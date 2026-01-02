"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserPermissionsUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetUserPermissionsUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        return {
            permissions: user.permissions || [],
            role: user.role,
        };
    }
}
exports.GetUserPermissionsUseCase = GetUserPermissionsUseCase;
