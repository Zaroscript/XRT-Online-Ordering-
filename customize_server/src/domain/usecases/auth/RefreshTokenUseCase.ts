import { IUserRepository } from '../../repositories/IUserRepository';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { verifyToken, generateToken } from '../../../infrastructure/auth/jwt';
import { UserModel } from '../../../infrastructure/database/models/UserModel';
import crypto from 'crypto';
import { env } from '../../../shared/config/env';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResult {
  accessToken: string;
}

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: RefreshTokenDTO): Promise<RefreshTokenResult> {
    if (!data.refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    // Verify refresh token
    let decoded: any;
    try {
      decoded = verifyToken(data.refreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if user still exists
    const user = await this.userRepository.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('The user belonging to this token no longer exists');
    }

    const userDoc = await UserModel.findById(user.id);
    if (!userDoc) {
      throw new UnauthorizedError('User not found');
    }

    // Check if user changed password after token was issued
    if (userDoc.changedPasswordAfter(decoded.iat)) {
      throw new UnauthorizedError('User recently changed password! Please log in again');
    }

    // Verify refresh token matches stored hash
    const hashedToken = crypto.createHash('sha256').update(data.refreshToken).digest('hex');

    if (hashedToken !== userDoc.refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (userDoc.refreshTokenExpires && new Date() > userDoc.refreshTokenExpires) {
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Generate new access token
    const accessToken = userDoc.generateAccessToken();

    return {
      accessToken,
    };
  }
}

