// Role model for handling custom roles in the restaurant management system
import mongoose from 'mongoose';

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
      "roles:delete",

      // Withdraw permissions
      "withdraws:read",
      "withdraws:create",
      "withdraws:update",
      "withdraws:delete"
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

// Static method to find only non-system roles
roleSchema.statics.findNonSystemRoles = function () {
  return this.find({ isSystem: { $ne: true } });
};

// Static method to check if role name exists
roleSchema.statics.isNameTaken = async function (name, excludeId = null) {
  const query = { name };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const role = await this.findOne(query);
  return !!role;
};

// Instance method to check if role has specific permission
roleSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

// Instance method to add permission
roleSchema.methods.addPermission = function (permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};

// Instance method to remove permission
roleSchema.methods.removePermission = function (permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

// Pre-remove middleware to check if role is assigned to any users
roleSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const User = mongoose.model('User');
  const usersWithRole = await User.countDocuments({ customRole: this._id });
  if (usersWithRole > 0) {
    throw new Error('Cannot delete role that is assigned to users');
  }
});

const Role = mongoose.model("Role", roleSchema);

export default Role;
