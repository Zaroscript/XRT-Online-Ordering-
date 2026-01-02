import { IUserRepository } from '../../repositories/IUserRepository';
import { UpdateUserDTO, User } from '../../entities/User';
import { NotFoundError } from '../../../shared/errors/AppError';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, userData: UpdateUserDTO): Promise<Omit<User, 'password'>> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      throw new NotFoundError('User');
    }

    const updateData: UpdateUserDTO = { ...userData };

    if (userData.name) {
      updateData.name = userData.name.trim();
    }

    if (userData.email) {
      updateData.email = userData.email.toLowerCase().trim();
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}

