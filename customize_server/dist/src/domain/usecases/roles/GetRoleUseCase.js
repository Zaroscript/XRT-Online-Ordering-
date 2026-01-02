"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoleUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetRoleUseCase {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async execute(id) {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new AppError_1.NotFoundError('Role not found');
        }
        return role;
    }
}
exports.GetRoleUseCase = GetRoleUseCase;
