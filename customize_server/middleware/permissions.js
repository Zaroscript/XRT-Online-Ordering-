// Permission-based access control middleware
import { catchAsync } from '../utils/catchAsync.js';

// Check if user has specific permission
export const requirePermission = (permission) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const hasPermission = await req.user.hasPermission(permission);
    if (!hasPermission) {
      return res.status(403).json({
        status: 'error',
        message: `Insufficient permissions. Required: ${permission}`,
      });
    }

    next();
  });
};

// Check if user has any of the specified permissions
export const requireAnyPermission = (permissions) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Check each permission
    for (const permission of permissions) {
      const hasPermission = await req.user.hasPermission(permission);
      if (hasPermission) {
        return next();
      }
    }

    return res.status(403).json({
      status: 'error',
      message: `Insufficient permissions. Required one of: ${permissions.join(', ')}`,
    });
  });
};

// Check if user has all specified permissions
export const requireAllPermissions = (permissions) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const hasAllPermissions = await Promise.all(
      permissions.map(permission => req.user.hasPermission(permission))
    );

    if (!hasAllPermissions.every(Boolean)) {
      return res.status(403).json({
        status: 'error',
        message: `Insufficient permissions. Required all of: ${permissions.join(', ')}`,
      });
    }

    next();
  });
};

// Permission-based resource ownership check
export const requireOwnershipOrPermission = (permission) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Super admin bypasses ownership check
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user owns the resource (assuming resource has userId field)
    // This would need to be implemented based on your specific resource model
    const resourceId = req.params.id;
    const userId = req.user._id.toString();
    
    // For now, we'll just check permission
    // In a real implementation, you would fetch the resource and check ownership
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        status: 'error',
        message: `Insufficient permissions. Required: ${permission} or resource ownership`,
      });
    }

    next();
  });
};

// Helper function to get user permissions (for frontend)
export const getUserPermissions = (user) => {
  if (user.role === 'super_admin') {
    return [
      "users:read", "users:create", "users:update", "users:delete", "users:approve", "users:ban",
      "content:read", "content:create", "content:update", "content:delete", "content:publish",
      "system:read", "system:update", "system:backup", "system:logs",
      "profile:read", "profile:update",
      "admin:dashboard", "admin:settings", "admin:analytics"
    ];
  }
  return user.permissions || [];
};

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  USER_MANAGEMENT: [
    "users:read",
    "users:create", 
    "users:update",
    "users:delete",
    "users:approve",
    "users:ban"
  ],
  CONTENT_MANAGEMENT: [
    "content:read",
    "content:create",
    "content:update", 
    "content:delete",
    "content:publish"
  ],
  SYSTEM: [
    "system:read",
    "system:update",
    "system:backup",
    "system:logs"
  ],
  PROFILE: [
    "profile:read",
    "profile:update"
  ],
  ADMIN: [
    "admin:dashboard",
    "admin:settings",
    "admin:analytics"
  ]
};
