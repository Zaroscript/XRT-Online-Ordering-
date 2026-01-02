import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';
import { UserRole } from '../../../shared/constants/roles';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../../shared/config/env';

export interface UserDocument extends Omit<User, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
  comparePassword(enteredPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  isLocked(): boolean;
  handleFailedLogin(): Promise<void>;
  createPasswordResetToken(): string;
  clearResetToken(): Promise<void>;
  hasPermission(permission: string): Promise<boolean>;
  getAllPermissions(): Promise<string[]>;
  hasAnyPermission(permissions: string[]): boolean;
  setDefaultPermissions(): void;
}

const UserSchema = new Schema<UserDocument>(
  {
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
      enum: Object.values(UserRole),
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
      type: Schema.Types.ObjectId,
      ref: 'Role',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

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
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error as Error);
  }
});

// Update passwordChangedAt when password is modified
UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Filter out inactive users by default
UserSchema.pre(/^find/, function (next) {
  (this as any).find({ isActive: { $ne: false } });
  next();
});

// Instance methods
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (this.isLocked()) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }

  const isMatch = await bcrypt.compare(enteredPassword, this.password);

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

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(String(this.passwordChangedAt.getTime() / 1000), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

UserSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    } as object,
    env.JWT_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRE as any }
  );
};

UserSchema.methods.generateRefreshToken = function (): string {
  const refreshToken = jwt.sign({ id: this._id } as object, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRE as any,
  });

  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  this.refreshToken = hashedToken;
  this.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return refreshToken;
};

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

UserSchema.methods.handleFailedLogin = async function (): Promise<void> {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) };
  }

  await this.updateOne(updates);
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetToken = crypto.createHash('sha256').update(otp).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return otp;
};

UserSchema.methods.clearResetToken = async function (): Promise<void> {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  await this.save({ validateBeforeSave: false });
};

UserSchema.methods.hasPermission = async function (permission: string): Promise<boolean> {
  if (this.role === 'super_admin') {
    return true;
  }
  return this.permissions.includes(permission);
};

UserSchema.methods.getAllPermissions = async function (): Promise<string[]> {
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

UserSchema.methods.hasAnyPermission = function (permissions: string[]): boolean {
  if (this.role === 'super_admin') {
    return true;
  }
  return permissions.some((permission) => this.permissions.includes(permission));
};

UserSchema.methods.setDefaultPermissions = function (): void {
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
  } else if (this.role === 'client') {
    this.permissions = ['profile:read', 'profile:update', 'content:read'];
  }
};

// Pre-save hook to set default permissions
UserSchema.pre('save', function (next) {
  if (
    this.isModified('role') ||
    (this.isNew && (!this.permissions || this.permissions.length === 0))
  ) {
    this.setDefaultPermissions();
  }
  next();
});

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);

