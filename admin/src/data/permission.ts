import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionClient } from './client/permission';
import { Permission, QueryOptions } from '@/types';
import { API_ENDPOINTS } from './client/api-endpoints';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';

export const usePermissionsQuery = (params?: Partial<QueryOptions>) => {
    return useQuery<Permission[], Error>({
        queryKey: [API_ENDPOINTS.PERMISSIONS, params],
        queryFn: () => permissionClient.all(params),
    });
};

export const useGroupedPermissionsQuery = () => {
    return useQuery<{ permissionsByModule: Record<string, Permission[]>; modules: string[] }, Error>({
        queryKey: [API_ENDPOINTS.PERMISSIONS, 'grouped'],
        queryFn: permissionClient.grouped,
        select: (data: any) => {
            // Handle backend response format: { success: true, data: { permissionsByModule, modules } }
            const result = data?.data || data;
            return {
                permissionsByModule: result?.permissionsByModule || {},
                modules: result?.modules || [],
            };
        },
    });
};

export const useUpdatePermissionMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: permissionClient.update,
        onSuccess: () => {
            toast.success(t('common:successfully-updated'));
            queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.PERMISSIONS] });
        },
        onError: (error: any) => {
            toast.error(t('common:action-failed'));
        },
    });
};
