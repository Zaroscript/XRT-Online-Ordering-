"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateCustomerUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(customerData) {
        if (!customerData.name || !customerData.email || !customerData.phoneNumber || !customerData.business_id) {
            throw new AppError_1.ValidationError('Name, email, phone number, and business_id are required');
        }
        // Check if customer with same email exists in this business
        const emailExists = await this.customerRepository.exists(customerData.email, customerData.business_id);
        if (emailExists) {
            throw new AppError_1.ValidationError('Customer with this email already exists in this business');
        }
        const finalCustomerData = {
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
exports.CreateCustomerUseCase = CreateCustomerUseCase;
