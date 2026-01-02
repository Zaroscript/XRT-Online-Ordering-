"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWithdrawUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetWithdrawUseCase {
    constructor(withdrawRepository) {
        this.withdrawRepository = withdrawRepository;
    }
    async execute(id) {
        const withdraw = await this.withdrawRepository.findById(id);
        if (!withdraw) {
            throw new AppError_1.NotFoundError('Withdraw not found');
        }
        return withdraw;
    }
}
exports.GetWithdrawUseCase = GetWithdrawUseCase;
