import { IUserRepository } from '../../repositories/IUserRepository';
import { UpdatePasswordDTO } from '../../entities/User';
import { ValidationError, UnauthorizedError } from '../../../shared/errors/AppError';
import { UserModel } from '../../../infrastructure/database/models/UserModel';
import { generateToken } from '../../../infrastructure/auth/jwt';

export interface UpdatePasswordResult {
  user: Omit<any, 'password' | 'refreshToken' | 'passwordResetToken'>;
  accessToken: string;
  refreshToken: string;
}

export class UpdatePasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private generateAccessToken: (user: any) => string
  ) {}

  async execute(userId: string, data: UpdatePasswordDTO): Promise<UpdatePasswordResult> {
    const user = await this.userRepository.findById(userId, true);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const userDoc = await UserModel.findById(userId).select('+password');
    if (!userDoc) {
      throw new UnauthorizedError('User not found');
    }

    // Check current password
    const isCurrentPasswordValid = await userDoc.comparePassword(data.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Your current password is wrong');
    }

    // Validate new password
    if (!data.newPassword || typeof data.newPassword !== 'string') {
      throw new ValidationError('New password is required and must be a string');
    }

    if (data.newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
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

    const { password, refreshToken: rt, passwordResetToken, ...userWithoutSensitive } =
      updatedUser;

    return {
      user: userWithoutSensitive,
      accessToken,
      refreshToken,
    };
  }
}

