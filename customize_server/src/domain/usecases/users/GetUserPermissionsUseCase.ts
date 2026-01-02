import { IUserRepository } from '../../repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetUserPermissionsUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<{ permissions: string[]; role: string }> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      permissions: user.permissions || [],
      role: user.role,
    };
  }
}

