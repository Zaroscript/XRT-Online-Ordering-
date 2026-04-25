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
import mongoose from 'mongoose';

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

function normalizeAuthorizeNetStatus(status: string | undefined | null): string {
  return String(status || '')
    .trim()
    .toLowerCase();
}

function isAuthorizeNetSettledStatus(status: string): boolean {
  return normalizeAuthorizeNetStatus(status) === 'settledsuccessfully';
}

function isAuthorizeNetVoidOnlyStatus(status: string): boolean {
  const s = normalizeAuthorizeNetStatus(status);
  return (
    s === 'authorizedpendingcapture' ||
    s === 'capturedpendingsettlement' ||
    s === 'pendingsettlement' ||
    s === 'fds - pending review' ||
    s === 'underreview'
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

function logRefundStep(
  step: string,
  context: Record<string, unknown> = {},
  level: 'info' | 'error' = 'info',
) {
  const payload = {
    scope: 'refund-flow',
    step,
    ...context,
  };
  if (level === 'error') {
    console.error('[RefundFlow]', payload);
    return;
  }
  console.info('[RefundFlow]', payload);
}

function isMongoTransactionUnsupportedError(error: any): boolean {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('transaction numbers are only allowed') ||
    message.includes('replica set') ||
    message.includes('mongos')
  );
}

function isMongoDuplicateKeyError(error: any): boolean {
  return Number(error?.code) === 11000;
}

function toCents(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round((numeric + Number.EPSILON) * 100);
}

function fromCents(cents: number): number {
  return Number((cents / 100).toFixed(2));
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

  private async executeAuthorizeNetRequest(
    requestToExecute: any,
    endpoint: string,
  ): Promise<any> {
    const ctrl = new AuthorizeNet.APIControllers.CreateTransactionController(
      requestToExecute.getJSON(),
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
  }

  private async fetchAuthorizeNetTransactionDetails(
    merchantAuthenticationType: any,
    refTransId: string,
    primaryEndpoint: string,
    fallbackEndpoint: string,
  ): Promise<{
    transactionStatus: string;
    settled: boolean;
    capturedAmount: number | null;
    last4: string | null;
  }> {
    const executeDetailsOnEnv = async (endpoint: string) => {
      const detailsReq = new AuthorizeNet.APIContracts.GetTransactionDetailsRequest();
      detailsReq.setMerchantAuthentication(merchantAuthenticationType);
      detailsReq.setTransId(refTransId);

      const ctrl = new AuthorizeNet.APIControllers.GetTransactionDetailsController(
        detailsReq.getJSON(),
      );
      ctrl.setEnvironment(endpoint);

      return new Promise<any>((resolve, reject) => {
        ctrl.execute(() => {
          const apiResponse = ctrl.getResponse();
          const response =
            new AuthorizeNet.APIContracts.GetTransactionDetailsResponse(apiResponse);
          const resultCode = response?.getMessages?.()?.getResultCode?.();
          if (resultCode === AuthorizeNet.APIContracts.MessageTypeEnum.OK) {
            resolve(response?.getTransaction?.());
            return;
          }

          const errMsg =
            response?.getMessages?.()?.getMessage?.()?.[0]?.getText?.() ||
            'Failed to retrieve transaction details';
          reject(new Error(errMsg));
        });
      });
    };

    let txDetails: any;
    try {
      txDetails = await executeDetailsOnEnv(primaryEndpoint);
    } catch (firstErr: any) {
      const m = String(firstErr?.message || '');
      if (!refundErrorSuggestsWrongEnvironment(m)) throw firstErr;
      txDetails = await executeDetailsOnEnv(fallbackEndpoint);
    }

    const status = String(txDetails?.getTransactionStatus?.() || '');
    const settleAmountRaw =
      txDetails?.getSettleAmount?.() ??
      txDetails?.getAuthAmount?.() ??
      txDetails?.getAmount?.() ??
      null;
    const capturedAmount =
      settleAmountRaw != null && settleAmountRaw !== ''
        ? Number.parseFloat(String(settleAmountRaw))
        : null;
    const last4Raw = String(txDetails?.getAccountNumber?.() || '');
    const last4 = normalizeCardLastFour(last4Raw);

    return {
      transactionStatus: status,
      settled: isAuthorizeNetSettledStatus(status),
      capturedAmount: Number.isFinite(capturedAmount as number)
        ? (capturedAmount as number)
        : null,
      last4,
    };
  }

  private getPriorRefundSummary(priorTx: Array<{ gateway?: string; amount?: number }>) {
    let alreadyRefundedCents = 0;
    for (const t of priorTx) {
      if (t.gateway !== 'authorize_net') continue;
      const amount = Number(t.amount);
      if (!Number.isNaN(amount) && amount < 0) {
        alreadyRefundedCents += Math.abs(toCents(amount));
      }
    }
    return {
      alreadyRefundedCents,
      alreadyRefunded: fromCents(alreadyRefundedCents),
    };
  }

  /** GET /orders/:id/refund-action — inspect Authorize.Net settlement state for UI labeling. */
  getRefundAction = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const orderRepository = new OrderRepository();
    const transactionRepository = new TransactionRepository();
    const order = await orderRepository.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const paymentMethod = String(order.money.payment || '').toLowerCase();
    if (!['authorize_net', 'authorize_net_iframe', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Order not eligible' });
    }

    const refTransId = String(order.money.payment_id || '').trim();
    if (!refTransId) {
      return res.status(400).json({ success: false, message: 'Invalid transaction id' });
    }

    const businessSettingsRepository = new BusinessSettingsRepository();
    const settings = await businessSettingsRepository.findByBusinessId(order.business_id);
    const authNetApiLoginId = settings?.authorizeNetApiLoginId;
    const authNetTransactionKey = settings?.authorizeNetTransactionKey;

    if (!authNetApiLoginId || !authNetTransactionKey) {
      return res.status(500).json({ success: false, message: 'Authorize.Net payment gateway is not configured' });
    }

    const priorTx = await transactionRepository.findByOrderId(orderId);
    const { alreadyRefundedCents, alreadyRefunded } = this.getPriorRefundSummary(priorTx as any);

    const saleTxn = priorTx.find(
      (t) =>
        t.gateway === 'authorize_net' &&
        Number(t.amount) > 0 &&
        t.transaction_id === refTransId,
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

    const merchantAuthenticationType = new AuthorizeNet.APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(authNetApiLoginId);
    merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

    let details;
    try {
      details = await this.fetchAuthorizeNetTransactionDetails(
        merchantAuthenticationType,
        refTransId,
        primaryEndpoint,
        fallbackEndpoint,
      );
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id',
        details: String(err?.message || ''),
      });
    }

    const capturedCents = toCents(details.capturedAmount ?? order.money.total_amount ?? 0);
    const remainingRefundableCents = Math.max(0, capturedCents - alreadyRefundedCents);
    const remainingRefundable = fromCents(remainingRefundableCents);
    const gatewayCapturedAmount = fromCents(capturedCents);
    const shouldVoid = !details.settled && isAuthorizeNetVoidOnlyStatus(details.transactionStatus);
    const action = shouldVoid ? 'void' : 'refund';

    logRefundStep('refund-action:financials', {
      orderId,
      dbTotal: Number(order.money.total_amount || 0),
      gatewayCapturedAmount,
      previousRefunds: alreadyRefunded,
      remainingRefundable,
      transactionStatus: details.transactionStatus,
    });

    try {
      const { OrderModel } = await import('../../infrastructure/database/models/OrderModel');
      await OrderModel.findByIdAndUpdate(orderId, {
        $set: {
          'money.gateway_captured_amount': gatewayCapturedAmount,
          'money.gateway_refundable_remaining': remainingRefundable,
          'money.refunded_amount': alreadyRefunded,
          'money.net_paid_amount': fromCents(
            Math.max(0, capturedCents - alreadyRefundedCents),
          ),
        },
      }).exec();
    } catch (reconcileError: any) {
      logRefundStep(
        'refund-action:reconcile-warning',
        {
          orderId,
          message: String(reconcileError?.message || reconcileError),
        },
        'error',
      );
    }

    return sendSuccess(res, 'Refund action resolved', {
      action,
      transactionId: refTransId,
      transactionStatus: details.transactionStatus,
      settled: details.settled,
      capturedAmount: gatewayCapturedAmount,
      remainingRefundable,
      last4: details.last4 || normalizeCardLastFour(order.money.last_4),
      message: shouldVoid ? 'Payment not settled yet, voiding instead' : undefined,
    });
  });

  /** POST /orders/:id/refund — Process a full or partial refund for an order. */
  refundOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const { amount, reason, refundType, notes } = req.body ?? {};
    const requestId = `${orderId}:${Date.now()}`;

    logRefundStep('load-order:start', { requestId, orderId });

    const orderRepository = new OrderRepository();
    const transactionRepository = new TransactionRepository();
    const order = await orderRepository.findById(orderId);
    logRefundStep('load-order:complete', {
      requestId,
      orderId,
      found: !!order,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const normalizedReason = String(reason || '').trim();
    if (!normalizedReason) {
      return res.status(400).json({
        success: false,
        message: 'Refund reason is required.',
      });
    }

    const normalizedRefundType: 'full' | 'partial' =
      refundType === 'partial' || refundType === 'full'
        ? refundType
        : amount !== undefined && amount !== null && String(amount).trim() !== ''
          ? 'partial'
          : 'full';

    const paymentMethod = String(order.money.payment || '').toLowerCase();
    logRefundStep('validate-refundable-state:start', {
      requestId,
      orderId,
      paymentMethod,
      refundType: normalizedRefundType,
    });
    if (paymentMethod === 'nmi') {
      return res
        .status(400)
        .json({ success: false, message: 'This order uses NMI and cannot be refunded from this endpoint.' });
    }

    const authNetPayments = ['authorize_net', 'authorize_net_iframe', 'card'];
    if (!authNetPayments.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'This order payment method is not eligible for refund.',
      });
    }

    if (!order.money.payment_id || String(order.money.payment_id).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Order has no gateway transaction ID (payment_id). Cannot refund.',
      });
    }

    const payStatus = String(
      order.money.payment_status || (order as any).payment_status || '',
    )
      .toLowerCase()
      .replace(/\s+/g, '_');
    if (payStatus === 'refunded') {
      return res
        .status(400)
        .json({ success: false, message: 'This order has already been fully refunded.' });
    }

    if (!['paid', 'partially_refunded', 'payment_success'].includes(payStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Only paid or partially refunded orders can be refunded.',
      });
    }

    const orderStatus = String(order.status || '').toLowerCase();
    if (!['completed', 'canceled', 'cancelled'].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Only completed or canceled orders are eligible for refund.',
      });
    }

    const dbOrderTotal = Number.parseFloat(String(order.money.total_amount || 0));
    if (isNaN(dbOrderTotal) || dbOrderTotal <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order total.' });
    }

    const priorTx = await transactionRepository.findByOrderId(orderId);
    const { alreadyRefundedCents, alreadyRefunded } = this.getPriorRefundSummary(priorTx as any);
    const dbOrderTotalCents = toCents(dbOrderTotal);
    const remainingByDbCents = Math.max(0, dbOrderTotalCents - alreadyRefundedCents);
    const remainingByDb = fromCents(remainingByDbCents);
    logRefundStep('validate-refundable-state:complete', {
      requestId,
      orderId,
      priorTransactions: priorTx.length,
      dbTotal: dbOrderTotal,
      alreadyRefunded,
      remainingByDb,
    });
    if (remainingByDbCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been fully refunded.',
      });
    }

    if (
      normalizedRefundType === 'partial' &&
      (amount === undefined || amount === null || String(amount).trim() === '')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Partial refunds require a valid amount greater than 0.',
      });
    }

    const requestedAmountRaw = normalizedRefundType === 'partial'
      ? parseFloat(String(amount))
      : remainingByDb;

    if (isNaN(requestedAmountRaw) || requestedAmountRaw <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount must be greater than 0.',
      });
    }

    const requestedAmountCents = toCents(requestedAmountRaw);
    if (requestedAmountCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount must be greater than 0.01.',
      });
    }
    const formattedAmount = fromCents(requestedAmountCents).toFixed(2);
    logRefundStep('compute-refund-values', {
      requestId,
      orderId,
      requestedAmountRaw: fromCents(requestedAmountCents),
      formattedAmount,
    });

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

    const merchantAuthenticationType = new AuthorizeNet.APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(authNetApiLoginId);
    merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

    const refTransId = String(order.money.payment_id).trim();

    let transactionDetails: {
      transactionStatus: string;
      settled: boolean;
      capturedAmount: number | null;
      last4: string | null;
    };
    try {
      logRefundStep('gateway-details:start', { requestId, orderId, refTransId });
      transactionDetails = await this.fetchAuthorizeNetTransactionDetails(
        merchantAuthenticationType,
        refTransId,
        primaryEndpoint,
        fallbackEndpoint,
      );
      logRefundStep('gateway-details:complete', {
        requestId,
        orderId,
        transactionStatus: transactionDetails.transactionStatus,
        settled: transactionDetails.settled,
        capturedAmount: transactionDetails.capturedAmount,
      });
    } catch {
      logRefundStep('gateway-details:error', { requestId, orderId, refTransId }, 'error');
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction id',
      });
    }

    const shouldVoid =
      !transactionDetails.settled &&
      isAuthorizeNetVoidOnlyStatus(transactionDetails.transactionStatus);
    const capturedBaseAmountCents = toCents(
      transactionDetails.capturedAmount != null && transactionDetails.capturedAmount > 0
        ? transactionDetails.capturedAmount
        : dbOrderTotal,
    );
    const remainingByCapturedCents = Math.max(0, capturedBaseAmountCents - alreadyRefundedCents);
    const remainingByCaptured = fromCents(remainingByCapturedCents);
    const requestedRefundAmount = fromCents(requestedAmountCents);
    logRefundStep('refund-financial-reconciliation', {
      requestId,
      orderId,
      dbTotal: dbOrderTotal,
      gatewayCaptured: fromCents(capturedBaseAmountCents),
      requestedRefund: requestedRefundAmount,
      previousRefunds: alreadyRefunded,
      remainingRefundable: remainingByCaptured,
    });

    if (remainingByCapturedCents <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been fully refunded.',
      });
    }
    if (requestedAmountCents > remainingByCapturedCents) {
      return res.status(400).json({
        success: false,
        message: 'Refund exceeds captured transaction amount.',
      });
    }
    const isFullRefund = requestedAmountCents >= remainingByCapturedCents;
    const last4 =
      normalizeCardLastFour(order.money.last_4) ??
      normalizeCardLastFour(transactionDetails.last4);

    const buildRefundRequest = () => {
      const transactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(
        AuthorizeNet.APIContracts.TransactionTypeEnum.REFUNDTRANSACTION
      );
      transactionRequestType.setAmount(formattedAmount);
      transactionRequestType.setRefTransId(refTransId);

      const paymentType = new AuthorizeNet.APIContracts.PaymentType();
      const creditCard = new AuthorizeNet.APIContracts.CreditCardType();
      creditCard.setCardNumber(maskedPanForAuthorizeNetRefund(last4 as string));
      creditCard.setExpirationDate('XXXX');
      paymentType.setCreditCard(creditCard);
      transactionRequestType.setPayment(paymentType);

      const createRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);
      return createRequest;
    };

    let finalAuthNetTransId = '';
    const runCreateTransaction = async (requestFactory: () => any) => {
      try {
        return await this.executeAuthorizeNetRequest(requestFactory(), primaryEndpoint);
      } catch (firstErr: any) {
        const m = String(firstErr?.message || '');
        if (refundErrorSuggestsWrongEnvironment(m)) {
          return this.executeAuthorizeNetRequest(requestFactory(), fallbackEndpoint);
        }
        throw firstErr;
      }
    };

    if (shouldVoid) {
      if (!isFullRefund || alreadyRefundedCents > 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment is not settled yet. Only full void is allowed at this stage.',
        });
      }

      const buildVoidRequest = () => {
        const voidTransactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
        voidTransactionRequestType.setTransactionType(
          AuthorizeNet.APIContracts.TransactionTypeEnum.VOIDTRANSACTION,
        );
        voidTransactionRequestType.setRefTransId(refTransId);

        const voidRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
        voidRequest.setMerchantAuthentication(merchantAuthenticationType);
        voidRequest.setTransactionRequest(voidTransactionRequestType);
        return voidRequest;
      };

      try {
        logRefundStep('gateway-void:start', { requestId, orderId, refTransId });
        const voidResponse = await runCreateTransaction(buildVoidRequest);
        finalAuthNetTransId =
          typeof voidResponse?.getTransId === 'function'
            ? voidResponse.getTransId()
            : `void_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        logRefundStep('gateway-void:complete', {
          requestId,
          orderId,
          finalAuthNetTransId,
        });
      } catch (voidError: any) {
        logRefundStep(
          'gateway-void:error',
          { requestId, orderId, message: String(voidError?.message || voidError) },
          'error',
        );
        return res.status(400).json({
          success: false,
          message: `Authorize.Net: ${String(voidError?.message || voidError)}`,
        });
      }
    } else {
      if (!transactionDetails.settled) {
        return res.status(400).json({
          success: false,
          message: 'Payment is not settled yet. Please void instead of refund.',
        });
      }

      if (!last4) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction id',
        });
      }

      try {
        logRefundStep('gateway-refund:start', {
          requestId,
          orderId,
          refTransId,
          amount: formattedAmount,
        });
        const refundResponse = await runCreateTransaction(buildRefundRequest);
        finalAuthNetTransId =
          typeof refundResponse?.getTransId === 'function'
            ? refundResponse.getTransId()
            : `refund_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        logRefundStep('gateway-refund:complete', {
          requestId,
          orderId,
          finalAuthNetTransId,
        });
      } catch (refundError: any) {
        logRefundStep(
          'gateway-refund:error',
          { requestId, orderId, message: String(refundError?.message || refundError) },
          'error',
        );
        return res.status(400).json({
          success: false,
          message: `Authorize.Net: ${String(refundError?.message || refundError)}`,
        });
      }
    }

    const newTotalRefundedCents = alreadyRefundedCents + requestedAmountCents;
    const newPaymentStatus =
      newTotalRefundedCents >= capturedBaseAmountCents ? 'refunded' : 'partially_refunded';
    const netPaidCents = Math.max(0, capturedBaseAmountCents - newTotalRefundedCents);
    const newTotalRefunded = fromCents(newTotalRefundedCents);
    const netPaidAmount = fromCents(netPaidCents);
    const gatewayCapturedAmount = fromCents(capturedBaseAmountCents);
    logRefundStep('persist-refund:start', {
      requestId,
      orderId,
      newPaymentStatus,
      newTotalRefunded,
      netPaidAmount,
      gatewayCapturedAmount,
    });

    const { OrderModel } = await import('../../infrastructure/database/models/OrderModel');
    const { TransactionModel } = await import('../../infrastructure/database/models/TransactionModel');
    const refundTransactionDoc = {
      order_id: orderId,
      customer_id: order.customer_id,
      transaction_id: finalAuthNetTransId,
      amount: -requestedRefundAmount,
      currency: order.money.currency || 'USD',
      gateway: 'authorize_net',
      status: shouldVoid ? 'voided' : 'refunded',
      payment_method: 'credit_card',
      card_type: order.money.card_type || 'Unknown',
      last_4: last4,
      metadata: {
        type: shouldVoid ? 'void' : 'refund',
        parentTransactionId: refTransId,
        gatewayRefundId: finalAuthNetTransId,
        refTransId: order.money.payment_id,
        authorizeNetEnvironment: primaryEnv,
        authorizeNetTransactionStatus: transactionDetails.transactionStatus,
        refundAmount: requestedRefundAmount,
        refundStatus: shouldVoid ? 'voided' : 'refunded',
        refundedAt: new Date().toISOString(),
        reason: normalizedReason,
        refundType: normalizedRefundType,
        notes: String(notes || '').trim() || undefined,
      },
    };

    const session = await mongoose.startSession();
    let updatedOrder: any = null;

    try {
      await session.withTransaction(async () => {
        updatedOrder = await OrderModel.findByIdAndUpdate(
          orderId,
          {
            $set: {
              'money.payment_status': newPaymentStatus,
              'money.refunded_amount': newTotalRefunded,
              'money.net_paid_amount': netPaidAmount,
              'money.gateway_captured_amount': gatewayCapturedAmount,
              'money.gateway_refundable_remaining': fromCents(
                Math.max(0, capturedBaseAmountCents - newTotalRefundedCents),
              ),
              payment_status: newPaymentStatus,
              status: newPaymentStatus === 'refunded' ? 'canceled' : order.status,
            },
          },
          { new: true, session }
        );

        if (!updatedOrder) {
          throw new Error('Order update failed during refund persistence');
        }

        const upsertResult = await TransactionModel.updateOne(
          { transaction_id: finalAuthNetTransId },
          { $setOnInsert: refundTransactionDoc },
          { upsert: true, session },
        );

        if (upsertResult.matchedCount > 0 && upsertResult.upsertedCount === 0) {
          const existingTx = await TransactionModel.findOne({
            transaction_id: finalAuthNetTransId,
          })
            .session(session)
            .lean();
          const sameOrder =
            String(existingTx?.order_id || '') === String(orderId);
          if (!sameOrder) {
            throw new Error('Duplicate gateway refund transaction id conflict');
          }
        }
      });
      logRefundStep('persist-refund:complete', {
        requestId,
        orderId,
        paymentStatus: newPaymentStatus,
        refundedAmount: newTotalRefunded,
      });
    } catch (persistenceError: any) {
      if (isMongoTransactionUnsupportedError(persistenceError)) {
        logRefundStep(
          'persist-refund:fallback-no-transaction',
          { requestId, orderId, message: String(persistenceError?.message || persistenceError) },
        );

        try {
          const fallbackUpsert = await TransactionModel.updateOne(
            { transaction_id: finalAuthNetTransId },
            { $setOnInsert: refundTransactionDoc },
            { upsert: true },
          );
          if (fallbackUpsert.matchedCount > 0 && fallbackUpsert.upsertedCount === 0) {
            const existingTx = await TransactionModel.findOne({
              transaction_id: finalAuthNetTransId,
            }).lean();
            const sameOrder =
              String(existingTx?.order_id || '') === String(orderId);
            if (!sameOrder) {
              throw new Error('Duplicate gateway refund transaction id conflict');
            }
          }
          updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            {
              $set: {
                'money.payment_status': newPaymentStatus,
                'money.refunded_amount': newTotalRefunded,
                'money.net_paid_amount': netPaidAmount,
                'money.gateway_captured_amount': gatewayCapturedAmount,
                'money.gateway_refundable_remaining': fromCents(
                  Math.max(0, capturedBaseAmountCents - newTotalRefundedCents),
                ),
                payment_status: newPaymentStatus,
                status: newPaymentStatus === 'refunded' ? 'canceled' : order.status,
              },
            },
            { new: true }
          );

          if (!updatedOrder) {
            throw new Error('Order update failed during fallback refund persistence');
          }
          logRefundStep('persist-refund:fallback-complete', {
            requestId,
            orderId,
            paymentStatus: newPaymentStatus,
            refundedAmount: newTotalRefunded,
          });
        } catch (fallbackError: any) {
          logRefundStep(
            'persist-refund:fallback-error',
            { requestId, orderId, message: String(fallbackError?.message || fallbackError) },
            'error',
          );
          throw fallbackError;
        }
      } else {
      if (isMongoDuplicateKeyError(persistenceError)) {
        logRefundStep(
          'persist-refund:duplicate-key',
          { requestId, orderId, message: String(persistenceError?.message || persistenceError) },
          'error',
        );
        return res.status(400).json({
          success: false,
          message: 'Duplicate refund transaction detected. Please verify order payment history.',
        });
      }
      logRefundStep(
        'persist-refund:error',
        { requestId, orderId, message: String(persistenceError?.message || persistenceError) },
        'error',
      );
      return res.status(500).json({
        success: false,
        message: 'Refund failed due to internal processing error.',
      });
      }
    } finally {
      await session.endSession();
    }

    const persistedRefundedAmount = Number(
      updatedOrder?.money?.refunded_amount ??
        updatedOrder?.money?.refundAmount ??
        0,
    );
    if (!updatedOrder || persistedRefundedAmount <= 0) {
      logRefundStep(
        'persist-refund:post-verify-failed',
        {
          requestId,
          orderId,
          updatedOrderExists: !!updatedOrder,
          persistedRefundedAmount,
        },
        'error',
      );
      return res.status(500).json({
        success: false,
        message: 'Refund failed due to internal processing error.',
      });
    }

    emitOrderChanged(req, {
      action: 'refunded',
      orderId,
      order: updatedOrder ?? order,
      status: updatedOrder?.status ?? order.status,
    });

    return sendSuccess(
      res,
      shouldVoid
        ? 'Payment not settled yet, voiding instead'
        : `Order successfully ${newPaymentStatus.replace('_', ' ')}`,
      updatedOrder
    );
  });
}
