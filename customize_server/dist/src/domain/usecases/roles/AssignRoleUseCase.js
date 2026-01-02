"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignRoleUseCase = void 0;
class AssignRoleUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId, roleId) {
        return await this.userRepository.assignRole(userId, roleId);
    }
}
exports.AssignRoleUseCase = AssignRoleUseCase;
