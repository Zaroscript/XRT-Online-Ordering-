"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomerUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetCustomerUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(id, business_id) {
        const customer = await this.customerRepository.findById(id, business_id);
        if (!customer) {
            throw new AppError_1.NotFoundError('Customer');
        }
        return customer;
    }
}
exports.GetCustomerUseCase = GetCustomerUseCase;
