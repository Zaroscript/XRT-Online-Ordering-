import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateOrderUseCase } from '../../domain/usecases/order/CreateOrderUseCase';
import { GetOrderUseCase } from '../../domain/usecases/order/GetOrderUseCase';
import { GetOrdersUseCase } from '../../domain/usecases/order/GetOrdersUseCase';
import { UpdateOrderStatusUseCase } from '../../domain/usecases/order/UpdateOrderStatusUseCase';
import { DeleteOrderUseCase } from '../../domain/usecases/order/DeleteOrderUseCase';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';
import { emitNewOrder } from '../../services/printer/orderPrintEvents';
import { routeOrderToPrinters } from '../../services/printer/printRoutingService';
import { PrintLogRepository } from '../../infrastructure/repositories/PrintLogRepository';
import { Server as SocketIOServer } from 'socket.io';

import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { CouponRepository } from '../../infrastructure/repositories/CouponRepository';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository';
import { TransactionRepository } from '../../infrastructure/repositories/TransactionRepository';
import * as AuthorizeNet from 'authorizenet';
import { CustomerOrderNotificationService } from '../../services/order/CustomerOrderNotificationService';

/**
 * Authorize.Net refund (credit) transactions require refTransId, amount, and masked card XXXX1234 + expiration XXXX.
 * @see https://developer.authorize.net/api/reference/index.html#transaction-refund-a-transaction
 */
function normalizeCardLastFour(raw: string | undefined | null): string | null {
  if (raw == null || String(raw).trim() === '') return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  return null;
}

function maskedPanForAuthorizeNetRefund(last4: string): string {
  return `XXXX${last4}`;
}

function refundErrorSuggestsUnsettled(msg: string): boolean {
  const m = (msg || '').toLowerCase();
  return (
    m.includes('settled') ||
    m.includes('settlement') ||
    m.includes('cannot issue a credit') ||
    m.includes('cannot issue credit') ||
    m.includes('not been settled') ||
    (m.includes('does not allow') && m.includes('credit'))
  );
}

function refundErrorSuggestsWrongEnvironment(msg: string): boolean {
  const m = (msg || '').toLowerCase();
  return (
    m.includes('does not exist') ||
    m.includes('e00040') ||
    m.includes('cannot find') ||
    m.includes('transaction not found') ||
    m.includes('record cannot be found')
  );
}

function emitOrderChanged(
  req: Request,
  payload: {
    action: 'status-updated' | 'deleted' | 'refunded';
    orderId: string;
    order?: unknown;
    status?: string;
    deleted?: boolean;
  },
) {
  const socketIo = req.app.get('io') as SocketIOServer | undefined;
  if (socketIo) {
    socketIo.emit('order-changed', payload);
  }
}

export class OrderController {
  private createOrderUseCase: CreateOrderUseCase;
  private getOrderUseCase: GetOrderUseCase;
  private getOrdersUseCase: GetOrdersUseCase;
  private updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  private deleteOrderUseCase: DeleteOrderUseCase;

