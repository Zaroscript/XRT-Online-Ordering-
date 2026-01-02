import { IUserRepository } from '../../repositories/IUserRepository';
import { UpdateUserDTO } from '../../entities/User';
import { NotFoundError } from '../../../shared/errors/AppError';

export class BanUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    id: string,
    isBanned: boolean,
    banReason?: string
  ): Promise<Omit<any, 'password'>> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    const updateData: UpdateUserDTO = {
      isBanned,
      banReason: isBanned ? banReason : undefined,
    };

    const updatedUser = await this.userRepository.update(id, updateData);
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }
}

