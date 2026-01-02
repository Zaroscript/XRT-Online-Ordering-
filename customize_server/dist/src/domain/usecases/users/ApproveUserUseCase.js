"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveUserUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class ApproveUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        const updatedUser = await this.userRepository.update(id, { isApproved: true });
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}
exports.ApproveUserUseCase = ApproveUserUseCase;
