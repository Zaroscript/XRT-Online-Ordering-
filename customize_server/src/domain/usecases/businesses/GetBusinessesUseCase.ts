import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { Business } from '../../entities/Business';

export class GetBusinessesUseCase {
  constructor(private businessRepository: IBusinessRepository) {}

  async execute(ownerId: string): Promise<Business[]> {
    return await this.businessRepository.findByOwner(ownerId);
  }
}

