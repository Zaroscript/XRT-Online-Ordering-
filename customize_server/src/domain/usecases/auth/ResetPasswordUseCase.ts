import { IUserRepository } from '../../repositories/IUserRepository';
import { ResetPasswordDTO } from '../../entities/User';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/AppError';
import { UserModel } from '../../../infrastructure/database/models/UserModel';
import crypto from 'crypto';

export class ResetPasswordUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: ResetPasswordDTO): Promise<{ message: string }> {
    if (!data.email || !data.otp) {
      throw new ValidationError('Email and OTP are required');
    }

    if (!data.password || typeof data.password !== 'string') {
      throw new ValidationError('Password is required and must be a string');
    }

    if (data.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Hash the OTP
    const hashedOtp = crypto.createHash('sha256').update(data.otp).digest('hex');

    // Find user with matching OTP
    const userDoc = await UserModel.findOne({
      email: data.email.toLowerCase(),
      passwordResetToken: hashedOtp,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!userDoc) {
      throw new UnauthorizedError('OTP is invalid or has expired');
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

