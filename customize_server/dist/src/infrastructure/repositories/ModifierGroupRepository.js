"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierGroupRepository = void 0;
const ModifierGroupModel_1 = require("../database/models/ModifierGroupModel");
const ItemModel_1 = require("../database/models/ItemModel");
const ModifierModel_1 = require("../database/models/ModifierModel");
const AppError_1 = require("../../shared/errors/AppError");
const ModifierRepository_1 = require("./ModifierRepository");
class ModifierGroupRepository {
    toDomain(document, modifiers) {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            name: document.name,
            display_name: document.display_name,
            display_type: document.display_type,
            min_select: document.min_select,
            max_select: document.max_select,
            quantity_levels: document.quantity_levels || [],
            modifiers: modifiers || document.modifiers || [],
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
        if (!modifierGroupDoc)
            return null;
        const modifierRepo = new ModifierRepository_1.ModifierRepository();
        const modifiers = await modifierRepo.findByGroupId(id);
        return this.toDomain(modifierGroupDoc, modifiers);
    }
    async findActiveById(id, business_id) {
        const query = { _id: id, is_active: true, deleted_at: null };
        if (business_id) {
            query.business_id = business_id;
        }
        const modifierGroupDoc = await ModifierGroupModel_1.ModifierGroupModel.findOne(query);
        if (!modifierGroupDoc)
            return null;
        const modifierRepo = new ModifierRepository_1.ModifierRepository();
        const modifiers = await modifierRepo.findByGroupId(id);
        return this.toDomain(modifierGroupDoc, modifiers);
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
        // Fetch modifiers for all groups in this page
        const groupIds = modifierGroupDocs.map((doc) => doc._id);
        const modifiersList = await ModifierModel_1.ModifierModel.find({
            modifier_group_id: { $in: groupIds },
            deleted_at: null,
        }).sort({ display_order: 1, created_at: 1 });
        // Map modifiers to their groups
        const modifierRepo = new ModifierRepository_1.ModifierRepository();
        const domainModifiers = modifiersList.map((m) => modifierRepo.toDomain(m));
        const modifierGroups = modifierGroupDocs.map((doc) => {
            const groupModifiers = domainModifiers.filter((m) => m.modifier_group_id === doc._id.toString());
            return this.toDomain(doc, groupModifiers);
        });
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
    async updateSortOrder(items) {
        if (!items || items.length === 0)
            return;
        const operations = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { sort_order: item.order },
            },
        }));
        await ModifierGroupModel_1.ModifierGroupModel.bulkWrite(operations);
    }
}
exports.ModifierGroupRepository = ModifierGroupRepository;
