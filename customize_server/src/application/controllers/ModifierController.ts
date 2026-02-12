import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateModifierUseCase } from '../../domain/usecases/modifiers/CreateModifierUseCase';
import { UpdateModifierUseCase } from '../../domain/usecases/modifiers/UpdateModifierUseCase';
import { DeleteModifierUseCase } from '../../domain/usecases/modifiers/DeleteModifierUseCase';
import { ModifierRepository } from '../../infrastructure/repositories/ModifierRepository';
import { ModifierGroupRepository } from '../../infrastructure/repositories/ModifierGroupRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';
import { IModifierRepository } from '../../domain/repositories/IModifierRepository';

export class ModifierController {
  private createModifierUseCase: CreateModifierUseCase;
  private updateModifierUseCase: UpdateModifierUseCase;
  private deleteModifierUseCase: DeleteModifierUseCase;
  private modifierRepository: IModifierRepository;

  constructor() {
    const modifierRepository = new ModifierRepository();
    const modifierGroupRepository = new ModifierGroupRepository();

    this.modifierRepository = modifierRepository;
    this.createModifierUseCase = new CreateModifierUseCase(
      modifierRepository,
      modifierGroupRepository
    );
    this.updateModifierUseCase = new UpdateModifierUseCase(modifierRepository);
    this.deleteModifierUseCase = new DeleteModifierUseCase(modifierRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { groupId } = req.params;
    const { name, display_order, is_active, sides_config, quantity_levels, prices_by_size } =
      req.body;

    if (!groupId) {
      throw new ValidationError('groupId is required');
    }

    // Parse sides_config if provided as string
    let parsedSidesConfig = sides_config;
    if (sides_config && typeof sides_config === 'string') {
      try {
        parsedSidesConfig = JSON.parse(sides_config);
      } catch (error) {
        throw new ValidationError('Invalid sides_config format. Expected JSON object.');
      }
    }

    const modifier = await this.createModifierUseCase.execute({
      modifier_group_id: groupId,
      name,
      display_order: display_order ? Number(display_order) : 0,
      is_active: is_active !== undefined ? is_active === true || is_active === 'true' : true,
      sides_config: parsedSidesConfig,
      quantity_levels: quantity_levels || [],
      prices_by_size: prices_by_size || [],
    });

    return sendSuccess(res, 'Modifier created successfully', modifier, 201);
  });

  index = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      name: req.query.name as string,
      modifier_group_id: req.query.modifier_group_id as string,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
    };

    const modifiers = await this.modifierRepository.findAll(filters);

    return sendSuccess(res, 'Modifiers retrieved successfully', modifiers);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { groupId } = req.params;

    if (!groupId) {
      throw new ValidationError('groupId is required');
    }

    const modifiers = await this.modifierRepository.findByGroupId(groupId);

    return sendSuccess(res, 'Modifiers retrieved successfully', { modifiers });
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, groupId } = req.params;

    if (!groupId) {
      throw new ValidationError('groupId is required');
    }

    const modifier = await this.modifierRepository.findById(id, groupId);

    if (!modifier) {
      throw new NotFoundError('Modifier');
    }

    return sendSuccess(res, 'Modifier retrieved successfully', modifier);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { groupId } = req.params;
    const { name, display_order, is_active, sides_config, quantity_levels, prices_by_size } =
      req.body;

    if (!groupId) {
      throw new ValidationError('groupId is required');
    }

    // Parse sides_config if provided as string
    let parsedSidesConfig = sides_config;
    if (sides_config !== undefined) {
      if (typeof sides_config === 'string') {
        try {
          parsedSidesConfig = JSON.parse(sides_config);
        } catch (error) {
          throw new ValidationError('Invalid sides_config format. Expected JSON object.');
        }
      }
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (display_order !== undefined) updateData.display_order = Number(display_order);
    if (is_active !== undefined) updateData.is_active = is_active === true || is_active === 'true';
    if (parsedSidesConfig !== undefined) updateData.sides_config = parsedSidesConfig;
    if (quantity_levels !== undefined) updateData.quantity_levels = quantity_levels;
    if (prices_by_size !== undefined) updateData.prices_by_size = prices_by_size;

    const modifier = await this.updateModifierUseCase.execute(id, groupId, updateData);

    return sendSuccess(res, 'Modifier updated successfully', modifier);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { groupId } = req.params;

    if (!groupId) {
      throw new ValidationError('groupId is required');
    }

    await this.deleteModifierUseCase.execute(id, groupId);

    return sendSuccess(res, 'Modifier deleted successfully');
  });

  updateSortOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    await this.modifierRepository.updateSortOrder(items);

    return sendSuccess(res, 'Modifier sort order updated successfully');
  });

  exportModifiers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      modifier_group_id: req.query.modifier_group_id as string,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
    };

    const modifiers = await this.modifierRepository.findAll(filters);

    // Helper to safely stringify values for CSV
    const safeString = (val: any) => `"${(val || '').toString().replace(/"/g, '""')}"`;

    // Helpers for formatting
    const formatSidesConfig = (config: any) => {
      if (!config || !config.enabled) return 'Disabled';
      const sides = (config.allowed_sides || []).join(', ');
      return `Enabled (${sides})`;
    };

    const formatQuantityLevels = (levels: any[]) => {
      if (!levels || !Array.isArray(levels)) return '';
      return levels
        .map((ql) => {
          const qty = ql.quantity;
          const price = ql.price !== undefined ? `$${ql.price}` : '';
          const name = ql.name ? ` (${ql.name})` : '';
          return `${qty}x${name}: ${price}`;
        })
        .join('; ');
    };

    const formatPricesBySize = (prices: any[]) => {
      if (!prices || !Array.isArray(prices)) return '';
      return prices.map((p) => `${p.sizeCode}: +$${p.priceDelta}`).join('; ');
    };

    // Convert to CSV
    const csvRows = [
      [
        'modifier_group_name',
        'name',
        'display_order',
        'is_active',
        'sides_config',
        'quantity_levels',
        'prices_by_size',
      ].join(','),
      ...modifiers.map((mod: any) =>
        [
          safeString(mod.modifier_group?.name),
          safeString(mod.name),
          mod.display_order,
          mod.is_active,
          safeString(formatSidesConfig(mod.sides_config)),
          safeString(formatQuantityLevels(mod.quantity_levels)),
          safeString(formatPricesBySize(mod.prices_by_size)),
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="modifiers-export.csv"`);
    res.send(csvContent);
  });
}
