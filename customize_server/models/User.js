// User model for handling a restaurant management system dashboard user's
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Role schema for custom roles
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [50, "Role name cannot be more than 50 characters"]
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Display name cannot be more than 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters"]
  },
  permissions: {
    type: [String],
    default: [],
    enum: [
      // User management permissions
      "users:read",
      "users:create", 
      "users:update",
      "users:delete",
      "users:approve",
      "users:ban",
      
      // Content management permissions
      "content:read",
      "content:create",
      "content:update", 
      "content:delete",
      "content:publish",
      
      // System permissions
      "system:read",
      "system:update",
      "system:backup",
      "system:logs",
      
      // Profile permissions
      "profile:read",
      "profile:update",
      
      // Admin permissions
      "admin:dashboard",
      "admin:settings",
      "admin:analytics",
      
      // Role management permissions
      "roles:read",
      "roles:create",
      "roles:update",
      "roles:delete"
    ]
  },
  isSystem: {
    type: Boolean,
    default: false,
    select: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: false
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [50, "Name cannot be more than 50 characters"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      trim: true
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
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
      select: false
    },
    lockUntil: {
      type: Date,
      select: false
    },
    lastLogin: Date,
    role: {
      type: String,
      enum: ["super_admin", "client"],
      default: "client",
    },
    customRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null
    },
    permissions: {
      type: [String],
      default: [],
      enum: [
        // User management permissions
        "users:read",
        "users:create", 
        "users:update",
        "users:delete",
        "users:approve",
        "users:ban",
        
        // Content management permissions
        "content:read",
        "content:create",
        "content:update", 
        "content:delete",
        "content:publish",
        
        // System permissions
        "system:read",
        "system:update",
        "system:backup",
        "system:logs",
        
        // Profile permissions
        "profile:read",
        "profile:update",
        
        // Admin permissions
        "admin:dashboard",
        "admin:settings",
        "admin:analytics",
        
        // Role management permissions
        "roles:read",
        "roles:create",
        "roles:update",
        "roles:delete"
      ]
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
    resetToken: String,
    resetTokenExpire: Date,
    isActive: {
      type: Boolean,
      default: true,
      select: false
    },
    twoFactorSecret: {
      type: String,
      select: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Encrypt password before saving to database
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) {
    return next();
  }

  // Check if password exists and is a string
  if (!this.password || typeof this.password !== 'string') {
    return next(new Error("Password is required and must be a string"));
  }

  // Check minimum password length
  if (this.password.length < 8) {
    return next(new Error("Password must be at least 8 characters long"));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate access token
userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );
  
  // Hash the refresh token before saving to DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
    
  this.refreshToken = hashedToken;
  this.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  
  return refreshToken;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  
  return await this.updateOne(updates);
};

// Generate and hash password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Clear reset token after use
userSchema.methods.clearResetToken = function() {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  return this.save({ validateBeforeSave: false });
};

// Compare password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  if (this.isLocked()) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }
  
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  
  if (!isMatch) {
    await this.handleFailedLogin();
    return false;
  }
  
  // Reset login attempts on successful login
  if (this.loginAttempts > 0 || this.lockUntil) {
    await this.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
      lastLogin: Date.now()
    });
  }
  
  return true;
};

// Middleware to update passwordChangedAt when password is modified
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // Set passwordChangedAt to current time minus 1 second to ensure token is created after
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Middleware to filter out inactive users by default
userSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Method to check if user has specific permission
userSchema.methods.hasPermission = async function(permission) {
  if (this.role === 'super_admin') {
    return true; // Super admin has all permissions
  }
  
  // Check direct permissions
  if (this.permissions.includes(permission)) {
    return true;
  }
  
  // Check custom role permissions
  if (this.customRole) {
    try {
      const Role = mongoose.model('Role');
      const role = await Role.findById(this.customRole);
      if (role && role.permissions.includes(permission)) {
        return true;
      }
    } catch (error) {
      console.error('Error checking role permissions:', error);
    }
  }
  
  return false;
};

// Method to get all user permissions (direct + role-based)
userSchema.methods.getAllPermissions = async function() {
  if (this.role === 'super_admin') {
    return [
      "users:read", "users:create", "users:update", "users:delete", "users:approve", "users:ban",
      "content:read", "content:create", "content:update", "content:delete", "content:publish",
      "system:read", "system:update", "system:backup", "system:logs",
      "profile:read", "profile:update",
      "admin:dashboard", "admin:settings", "admin:analytics",
      "roles:read", "roles:create", "roles:update", "roles:delete"
    ];
  }
  
  let allPermissions = [...(this.permissions || [])];
  
  // Add custom role permissions
  if (this.customRole) {
    try {
      const Role = mongoose.model('Role');
      const role = await Role.findById(this.customRole);
      if (role && role.permissions) {
        allPermissions = [...new Set([...allPermissions, ...role.permissions])];
      }
    } catch (error) {
      console.error('Error getting role permissions:', error);
    }
  }
  
  return allPermissions;
};

// Method to check if user has any of the specified permissions
userSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'super_admin') {
    return true; // Super admin has all permissions
  }
  return permissions.some(permission => this.permissions.includes(permission));
};

// Method to set default permissions based on role
userSchema.methods.setDefaultPermissions = function() {
  if (this.role === 'super_admin') {
    // Super admin gets all permissions
    this.permissions = [
      "users:read", "users:create", "users:update", "users:delete", "users:approve", "users:ban",
      "content:read", "content:create", "content:update", "content:delete", "content:publish",
      "system:read", "system:update", "system:backup", "system:logs",
      "profile:read", "profile:update",
      "admin:dashboard", "admin:settings", "admin:analytics",
      "roles:read", "roles:create", "roles:update", "roles:delete"
    ];
  } else if (this.role === 'client') {
    // Client gets basic permissions
    this.permissions = [
      "profile:read", "profile:update",
      "content:read"
    ];
  }
  return this;
};

// Pre-save hook to set default permissions
userSchema.pre('save', function(next) {
  if (this.isModified('role') || (this.isNew && (!this.permissions || this.permissions.length === 0))) {
    this.setDefaultPermissions();
  }
  next();
});

const Role = mongoose.model("Role", roleSchema);
const User = mongoose.model("User", userSchema);

export { Role, User };
export default User;
