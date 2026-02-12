import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth'; // Adjust path if needed
import { KitchenSectionRepository } from '../../infrastructure/repositories/KitchenSectionRepository';
import { GetKitchenSectionsUseCase } from '../../domain/usecases/kitchen-sections/GetKitchenSectionsUseCase';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class KitchenSectionController {
  private getKitchenSectionsUseCase: GetKitchenSectionsUseCase;

  constructor() {
    const kitchenSectionRepository = new KitchenSectionRepository();
    this.getKitchenSectionsUseCase = new GetKitchenSectionsUseCase(kitchenSectionRepository);
  }

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    // Allow looking up by specific business_id if provided, otherwise fail or restricted?
    // Using cast for simplicity as repository handles string
    const sections = await this.getKitchenSectionsUseCase.execute(business_id as string);

    return sendSuccess(res, 'Kitchen sections retrieved successfully', sections);
  });
}
