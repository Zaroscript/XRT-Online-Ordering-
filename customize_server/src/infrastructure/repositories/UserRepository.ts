import { IUserRepository, UserFilters, PaginatedUsers } from '../../domain/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User';
import { UserModel, UserDocument } from '../database/models/UserModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class UserRepository implements IUserRepository {
  private toDomain(document: UserDocument): User {
    return {
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      password: document.password,
      role: document.role as any,
      permissions: [
        ...(document.permissions || []),
        ...((document.customRole as any)?.permissions || []),
      ],
      isApproved: document.isApproved,
      isBanned: document.isBanned,
      banReason: document.banReason,
      isActive: document.isActive,
      passwordChangedAt: document.passwordChangedAt,
      passwordResetToken: document.passwordResetToken,
      passwordResetExpires: document.passwordResetExpires,
      refreshToken: document.refreshToken,
      refreshTokenExpires: document.refreshTokenExpires,
      loginAttempts: document.loginAttempts,
      lockUntil: document.lockUntil,
      lastLogin: document.lastLogin,
      twoFactorSecret: document.twoFactorSecret,
      twoFactorEnabled: document.twoFactorEnabled,
      customRole: document.customRole,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const userDoc = new UserModel(userData);
    await userDoc.save();
    return this.toDomain(userDoc);
  }

  async findById(id: string, includePassword = false): Promise<User | null> {
    const query = UserModel.findById(id);
    if (includePassword) {
      query.select('+password +isActive +isApproved +isBanned +banReason');
    }
    const userDoc = await query.populate('customRole');
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    const userDoc = await query;
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findAll(filters: UserFilters): Promise<PaginatedUsers> {
    const query: any = {};

    // Role filter
    if (filters.role) {
      if (filters.role === 'admin') {
        query.role = { $in: ['admin', 'manager', 'super_admin'] };
      } else {
        query.role = filters.role;
      }
    }

    // Active filter
    if (filters.is_active !== undefined) {
      if (String(filters.is_active) === 'true') {
        query.isBanned = false;
      } else {
        query.isBanned = true;
      }
    }

    // Search filter
    if (filters.search) {
      const searchParams = filters.search.split(';');
      for (const param of searchParams) {
        const [key, value] = param.split(':');
        if (key && value) {
          if (key === 'name') {
            query.name = { $regex: value, $options: 'i' };
          } else if (key === 'email') {
            query.email = { $regex: value, $options: 'i' };
          } else if (key === 'role') {
            if (value === 'admin') {
              query.role = { $in: ['admin', 'manager', 'super_admin'] };
            } else {
              query.role = value;
            }
          }
        }
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sort: any = {};
    const sortField = filters.orderBy === 'created_at' ? 'createdAt' : filters.orderBy || 'createdAt';
    const sortOrder = filters.sortedBy === 'asc' ? 1 : -1;
    sort[sortField] = sortOrder;

    const total = await UserModel.countDocuments(query);

    const userDocs = await UserModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires +isActive')
      .populate('customRole');

    return {
      users: userDocs.map((doc) => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User> {
    const userDoc = await UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });

    if (!userDoc) {
      throw new NotFoundError('User');
    }

    return this.toDomain(userDoc);
  }

  async delete(id: string): Promise<void> {
    const result = await UserModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('User');
    }
  }

  async exists(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
    const userDoc = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    return userDoc ? this.toDomain(userDoc) : null;
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const userDoc = await UserModel.findById(id).select('+password');
    if (!userDoc) {
      throw new NotFoundError('User');
    }

    userDoc.password = password;
    userDoc.passwordResetToken = undefined;
    userDoc.passwordResetExpires = undefined;
    await userDoc.save();

    return this.toDomain(userDoc);
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $inc: { loginAttempts: 1 } });
  }

  async resetLoginAttempts(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      $set: { loginAttempts: 0, lastLogin: new Date() },
      $unset: { lockUntil: 1 },
    });
  }

  async lockAccount(id: string, lockUntil: Date): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $set: { lockUntil } });
  }

  async unlockAccount(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
    });
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    const userDoc = await UserModel.findByIdAndUpdate(
      userId,
      { customRole: roleId },
      { new: true }
    ).populate('customRole');

    if (!userDoc) {
      throw new NotFoundError('User');
    }

    return this.toDomain(userDoc);
  }

  async removeRole(userId: string): Promise<User> {
    const userDoc = await UserModel.findByIdAndUpdate(
      userId,
      { $unset: { customRole: 1 } },
      { new: true }
    );

    if (!userDoc) {
      throw new NotFoundError('User');
    }

    return this.toDomain(userDoc);
  }
}

