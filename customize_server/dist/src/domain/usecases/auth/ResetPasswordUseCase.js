"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const UserModel_1 = require("../../../infrastructure/database/models/UserModel");
const crypto_1 = __importDefault(require("crypto"));
class ResetPasswordUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(data) {
        if (!data.email || !data.otp) {
            throw new AppError_1.ValidationError('Email and OTP are required');
        }
        if (!data.password || typeof data.password !== 'string') {
            throw new AppError_1.ValidationError('Password is required and must be a string');
        }
        if (data.password.length < 8) {
            throw new AppError_1.ValidationError('Password must be at least 8 characters long');
        }
        // Hash the OTP
        const hashedOtp = crypto_1.default.createHash('sha256').update(data.otp).digest('hex');
        // Find user with matching OTP
        const userDoc = await UserModel_1.UserModel.findOne({
            email: data.email.toLowerCase(),
            passwordResetToken: hashedOtp,
            passwordResetExpires: { $gt: new Date() },
        }).select('+password');
        if (!userDoc) {
            throw new AppError_1.UnauthorizedError('OTP is invalid or has expired');
        }
        // Update password
        userDoc.password = data.password;
        userDoc.passwordResetToken = undefined;
        userDoc.passwordResetExpires = undefined;
        await userDoc.save();
        return {
            message: 'Password reset successful! You can now login with your new password.',
        };
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
