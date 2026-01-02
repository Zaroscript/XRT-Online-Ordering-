"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePasswordUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const UserModel_1 = require("../../../infrastructure/database/models/UserModel");
class UpdatePasswordUseCase {
    constructor(userRepository, generateAccessToken) {
        this.userRepository = userRepository;
        this.generateAccessToken = generateAccessToken;
    }
    async execute(userId, data) {
        const user = await this.userRepository.findById(userId, true);
        if (!user) {
            throw new AppError_1.UnauthorizedError('User not found');
        }
        const userDoc = await UserModel_1.UserModel.findById(userId).select('+password');
        if (!userDoc) {
            throw new AppError_1.UnauthorizedError('User not found');
        }
        // Check current password
        const isCurrentPasswordValid = await userDoc.comparePassword(data.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new AppError_1.UnauthorizedError('Your current password is wrong');
        }
        // Validate new password
        if (!data.newPassword || typeof data.newPassword !== 'string') {
            throw new AppError_1.ValidationError('New password is required and must be a string');
        }
        if (data.newPassword.length < 8) {
            throw new AppError_1.ValidationError('New password must be at least 8 characters long');
        }
        // Update password
        userDoc.password = data.newPassword;
        await userDoc.save();
        // Generate new tokens
        const accessToken = userDoc.generateAccessToken();
        const refreshToken = userDoc.generateRefreshToken();
        await userDoc.save({ validateBeforeSave: false });
        const updatedUser = await this.userRepository.findById(userId);
        if (!updatedUser) {
            throw new Error('Failed to retrieve updated user');
        }
        const { password, refreshToken: rt, passwordResetToken, ...userWithoutSensitive } = updatedUser;
        return {
            user: userWithoutSensitive,
            accessToken,
            refreshToken,
        };
    }
}
exports.UpdatePasswordUseCase = UpdatePasswordUseCase;
