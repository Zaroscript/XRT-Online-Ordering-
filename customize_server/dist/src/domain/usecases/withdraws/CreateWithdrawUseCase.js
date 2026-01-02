"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWithdrawUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateWithdrawUseCase {
    constructor(withdrawRepository) {
        this.withdrawRepository = withdrawRepository;
    }
    async execute(withdrawData, createdBy) {
        if (withdrawData.amount <= 0) {
            throw new AppError_1.ValidationError('Amount must be greater than 0');
        }
        return this.withdrawRepository.create(withdrawData, createdBy);
    }
}
exports.CreateWithdrawUseCase = CreateWithdrawUseCase;
