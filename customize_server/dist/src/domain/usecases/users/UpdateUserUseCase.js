"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id, userData) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            throw new AppError_1.NotFoundError('User');
        }
        const updateData = { ...userData };
        if (userData.name) {
            updateData.name = userData.name.trim();
        }
        if (userData.email) {
            updateData.email = userData.email.toLowerCase().trim();
        }
        const updatedUser = await this.userRepository.update(id, updateData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}
exports.UpdateUserUseCase = UpdateUserUseCase;
