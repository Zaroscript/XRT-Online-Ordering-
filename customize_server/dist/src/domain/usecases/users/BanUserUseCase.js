"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanUserUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class BanUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id, isBanned, banReason) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        const updateData = {
            isBanned,
            banReason: isBanned ? banReason : undefined,
        };
        const updatedUser = await this.userRepository.update(id, updateData);
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}
exports.BanUserUseCase = BanUserUseCase;
