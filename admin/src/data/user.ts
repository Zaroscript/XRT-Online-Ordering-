import { AUTH_CRED } from '@/utils/constants';
import { Routes } from '@/config/routes';
import Cookies from 'js-cookie';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './client/api-endpoints';
import { userClient } from './client/user';
import {
  User,
  QueryOptionsType,
  UserPaginator,
  UserQueryOptions,
  LicensedDomainPaginator,
  LicenseAdditionalData,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import axios from 'axios';
import {
  setEmailVerified,
  setAuthCredentials,
  getAuthCredentials,
} from '@/utils/auth-utils';
import { type } from 'os';

export const useMeQuery = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { token } = getAuthCredentials();

  return useQuery<User, Error>(
    [API_ENDPOINTS.ME],
    userClient.me,
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!token, // Only run query if token exists
      onSuccess: (data: any) => {
        if (router.pathname === Routes.verifyLicense) {
          router.replace(Routes.dashboard);
        }
        if (router.pathname === Routes.verifyEmail) {
          setEmailVerified(true);
          router.replace(Routes.dashboard);
        }
      },
      onError: (err: any) => {
        // Handle authentication errors - redirect to login if needed
        // Only redirect if not already on login page
        if (err.response?.status === 401 && router.pathname !== Routes.login) {
          router.replace(Routes.login);
        }
      },
    }
  );
};

export function useLogin() {
  // Return mutation without default handlers - let the component handle success/error
  // This allows components to have full control over the login flow
  return useMutation(userClient.login);
}

export const useLogoutMutation = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation(userClient.logout, {
    onSuccess: () => {
      Cookies.remove(AUTH_CRED);
      router.replace(Routes.login);
      toast.success(t('common:successfully-logout'), {
        toastId: 'logoutSuccess',
      });
    },
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(userClient.register, {
    onSuccess: () => {
      toast.success(t('common:successfully-register'), {
        toastId: 'successRegister',
      });
    },
    onError: (error: any) => {
      const {
        response: { data },
      } = error ?? {};
      toast.error(data?.message || t('common:registration-failed'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.REGISTER);
    },
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(userClient.createUser, {
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      const {
        response: { data },
      } = error ?? {};
      toast.error(data?.message || t('common:create-user-failed'));
    },
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_LIST);
      queryClient.invalidateQueries(API_ENDPOINTS.STAFFS);
    },
  });
};

export const useUpdateUserMutation = () => {
  // ...existing code...
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(userClient.update, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ME);
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
    },
  });
};
export const useUpdateUserEmailMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(userClient.updateEmail, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};

      toast.error(data?.message);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.ME);
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation(userClient.changePassword);
};

export const useForgetPasswordMutation = () => {
  return useMutation(userClient.forgetPassword);
};
export const useResendVerificationEmail = () => {
  const { t } = useTranslation('common');
  return useMutation(userClient.resendVerificationEmail, {
    onSuccess: () => {
      toast.success(t('common:PICKBAZAR_MESSAGE.EMAIL_SENT_SUCCESSFUL'));
    },
    onError: () => {
      toast(t('common:PICKBAZAR_MESSAGE.EMAIL_SENT_FAILED'));
    },
  });
};

export const useLicenseKeyMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation(userClient.addLicenseKey, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      setTimeout(() => {
        router.reload();
      }, 1000);
    },
    onError: () => {
      toast.error(t('common:PICKBAZAR_MESSAGE.INVALID_LICENSE_KEY'));
    },
  });
};

export const useVerifyForgetPasswordTokenMutation = () => {
  return useMutation(userClient.verifyForgetPasswordToken);
};

export const useResetPasswordMutation = () => {
  return useMutation(userClient.resetPassword);
};

export const useMakeOrRevokeAdminMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(userClient.makeAdmin, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
    },
  });
};