  constructor() {
    const orderRepository = new OrderRepository();
    const itemRepository = new ItemRepository();
    const categoryRepository = new CategoryRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const couponRepository = new CouponRepository();
    const customerRepository = new CustomerRepository();
    this.createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      itemRepository,
      categoryRepository,
      businessSettingsRepository,
      couponRepository,
      customerRepository
    );
    this.getOrderUseCase = new GetOrderUseCase(orderRepository);
    this.getOrdersUseCase = new GetOrdersUseCase(orderRepository);
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);
    this.deleteOrderUseCase = new DeleteOrderUseCase(orderRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In a real scenario, customer_id might come from req.user if customer is logging in
    const customer_id = req.user?.id || req.body.customer_id;

    if (!customer_id) {
      throw new ValidationError('customer_id is required');
    }

    const orderData = {
      ...req.body,
      customer_id,
    };

    const order = await this.createOrderUseCase.execute(orderData);
    const payload = { orderId: order.id, orderNumber: order.order_number };
    emitNewOrder(payload);
    const socketIo = req.app.get('io') as SocketIOServer | undefined;
    if (socketIo) socketIo.emit('new-order', order);
    return sendSuccess(res, 'Order created successfully', order, 201);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const statusParam = req.query.status as string | undefined;
    const status = statusParam
      ? statusParam.includes(',')
        ? statusParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : statusParam
      : undefined;
    const filters: any = {
      status,
      order_type: req.query.order_type as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      today_only: req.query.today_only === 'true',
    };

    // If a customer is querying their own orders
    if (req.user?.role === 'customer') {
      filters.customer_id = req.user.id;
    } else if (req.query.customer_id) {
      filters.customer_id = req.query.customer_id as string;
    }

    const orders = await this.getOrdersUseCase.execute(filters);
    return sendSuccess(res, 'Orders retrieved successfully', orders);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const order = await this.getOrderUseCase.execute(id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Optional: authorization check to ensure customer owns the order
    if (req.user?.role === 'customer' && order.customer_id !== req.user.id) {
      throw new NotFoundError('Order not found'); // Hide existence to unauthorized users
    }

    return sendSuccess(res, 'Order retrieved successfully', order);
  });

  updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, cancelled_reason, cancelled_by, ready_time, clear_schedule } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const order = await this.updateOrderStatusUseCase.execute(id, {
      status,
      ready_time: ready_time ? new Date(ready_time) : undefined,
      clear_schedule: !!clear_schedule,
      cancelled_reason,
      cancelled_by: cancelled_by || req.user?.role || 'system',
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    try {
      const businessRepository = new BusinessRepository();
      const customerRepository = new CustomerRepository();
      const [business, customer] = await Promise.all([
        businessRepository.findOne(),
        customerRepository.findById(order.customer_id, order.business_id),
      ]);

      if (business && customer) {
        const notificationService = new CustomerOrderNotificationService();
        await notificationService.sendOrderStatusNotifications({
          business,
          customer,
          order,
        });
      }
    } catch (error: any) {
      console.error('Failed to send order status notifications:', error?.message || error);
    }

    emitOrderChanged(req, {
      action: 'status-updated',
      orderId: order.id,
      order,
      status: order.status,
    });

    return sendSuccess(res, 'Order status updated successfully', order);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const success = await this.deleteOrderUseCase.execute(id);

    if (!success) {
      throw new NotFoundError('Order not found or already deleted');
    }

    emitOrderChanged(req, {
      action: 'deleted',
      orderId: id,
      deleted: true,
    });

    return sendSuccess(res, 'Order deleted successfully', { deleted: true });
  });

  /** POST /orders/:id/reprint — clear print status and trigger routing again (manual reprint). */
  reprint = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const printerId = req.body.printerId as string | undefined;

    const order = await this.getOrderUseCase.execute(orderId);
    if (!order) throw new NotFoundError('Order not found');

    const orderRepository = new OrderRepository();
    await orderRepository.clearPrintStatus(orderId, printerId);
    setImmediate(() => {
      routeOrderToPrinters(orderId).catch(() => {});
    });
    return sendSuccess(res, 'Reprint triggered', { orderId, printerId: printerId ?? 'all' });
  });

  /** GET /orders/:id/print-logs — list print attempt logs for an order. */
  getPrintLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const order = await this.getOrderUseCase.execute(orderId);
    if (!order) throw new NotFoundError('Order not found');
    const printLogRepo = new PrintLogRepository();
    const logs = await printLogRepo.findByOrderId(orderId);
    return sendSuccess(res, 'Print logs retrieved', logs);
  });

  /** POST /orders/:id/refund — Process a full or partial refund for an order. */
  refundOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const { amount } = req.body;

    const orderRepository = new OrderRepository();
    const transactionRepository = new TransactionRepository();
    const order = await orderRepository.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const paymentMethod = String(order.money.payment || '').toLowerCase();
    if (paymentMethod === 'nmi') {
      return res
        .status(400)
        .json({ success: false, message: 'Refunds for NMI are not implemented via this endpoint.' });
    }

    const authNetPayments = ['authorize_net', 'authorize_net_iframe', 'card'];
    if (!authNetPayments.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message:
          'Refunds via this endpoint are only supported for Authorize.Net card payments. Use your POS or gateway for cash / other methods.',
      });
    }

    if (!order.money.payment_id || String(order.money.payment_id).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Order has no gateway transaction ID (payment_id). Cannot refund.',
      });
    }

    const payStatus = String(order.money.payment_status || (order as any).payment_status || '');
    if (payStatus === 'refunded') {
      return res
        .status(400)
        .json({ success: false, message: 'This order has already been fully refunded.' });
    }

    const rawTotalAmount = parseFloat(String(order.money.total_amount || 0));
    if (isNaN(rawTotalAmount) || rawTotalAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order total.' });
    }

    const priorTx = await transactionRepository.findByOrderId(orderId);
    let alreadyRefunded = 0;
    for (const t of priorTx) {
      if (t.gateway !== 'authorize_net') continue;
      const a = Number(t.amount);
      if (!Number.isNaN(a) && a < 0) {
        alreadyRefunded += Math.abs(a);
      }
    }
    const remainingRefundable = Math.max(0, rawTotalAmount - alreadyRefunded);
    if (remainingRefundable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No refundable balance remains on this order.',
      });
    }

    const refundAmountRaw =
      amount !== undefined && amount !== null && String(amount).trim() !== ''
        ? parseFloat(String(amount))
        : remainingRefundable;

    if (isNaN(refundAmountRaw) || refundAmountRaw <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid refund amount.' });
    }

    if (refundAmountRaw > remainingRefundable + 0.001) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed remaining captured total ($${remainingRefundable.toFixed(2)}; already refunded $${alreadyRefunded.toFixed(2)} of $${rawTotalAmount.toFixed(2)}).`,
      });
    }

    const isFullRefund = refundAmountRaw >= remainingRefundable - 0.001;
    const formattedAmount = refundAmountRaw.toFixed(2);

    const businessSettingsRepository = new BusinessSettingsRepository();
    const settings = await businessSettingsRepository.findByBusinessId(order.business_id);

    const authNetApiLoginId = settings?.authorizeNetApiLoginId;
    const authNetTransactionKey = settings?.authorizeNetTransactionKey;

    if (!authNetApiLoginId || !authNetTransactionKey) {
      return res.status(500).json({ success: false, message: 'Authorize.Net payment gateway is not configured' });
    }

    const saleTxn = priorTx.find(
      (t) =>
        t.gateway === 'authorize_net' &&
        Number(t.amount) > 0 &&
        t.transaction_id === order.money.payment_id
    );
    const chargeEnvFromMeta = saleTxn?.metadata?.authorizeNetEnvironment as string | undefined;
    const settingsEnv = settings?.authorizeNetEnvironment === 'production' ? 'production' : 'sandbox';
    const primaryEnv =
      chargeEnvFromMeta === 'production' || chargeEnvFromMeta === 'sandbox'
        ? chargeEnvFromMeta
        : settingsEnv;

    const endpointProduction = AuthorizeNet.Constants.endpoint.production;
    const endpointSandbox = AuthorizeNet.Constants.endpoint.sandbox;
    const primaryEndpoint = primaryEnv === 'production' ? endpointProduction : endpointSandbox;
    const fallbackEndpoint = primaryEndpoint === endpointProduction ? endpointSandbox : endpointProduction;

    const last4 = normalizeCardLastFour(order.money.last_4);
    if (!last4) {
      return res.status(400).json({
        success: false,
        message:
          'Cannot refund: card last-4 is missing on the order. Authorize.Net requires the masked card (XXXX + last 4) for refund transactions.',
      });
    }

    const merchantAuthenticationType = new AuthorizeNet.APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(authNetApiLoginId);
    merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

    const buildRefundRequest = () => {
      const transactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(
        AuthorizeNet.APIContracts.TransactionTypeEnum.REFUNDTRANSACTION
      );
      transactionRequestType.setAmount(formattedAmount);
      transactionRequestType.setRefTransId(String(order.money.payment_id).trim());

      const paymentType = new AuthorizeNet.APIContracts.PaymentType();
      const creditCard = new AuthorizeNet.APIContracts.CreditCardType();
      creditCard.setCardNumber(maskedPanForAuthorizeNetRefund(last4));
      creditCard.setExpirationDate('XXXX');
      paymentType.setCreditCard(creditCard);
      transactionRequestType.setPayment(paymentType);

      const createRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);
      return createRequest;
    };

    const executeOnEnv = async (requestToExecute: any, endpoint: string): Promise<any> => {
      const ctrl = new AuthorizeNet.APIControllers.CreateTransactionController(
        requestToExecute.getJSON()
      );
      ctrl.setEnvironment(endpoint);

      return new Promise((resolve, reject) => {
        ctrl.execute(() => {
          const apiResponse = ctrl.getResponse();
          const response = new AuthorizeNet.APIContracts.CreateTransactionResponse(apiResponse);

          if (
            response != null &&
            response.getMessages().getResultCode() == AuthorizeNet.APIContracts.MessageTypeEnum.OK
          ) {
            const tr = response.getTransactionResponse();
            if (tr && tr.getMessages() != null) {
              resolve(tr);
            } else {
              let errorMsg = 'Transaction Failed.';
              if (tr && tr.getErrors() != null) {
                errorMsg = tr.getErrors().getError()[0].getErrorText();
              }
              reject(new Error(errorMsg));
            }
          } else {
            let errorMsg = 'Transaction Failed.';
            const tr = response?.getTransactionResponse();
            if (tr && tr.getErrors() != null) {
              errorMsg = tr.getErrors().getError()[0].getErrorText();
            } else if (response && response.getMessages() != null) {
              errorMsg = response.getMessages().getMessage()[0].getText();
            }
            reject(new Error(errorMsg));
          }
        });
      });
    };

    let finalAuthNetTransId = '';

    const runRefund = async () => {
      const reqBody = buildRefundRequest();
      try {
        return await executeOnEnv(reqBody, primaryEndpoint);
      } catch (firstErr: any) {
        const m = String(firstErr?.message || '');
        if (refundErrorSuggestsWrongEnvironment(m)) {
          return executeOnEnv(buildRefundRequest(), fallbackEndpoint);
        }
        throw firstErr;
      }
    };

    try {
      const response = await runRefund();
      finalAuthNetTransId =
        typeof response?.getTransId === 'function' ? response.getTransId() : `refund_${Date.now()}`;
    } catch (refundError: any) {
      const msg = String(refundError?.message || refundError || 'Unknown error');
      console.error('Authorize.Net refund failed:', msg);

      if (refundErrorSuggestsUnsettled(msg)) {
        if (isFullRefund && alreadyRefunded < 0.001) {
          const voidTransactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
          voidTransactionRequestType.setTransactionType(
            AuthorizeNet.APIContracts.TransactionTypeEnum.VOIDTRANSACTION
          );
          voidTransactionRequestType.setRefTransId(String(order.money.payment_id).trim());

          const voidRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
          voidRequest.setMerchantAuthentication(merchantAuthenticationType);
          voidRequest.setTransactionRequest(voidTransactionRequestType);

          const runVoid = async () => {
            try {
              return await executeOnEnv(voidRequest, primaryEndpoint);
            } catch (e: any) {
              if (refundErrorSuggestsWrongEnvironment(String(e?.message || ''))) {
                return executeOnEnv(voidRequest, fallbackEndpoint);
              }
              throw e;
            }
          };

          try {
            const voidResponse = await runVoid();
            finalAuthNetTransId =
              typeof voidResponse?.getTransId === 'function'
                ? voidResponse.getTransId()
                : `void_${Date.now()}`;
          } catch (voidError: any) {
            return res.status(400).json({
              success: false,
              message: `Refund is not allowed until the transaction settles. Full void also failed: ${String(voidError?.message || voidError)}`,
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message:
              'Partial refunds (and additional refunds after a prior refund) require the original charge to be settled. Per Authorize.Net, credits are issued against settled transactions.',
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: `Authorize.Net: ${msg}`,
        });
      }
    }

    const newTotalRefunded = alreadyRefunded + refundAmountRaw;
    const newPaymentStatus =
      newTotalRefunded >= rawTotalAmount - 0.001 ? 'refunded' : 'partially_refunded';

    const { OrderModel } = await import('../../infrastructure/database/models/OrderModel');
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'money.payment_status': newPaymentStatus,
          payment_status: newPaymentStatus,
          status: newPaymentStatus === 'refunded' ? 'canceled' : order.status,
        },
      },
      { new: true }
    );

    const { TransactionModel } = await import('../../infrastructure/database/models/TransactionModel');
    await TransactionModel.create({
      order_id: orderId,
      customer_id: order.customer_id,
      transaction_id: finalAuthNetTransId,
      amount: -refundAmountRaw,
      currency: order.money.currency || 'USD',
      gateway: 'authorize_net',
      status: 'refunded',
      payment_method: 'credit_card',
      card_type: order.money.card_type || 'Unknown',
      last_4: last4,
      metadata: {
        type: 'refund',
        refTransId: order.money.payment_id,
        authorizeNetEnvironment: primaryEnv,
      },
    });

    emitOrderChanged(req, {
      action: 'refunded',
      orderId,
      order: updatedOrder ?? order,
      status: updatedOrder?.status ?? order.status,
    });

    return sendSuccess(
      res,
      `Order successfully ${newPaymentStatus.replace('_', ' ')}`,
      updatedOrder
    );
  });
}
