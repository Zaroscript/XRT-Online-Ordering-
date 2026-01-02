import dynamic from 'next/dynamic';
import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  allowedRoles,
  getAuthCredentials,
  hasAccess,
  isAuthenticated,
} from '@/utils/auth-utils';
import { SUPER_ADMIN } from '@/utils/constants';
import AppLayout from '@/components/layouts/app';
import { Routes } from '@/config/routes';
import { Config } from '@/config';
import { useMeQuery } from '@/data/user';
import { useDashboardLoading } from '@/hooks/use-app-loading';

const AdminDashboard = dynamic(() => import('@/components/dashboard/admin'));
const OwnerDashboard = dynamic(() => import('@/components/dashboard/owner'));

export default function Dashboard({
  userPermissions,
  userRole,
}: {
  userPermissions: string[];
  userRole: string;
}) {
  const { data: userData, isLoading: userLoading } = useMeQuery();
  // Handle backend response format: { success: true, data: { user: {...} } }
  const user = (userData as any)?.data?.user || (userData as any)?.data || userData;

  // Only use dashboard loading hook if user is authenticated
  // This prevents the loader from showing on initial app load before login
  const { token } = getAuthCredentials();
  
  // Always call the hook, but pass empty array if not authenticated
  useDashboardLoading({
    loadingStates: token ? [userLoading] : [],
    loadingMessage: 'Loading user profile...'
  });

  // Use real user role from customize_server
  if (user?.role === 'super_admin') {
    return <AdminDashboard />;
  }
  return <OwnerDashboard />;
}

Dashboard.Layout = AppLayout;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { locale } = ctx;
  // TODO: Improve it
  const generateRedirectUrl =
    locale !== Config.defaultLanguage
      ? `/${locale}${Routes.login}`
      : Routes.login;
  const { token, permissions, role } = getAuthCredentials(ctx);
  if (!token || !hasAccess(allowedRoles, role)) {
    return {
      redirect: {
        destination: generateRedirectUrl,
        permanent: false,
      },
    };
  }
  if (locale) {
    return {
      props: {
        ...(await serverSideTranslations(locale, [
          'common',
          'form',
          'table',
          'widgets',
        ])),
        userPermissions: permissions,
        userRole: role,
      },
    };
  }
  return {
    props: {
      userPermissions: permissions,
      userRole: role,
    },
  };
};
