import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { Business, UpdateBusinessDTO } from '../../entities/Business';
import { NotFoundError } from '../../../shared/errors/AppError';

export class UpdateBusinessUseCase {
  constructor(private businessRepository: IBusinessRepository) {}

  async execute(businessData: UpdateBusinessDTO): Promise<Business> {
    const existingBusiness = await this.businessRepository.findOne();

    if (!existingBusiness) {
      throw new NotFoundError('Business');
    }

    return await this.businessRepository.update(existingBusiness.id, businessData);
  }
}
