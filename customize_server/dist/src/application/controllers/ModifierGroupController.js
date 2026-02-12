"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierGroupController = void 0;
const CreateModifierGroupUseCase_1 = require("../../domain/usecases/modifier-groups/CreateModifierGroupUseCase");
const UpdateModifierGroupUseCase_1 = require("../../domain/usecases/modifier-groups/UpdateModifierGroupUseCase");
const GetModifierGroupUseCase_1 = require("../../domain/usecases/modifier-groups/GetModifierGroupUseCase");
const GetModifierGroupsUseCase_1 = require("../../domain/usecases/modifier-groups/GetModifierGroupsUseCase");
const DeleteModifierGroupUseCase_1 = require("../../domain/usecases/modifier-groups/DeleteModifierGroupUseCase");
const ModifierGroupRepository_1 = require("../../infrastructure/repositories/ModifierGroupRepository");
const UpdateModifierSortOrderUseCase_1 = require("../../domain/usecases/modifiers/UpdateModifierSortOrderUseCase");
const ModifierRepository_1 = require("../../infrastructure/repositories/ModifierRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
const roles_1 = require("../../shared/constants/roles");
class ModifierGroupController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, display_name, display_type, min_select, max_select, quantity_levels, prices_by_size, is_active, sort_order, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const modifierGroup = await this.createModifierGroupUseCase.execute({
                business_id: business_id,
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
            return (0, response_1.sendSuccess)(res, 'Modifier group created successfully', modifierGroup, 201);
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                business_id: business_id,
                name: req.query.name,
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                display_type: req.query.display_type,
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                orderBy: req.query.orderBy,
                sortedBy: req.query.sortedBy,
            };
            // Remove undefined values
            Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);
            const result = await this.getModifierGroupsUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Modifier groups retrieved successfully', result);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            let business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            if (!business_id && req.user?.role === roles_1.UserRole.SUPER_ADMIN) {
                business_id = undefined;
            }
            const modifierGroup = await this.getModifierGroupUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Modifier group retrieved successfully', modifierGroup);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { name, display_name, display_type, min_select, max_select, quantity_levels, prices_by_size, is_active, sort_order, } = req.body;
            const business_id = req.user?.business_id || req.body.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (display_name !== undefined)
                updateData.display_name = display_name;
            if (display_type !== undefined)
                updateData.display_type = display_type;
            if (min_select !== undefined)
                updateData.min_select = Number(min_select);
            if (max_select !== undefined)
                updateData.max_select = Number(max_select);
            if (quantity_levels !== undefined)
                updateData.quantity_levels = quantity_levels;
            if (prices_by_size !== undefined)
                updateData.prices_by_size = prices_by_size;
            if (is_active !== undefined)
                updateData.is_active = is_active === true || is_active === 'true';
            if (sort_order !== undefined)
                updateData.sort_order = Number(sort_order);
            const modifierGroup = await this.updateModifierGroupUseCase.execute(id, business_id, updateData);
            return (0, response_1.sendSuccess)(res, 'Modifier group updated successfully', modifierGroup);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            await this.deleteModifierGroupUseCase.execute(id, business_id);
            return (0, response_1.sendSuccess)(res, 'Modifier group deleted successfully');
        });
        this.updateSortOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                throw new AppError_1.ValidationError('items array is required');
            }
            const repo = new ModifierGroupRepository_1.ModifierGroupRepository();
            await repo.updateSortOrder(items);
            return (0, response_1.sendSuccess)(res, 'Modifier group sort order updated successfully');
        });
        this.updateModifiersSortOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                throw new AppError_1.ValidationError('items array is required');
            }
            await this.updateModifierSortOrderUseCase.execute(items);
            return (0, response_1.sendSuccess)(res, 'Modifiers sort order updated successfully');
        });
        this.exportModifierGroups = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const business_id = req.user?.business_id || req.query.business_id;
            if (!business_id && req.user?.role !== roles_1.UserRole.SUPER_ADMIN) {
                throw new AppError_1.ValidationError('business_id is required');
            }
            const filters = {
                business_id: business_id,
                limit: 1000,
                page: 1,
            };
            const result = await this.getModifierGroupsUseCase.execute(filters);
            // Handle various result formats
            let modifierGroups = result.data || result.modifierGroups || result;
            if (!Array.isArray(modifierGroups)) {
                modifierGroups = [];
            }
            // Helper to safely stringify values for CSV
            const safeString = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
            // Helper to format quantity levels
            const formatQuantityLevels = (levels) => {
                if (!levels || !Array.isArray(levels))
                    return '';
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
                ...modifierGroups.map((group) => [
                    safeString(group.name), // Using name as group_key for now, if intended
                    safeString(group.name),
                    safeString(group.display_name),
                    group.display_type || 'CHECKBOX',
                    group.min_select || 0,
                    group.max_select || 1,
                    group.is_active,
                    group.sort_order || 0,
                    safeString(formatQuantityLevels(group.quantity_levels)),
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="modifier-groups-export.csv"`);
            res.send(csvContent);
        });
        const modifierGroupRepository = new ModifierGroupRepository_1.ModifierGroupRepository();
        this.createModifierGroupUseCase = new CreateModifierGroupUseCase_1.CreateModifierGroupUseCase(modifierGroupRepository);
        this.getModifierGroupsUseCase = new GetModifierGroupsUseCase_1.GetModifierGroupsUseCase(modifierGroupRepository);
        this.getModifierGroupUseCase = new GetModifierGroupUseCase_1.GetModifierGroupUseCase(modifierGroupRepository);
        this.updateModifierGroupUseCase = new UpdateModifierGroupUseCase_1.UpdateModifierGroupUseCase(modifierGroupRepository);
        this.deleteModifierGroupUseCase = new DeleteModifierGroupUseCase_1.DeleteModifierGroupUseCase(modifierGroupRepository);
        const modifierRepository = new ModifierRepository_1.ModifierRepository();
        this.updateModifierSortOrderUseCase = new UpdateModifierSortOrderUseCase_1.UpdateModifierSortOrderUseCase(modifierRepository);
    }
}
exports.ModifierGroupController = ModifierGroupController;
