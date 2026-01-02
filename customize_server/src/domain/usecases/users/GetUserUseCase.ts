import { IUserRepository } from '../../repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) { }

  async execute(id: string): Promise<any> {
    const user = await this.userRepository.findById(id, true);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Map to match frontend expectations
    const userObj = {
      ...user,
      id: user.id,
      is_active: user.isActive,
      permissions: user.permissions ? user.permissions.map((p: string) => ({ name: p })) : [],
      profile: (user as any).profile || { avatar: { thumbnail: '' } },
    };

    return userObj;
  }
}

