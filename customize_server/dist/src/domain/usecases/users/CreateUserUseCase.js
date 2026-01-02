"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userData) {
        if (!userData.name || !userData.email || !userData.password || !userData.role) {
            throw new AppError_1.ValidationError('Name, email, password, and role are required');
        }
        if (userData.password.length < 8) {
            throw new AppError_1.ValidationError('Password must be at least 8 characters long');
        }
        const emailExists = await this.userRepository.exists(userData.email);
        if (emailExists) {
            throw new AppError_1.ValidationError('Email already exists');
        }
        const finalUserData = {
            ...userData,
            name: userData.name.trim(),
            email: userData.email.toLowerCase().trim(),
            permissions: userData.permissions || [],
            isApproved: true, // Admin-created users are auto-approved
        };
        const user = await this.userRepository.create(finalUserData);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
