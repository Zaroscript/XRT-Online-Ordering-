"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteWithdrawUseCase = void 0;
class DeleteWithdrawUseCase {
    constructor(withdrawRepository) {
        this.withdrawRepository = withdrawRepository;
    }
    async execute(id) {
        await this.withdrawRepository.delete(id);
    }
}
exports.DeleteWithdrawUseCase = DeleteWithdrawUseCase;
