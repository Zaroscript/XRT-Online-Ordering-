import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { GetOrCreateDefaultBusinessUseCase } from '../../domain/usecases/businesses/GetOrCreateDefaultBusinessUseCase';
import { UpdateBusinessUseCase } from '../../domain/usecases/businesses/UpdateBusinessUseCase';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import { sendSuccess } from '../../shared/utils/response';
import { sendError } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';

/**
 * Single-tenant: one business only. No creating or deleting businesses.
 */
export class BusinessController {
  private getOrCreateDefaultBusinessUseCase: GetOrCreateDefaultBusinessUseCase;
  private updateBusinessUseCase: UpdateBusinessUseCase;

  constructor() {
    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();

    this.getOrCreateDefaultBusinessUseCase = new GetOrCreateDefaultBusinessUseCase(
      businessRepository,
      businessSettingsRepository
    );
    this.updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository);
  }

  /** Single-tenant: creating additional businesses is disabled */
  createBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    return sendError(
      res,
      'Single-tenant: only one business is allowed. Use the dashboard to update your store.',
      403
    );
  });

  /** Single-tenant: deleting the only business is disabled */
  deleteBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    return sendError(
      res,
      'Single-tenant: you cannot delete the only business.',
      403
    );
  });

  /** Returns the single business; creates it with defaults if none exists (first-time setup) */
  getBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business = await this.getOrCreateDefaultBusinessUseCase.execute(req.user!.id);
    return sendSuccess(res, 'Business retrieved successfully', { business });
  });

  /** Updates the single business */
  updateBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.getOrCreateDefaultBusinessUseCase.execute(req.user!.id);
    const business = await this.updateBusinessUseCase.execute(req.body);
    return sendSuccess(res, 'Business updated successfully', { business });
  });
}
