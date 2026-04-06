import { Request, Response } from 'express';
import { LoyaltyService } from '../../domain/services/LoyaltyService';
import { LoyaltyProgramRepository } from '../../infrastructure/repositories/LoyaltyProgramRepository';
import { LoyaltyAccountRepository } from '../../infrastructure/repositories/LoyaltyAccountRepository';
import { LoyaltyTransactionRepository } from '../../infrastructure/repositories/LoyaltyTransactionRepository';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class LoyaltyController {
  private loyaltyService: LoyaltyService;

  constructor() {
    this.loyaltyService = new LoyaltyService(
      new LoyaltyProgramRepository(),
      new LoyaltyAccountRepository(),
      new LoyaltyTransactionRepository()
    );
  }

  // --- Admin Endpoints --- //

  public getProgram = async (req: Request, res: Response) => {
    try {
      const program = await this.loyaltyService.getProgramSettings();
      // If none exists, return defaults for the form
      if (!program) {
        return sendSuccess(res, 'Loyalty program defaults retrieved', {
          is_active: false,
          earn_rate_points_per_currency: 1,
          redeem_rate_currency_per_point: 0.05,
          minimum_points_to_redeem: 50,
          max_discount_percent_per_order: 50,
        });
      }
      sendSuccess(res, 'Loyalty program settings retrieved successfully', program);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  public upsertProgram = async (req: Request, res: Response) => {
    try {
      const {
        is_active,
        earn_rate_points_per_currency,
        redeem_rate_currency_per_point,
        minimum_points_to_redeem,
        max_discount_percent_per_order,
      } = req.body;

      const program = await this.loyaltyService.upsertProgramSettings({
        is_active: is_active ?? false,
        earn_rate_points_per_currency: Number(earn_rate_points_per_currency || 1),
        redeem_rate_currency_per_point: Number(redeem_rate_currency_per_point || 0.05),
        minimum_points_to_redeem: Number(minimum_points_to_redeem || 50),
        max_discount_percent_per_order: Number(max_discount_percent_per_order || 50),
      });

      sendSuccess(res, 'Loyalty program settings saved successfully', program);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  public getMembers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const accountRepo = new LoyaltyAccountRepository();
      const members = await accountRepo.list({ page, limit, search });
      sendSuccess(res, 'Members retrieved successfully', {
        data: members.data,
        total: members.total,
        current_page: page,
        per_page: limit,
        last_page: Math.ceil(members.total / limit),
      });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };
 
  public getMember = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const accountRepo = new LoyaltyAccountRepository();
      const member = await accountRepo.findById(id);
      if (!member) {
        return sendError(res, 'Member not found', 404);
      }
      sendSuccess(res, 'Member retrieved successfully', member);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  public getMemberTransactions = async (req: Request, res: Response) => {
    try {
      const account_id = req.params.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const transactionRepo = new LoyaltyTransactionRepository();
      const transactions = await transactionRepo.listByAccount(account_id, { page, limit });
      sendSuccess(res, 'Transactions retrieved successfully', {
        data: transactions.data,
        total: transactions.total,
        current_page: page,
        per_page: limit,
        last_page: Math.ceil(transactions.total / limit),
      });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  // --- Public Endpoints (Frontend Checkout) --- //

  public lookup = async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      const result = await this.loyaltyService.lookupPoints(phone || '');
      sendSuccess(res, 'Points retrieved successfully', result);
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };

  public join = async (req: Request, res: Response) => {
    try {
      const { phone, name, email } = req.body;
      if (!phone) {
        return sendError(res, 'Phone number is required', 400);
      }

      const account = await this.loyaltyService.joinLoyalty({ phone, name, email });
      sendSuccess(res, 'Successfully joined the loyalty program', account);
    } catch (error: any) {
      const message = error?.message || 'Failed to join loyalty program';
      const normalizedMessage = message.toLowerCase();
      const isValidationError =
        error?.name === 'ValidationError' ||
        normalizedMessage.includes('required') ||
        normalizedMessage.includes('valid phone') ||
        normalizedMessage.includes('not active');
      const statusCode = isValidationError ? 400 : 500;
      sendError(res, message, statusCode);
    }
  };

  public redeem = async (req: Request, res: Response) => {
    try {
      const { phone, points_to_redeem, subtotal } = req.body;
      if (!phone || !points_to_redeem || subtotal == null) {
        return sendError(res, 'Phone, points_to_redeem, and subtotal are required', 400);
      }

      const lookup = await this.loyaltyService.lookupPoints(phone);
      if (!lookup.isEnrolled) {
        return sendError(res, 'Customer not enrolled in loyalty program', 400);
      }

      const program = await this.loyaltyService.getProgramSettings();
      if (!program) {
         return sendError(res, 'Loyalty program settings not found', 400);
      }

      if (points_to_redeem < program.minimum_points_to_redeem) {
         return sendError(res, `Minimum redemption is ${program.minimum_points_to_redeem} points.`, 400);
      }

      if (lookup.points_balance < points_to_redeem) {
         return sendError(res, `Insufficient points. You only have ${lookup.points_balance} points.`, 400);
      }

      const requestedDiscount = points_to_redeem * (program.redeem_rate_currency_per_point || 0);
      const maxDiscountValue = subtotal * ((program.max_discount_percent_per_order || 100) / 100);

      if (requestedDiscount > maxDiscountValue) {
         const maxAllowedPoints = Math.floor(maxDiscountValue / (program.redeem_rate_currency_per_point || 1));
         return sendError(res, `You can only discount up to ${program.max_discount_percent_per_order}% of your order. Maximum allowed points for this order is ${maxAllowedPoints}.`, 400);
      }

      sendSuccess(res, 'Valid redemption', { valid: true, discount_value: requestedDiscount });
    } catch (error: any) {
      sendError(res, error.message, 500);
    }
  };
}
