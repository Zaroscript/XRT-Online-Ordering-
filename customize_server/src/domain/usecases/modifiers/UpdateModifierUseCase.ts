import { IModifierRepository } from '../../repositories/IModifierRepository';
import { Modifier, UpdateModifierDTO } from '../../entities/Modifier';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';

export class UpdateModifierUseCase {
  constructor(private modifierRepository: IModifierRepository) {}

  async execute(id: string, modifier_group_id: string, data: UpdateModifierDTO): Promise<Modifier> {
    const existingModifier = await this.modifierRepository.findById(id, modifier_group_id);

    if (!existingModifier) {
      throw new NotFoundError('Modifier');
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

    // Check if name already exists in this group (excluding current modifier)
    if (data.name && data.name !== existingModifier.name) {
      const nameExists = await this.modifierRepository.exists(data.name, modifier_group_id, id);

      if (nameExists) {
        throw new ValidationError('Modifier name already exists in this group');
      }
    }

    return await this.modifierRepository.update(id, modifier_group_id, data);
  }
}
