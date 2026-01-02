"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoleUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const roles_1 = require("../../../shared/constants/roles");
class CreateRoleUseCase {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async execute(roleData, createdBy) {
        // Validate permissions
        const invalidPermissions = roleData.permissions.filter((perm) => !roles_1.ALL_PERMISSIONS.includes(perm));
        if (invalidPermissions.length > 0) {
            throw new AppError_1.ValidationError(`Invalid permissions: ${invalidPermissions.join(', ')}`);
        }
        // Check if role name already exists
        const existing = await this.roleRepository.findByName(roleData.name);
        if (existing) {
            throw new AppError_1.ValidationError(`Role with name "${roleData.name}" already exists`);
        }
        return this.roleRepository.create(roleData, createdBy);
    }
}
exports.CreateRoleUseCase = CreateRoleUseCase;
