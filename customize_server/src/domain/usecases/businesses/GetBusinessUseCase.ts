import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { Business } from '../../entities/Business';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetBusinessUseCase {
  constructor(private businessRepository: IBusinessRepository) {}

  async execute(): Promise<Business> {
    const business = await this.businessRepository.findOne();

    if (!business) {
      throw new NotFoundError('Business');
    }

    return business;
  }
}
