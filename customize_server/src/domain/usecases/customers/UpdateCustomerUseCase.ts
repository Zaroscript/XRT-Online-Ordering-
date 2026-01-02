import { ICustomerRepository } from '../../repositories/ICustomerRepository';
import { UpdateCustomerDTO, Customer } from '../../entities/Customer';
import { NotFoundError } from '../../../shared/errors/AppError';

export class UpdateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(id: string, customerData: UpdateCustomerDTO, business_id?: string): Promise<Customer> {
    const updateData: UpdateCustomerDTO = { ...customerData };

    if (customerData.name) {
      updateData.name = customerData.name.trim();
    }

    if (customerData.email) {
      updateData.email = customerData.email.toLowerCase().trim();
    }

    if (customerData.phoneNumber) {
      updateData.phoneNumber = customerData.phoneNumber.trim();
    }

    const customer = await this.customerRepository.update(id, updateData, business_id);

    return customer;
  }
}

