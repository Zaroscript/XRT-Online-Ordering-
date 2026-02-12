"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierRepository = void 0;
const ModifierModel_1 = require("../database/models/ModifierModel");
const AppError_1 = require("../../shared/errors/AppError");
class ModifierRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            modifier_group_id: document.modifier_group_id._id
                ? document.modifier_group_id._id.toString()
                : document.modifier_group_id.toString(),
            modifier_group: document.modifier_group_id.name
                ? {
                    id: document.modifier_group_id._id.toString(),
                    name: document.modifier_group_id.name,
                }
                : undefined,
            name: document.name,
            display_order: document.display_order,
            is_active: document.is_active,
            sides_config: document.sides_config
                ? {
                    enabled: document.sides_config.enabled || false,
                    allowed_sides: document.sides_config.allowed_sides || [],
                }
                : undefined,
            // Add modifier-level pricing fields
            quantity_levels: document.quantity_levels || [],
            prices_by_size: document.prices_by_size || [],
            created_at: document.created_at,
            updated_at: document.updated_at,
            deleted_at: document.deleted_at,
        };
    }
    async create(data) {
        const modifierDoc = new ModifierModel_1.ModifierModel({
            ...data,
            display_order: data.display_order ?? 0,
            is_active: data.is_active ?? true,
        });
        await modifierDoc.save();
        return this.toDomain(modifierDoc);
    }
    async findById(id, modifier_group_id) {
        const query = { _id: id, deleted_at: null };
        if (modifier_group_id) {
            query.modifier_group_id = modifier_group_id;
        }
        const modifierDoc = await ModifierModel_1.ModifierModel.findOne(query).populate('modifier_group_id', 'name');
        return modifierDoc ? this.toDomain(modifierDoc) : null;
    }
    async findActiveById(id, modifier_group_id) {
        const query = { _id: id, is_active: true, deleted_at: null };
        if (modifier_group_id) {
            query.modifier_group_id = modifier_group_id;
        }
        const modifierDoc = await ModifierModel_1.ModifierModel.findOne(query).populate('modifier_group_id', 'name');
        return modifierDoc ? this.toDomain(modifierDoc) : null;
    }
    async findAll(filters) {
        const query = { deleted_at: null };
        if (filters.modifier_group_id) {
            query.modifier_group_id = filters.modifier_group_id;
        }
        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' };
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        const modifierDocs = await ModifierModel_1.ModifierModel.find(query)
            .populate('modifier_group_id', 'name')
            .sort({ display_order: 1, created_at: 1 });
        return modifierDocs.map((doc) => this.toDomain(doc));
    }
    async findByGroupId(modifier_group_id) {
        const modifierDocs = await ModifierModel_1.ModifierModel.find({
            modifier_group_id,
            deleted_at: null,
        }).sort({ display_order: 1, created_at: 1 });
        return modifierDocs.map((doc) => this.toDomain(doc));
    }
    async update(id, modifier_group_id, data) {
        const modifierDoc = await ModifierModel_1.ModifierModel.findOneAndUpdate({ _id: id, modifier_group_id, deleted_at: null }, data, {
            new: true,
            runValidators: true,
        });
        if (!modifierDoc) {
            throw new AppError_1.NotFoundError('Modifier');
        }
        return this.toDomain(modifierDoc);
    }
    async delete(id, modifier_group_id) {
        // Soft delete - set deleted_at timestamp
        const modifierDoc = await ModifierModel_1.ModifierModel.findOneAndUpdate({ _id: id, modifier_group_id, deleted_at: null }, { deleted_at: new Date() }, { new: true });
        if (!modifierDoc) {
            throw new AppError_1.NotFoundError('Modifier');
        }
    }
    async exists(name, modifier_group_id, excludeId) {
        const query = {
            name,
            modifier_group_id,
            deleted_at: null,
        };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ModifierModel_1.ModifierModel.countDocuments(query);
        return count > 0;
    }
    async updateSortOrder(items) {
        if (!items || items.length === 0)
            return;
        const operations = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { display_order: item.order },
            },
        }));
        await ModifierModel_1.ModifierModel.bulkWrite(operations);
    }
}
exports.ModifierRepository = ModifierRepository;
