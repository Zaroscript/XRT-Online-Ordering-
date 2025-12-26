import { IRoleRepository } from '../../repositories/IRoleRepository';
import { Role, CreateRoleDTO } from '../../entities/Role';
import { ValidationError } from '../../../shared/errors/AppError';
import { ALL_PERMISSIONS } from '../../../shared/constants/roles';

export class CreateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) { }

  async execute(roleData: CreateRoleDTO, createdBy: string): Promise<Role> {
    // Validate permissions
    const invalidPermissions = roleData.permissions.filter(
      (perm) => !ALL_PERMISSIONS.includes(perm as any)
    );
    if (invalidPermissions.length > 0) {
      throw new ValidationError(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    // Check if role name already exists
    const existing = await this.roleRepository.findByName(roleData.name);
    if (existing) {
      throw new ValidationError(`Role with name "${roleData.name}" already exists`);
    }

    return this.roleRepository.create(roleData, createdBy);
  }
}

