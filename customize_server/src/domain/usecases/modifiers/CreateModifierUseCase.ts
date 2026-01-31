import { IModifierRepository } from '../../repositories/IModifierRepository';
import { IModifierGroupRepository } from '../../repositories/IModifierGroupRepository';
import { Modifier, CreateModifierDTO } from '../../entities/Modifier';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';

export class CreateModifierUseCase {
  constructor(
    private modifierRepository: IModifierRepository,
    private modifierGroupRepository: IModifierGroupRepository
  ) {}

  async execute(data: CreateModifierDTO): Promise<Modifier> {
    // Verify modifier group exists and is active
    const modifierGroup = await this.modifierGroupRepository.findActiveById(data.modifier_group_id);

    if (!modifierGroup) {
      throw new NotFoundError('Modifier Group');
    }

    // Check if name already exists in this group
    const nameExists = await this.modifierRepository.exists(data.name, data.modifier_group_id);

    if (nameExists) {
      throw new ValidationError('Modifier name already exists in this group');
    }

    // Validate display_order
    if (data.display_order !== undefined && data.display_order < 0) {
      throw new ValidationError('display_order must be greater than or equal to 0');
    }

    // Validate sides_config if provided
    if (data.sides_config) {
      if (
        data.sides_config.enabled &&
        (!data.sides_config.allowed_sides || data.sides_config.allowed_sides.length === 0)
      ) {
        throw new ValidationError('allowed_sides must be provided when sides_config is enabled');
      }
      if (data.sides_config.allowed_sides) {
        const validSides = ['LEFT', 'RIGHT', 'WHOLE'];
        const invalidSides = data.sides_config.allowed_sides.filter(
          (side) => !validSides.includes(side)
        );
        if (invalidSides.length > 0) {
          throw new ValidationError(
            `Invalid allowed_sides values: ${invalidSides.join(', ')}. Valid values are: LEFT, RIGHT, WHOLE`
          );
        }
      }
    }

    return await this.modifierRepository.create(data);
  }
}
