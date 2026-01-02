import { IUserRepository, UserFilters, PaginatedUsers } from '../../repositories/IUserRepository';

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(filters: UserFilters): Promise<PaginatedUsers> {
    return await this.userRepository.findAll(filters);
  }
}

