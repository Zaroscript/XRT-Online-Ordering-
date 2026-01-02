"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCustomerUseCase = void 0;
class DeleteCustomerUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(id, business_id) {
        await this.customerRepository.delete(id, business_id);
    }
}
exports.DeleteCustomerUseCase = DeleteCustomerUseCase;
