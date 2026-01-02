import { ICustomerRepository } from '../../repositories/ICustomerRepository';
import { CreateCustomerDTO, Customer } from '../../entities/Customer';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(customerData: CreateCustomerDTO): Promise<Customer> {
    if (!customerData.name || !customerData.email || !customerData.phoneNumber || !customerData.business_id) {
      throw new ValidationError('Name, email, phone number, and business_id are required');
    }

    // Check if customer with same email exists in this business
    const emailExists = await this.customerRepository.exists(customerData.email, customerData.business_id);

    if (emailExists) {
      throw new ValidationError('Customer with this email already exists in this business');
    }

    const finalCustomerData: CreateCustomerDTO = {
      ...customerData,
      name: customerData.name.trim(),
      email: customerData.email.toLowerCase().trim(),
      phoneNumber: customerData.phoneNumber.trim(),
      rewards: customerData.rewards || 0,
    };

    const customer = await this.customerRepository.create(finalCustomerData);

    return customer;
  }
}

