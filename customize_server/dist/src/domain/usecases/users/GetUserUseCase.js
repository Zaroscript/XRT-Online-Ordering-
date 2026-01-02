"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class GetUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(id) {
        const user = await this.userRepository.findById(id, true);
        if (!user) {
            throw new AppError_1.NotFoundError('User');
        }
        // Map to match frontend expectations
        const userObj = {
            ...user,
            id: user.id,
            is_active: user.isActive,
            permissions: user.permissions ? user.permissions.map((p) => ({ name: p })) : [],
            profile: user.profile || { avatar: { thumbnail: '' } },
        };
        return userObj;
    }
}
exports.GetUserUseCase = GetUserUseCase;