export const useBlockUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(userClient.block, {
    onSuccess: () => {
      toast.success(t('common:successfully-block'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.STAFFS);
      queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_LIST);
      queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
      queryClient.invalidateQueries(API_ENDPOINTS.VENDORS_LIST);
    },
  });
};

export const useUnblockUserMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(userClient.unblock, {
    onSuccess: () => {
      toast.success(t('common:successfully-unblock'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
      queryClient.invalidateQueries(API_ENDPOINTS.STAFFS);
      queryClient.invalidateQueries(API_ENDPOINTS.ADMIN_LIST);
      queryClient.invalidateQueries(API_ENDPOINTS.CUSTOMERS);
      queryClient.invalidateQueries(API_ENDPOINTS.VENDORS_LIST);
    },
  });
};

export const useAddWalletPointsMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation(userClient.addWalletPoints, {
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.USERS);
    },
  });
};

export const useUserQuery = ({ id }: { id: string }) => {
  return useQuery<any, Error>(
    [API_ENDPOINTS.USERS, id],
    () => userClient.fetchUser({ id }),
    {
      enabled: Boolean(id),
      select: (data) => data?.data?.user,
    },
  );
};

export const useUsersQuery = (params: Partial<QueryOptionsType>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.USERS, params],
    () => userClient.fetchUsers(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    users: (data as any)?.data?.users ?? [],
    paginatorInfo: (data as any)?.paginatorInfo ?? {
      total: (data as any)?.results ?? 0,
      currentPage: 1,
      lastPage: 1,
      hasMorePages: false,
      perPage: (data as any)?.results ?? 10,
      count: (data as any)?.results ?? 0,
      firstItem: 1,
      lastItem: (data as any)?.results ?? 0,
    },
    loading: isLoading,
    error,
  };
};

export const useAdminsQuery = (params: Partial<QueryOptionsType>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.ADMIN_LIST, params],
    () => userClient.fetchAdmins(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    admins: (data as any)?.data?.users ?? [],
    paginatorInfo: {
      total: (data as any)?.results ?? 0,
      currentPage: 1,
      lastPage: 1,
      hasMorePages: false,
      perPage: (data as any)?.results ?? 10,
      count: (data as any)?.results ?? 0,
      firstItem: 1,
      lastItem: (data as any)?.results ?? 0,
    },
    loading: isLoading,
    error,
  };
};

export const useVendorsQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.VENDORS_LIST, params],
    () => userClient.fetchVendors(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    vendors: (data as any)?.data?.users ?? [],
    paginatorInfo: {
      total: (data as any)?.results ?? 0,
      currentPage: 1,
      lastPage: 1,
      hasMorePages: false,
      perPage: (data as any)?.results ?? 10,
      count: (data as any)?.results ?? 0,
      firstItem: 1,
      lastItem: (data as any)?.results ?? 0,
    },
    loading: isLoading,
    error,
  };
};

export const useCustomersQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.CUSTOMERS, params],
    () => userClient.fetchCustomers(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    customers: (data as any)?.data?.users ?? [],
    paginatorInfo: {
      total: (data as any)?.results ?? 0,
      currentPage: 1,
      lastPage: 1,
      hasMorePages: false,
      perPage: (data as any)?.results ?? 10,
      count: (data as any)?.results ?? 0,
      firstItem: 1,
      lastItem: (data as any)?.results ?? 0,
    },
    loading: isLoading,
    error,
  };
};

export const useMyStaffsQuery = (
  params: Partial<UserQueryOptions & { shop_id: string }>,
) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.MY_STAFFS, params],
    () => userClient.getMyStaffs(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    myStaffs: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    loading: isLoading,
    error,
  };
};

export const useAllStaffsQuery = (params: Partial<UserQueryOptions>) => {
  const { data, isLoading, error } = useQuery<UserPaginator, Error>(
    [API_ENDPOINTS.ALL_STAFFS, params],
    () => userClient.getAllStaffs(params),
    {
      keepPreviousData: true,
    },
  );

  return {
    allStaffs: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    loading: isLoading,
    error,
  };
};
