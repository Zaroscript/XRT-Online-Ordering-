import React from 'react';
import { useRouter } from 'next/router';
import { getAuthCredentials, hasAccess, hasPermission } from './auth-utils';
import Loader from '@/components/ui/loader/loader';
import AccessDeniedPage from '@/components/common/access-denied';
import { Routes } from '@/config/routes';

import { SUPER_ADMIN } from './constants';

const PrivateRoute: React.FC<{
  authProps: any;
  children?: React.ReactNode;
}> = ({ children, authProps }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  const { token, role, permissions } = getAuthCredentials();
  const isUser = !!token;

  const hasRoleAccess =
    Array.isArray(authProps.permissions) &&
    !!authProps.permissions?.length &&
    hasAccess(authProps.permissions, role);

  const hasPermissionAccess =
    role === SUPER_ADMIN ||
    (authProps.allowedPermissions
      ? hasPermission(authProps.allowedPermissions, permissions)
      : true);

  const isAuthorized = (authProps.permissions ? hasRoleAccess : true) && hasPermissionAccess;

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
