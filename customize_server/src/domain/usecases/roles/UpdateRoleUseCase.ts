import { IRoleRepository } from '../../repositories/IRoleRepository';
import { Role, UpdateRoleDTO } from '../../entities/Role';
import { ValidationError } from '../../../shared/errors/AppError';
import { ALL_PERMISSIONS } from '../../../shared/constants/roles';

export class UpdateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) { }

  async execute(id: string, roleData: UpdateRoleDTO): Promise<Role> {
    // Validate permissions if provided
    if (roleData.permissions) {
      const invalidPermissions = roleData.permissions.filter(
        (perm) => !ALL_PERMISSIONS.includes(perm as any)
      );
      if (invalidPermissions.length > 0) {
        throw new ValidationError(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
    }

    return this.roleRepository.update(id, roleData);
  }
}

