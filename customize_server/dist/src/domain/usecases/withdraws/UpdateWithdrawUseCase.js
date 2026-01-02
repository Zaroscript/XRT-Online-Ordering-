"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWithdrawUseCase = void 0;
class UpdateWithdrawUseCase {
    constructor(withdrawRepository) {
        this.withdrawRepository = withdrawRepository;
    }
    async execute(id, withdrawData) {
        return this.withdrawRepository.update(id, withdrawData);
    }
}
exports.UpdateWithdrawUseCase = UpdateWithdrawUseCase;
