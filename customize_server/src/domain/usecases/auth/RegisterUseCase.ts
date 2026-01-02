import { IUserRepository } from '../../repositories/IUserRepository';
import { User, CreateUserDTO, RegisterDTO } from '../../entities/User';
import { ValidationError } from '../../../shared/errors/AppError';
import { UserRole } from '../../../shared/constants/roles';
import { UserModel } from '../../../infrastructure/database/models/UserModel';

export interface RegisterResult {
  user: Omit<User, 'password' | 'refreshToken' | 'passwordResetToken'>;
  accessToken: string;
  refreshToken: string;
}

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private generateAccessToken: (user: User) => string
  ) {}

  async execute(registerData: RegisterDTO): Promise<RegisterResult> {
    // Validate required fields
    if (!registerData.name || !registerData.email || !registerData.password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (registerData.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const emailExists = await this.userRepository.exists(registerData.email);

    if (emailExists) {
      throw new ValidationError('Email already exists');
    }

    const userData: CreateUserDTO = {
      name: registerData.name.trim(),
      email: registerData.email.toLowerCase().trim(),
      password: registerData.password, // Will be hashed by Mongoose pre-save hook
      role: registerData.role || UserRole.CLIENT,
      permissions: [],
      isApproved: registerData.role === UserRole.SUPER_ADMIN, // Auto-approve super admins
    };

    const user = await this.userRepository.create(userData);

    // Get document to generate tokens
    const userDoc = await UserModel.findById(user.id);
    if (!userDoc) {
      throw new Error('Failed to create user');
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

