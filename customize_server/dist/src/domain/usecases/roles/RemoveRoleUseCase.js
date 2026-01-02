"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRoleUseCase = void 0;
class RemoveRoleUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        return await this.userRepository.removeRole(userId);
    }
}
exports.RemoveRoleUseCase = RemoveRoleUseCase;
