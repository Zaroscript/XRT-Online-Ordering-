import Cookie from 'js-cookie';
import * as SSRCookie from 'cookie';
import {
  AUTH_CRED,
  EMAIL_VERIFIED,
  PERMISSIONS,
  STAFF,
  STORE_OWNER,
  SUPER_ADMIN,
  TOKEN,
} from './constants';

export const allowedRoles = [SUPER_ADMIN, STORE_OWNER, STAFF];
export const adminAndOwnerOnly = [SUPER_ADMIN, STORE_OWNER]; // Now includes 'client'
export const adminOwnerAndStaffOnly = [SUPER_ADMIN, STORE_OWNER, STAFF]; // Now includes 'client'
export const adminOnly = [SUPER_ADMIN];
export const ownerOnly = [STORE_OWNER]; // Now 'client'
export const ownerAndStaffOnly = [STORE_OWNER, STAFF]; // Now includes 'client'

export function setAuthCredentials(
  token: string,
  permissions: any,
  role: any,
  refreshToken?: string,
  persist: boolean = false,
) {
  const options = persist ? { expires: 30 } : {};
  Cookie.set(
    AUTH_CRED,
    JSON.stringify({ token, permissions, role, refreshToken }),
    options,
  );
}
export function setEmailVerified(emailVerified: boolean) {
  Cookie.set(EMAIL_VERIFIED, JSON.stringify({ emailVerified }));
}
export function getEmailVerified(): {
  emailVerified: boolean;
} {
  const emailVerified = Cookie.get(EMAIL_VERIFIED);
  return emailVerified ? JSON.parse(emailVerified) : { emailVerified: false };
}

export function getAuthCredentials(context?: any): {
  token: string | null;
  permissions: string[] | null;
  role: string | null;
  refreshToken: string | null;
} {
  let authCred;
  if (context) {
    authCred = parseSSRCookie(context)[AUTH_CRED];
  } else {
    authCred = Cookie.get(AUTH_CRED);
  }
  if (authCred) {
    return JSON.parse(authCred);
  }
  return {
    token: null,
    permissions: null,
    role: null,
    refreshToken: null,
  };
}

export function parseSSRCookie(context: any) {
  try {
    const cookieHeader = context?.req?.headers?.cookie ?? '';
    if (!cookieHeader) return {};
    return SSRCookie.parse(cookieHeader);
  } catch (error) {
    console.error('Error parsing SSR cookies:', error);
    return {};
  }
}

export function hasAccess(
  _allowedRoles: string[],
  _userRole: string | string[] | undefined | null,
) {
  if (
    !_allowedRoles ||
    !Array.isArray(_allowedRoles) ||
    !_allowedRoles.length
  ) {
    return true;
  }
  if (!_userRole) return false;

  if (Array.isArray(_userRole)) {
    return _userRole.some((role) => _allowedRoles.includes(role));
  }

  return _allowedRoles.includes(_userRole);
}

export function hasPermission(
  _allowedPermissions: string[],
  _userPermissions: string[] | undefined | null,
): boolean {
  if (
    !_allowedPermissions ||
    !Array.isArray(_allowedPermissions) ||
    !_allowedPermissions.length
  ) {
    return true;
  }

  if (!_userPermissions || !Array.isArray(_userPermissions)) {
    return false;
  }

  return _allowedPermissions.some((permission) =>
    _userPermissions.includes(permission),
  );
}

export function isAuthenticated(_cookies: any) {
  // Handle both old format (separate token/permissions cookies) and new format (AUTH_CRED cookie)
  if (_cookies.token && _cookies.permissions) {
    // Old format: separate cookies
    return (
      !!_cookies.token &&
      Array.isArray(_cookies.permissions) &&
      !!_cookies.permissions.length
    );
  } else if (_cookies.AUTH_CRED) {
    // New format: single AUTH_CRED cookie
    try {
      const authData =
        typeof _cookies.AUTH_CRED === 'string'
          ? JSON.parse(_cookies.AUTH_CRED)
          : _cookies.AUTH_CRED;
      return !!authData.token;
    } catch (error) {
      console.error('Error parsing AUTH_CRED cookie:', error);
      return false;
    }
  }
  return false;
}
