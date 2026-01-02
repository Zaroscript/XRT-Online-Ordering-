"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserPermissionsUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateUserPermissionsUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id, permissions) {
        if (!Array.isArray(permissions)) {
            throw new AppError_1.ValidationError('Permissions must be an array');
        }
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        const updatedUser = await this.userRepository.update(id, { permissions });
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}
exports.UpdateUserPermissionsUseCase = UpdateUserPermissionsUseCase;
