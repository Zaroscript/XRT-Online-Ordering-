import React from 'react';
import { useRouter } from 'next/router';
import { getAuthCredentials, hasAccess, hasPermission } from './auth-utils';
import Loader from '@/components/ui/loader/loader';
import AccessDeniedPage from '@/components/common/access-denied';
import { Routes } from '@/config/routes';

import { PERMISSION_KEYS, SUPER_ADMIN } from './constants';

function resolvePagePermission(pathname: string): string | null {
  if (!pathname) return null;

  const routeMatchers: Array<{ prefix: string; permission: string }> = [
    { prefix: '/orders', permission: PERMISSION_KEYS.ORDERS_READ },
    { prefix: '/categories', permission: PERMISSION_KEYS.CATEGORIES_READ },
    { prefix: '/products', permission: PERMISSION_KEYS.ITEMS_READ },
    { prefix: '/item-sizes', permission: PERMISSION_KEYS.ITEMS_READ },
    { prefix: '/modifiers/groups', permission: PERMISSION_KEYS.MODIFIER_GROUPS_READ },
    { prefix: '/modifiers', permission: PERMISSION_KEYS.MODIFIERS_READ },
    { prefix: '/import', permission: PERMISSION_KEYS.IMPORTS_READ },
    { prefix: '/printers', permission: PERMISSION_KEYS.PRINTERS_READ },
    { prefix: '/print-templates', permission: PERMISSION_KEYS.PRINT_TEMPLATES_READ },
    { prefix: '/kitchen-sections', permission: PERMISSION_KEYS.KITCHEN_SECTIONS_READ },
    { prefix: '/users', permission: PERMISSION_KEYS.USERS_READ },
    { prefix: '/roles', permission: PERMISSION_KEYS.ROLES_READ },
    { prefix: '/customers', permission: PERMISSION_KEYS.CUSTOMERS_READ },
    { prefix: '/coupons', permission: PERMISSION_KEYS.COUPONS_READ },
    { prefix: '/loyalty', permission: PERMISSION_KEYS.LOYALTY_READ },
    { prefix: '/emails', permission: PERMISSION_KEYS.EMAILS_READ },
    { prefix: '/sms', permission: PERMISSION_KEYS.SMS_READ },
    { prefix: '/settings', permission: PERMISSION_KEYS.SETTINGS_READ },
    { prefix: '/analytics', permission: PERMISSION_KEYS.ANALYTICS_READ },
    { prefix: '/messages', permission: PERMISSION_KEYS.ADMIN_DASHBOARD },
  ];

  const match = routeMatchers.find((item) => pathname.startsWith(item.prefix));
  if (match) return match.permission;

  if (pathname === '/' || pathname === '/dashboard') {
    return PERMISSION_KEYS.DASHBOARD_VIEW;
  }

  return null;
}

const PrivateRoute: React.FC<{
  authProps: any;
  children?: React.ReactNode;
}> = ({ children, authProps }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  const { token, role, permissions } = getAuthCredentials();
  const isUser = !!token;
  const pagePermission = resolvePagePermission(router.pathname);

  const hasRoleAccess =
    Array.isArray(authProps.permissions) &&
    !!authProps.permissions?.length &&
    hasAccess(authProps.permissions, role);

  const hasPermissionAccess =
    role === SUPER_ADMIN ||
    (authProps.allowedPermissions
      ? hasPermission(authProps.allowedPermissions, permissions)
      : true);

  const hasMappedPageAccess =
    pagePermission && (role === SUPER_ADMIN || hasPermission([pagePermission], permissions));

  // Backward compatible:
  // - If page still uses legacy role-based `permissions`, allow either role OR mapped permission
  // - If page defines `allowedPermissions`, that check remains authoritative
  const hasRoleAccessOrMappedPage =
    authProps.permissions ? hasRoleAccess || !!hasMappedPageAccess : true;

  const isAuthorized = hasRoleAccessOrMappedPage && hasPermissionAccess;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted && !isUser) router.replace(Routes.login);
  }, [isUser, isMounted]);

  if (!isMounted) {
    return <Loader showText={false} />;
  }

  if (isUser && isAuthorized) {
    return <>{children}</>;
  }
  if (isUser && !isAuthorized) {
    return <AccessDeniedPage />;
  }
  return <Loader showText={false} />;
};

export default PrivateRoute;
