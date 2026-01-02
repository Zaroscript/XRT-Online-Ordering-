import { ICustomerRepository } from '../../repositories/ICustomerRepository';

export class DeleteCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string, business_id?: string): Promise<void> {
    await this.customerRepository.delete(id, business_id);
  }
}

