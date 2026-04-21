import { IUserRepository } from '../../repositories/IUserRepository';
import { User, LoginDTO } from '../../entities/User';
import { UnauthorizedError, ForbiddenError } from '../../../shared/errors/AppError';
import { UserModel } from '../../../infrastructure/database/models/UserModel';

export interface LoginResult {
  user: Omit<User, 'password' | 'refreshToken' | 'passwordResetToken'>;
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private generateAccessToken: (user: User) => string
  ) {}

  async execute(loginData: LoginDTO): Promise<LoginResult> {
    const user = await this.userRepository.findByIdentity(loginData.identity, true);

    if (!user) {
      throw new UnauthorizedError('Incorrect email, contact number or password');
    }

    // Get the Mongoose document to use instance methods
    const userDoc = await UserModel.findById(user.id).select('+password');
    if (!userDoc) {
      throw new UnauthorizedError('Incorrect email, contact number or password');
    }

    const isPasswordValid = await userDoc.comparePassword(loginData.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Incorrect email or password');
    }

    // Check if account is approved
    if (!userDoc.isApproved) {
      throw new ForbiddenError('Your account is pending approval');
    }

    // Check if account is banned
    if (userDoc.isBanned) {
      throw new ForbiddenError(userDoc.banReason || 'Your account has been banned');
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

