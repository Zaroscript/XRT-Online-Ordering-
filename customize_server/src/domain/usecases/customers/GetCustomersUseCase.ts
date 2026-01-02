import { ICustomerRepository, CustomerFilters, PaginatedCustomers } from '../../repositories/ICustomerRepository';

export class GetCustomersUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(filters: CustomerFilters): Promise<PaginatedCustomers> {
    return await this.customerRepository.findAll(filters);
  }
}

