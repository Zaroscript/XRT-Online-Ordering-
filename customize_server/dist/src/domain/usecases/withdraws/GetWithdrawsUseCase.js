"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWithdrawsUseCase = void 0;
class GetWithdrawsUseCase {
    constructor(withdrawRepository) {
        this.withdrawRepository = withdrawRepository;
    }
    async execute(filters) {
        return this.withdrawRepository.findAll(filters);
    }
}
exports.GetWithdrawsUseCase = GetWithdrawsUseCase;
