import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreateModifierGroupUseCase } from '../../domain/usecases/modifier-groups/CreateModifierGroupUseCase';
import { UpdateModifierGroupUseCase } from '../../domain/usecases/modifier-groups/UpdateModifierGroupUseCase';
import { GetModifierGroupUseCase } from '../../domain/usecases/modifier-groups/GetModifierGroupUseCase';
import { GetModifierGroupsUseCase } from '../../domain/usecases/modifier-groups/GetModifierGroupsUseCase';
import { DeleteModifierGroupUseCase } from '../../domain/usecases/modifier-groups/DeleteModifierGroupUseCase';
import { ModifierGroupRepository } from '../../infrastructure/repositories/ModifierGroupRepository';
import { UpdateModifierSortOrderUseCase } from '../../domain/usecases/modifiers/UpdateModifierSortOrderUseCase';
import { ModifierRepository } from '../../infrastructure/repositories/ModifierRepository';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ValidationError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';

export class ModifierGroupController {
  private createModifierGroupUseCase: CreateModifierGroupUseCase;
  private getModifierGroupsUseCase: GetModifierGroupsUseCase;
  private getModifierGroupUseCase: GetModifierGroupUseCase;
  private updateModifierGroupUseCase: UpdateModifierGroupUseCase;
  private deleteModifierGroupUseCase: DeleteModifierGroupUseCase;
  private updateModifierSortOrderUseCase: UpdateModifierSortOrderUseCase;

  constructor() {
    const modifierGroupRepository = new ModifierGroupRepository();

    this.createModifierGroupUseCase = new CreateModifierGroupUseCase(modifierGroupRepository);
    this.getModifierGroupsUseCase = new GetModifierGroupsUseCase(modifierGroupRepository);
    this.getModifierGroupUseCase = new GetModifierGroupUseCase(modifierGroupRepository);
    this.updateModifierGroupUseCase = new UpdateModifierGroupUseCase(modifierGroupRepository);
    this.deleteModifierGroupUseCase = new DeleteModifierGroupUseCase(modifierGroupRepository);

    const modifierRepository = new ModifierRepository();
    this.updateModifierSortOrderUseCase = new UpdateModifierSortOrderUseCase(modifierRepository);
  }

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      display_name,
      display_type,
      min_select,
      max_select,
      quantity_levels,
      prices_by_size,
      is_active,
      sort_order,
    } = req.body;
    const business_id = req.user?.business_id || req.body.business_id || 'default';

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const modifierGroup = await this.createModifierGroupUseCase.execute({
      business_id: business_id!,
      name,
      display_name,
      display_type,
      min_select: Number(min_select),
      max_select: Number(max_select),
      quantity_levels: quantity_levels || [],
      prices_by_size: prices_by_size || [],
      is_active: is_active !== undefined ? is_active === true || is_active === 'true' : true,
      sort_order: sort_order ? Number(sort_order) : 0,
    });

    return sendSuccess(res, 'Modifier group created successfully', modifierGroup, 201);
  });

  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const filters: any = {
      business_id: business_id as string,
      name: req.query.name as string | undefined,
      is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
      display_type: req.query.display_type as 'RADIO' | 'CHECKBOX' | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      orderBy: req.query.orderBy as string | undefined,
      sortedBy: req.query.sortedBy as 'asc' | 'desc' | undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

    const result = await this.getModifierGroupsUseCase.execute(filters);

    return sendSuccess(res, 'Modifier groups retrieved successfully', result);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    let business_id = req.user?.business_id || req.query.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    if (!business_id && req.user?.role === UserRole.SUPER_ADMIN) {
      business_id = undefined;
    }

    const modifierGroup = await this.getModifierGroupUseCase.execute(
      id,
      business_id as string | undefined
    );

    return sendSuccess(res, 'Modifier group retrieved successfully', modifierGroup);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      name,
      display_name,
      display_type,
      min_select,
      max_select,
      quantity_levels,
      prices_by_size,
      is_active,
      sort_order,
    } = req.body;
    const business_id = req.user?.business_id || req.body.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (display_type !== undefined) updateData.display_type = display_type;
    if (min_select !== undefined) updateData.min_select = Number(min_select);
    if (max_select !== undefined) updateData.max_select = Number(max_select);
    if (quantity_levels !== undefined) updateData.quantity_levels = quantity_levels;
    if (prices_by_size !== undefined) updateData.prices_by_size = prices_by_size;
    if (is_active !== undefined) updateData.is_active = is_active === true || is_active === 'true';
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);

    const modifierGroup = await this.updateModifierGroupUseCase.execute(
      id,
      business_id!,
      updateData
    );

    return sendSuccess(res, 'Modifier group updated successfully', modifierGroup);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const business_id = req.user?.business_id || req.query.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    await this.deleteModifierGroupUseCase.execute(id, business_id as string);

    return sendSuccess(res, 'Modifier group deleted successfully');
  });

  updateSortOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    const repo = new ModifierGroupRepository();
    await repo.updateSortOrder(items);

    return sendSuccess(res, 'Modifier group sort order updated successfully');
  });

  updateModifiersSortOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    await this.updateModifierSortOrderUseCase.execute(items);

    return sendSuccess(res, 'Modifiers sort order updated successfully');
  });

  exportModifierGroups = asyncHandler(async (req: AuthRequest, res: Response) => {
    const business_id = req.user?.business_id || req.query.business_id;

    // if (!business_id && req.user?.role !== UserRole.SUPER_ADMIN) {
    //   throw new ValidationError('business_id is required');
    // }

    const filters: any = {
      business_id: business_id as string,
      limit: 1000,
      page: 1,
    };

    const result: any = await this.getModifierGroupsUseCase.execute(filters);
    // Handle various result formats
    let modifierGroups = result.data || result.modifierGroups || result;
    if (!Array.isArray(modifierGroups)) {
      modifierGroups = [];
    }

    // Helper to safely stringify values for CSV
    const safeString = (val: any) => `"${(val || '').toString().replace(/"/g, '""')}"`;

    // Helper to format quantity levels
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

    // Convert to CSV
    const csvRows = [
      [
        'group_key',
        'name',
        'display_name',
        'display_type',
        'min_select',
        'max_select',
        'is_active',
        'sort_order',
        'quantity_levels',
      ].join(','),
      ...modifierGroups.map((group: any) =>
        [
          safeString(group.name), // Using name as group_key for now, if intended
          safeString(group.name),
          safeString(group.display_name),
          group.display_type || 'CHECKBOX',
          group.min_select || 0,
          group.max_select || 1,
          group.is_active,
          group.sort_order || 0,
          safeString(formatQuantityLevels(group.quantity_levels)),
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="modifier-groups-export.csv"`);
    res.send(csvContent);
  });
}
