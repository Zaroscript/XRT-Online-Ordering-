import { IUserRepository } from '../../repositories/IUserRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class UpdateUserPermissionsUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string, permissions: string[]): Promise<Omit<any, 'password'>> {
    if (!Array.isArray(permissions)) {
      throw new ValidationError('Permissions must be an array');
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await this.userRepository.update(id, { permissions });
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}

