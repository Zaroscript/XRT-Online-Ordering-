import { IUserRepository } from '../../repositories/IUserRepository';
import { User } from '../../entities/User';

export class RemoveRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string): Promise<User> {
        return await this.userRepository.removeRole(userId);
    }
}
