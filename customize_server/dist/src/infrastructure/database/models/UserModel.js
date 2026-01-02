"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const roles_1 = require("../../../shared/constants/roles");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../../shared/config/env");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [50, 'Name cannot be more than 50 characters'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    refreshTokenExpires: Date,
    loginAttempts: {
        type: Number,
        default: 0,
        select: false,
    },
    lockUntil: {
        type: Date,
        select: false,
    },
    lastLogin: Date,
    role: {
        type: String,
        required: [true, 'Please provide a role'],
        enum: Object.values(roles_1.UserRole),
        index: true,
    },
    permissions: {
        type: [String],
        default: [],
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    banReason: String,
    isActive: {
        type: Boolean,
        default: true,
        select: false,
    },
    twoFactorSecret: {
        type: String,
        select: false,
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    customRole: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Role',
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
// Encrypt password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    if (!this.password || typeof this.password !== 'string') {
        return next(new Error('Password is required and must be a string'));
    }
    if (this.password.length < 8) {
        return next(new Error('Password must be at least 8 characters long'));
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        return next(error);
    }
});
// Update passwordChangedAt when password is modified
UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew)
        return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
});
// Filter out inactive users by default
UserSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next();
});
// Instance methods
UserSchema.methods.comparePassword = async function (enteredPassword) {
    if (this.isLocked()) {
        throw new Error('Account is temporarily locked. Please try again later.');
    }
    const isMatch = await bcryptjs_1.default.compare(enteredPassword, this.password);
    if (!isMatch) {
        await this.handleFailedLogin();
        return false;
    }
    if (this.loginAttempts > 0 || this.lockUntil) {
        await this.updateOne({
            $set: { loginAttempts: 0, lastLogin: new Date() },
            $unset: { lockUntil: 1 },
        });
    }
    return true;
};
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(String(this.passwordChangedAt.getTime() / 1000), 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};
UserSchema.methods.generateAccessToken = function () {
    return jsonwebtoken_1.default.sign({
        id: this._id,
        role: this.role,
    }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.ACCESS_TOKEN_EXPIRE });
};
UserSchema.methods.generateRefreshToken = function () {
    const refreshToken = jsonwebtoken_1.default.sign({ id: this._id }, env_1.env.REFRESH_TOKEN_SECRET, {
        expiresIn: env_1.env.REFRESH_TOKEN_EXPIRE,
    });
    const hashedToken = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
    this.refreshToken = hashedToken;
    this.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return refreshToken;
};
UserSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
};
UserSchema.methods.handleFailedLogin = async function () {
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
    if (this.lockUntil && this.lockUntil < new Date()) {
        await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
        return;
    }
    const updates = { $inc: { loginAttempts: 1 } };
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
        updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
    }
    await this.updateOne(updates);
};
UserSchema.methods.createPasswordResetToken = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(otp).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return otp;
};
UserSchema.methods.clearResetToken = async function () {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
    await this.save({ validateBeforeSave: false });
};
UserSchema.methods.hasPermission = async function (permission) {
    if (this.role === 'super_admin') {
        return true;
    }
    return this.permissions.includes(permission);
};
UserSchema.methods.getAllPermissions = async function () {
    if (this.role === 'super_admin') {
        return [
            'users:read',
            'users:create',
            'users:update',
            'users:delete',
            'users:approve',
            'users:ban',
            'content:read',
            'content:create',
            'content:update',
            'content:delete',
            'content:publish',
            'system:read',
            'system:update',
            'system:backup',
            'system:logs',
            'profile:read',
            'profile:update',
            'admin:dashboard',
            'admin:settings',
            'admin:analytics',
            'roles:read',
            'roles:create',
            'roles:update',
            'roles:delete',
            'items:read',
            'items:create',
            'items:update',
            'items:delete',
        ];
    }
    return [...(this.permissions || [])];
};
UserSchema.methods.hasAnyPermission = function (permissions) {
    if (this.role === 'super_admin') {
        return true;
    }
    return permissions.some((permission) => this.permissions.includes(permission));
};
UserSchema.methods.setDefaultPermissions = function () {
    if (this.role === 'super_admin') {
        this.permissions = [
            'users:read',
            'users:create',
            'users:update',
            'users:delete',
            'users:approve',
            'users:ban',
            'content:read',
            'content:create',
            'content:update',
            'content:delete',
            'content:publish',
            'system:read',
            'system:update',
            'system:backup',
            'system:logs',
            'profile:read',
            'profile:update',
            'admin:dashboard',
            'admin:settings',
            'admin:analytics',
            'roles:read',
            'roles:create',
            'roles:update',
            'roles:delete',
            'items:read',
            'items:create',
            'items:update',
            'items:delete',
        ];
    }
    else if (this.role === 'client') {
        this.permissions = ['profile:read', 'profile:update', 'content:read'];
    }
};
// Pre-save hook to set default permissions
UserSchema.pre('save', function (next) {
    if (this.isModified('role') ||
        (this.isNew && (!this.permissions || this.permissions.length === 0))) {
        this.setDefaultPermissions();
    }
    next();
});
exports.UserModel = mongoose_1.default.model('User', UserSchema);
