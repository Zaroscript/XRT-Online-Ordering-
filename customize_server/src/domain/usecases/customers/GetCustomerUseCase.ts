import { ICustomerRepository } from '../../repositories/ICustomerRepository';
import { Customer } from '../../entities/Customer';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string, business_id?: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id, business_id);

    if (!customer) {
      throw new NotFoundError('Customer');
    }

    return customer;
  }
}

