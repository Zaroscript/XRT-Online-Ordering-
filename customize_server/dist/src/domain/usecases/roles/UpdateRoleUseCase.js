"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoleUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const roles_1 = require("../../../shared/constants/roles");
class UpdateRoleUseCase {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async execute(id, roleData) {
        // Validate permissions if provided
        if (roleData.permissions) {
            const invalidPermissions = roleData.permissions.filter((perm) => !roles_1.ALL_PERMISSIONS.includes(perm));
            if (invalidPermissions.length > 0) {
                throw new AppError_1.ValidationError(`Invalid permissions: ${invalidPermissions.join(', ')}`);
            }
        }
        return this.roleRepository.update(id, roleData);
    }
}
exports.UpdateRoleUseCase = UpdateRoleUseCase;
