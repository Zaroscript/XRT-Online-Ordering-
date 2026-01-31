import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateBusinessUseCase } from '../../domain/usecases/businesses/CreateBusinessUseCase';
import { GetBusinessUseCase } from '../../domain/usecases/businesses/GetBusinessUseCase';
import { UpdateBusinessUseCase } from '../../domain/usecases/businesses/UpdateBusinessUseCase';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class BusinessController {
  private createBusinessUseCase: CreateBusinessUseCase;
  private getBusinessUseCase: GetBusinessUseCase;
  private updateBusinessUseCase: UpdateBusinessUseCase;

  constructor() {
    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();

    this.createBusinessUseCase = new CreateBusinessUseCase(
      businessRepository,
      businessSettingsRepository
    );
    this.getBusinessUseCase = new GetBusinessUseCase(businessRepository);
    this.updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository);
  }

  createBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business = await this.createBusinessUseCase.execute({
      ...req.body,
      owner: req.user!.id,
    });

    return sendSuccess(res, 'Business created successfully', { business }, 201);
  });

  getBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business = await this.getBusinessUseCase.execute();

    return sendSuccess(res, 'Business retrieved successfully', { business });
  });

  updateBusiness = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business = await this.updateBusinessUseCase.execute(req.body);

    return sendSuccess(res, 'Business updated successfully', { business });
  });
}
