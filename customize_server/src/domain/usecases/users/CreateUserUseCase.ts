import { IUserRepository } from '../../repositories/IUserRepository';
import { CreateUserDTO, User } from '../../entities/User';
import { ValidationError } from '../../../shared/errors/AppError';
import { UserRole } from '../../../shared/constants/roles';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userData: CreateUserDTO): Promise<Omit<User, 'password'>> {
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      throw new ValidationError('Name, email, password, and role are required');
    }

    if (userData.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    const emailExists = await this.userRepository.exists(userData.email);

    if (emailExists) {
      throw new ValidationError('Email already exists');
    }

    const finalUserData: CreateUserDTO = {
      ...userData,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      permissions: userData.permissions || [],
      isApproved: true, // Admin-created users are auto-approved
    };

    const user = await this.userRepository.create(finalUserData);
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}

