import { IUserRepository } from '../../repositories/IUserRepository';
import { User } from '../../entities/User';

export class AssignRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, roleId: string): Promise<User> {
        return await this.userRepository.assignRole(userId, roleId);
    }
}
