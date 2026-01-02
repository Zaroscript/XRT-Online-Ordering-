import { IUserRepository } from '../../repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    await this.userRepository.delete(id);
  }
}

