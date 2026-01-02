import { IUserRepository } from '../../repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class ApproveUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<Omit<any, 'password'>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await this.userRepository.update(id, { isApproved: true });
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}

