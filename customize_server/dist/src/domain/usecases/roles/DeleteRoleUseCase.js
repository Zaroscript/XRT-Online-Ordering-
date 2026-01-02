"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRoleUseCase = void 0;
class DeleteRoleUseCase {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async execute(id) {
        await this.roleRepository.delete(id);
    }
}
exports.DeleteRoleUseCase = DeleteRoleUseCase;
