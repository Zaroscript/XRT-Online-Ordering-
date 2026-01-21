"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierGroupRepository = void 0;
const ModifierGroupModel_1 = require("../database/models/ModifierGroupModel");
const ItemModel_1 = require("../database/models/ItemModel");
const AppError_1 = require("../../shared/errors/AppError");
class ModifierGroupRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            name: document.name,
            display_name: document.display_name,
            display_type: document.display_type,
            min_select: document.min_select,
            max_select: document.max_select,
            quantity_levels: document.quantity_levels || [],
            is_active: document.is_active,
            sort_order: document.sort_order,
            created_at: document.created_at,
            updated_at: document.updated_at,
            deleted_at: document.deleted_at,
        };
    }
    async create(data) {
        const modifierGroupDoc = new ModifierGroupModel_1.ModifierGroupModel({
            ...data,
            is_active: data.is_active ?? true,
            sort_order: data.sort_order ?? 0,
        });
        await modifierGroupDoc.save();
        return this.toDomain(modifierGroupDoc);
    }
    async findById(id, business_id) {
        const query = { _id: id, deleted_at: null };
        if (business_id) {
            query.business_id = business_id;
        }
        const modifierGroupDoc = await ModifierGroupModel_1.ModifierGroupModel.findOne(query);
        return modifierGroupDoc ? this.toDomain(modifierGroupDoc) : null;
    }
    async findActiveById(id, business_id) {
        const query = { _id: id, is_active: true, deleted_at: null };
        if (business_id) {
            query.business_id = business_id;
        }
        const modifierGroupDoc = await ModifierGroupModel_1.ModifierGroupModel.findOne(query);
        return modifierGroupDoc ? this.toDomain(modifierGroupDoc) : null;
    }
    async findAll(filters) {
        const query = { deleted_at: null };
        if (filters.business_id) {
            query.business_id = filters.business_id;
        }
        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' };
        }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        if (filters.display_type) {
            query.display_type = filters.display_type;
        }
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const sortField = filters.orderBy || 'sort_order';
        const sortOrder = filters.sortedBy === 'desc' ? -1 : 1;
        const sort = { [sortField]: sortOrder };
        const [modifierGroupDocs, total] = await Promise.all([
            ModifierGroupModel_1.ModifierGroupModel.find(query).sort(sort).skip(skip).limit(limit),
            ModifierGroupModel_1.ModifierGroupModel.countDocuments(query),
        ]);
        const modifierGroups = modifierGroupDocs.map((doc) => this.toDomain(doc));
        const totalPages = Math.ceil(total / limit);
        return {
            modifierGroups,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async update(id, business_id, data) {
        const modifierGroupDoc = await ModifierGroupModel_1.ModifierGroupModel.findOneAndUpdate({ _id: id, business_id, deleted_at: null }, data, {
            new: true,
            runValidators: true,
        });
        if (!modifierGroupDoc) {
            throw new AppError_1.NotFoundError('Modifier Group');
        }
        return this.toDomain(modifierGroupDoc);
    }
    async delete(id, business_id) {
        // Soft delete - set deleted_at timestamp
        const modifierGroupDoc = await ModifierGroupModel_1.ModifierGroupModel.findOneAndUpdate({ _id: id, business_id, deleted_at: null }, { deleted_at: new Date() }, { new: true });
        if (!modifierGroupDoc) {
            throw new AppError_1.NotFoundError('Modifier Group');
        }
    }
    async exists(name, business_id, excludeId) {
        const query = {
            name,
            business_id,
            deleted_at: null,
        };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await ModifierGroupModel_1.ModifierGroupModel.countDocuments(query);
        return count > 0;
    }
    async isUsedByItems(modifierGroupId) {
        const count = await ItemModel_1.ItemModel.countDocuments({
            'modifier_groups.modifier_group_id': modifierGroupId,
        });
        return count > 0;
    }
}
exports.ModifierGroupRepository = ModifierGroupRepository;
