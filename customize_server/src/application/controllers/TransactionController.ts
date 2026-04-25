import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { TransactionRepository } from '../../infrastructure/repositories/TransactionRepository';
import { TransactionModel } from '../../infrastructure/database/models/TransactionModel';
import { Types } from 'mongoose';

type PaymentLifecycleState =
  | 'charge'
  | 'partially_refunded'
  | 'refunded'
  | 'voided'
  | 'failed'
  | 'pending';

function toOrderId(value: any): string {
  return String(value?.id || value?._id || value || '');
}

function resolveLifecycleState(transaction: any): PaymentLifecycleState {
  const orderPaymentStatus = String(
    transaction?.order_id?.money?.payment_status ||
      transaction?.order_id?.payment_status ||
      transaction?.status ||
      '',
  )
    .toLowerCase()
    .trim();
  const txType = String(transaction?.metadata?.type || '')
    .toLowerCase()
    .trim();
  const txStatus = String(transaction?.status || '')
    .toLowerCase()
    .trim();

  if (txType === 'void' || txStatus === 'voided') return 'voided';
  if (orderPaymentStatus === 'refunded' || txStatus === 'refunded') return 'refunded';
  if (orderPaymentStatus === 'partially_refunded') return 'partially_refunded';
  if (txStatus === 'failed' || orderPaymentStatus === 'failed') return 'failed';
  if (txStatus === 'pending' || orderPaymentStatus === 'pending') return 'pending';
  return 'charge';
}

export class TransactionController {
  getTransactions = asyncHandler(async (req: Request, res: Response) => {
    const transactionRepository = new TransactionRepository();
    
    const { 
      page, 
      limit, 
      order_id,
      status, 
      gateway, 
      date, 
      startDate, 
      endDate,
      customer_id 
    } = req.query;

    const filters = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      order_id,
      status,
      gateway,
      date,
      startDate,
      endDate,
      customer_id
    };

    const result = await transactionRepository.findAll(filters);
    const transactions = Array.isArray(result?.data) ? result.data : [];
    const orderIds = Array.from(
      new Set(
        transactions
          .map((tx: any) => toOrderId(tx?.order_id))
          .filter((id) => Types.ObjectId.isValid(id)),
      ),
    );

    const summaries = orderIds.length
      ? await TransactionModel.aggregate([
          {
            $match: {
              order_id: {
                $in: orderIds.map((id) => new Types.ObjectId(id)),
              },
            },
          },
          {
            $group: {
              _id: '$order_id',
              refundedAmount: {
                $sum: {
                  $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0],
                },
              },
            },
          },
        ])
      : [];

    const summaryByOrderId = new Map<string, { refundedAmount: number }>();
    for (const summary of summaries) {
      summaryByOrderId.set(String(summary?._id), {
        refundedAmount: Number(summary?.refundedAmount || 0),
      });
    }

    const enhancedData = transactions.map((tx: any) => {
      const orderId = toOrderId(tx?.order_id);
      const refundedAmount =
        summaryByOrderId.get(orderId)?.refundedAmount ?? Number(tx?.refundedAmount || 0);
      const orderTotal = Number(tx?.order_id?.money?.total_amount || tx?.amount || 0);
      const refundableAmount = Math.max(0, orderTotal - refundedAmount);
      const lifecycleState = resolveLifecycleState(tx);
      return {
        ...tx,
        paymentStatus:
          tx?.order_id?.money?.payment_status || tx?.order_id?.payment_status || tx?.status,
        transactionType: String(
          tx?.metadata?.type || (Number(tx?.amount || 0) < 0 ? 'refund' : 'charge'),
        ),
        refundedAmount,
        refundableAmount,
        lifecycleState,
      };
    });

    return sendSuccess(res, 'Transactions retrieved successfully', {
      ...result,
      data: enhancedData,
    });
  });

  getTransactionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transactionRepository = new TransactionRepository();
    
    const transaction = await transactionRepository.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    return sendSuccess(res, 'Transaction retrieved successfully', transaction);
  });
}
