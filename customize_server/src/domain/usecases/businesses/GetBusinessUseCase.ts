import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { Business } from '../../entities/Business';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetBusinessUseCase {
  constructor(private businessRepository: IBusinessRepository) {}

  async execute(id: string, ownerId?: string): Promise<Business> {
    const business = await this.businessRepository.findById(id, ownerId);

    if (!business) {
      throw new NotFoundError('Business');
    }

    return business;
  }
}

