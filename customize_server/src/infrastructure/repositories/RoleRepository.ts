import { IRoleRepository, RoleFilters, PaginatedRoles } from '../../domain/repositories/IRoleRepository';
import { Role, CreateRoleDTO, UpdateRoleDTO } from '../../domain/entities/Role';
import { RoleModel, RoleDocument } from '../database/models/RoleModel';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';

export class RoleRepository implements IRoleRepository {
  private toDomain(document: RoleDocument): Role {
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

  async create(roleData: CreateRoleDTO, createdBy: string): Promise<Role> {
    // Check if role with same name exists
    const existing = await RoleModel.findOne({ name: roleData.name.toLowerCase() });
    if (existing) {
      throw new ValidationError(`Role with name "${roleData.name}" already exists`);
    }

    const roleDoc = new RoleModel({
      ...roleData,
      name: roleData.name.toLowerCase(),
      createdBy,
    });
    await roleDoc.save();
    return this.toDomain(roleDoc);
  }

  async findById(id: string): Promise<Role | null> {
    const roleDoc = await RoleModel.findById(id);
    return roleDoc ? this.toDomain(roleDoc) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const roleDoc = await RoleModel.findOne({ name: name.toLowerCase() });
    return roleDoc ? this.toDomain(roleDoc) : null;
  }

  async findAll(filters: RoleFilters): Promise<PaginatedRoles> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;
    const orderBy = filters.orderBy || 'created_at';
    const sortedBy = filters.sortedBy === 'asc' ? 1 : -1;

    const query: any = {};

    // Search filter
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { displayName: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [roles, total] = await Promise.all([
      RoleModel.find(query)
        .sort({ [orderBy]: sortedBy })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      RoleModel.countDocuments(query),
    ]);

    return {
      roles: roles.map((doc) => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, roleData: UpdateRoleDTO): Promise<Role> {
    const roleDoc = await RoleModel.findById(id);
    if (!roleDoc) {
      throw new NotFoundError('Role not found');
    }

    // Prevent updating system roles
    if (roleDoc.isSystem) {
      throw new ValidationError('Cannot update system roles');
    }

    Object.assign(roleDoc, roleData);
    await roleDoc.save();
    return this.toDomain(roleDoc);
  }

  async delete(id: string): Promise<void> {
    const roleDoc = await RoleModel.findById(id);
    if (!roleDoc) {
      throw new NotFoundError('Role not found');
    }

    // Prevent deleting system roles
    if (roleDoc.isSystem) {
      throw new ValidationError('Cannot delete system roles');
    }

    await RoleModel.findByIdAndDelete(id);
  }
}

