"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const RoleModel_1 = require("../database/models/RoleModel");
const AppError_1 = require("../../shared/errors/AppError");
class RoleRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            name: document.name,
            displayName: document.displayName,
            description: document.description,
            permissions: document.permissions || [],
            isSystem: document.isSystem || false,
            createdBy: document.createdBy?.toString(),
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(roleData, createdBy) {
        // Check if role with same name exists
        const existing = await RoleModel_1.RoleModel.findOne({ name: roleData.name.toLowerCase() });
        if (existing) {
            throw new AppError_1.ValidationError(`Role with name "${roleData.name}" already exists`);
        }
        const roleDoc = new RoleModel_1.RoleModel({
            ...roleData,
            name: roleData.name.toLowerCase(),
            createdBy,
        });
        await roleDoc.save();
        return this.toDomain(roleDoc);
    }
    async findById(id) {
        const roleDoc = await RoleModel_1.RoleModel.findById(id);
        return roleDoc ? this.toDomain(roleDoc) : null;
    }
    async findByName(name) {
        const roleDoc = await RoleModel_1.RoleModel.findOne({ name: name.toLowerCase() });
        return roleDoc ? this.toDomain(roleDoc) : null;
    }
    async findAll(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const orderBy = filters.orderBy || 'created_at';
        const sortedBy = filters.sortedBy === 'asc' ? 1 : -1;
        const query = {};
        // Search filter
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { displayName: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
            ];
        }
        const [roles, total] = await Promise.all([
            RoleModel_1.RoleModel.find(query)
                .sort({ [orderBy]: sortedBy })
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'name email'),
            RoleModel_1.RoleModel.countDocuments(query),
        ]);
        return {
            roles: roles.map((doc) => this.toDomain(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async update(id, roleData) {
        const roleDoc = await RoleModel_1.RoleModel.findById(id);
        if (!roleDoc) {
            throw new AppError_1.NotFoundError('Role not found');
        }
        // Prevent updating system roles
        if (roleDoc.isSystem) {
            throw new AppError_1.ValidationError('Cannot update system roles');
        }
        Object.assign(roleDoc, roleData);
        await roleDoc.save();
        return this.toDomain(roleDoc);
    }
    async delete(id) {
        const roleDoc = await RoleModel_1.RoleModel.findById(id);
        if (!roleDoc) {
            throw new AppError_1.NotFoundError('Role not found');
        }
        // Prevent deleting system roles
        if (roleDoc.isSystem) {
            throw new AppError_1.ValidationError('Cannot delete system roles');
        }
        await RoleModel_1.RoleModel.findByIdAndDelete(id);
    }
}
exports.RoleRepository = RoleRepository;
