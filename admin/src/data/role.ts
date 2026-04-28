import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { roleClient } from './client/role';
import { Role, RolePaginator, QueryOptionsType } from '@/types';
import { Routes } from '@/config/routes';
import { useRouter } from 'next/router';
import { getErrorMessage } from '@/utils/form-error';

export const useRolesQuery = (params: Partial<QueryOptionsType>) => {
  const { data, isLoading, error } = useQuery<RolePaginator, Error>({
    queryKey: [API_ENDPOINTS.ROLES, params],
    queryFn: () => roleClient.fetchRoles(params),
    placeholderData: (previousData) => previousData,
  },
  );

  // Handle backend response format: { success: true, data: { roles: [...], paginatorInfo: {...} } }
  const responseData = (data as any)?.data || data;
  const roles = responseData?.roles ?? [];
  const paginatorInfo = responseData?.paginatorInfo ?? {
    total: roles.length,
    currentPage: 1,
    lastPage: 1,
    hasMorePages: false,
    perPage: 10,
    count: roles.length,
    firstItem: 1,
    lastItem: roles.length,
  };

  return {
    roles: Array.isArray(roles) ? roles : [],
    paginatorInfo,
    loading: isLoading,
    error,
  };
};

export const useRoleQuery = ({ id }: { id: string }) => {
  return useQuery<Role, Error>({
    queryKey: [API_ENDPOINTS.ROLES, id],
    queryFn: () => roleClient.fetchRole({ id }),
    enabled: Boolean(id) && id !== 'undefined',
    select: (data: any) => {
      // Handle backend response format: { success: true, data: { role: {...} } }
      const res = data?.data || data;
      return res?.role || res;
    },
  },
  );
};

export const useCreateRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: roleClient.create,
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      router.push(Routes.role.list);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ROLES] });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: roleClient.update,
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ROLES] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS] }); // Permissions might change
    },
  });
};

export const useDeleteRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error)?.message as string);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ROLES] });
    },
  });
};

export const usePermissionsQuery = (
  options?: UseQueryOptions<string[], Error>,
): UseQueryResult<string[], Error> => {
  return useQuery<string[], Error>({
    queryKey: [API_ENDPOINTS.ALL_PERMISSIONS],
    queryFn: () => roleClient.fetchAllPermissions(),
    ...options,
  });
};

export const useAssignRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleClient.assignRoleToUser,
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ROLES] });
    },
  });
};

export const useRemoveRoleMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleClient.removeRoleFromUser,
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.USERS] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ROLES] });
    },
  });
};
