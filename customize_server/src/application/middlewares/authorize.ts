import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ForbiddenError } from '../../shared/errors/AppError';
import { UserRole } from '../../shared/constants/roles';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
};

// Permission-based authorization
export const requirePermission = (permission: string) => {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const hasPermission = await req.user.hasPermission(permission);
    if (!hasPermission) {
      throw new ForbiddenError(`Insufficient permissions. Required: ${permission}`);
    }

    next();
  });
};

// Check if user has any of the specified permissions
export const requireAnyPermission = (permissions: string[]) => {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    for (const permission of permissions) {
      const hasPermission = await req.user.hasPermission(permission);
      if (hasPermission) {
        return next();
      }
    }

    throw new ForbiddenError(
      `Insufficient permissions. Required one of: ${permissions.join(', ')}`
    );
  });
};

// Check if user has all specified permissions
export const requireAllPermissions = (permissions: string[]) => {
  return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const hasAllPermissions = await Promise.all(
      permissions.map((permission) => req.user!.hasPermission(permission))
    );

    if (!hasAllPermissions.every(Boolean)) {
      throw new ForbiddenError(
        `Insufficient permissions. Required all of: ${permissions.join(', ')}`
      );
    }

    next();
  });
};

// Helper middleware to check if user belongs to business or is super admin
export const requireBusinessAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Super admin can access any business
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // For other roles, business_id must match
  const businessId = req.params.business_id || req.body.business_id || req.query.business_id;

  if (req.user.business_id !== businessId) {
    throw new ForbiddenError('Access denied to this business');
  }

  next();
};

