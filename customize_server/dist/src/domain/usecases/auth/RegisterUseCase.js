"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const roles_1 = require("../../../shared/constants/roles");
const UserModel_1 = require("../../../infrastructure/database/models/UserModel");
class RegisterUseCase {
    constructor(userRepository, generateAccessToken) {
        this.userRepository = userRepository;
        this.generateAccessToken = generateAccessToken;
    }
    async execute(registerData) {
        // Validate required fields
        if (!registerData.name || !registerData.email || !registerData.password) {
            throw new AppError_1.ValidationError('Name, email, and password are required');
        }
        if (registerData.password.length < 8) {
            throw new AppError_1.ValidationError('Password must be at least 8 characters long');
        }
        const emailExists = await this.userRepository.exists(registerData.email);
        if (emailExists) {
            throw new AppError_1.ValidationError('Email already exists');
        }
        const userData = {
            name: registerData.name.trim(),
            email: registerData.email.toLowerCase().trim(),
            password: registerData.password, // Will be hashed by Mongoose pre-save hook
            role: registerData.role || roles_1.UserRole.CLIENT,
            permissions: [],
            isApproved: registerData.role === roles_1.UserRole.SUPER_ADMIN, // Auto-approve super admins
        };
        const user = await this.userRepository.create(userData);
        // Get document to generate tokens
        const userDoc = await UserModel_1.UserModel.findById(user.id);
        if (!userDoc) {
            throw new Error('Failed to create user');
        }
        const accessToken = userDoc.generateAccessToken();
        const refreshToken = userDoc.generateRefreshToken();
        await userDoc.save({ validateBeforeSave: false });
        const { password, refreshToken: rt, passwordResetToken, ...userWithoutSensitive } = user;
        return {
            user: userWithoutSensitive,
            accessToken,
            refreshToken,
        };
    }
}
exports.RegisterUseCase = RegisterUseCase;
