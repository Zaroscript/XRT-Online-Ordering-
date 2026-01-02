import { IRoleRepository } from '../../repositories/IRoleRepository';

export class DeleteRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    await this.roleRepository.delete(id);
  }
}

