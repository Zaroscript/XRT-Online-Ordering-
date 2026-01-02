"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const UserModel_1 = require("../database/models/UserModel");
const AppError_1 = require("../../shared/errors/AppError");
class UserRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            name: document.name,
            email: document.email,
            password: document.password,
            role: document.role,
            permissions: [
                ...(document.permissions || []),
                ...(document.customRole?.permissions || []),
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
    async create(userData) {
        const userDoc = new UserModel_1.UserModel(userData);
        await userDoc.save();
        return this.toDomain(userDoc);
    }
    async findById(id, includePassword = false) {
        const query = UserModel_1.UserModel.findById(id);
        if (includePassword) {
            query.select('+password +isActive +isApproved +isBanned +banReason');
        }
        const userDoc = await query.populate('customRole');
        return userDoc ? this.toDomain(userDoc) : null;
    }
    async findByEmail(email, includePassword = false) {
        const query = UserModel_1.UserModel.findOne({ email: email.toLowerCase() });
        if (includePassword) {
            query.select('+password');
        }
        const userDoc = await query;
        return userDoc ? this.toDomain(userDoc) : null;
    }
    async findAll(filters) {
        const query = {};
        // Role filter
        if (filters.role) {
            if (filters.role === 'admin') {
                query.role = { $in: ['admin', 'manager', 'super_admin'] };
            }
            else {
                query.role = filters.role;
            }
        }
        // Active filter
        if (filters.is_active !== undefined) {
            if (String(filters.is_active) === 'true') {
                query.isBanned = false;
            }
            else {
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
                    }
                    else if (key === 'email') {
                        query.email = { $regex: value, $options: 'i' };
                    }
                    else if (key === 'role') {
                        if (value === 'admin') {
                            query.role = { $in: ['admin', 'manager', 'super_admin'] };
                        }
                        else {
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
        const sort = {};
        const sortField = filters.orderBy === 'created_at' ? 'createdAt' : filters.orderBy || 'createdAt';
        const sortOrder = filters.sortedBy === 'asc' ? 1 : -1;
        sort[sortField] = sortOrder;
        const total = await UserModel_1.UserModel.countDocuments(query);
        const userDocs = await UserModel_1.UserModel.find(query)
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
    async update(id, userData) {
        const userDoc = await UserModel_1.UserModel.findByIdAndUpdate(id, userData, {
            new: true,
            runValidators: true,
        });
        if (!userDoc) {
            throw new AppError_1.NotFoundError('User');
        }
        return this.toDomain(userDoc);
    }
    async delete(id) {
        const result = await UserModel_1.UserModel.findByIdAndDelete(id);
        if (!result) {
            throw new AppError_1.NotFoundError('User');
        }
    }
    async exists(email) {
        const count = await UserModel_1.UserModel.countDocuments({ email: email.toLowerCase() });
        return count > 0;
    }
    async findByPasswordResetToken(token) {
        const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
        const userDoc = await UserModel_1.UserModel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() },
        }).select('+password');
        return userDoc ? this.toDomain(userDoc) : null;
    }
    async updatePassword(id, password) {
        const userDoc = await UserModel_1.UserModel.findById(id).select('+password');
        if (!userDoc) {
            throw new AppError_1.NotFoundError('User');
        }
        userDoc.password = password;
        userDoc.passwordResetToken = undefined;
        userDoc.passwordResetExpires = undefined;
        await userDoc.save();
        return this.toDomain(userDoc);
    }
    async incrementLoginAttempts(id) {
        await UserModel_1.UserModel.findByIdAndUpdate(id, { $inc: { loginAttempts: 1 } });
    }
    async resetLoginAttempts(id) {
        await UserModel_1.UserModel.findByIdAndUpdate(id, {
            $set: { loginAttempts: 0, lastLogin: new Date() },
            $unset: { lockUntil: 1 },
        });
    }
    async lockAccount(id, lockUntil) {
        await UserModel_1.UserModel.findByIdAndUpdate(id, { $set: { lockUntil } });
    }
    async unlockAccount(id) {
        await UserModel_1.UserModel.findByIdAndUpdate(id, {
            $set: { loginAttempts: 0 },
            $unset: { lockUntil: 1 },
        });
    }
    async assignRole(userId, roleId) {
        const userDoc = await UserModel_1.UserModel.findByIdAndUpdate(userId, { customRole: roleId }, { new: true }).populate('customRole');
        if (!userDoc) {
            throw new AppError_1.NotFoundError('User');
        }
        return this.toDomain(userDoc);
    }
    async removeRole(userId) {
        const userDoc = await UserModel_1.UserModel.findByIdAndUpdate(userId, { $unset: { customRole: 1 } }, { new: true });
        if (!userDoc) {
            throw new AppError_1.NotFoundError('User');
        }
        return this.toDomain(userDoc);
    }
}
exports.UserRepository = UserRepository;
