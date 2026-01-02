import { IRoleRepository, RoleFilters, PaginatedRoles } from '../../repositories/IRoleRepository';

export class GetRolesUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(filters: RoleFilters): Promise<PaginatedRoles> {
    return this.roleRepository.findAll(filters);
  }
}

