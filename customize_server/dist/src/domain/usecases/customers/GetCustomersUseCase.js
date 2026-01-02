"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCustomersUseCase = void 0;
class GetCustomersUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    async execute(filters) {
        return await this.customerRepository.findAll(filters);
    }
}
exports.GetCustomersUseCase = GetCustomersUseCase;
