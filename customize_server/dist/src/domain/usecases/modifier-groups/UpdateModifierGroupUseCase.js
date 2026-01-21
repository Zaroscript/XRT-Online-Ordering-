"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModifierGroupUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateModifierGroupUseCase {
    constructor(modifierGroupRepository) {
        this.modifierGroupRepository = modifierGroupRepository;
    }
    async execute(id, business_id, data) {
        const existingGroup = await this.modifierGroupRepository.findById(id, business_id);
        if (!existingGroup) {
            throw new AppError_1.NotFoundError('Modifier Group');
        }
        // Validate min/max rules if both are being updated
        if (data.min_select !== undefined && data.max_select !== undefined) {
            if (data.max_select < data.min_select) {
                throw new AppError_1.ValidationError('max_select must be greater than or equal to min_select');
            }
        }
        else if (data.min_select !== undefined && existingGroup.max_select < data.min_select) {
            throw new AppError_1.ValidationError('max_select must be greater than or equal to min_select');
        }
        else if (data.max_select !== undefined && data.max_select < existingGroup.min_select) {
            throw new AppError_1.ValidationError('max_select must be greater than or equal to min_select');
        }
        if (data.min_select !== undefined && data.min_select < 0) {
            throw new AppError_1.ValidationError('min_select must be greater than or equal to 0');
        }
        if (data.max_select !== undefined && data.max_select < 1) {
            throw new AppError_1.ValidationError('max_select must be greater than or equal to 1');
        }
        // Validate quantity levels
        if (data.quantity_levels && data.quantity_levels.length > 0) {
            const defaultCount = data.quantity_levels.filter(ql => ql.is_default).length;
            if (defaultCount > 1) {
                throw new AppError_1.ValidationError('Only one quantity level can be marked as default');
            }
            // Validate unique quantities
            const quantities = data.quantity_levels.map(ql => ql.quantity);
            const uniqueQuantities = new Set(quantities);
            if (quantities.length !== uniqueQuantities.size) {
                throw new AppError_1.ValidationError('Quantity levels must have unique quantities');
            }
        }
        // Validate prices by size
        if (data.prices_by_size && data.prices_by_size.length > 0) {
            const sizeIds = data.prices_by_size.map(ps => ps.size_id);
            const uniqueSizeIds = new Set(sizeIds);
            if (sizeIds.length !== uniqueSizeIds.size) {
                throw new AppError_1.ValidationError('Prices by size must have unique size IDs');
            }
        }
        // Check if name already exists (excluding current group)
        if (data.name && data.name !== existingGroup.name) {
            const nameExists = await this.modifierGroupRepository.exists(data.name, business_id, id);
            if (nameExists) {
                throw new AppError_1.ValidationError('Modifier group name already exists for this business');
            }
        }
        return await this.modifierGroupRepository.update(id, business_id, data);
    }
}
exports.UpdateModifierGroupUseCase = UpdateModifierGroupUseCase;
