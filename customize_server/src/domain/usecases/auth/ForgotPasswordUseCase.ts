import { IUserRepository } from '../../repositories/IUserRepository';
import { ForgotPasswordDTO } from '../../entities/User';
import { NotFoundError } from '../../../shared/errors/AppError';
import { UserModel } from '../../../infrastructure/database/models/UserModel';
import { IEmailService } from '../../services/IEmailService';

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(data: ForgotPasswordDTO): Promise<{ message: string; otp?: string }> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      // Don't reveal if user exists for security
      return {
        message: 'If an account exists with this email, a password reset OTP has been sent',
      };
    }

    const userDoc = await UserModel.findById(user.id);
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
      } else {
        await this.emailService.sendEmail({
          email: user.email,
          subject: 'Your password reset OTP (valid for 10 min)',
          message,
        });

        return {
          message: 'OTP sent to email!',
        };
      }
    } catch (error) {
      userDoc.passwordResetToken = undefined;
      userDoc.passwordResetExpires = undefined;
      await userDoc.save({ validateBeforeSave: false });

      throw new Error('There was an error sending the email. Try again later!');
    }
  }
}

