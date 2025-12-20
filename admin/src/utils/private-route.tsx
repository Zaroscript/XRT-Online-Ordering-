import React from 'react';
import { useRouter } from 'next/router';
import { getAuthCredentials, hasAccess } from './auth-utils';
import Loader from '@/components/ui/loader/loader';
import AccessDeniedPage from '@/components/common/access-denied';
import { Routes } from '@/config/routes';

const PrivateRoute: React.FC<{
  authProps: any;
  children?: React.ReactNode;
}> = ({ children, authProps }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const router = useRouter();
  const { token, role } = getAuthCredentials();
  const isUser = !!token;
  const hasPermission =
    Array.isArray(authProps.permissions) &&
    !!authProps.permissions?.length &&
    hasAccess(authProps.permissions, role);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted && !isUser) router.replace(Routes.login); // If not authenticated, force log in
  }, [isUser, isMounted]);

  if (!isMounted) {
    return <Loader showText={false} />;
  }

  if (isUser && hasPermission) {
    return <>{children}</>;
  }
  if (isUser && !hasPermission) {
    return <AccessDeniedPage />;
  }
  return <Loader showText={false} />;
};

export default PrivateRoute;
