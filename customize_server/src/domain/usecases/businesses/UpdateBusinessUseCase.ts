import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { Business, UpdateBusinessDTO } from '../../entities/Business';
import { NotFoundError } from '../../../shared/errors/AppError';

export class UpdateBusinessUseCase {
  constructor(private businessRepository: IBusinessRepository) {}

  async execute(id: string, ownerId: string, businessData: UpdateBusinessDTO): Promise<Business> {
    const existingBusiness = await this.businessRepository.findById(id, ownerId);

    if (!existingBusiness) {
      throw new NotFoundError('Business');
    }

    return await this.businessRepository.update(id, ownerId, businessData);
  }
}

