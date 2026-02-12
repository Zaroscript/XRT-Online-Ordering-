"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierController = void 0;
const CreateModifierUseCase_1 = require("../../domain/usecases/modifiers/CreateModifierUseCase");
const UpdateModifierUseCase_1 = require("../../domain/usecases/modifiers/UpdateModifierUseCase");
const DeleteModifierUseCase_1 = require("../../domain/usecases/modifiers/DeleteModifierUseCase");
const ModifierRepository_1 = require("../../infrastructure/repositories/ModifierRepository");
const ModifierGroupRepository_1 = require("../../infrastructure/repositories/ModifierGroupRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
class ModifierController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { groupId } = req.params;
            const { name, display_order, is_active, sides_config, quantity_levels, prices_by_size } = req.body;
            if (!groupId) {
                throw new AppError_1.ValidationError('groupId is required');
            }
            // Parse sides_config if provided as string
            let parsedSidesConfig = sides_config;
            if (sides_config && typeof sides_config === 'string') {
                try {
                    parsedSidesConfig = JSON.parse(sides_config);
                }
                catch (error) {
                    throw new AppError_1.ValidationError('Invalid sides_config format. Expected JSON object.');
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
            return (0, response_1.sendSuccess)(res, 'Modifier created successfully', modifier, 201);
        });
        this.index = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                name: req.query.name,
                modifier_group_id: req.query.modifier_group_id,
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
            };
            const modifiers = await this.modifierRepository.findAll(filters);
            return (0, response_1.sendSuccess)(res, 'Modifiers retrieved successfully', modifiers);
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { groupId } = req.params;
            if (!groupId) {
                throw new AppError_1.ValidationError('groupId is required');
            }
            const modifiers = await this.modifierRepository.findByGroupId(groupId);
            return (0, response_1.sendSuccess)(res, 'Modifiers retrieved successfully', { modifiers });
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id, groupId } = req.params;
            if (!groupId) {
                throw new AppError_1.ValidationError('groupId is required');
            }
            const modifier = await this.modifierRepository.findById(id, groupId);
            if (!modifier) {
                throw new AppError_1.NotFoundError('Modifier');
            }
            return (0, response_1.sendSuccess)(res, 'Modifier retrieved successfully', modifier);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { groupId } = req.params;
            const { name, display_order, is_active, sides_config, quantity_levels, prices_by_size } = req.body;
            if (!groupId) {
                throw new AppError_1.ValidationError('groupId is required');
            }
            // Parse sides_config if provided as string
            let parsedSidesConfig = sides_config;
            if (sides_config !== undefined) {
                if (typeof sides_config === 'string') {
                    try {
                        parsedSidesConfig = JSON.parse(sides_config);
                    }
                    catch (error) {
                        throw new AppError_1.ValidationError('Invalid sides_config format. Expected JSON object.');
                    }
                }
            }
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (display_order !== undefined)
                updateData.display_order = Number(display_order);
            if (is_active !== undefined)
                updateData.is_active = is_active === true || is_active === 'true';
            if (parsedSidesConfig !== undefined)
                updateData.sides_config = parsedSidesConfig;
            if (quantity_levels !== undefined)
                updateData.quantity_levels = quantity_levels;
            if (prices_by_size !== undefined)
                updateData.prices_by_size = prices_by_size;
            const modifier = await this.updateModifierUseCase.execute(id, groupId, updateData);
            return (0, response_1.sendSuccess)(res, 'Modifier updated successfully', modifier);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { groupId } = req.params;
            if (!groupId) {
                throw new AppError_1.ValidationError('groupId is required');
            }
            await this.deleteModifierUseCase.execute(id, groupId);
            return (0, response_1.sendSuccess)(res, 'Modifier deleted successfully');
        });
        this.updateSortOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                throw new AppError_1.ValidationError('items array is required');
            }
            await this.modifierRepository.updateSortOrder(items);
            return (0, response_1.sendSuccess)(res, 'Modifier sort order updated successfully');
        });
        this.exportModifiers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                modifier_group_id: req.query.modifier_group_id,
                is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
            };
            const modifiers = await this.modifierRepository.findAll(filters);
            // Helper to safely stringify values for CSV
            const safeString = (val) => `"${(val || '').toString().replace(/"/g, '""')}"`;
            // Helpers for formatting
            const formatSidesConfig = (config) => {
                if (!config || !config.enabled)
                    return 'Disabled';
                const sides = (config.allowed_sides || []).join(', ');
                return `Enabled (${sides})`;
            };
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
            const formatPricesBySize = (prices) => {
                if (!prices || !Array.isArray(prices))
                    return '';
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
                ...modifiers.map((mod) => [
                    safeString(mod.modifier_group?.name),
                    safeString(mod.name),
                    mod.display_order,
                    mod.is_active,
                    safeString(formatSidesConfig(mod.sides_config)),
                    safeString(formatQuantityLevels(mod.quantity_levels)),
                    safeString(formatPricesBySize(mod.prices_by_size)),
                ].join(',')),
            ];
            const csvContent = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="modifiers-export.csv"`);
            res.send(csvContent);
        });
        const modifierRepository = new ModifierRepository_1.ModifierRepository();
        const modifierGroupRepository = new ModifierGroupRepository_1.ModifierGroupRepository();
        this.modifierRepository = modifierRepository;
        this.createModifierUseCase = new CreateModifierUseCase_1.CreateModifierUseCase(modifierRepository, modifierGroupRepository);
        this.updateModifierUseCase = new UpdateModifierUseCase_1.UpdateModifierUseCase(modifierRepository);
        this.deleteModifierUseCase = new DeleteModifierUseCase_1.DeleteModifierUseCase(modifierRepository);
    }
}
exports.ModifierController = ModifierController;
