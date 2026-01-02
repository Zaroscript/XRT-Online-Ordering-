"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordUseCase = void 0;
const UserModel_1 = require("../../../infrastructure/database/models/UserModel");
class ForgotPasswordUseCase {
    constructor(userRepository, emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
    async execute(data) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            // Don't reveal if user exists for security
            return {
                message: 'If an account exists with this email, a password reset OTP has been sent',
            };
        }
        const userDoc = await UserModel_1.UserModel.findById(user.id);
        if (!userDoc) {
            return {
                message: 'If an account exists with this email, a password reset OTP has been sent',
            };
        }
        // Generate reset token
        const otp = userDoc.createPasswordResetToken();
        await userDoc.save({ validateBeforeSave: false });
        // Send email
        const message = `Your password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes.\nIf you didn't request a password reset, please ignore this email.`;
        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('📧 Development mode: OTP for', user.email, 'is:', otp);
                return {
                    message: 'OTP sent to email! (Development mode - check console)',
                    otp, // Only in development
                };
            }
            else {
                await this.emailService.sendEmail({
                    email: user.email,
                    subject: 'Your password reset OTP (valid for 10 min)',
                    message,
                });
                return {
                    message: 'OTP sent to email!',
                };
            }
        }
        catch (error) {
            userDoc.passwordResetToken = undefined;
            userDoc.passwordResetExpires = undefined;
            await userDoc.save({ validateBeforeSave: false });
            throw new Error('There was an error sending the email. Try again later!');
        }
    }
}
exports.ForgotPasswordUseCase = ForgotPasswordUseCase;
