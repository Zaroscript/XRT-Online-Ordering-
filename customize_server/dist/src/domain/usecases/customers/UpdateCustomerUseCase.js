"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCustomerUseCase = void 0;
class UpdateCustomerUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(id, customerData, business_id) {
        const updateData = { ...customerData };
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
exports.UpdateCustomerUseCase = UpdateCustomerUseCase;
