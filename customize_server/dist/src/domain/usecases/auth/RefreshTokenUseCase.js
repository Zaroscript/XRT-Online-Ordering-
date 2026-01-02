"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const jwt_1 = require("../../../infrastructure/auth/jwt");
const UserModel_1 = require("../../../infrastructure/database/models/UserModel");
const crypto_1 = __importDefault(require("crypto"));
class RefreshTokenUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(data) {
        if (!data.refreshToken) {
            throw new AppError_1.UnauthorizedError('No refresh token provided');
        }
        // Verify refresh token
        let decoded;
        try {
            decoded = (0, jwt_1.verifyToken)(data.refreshToken);
        }
        catch (error) {
            throw new AppError_1.UnauthorizedError('Invalid refresh token');
        }
        // Check if user still exists
        const user = await this.userRepository.findById(decoded.id);
        if (!user) {
            throw new AppError_1.UnauthorizedError('The user belonging to this token no longer exists');
        }
        const userDoc = await UserModel_1.UserModel.findById(user.id);
        if (!userDoc) {
            throw new AppError_1.UnauthorizedError('User not found');
        }
        // Check if user changed password after token was issued
        if (userDoc.changedPasswordAfter(decoded.iat)) {
            throw new AppError_1.UnauthorizedError('User recently changed password! Please log in again');
        }
        // Verify refresh token matches stored hash
        const hashedToken = crypto_1.default.createHash('sha256').update(data.refreshToken).digest('hex');
        if (hashedToken !== userDoc.refreshToken) {
            throw new AppError_1.UnauthorizedError('Invalid refresh token');
        }
        if (userDoc.refreshTokenExpires && new Date() > userDoc.refreshTokenExpires) {
            throw new AppError_1.UnauthorizedError('Refresh token has expired');
        }
        // Generate new access token
        const accessToken = userDoc.generateAccessToken();
        return {
            accessToken,
        };
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
