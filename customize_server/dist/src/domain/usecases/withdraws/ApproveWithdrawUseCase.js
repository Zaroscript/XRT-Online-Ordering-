"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveWithdrawUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class ApproveWithdrawUseCase {
    constructor(withdrawRepository) {
        this.withdrawRepository = withdrawRepository;
    }
    async execute(id, approveData, approvedBy) {
        const withdraw = await this.withdrawRepository.findById(id);
        if (!withdraw) {
            throw new AppError_1.NotFoundError('Withdraw not found');
        }
        if (withdraw.status !== 'pending') {
            throw new AppError_1.ValidationError('Only pending withdraws can be approved or rejected');
        }
        return this.withdrawRepository.update(id, {
            status: approveData.status,
            note: approveData.note,
        });
    }
}
exports.ApproveWithdrawUseCase = ApproveWithdrawUseCase;
