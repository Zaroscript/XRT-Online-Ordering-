"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const UserModel_1 = require("../../../infrastructure/database/models/UserModel");
class LoginUseCase {
    constructor(userRepository, generateAccessToken) {
        this.userRepository = userRepository;
        this.generateAccessToken = generateAccessToken;
    }
    async execute(loginData) {
        // Normalize email to lowercase for consistent lookup
        const normalizedEmail = loginData.email.toLowerCase().trim();
        const user = await this.userRepository.findByEmail(normalizedEmail, true);
        if (!user) {
            throw new AppError_1.UnauthorizedError('Incorrect email or password');
        }
        // Get the Mongoose document to use instance methods
        const userDoc = await UserModel_1.UserModel.findById(user.id).select('+password');
        if (!userDoc) {
            throw new AppError_1.UnauthorizedError('Incorrect email or password');
        }
        const isPasswordValid = await userDoc.comparePassword(loginData.password);
        if (!isPasswordValid) {
            throw new AppError_1.UnauthorizedError('Incorrect email or password');
        }
        // Check if account is approved
        if (!userDoc.isApproved) {
            throw new AppError_1.ForbiddenError('Your account is pending approval');
        }
        // Check if account is banned
        if (userDoc.isBanned) {
            throw new AppError_1.ForbiddenError(userDoc.banReason || 'Your account has been banned');
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
exports.LoginUseCase = LoginUseCase;
