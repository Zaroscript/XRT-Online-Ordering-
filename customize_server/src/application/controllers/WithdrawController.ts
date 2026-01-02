import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetWithdrawsUseCase } from '../../domain/usecases/withdraws/GetWithdrawsUseCase';
import { GetWithdrawUseCase } from '../../domain/usecases/withdraws/GetWithdrawUseCase';
import { CreateWithdrawUseCase } from '../../domain/usecases/withdraws/CreateWithdrawUseCase';
import { UpdateWithdrawUseCase } from '../../domain/usecases/withdraws/UpdateWithdrawUseCase';
import { ApproveWithdrawUseCase } from '../../domain/usecases/withdraws/ApproveWithdrawUseCase';
import { DeleteWithdrawUseCase } from '../../domain/usecases/withdraws/DeleteWithdrawUseCase';
import { WithdrawRepository } from '../../infrastructure/repositories/WithdrawRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class WithdrawController {
  private getWithdrawsUseCase: GetWithdrawsUseCase;
  private getWithdrawUseCase: GetWithdrawUseCase;
  private createWithdrawUseCase: CreateWithdrawUseCase;
  private updateWithdrawUseCase: UpdateWithdrawUseCase;
  private approveWithdrawUseCase: ApproveWithdrawUseCase;
  private deleteWithdrawUseCase: DeleteWithdrawUseCase;

  constructor() {
    const withdrawRepository = new WithdrawRepository();

    this.getWithdrawsUseCase = new GetWithdrawsUseCase(withdrawRepository);
    this.getWithdrawUseCase = new GetWithdrawUseCase(withdrawRepository);
    this.createWithdrawUseCase = new CreateWithdrawUseCase(withdrawRepository);
    this.updateWithdrawUseCase = new UpdateWithdrawUseCase(withdrawRepository);
    this.approveWithdrawUseCase = new ApproveWithdrawUseCase(withdrawRepository);
    this.deleteWithdrawUseCase = new DeleteWithdrawUseCase(withdrawRepository);
  }

  getAllWithdraws = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortedBy = 'desc',
      search,
      business_id,
      status,
    } = req.query;

    // For non-super-admins, filter by their business_id
    const filterBusinessId = req.user?.role === 'SUPER_ADMIN' 
      ? (business_id as string) 
      : (req.user?.business_id || business_id as string);

    const result = await this.getWithdrawsUseCase.execute({
      page: Number(page),
      limit: Number(limit),
      orderBy: orderBy as string,
      sortedBy: sortedBy as 'asc' | 'desc',
      search: search as string,
      business_id: filterBusinessId,
      status: status as string,
    });

    // Map withdraws to match frontend expectations
    const mappedWithdraws = result.withdraws.map((withdraw) => ({
      ...withdraw,
      shop_id: withdraw.business_id,
      shop: (withdraw as any).business_id, // Populated business
    }));

    return sendSuccess(res, 'Withdraws retrieved successfully', {
      withdraws: mappedWithdraws,
      paginatorInfo: {
        total: result.total,
        currentPage: result.page,
        lastPage: result.totalPages,
        perPage: result.limit,
        count: result.withdraws.length,
      },
    });
  });

  getWithdraw = asyncHandler(async (req: Request, res: Response) => {
    const withdraw = await this.getWithdrawUseCase.execute(req.params.id);

    return sendSuccess(res, 'Withdraw retrieved successfully', {
      withdraw: {
        ...withdraw,
        shop_id: withdraw.business_id,
        shop: (withdraw as any).business_id,
      },
    });
  });

  createWithdraw = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, business_id, payment_method, details, note } = req.body;
    const createdBy = req.user?.id || '';

    // Use business_id from body or user's business_id
    const withdrawBusinessId = business_id || req.user?.business_id;
    if (!withdrawBusinessId) {
      throw new Error('business_id is required');
    }

    const withdraw = await this.createWithdrawUseCase.execute(
      {
        amount,
        business_id: withdrawBusinessId,
        payment_method,
        details,
        note,
      },
      createdBy
    );

    return sendSuccess(
      res,
      'Withdraw created successfully',
      {
        withdraw: {
          ...withdraw,
          shop_id: withdraw.business_id,
        },
      },
      201
    );
  });

  updateWithdraw = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { payment_method, details, note } = req.body;

    const withdraw = await this.updateWithdrawUseCase.execute(id, {
      payment_method,
      details,
      note,
    });

    return sendSuccess(res, 'Withdraw updated successfully', {
      withdraw: {
        ...withdraw,
        shop_id: withdraw.business_id,
      },
    });
  });

  approveWithdraw = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const approvedBy = req.user?.id || '';

    const withdraw = await this.approveWithdrawUseCase.execute(
      id,
      { status, note },
      approvedBy
    );

    return sendSuccess(res, 'Withdraw status updated successfully', {
      withdraw: {
        ...withdraw,
        shop_id: withdraw.business_id,
      },
    });
  });

  deleteWithdraw = asyncHandler(async (req: Request, res: Response) => {
    await this.deleteWithdrawUseCase.execute(req.params.id);

    return sendSuccess(res, 'Withdraw deleted successfully');
  });
}

