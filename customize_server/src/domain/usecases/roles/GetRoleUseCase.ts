import { IRoleRepository } from '../../repositories/IRoleRepository';
import { Role } from '../../entities/Role';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return role;
  }
}

