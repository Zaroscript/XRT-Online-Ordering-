import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  ModifierGroup,
  ModifierGroupPaginator,
  ModifierGroupQueryOptions,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { modifierGroupClient } from './client/modifier-group';
import { Config } from '@/config';
// Removed mock imports - using real API calls now

export const useCreateModifierGroupMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (input: any) => {
      return modifierGroupClient.create(input);
    },
    onSuccess: () => {
      Router.push(Routes.modifierGroup.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('common:create-failed'),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
    },
  });
};

export const useDeleteModifierGroupMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return modifierGroupClient.delete({ id });
    },
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('common:delete-failed'),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
    },
  });
};

export const useUpdateModifierGroupMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      return modifierGroupClient.update({ id, ...input });
    },
    onSuccess: async (data, variables) => {
      const updatedGroup = (data as any)?.data || data;
      queryClient.setQueryData(
        [
          API_ENDPOINTS.MODIFIER_GROUPS,
          { id: variables.id, language: router.locale },
        ],
        (old: any) => {
          return { data: updatedGroup };
        },
      );
      toast.success(t('common:successfully-updated'));
      router.push(Routes.modifierGroup.list, undefined, {
        locale: Config.defaultLanguage,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          t('common:update-failed'),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
    },
  });
};

export const useModifierGroupQuery = ({
  slug,
  id,
  language,
}: {
  slug?: string;
  id?: string;
  language: string;
}) => {
  // Use real API call
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ModifierGroup, Error>({
    queryKey: [API_ENDPOINTS.MODIFIER_GROUPS, { slug, id, language }],
    queryFn: async () => {
      const groupId = id || slug;
      if (!groupId) {
        throw new Error('Modifier group ID is required');
      }
      return modifierGroupClient.get({ id: groupId, language });
    },
    enabled: Boolean(id || slug),
    // Detail pages: shorter stale time for fresher data
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const group = ((data as any)?.data || data) as ModifierGroup | undefined;

  return {
    group,
    error,
    isLoading,
  };
};

export const useModifierGroupsQuery = (
  options: Partial<ModifierGroupQueryOptions>,
) => {
  // Use real API call instead of mock data
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ModifierGroupPaginator, Error>({
    queryKey: [API_ENDPOINTS.MODIFIER_GROUPS, options],
    queryFn: ({ queryKey, pageParam }) =>
      modifierGroupClient.paginated(
        Object.assign({}, queryKey[1] as any, pageParam),
      ),
    placeholderData: (previousData) => previousData,
  });

  const groups = (data as any)?.data ?? [];
  // The paginated function returns a PaginatorInfo structure, so mapPaginatorData should work
  // But we need to ensure it has a fallback
  const mappedPaginator = mapPaginatorData(data);
  const paginatorInfo = mappedPaginator || {
    currentPage: 1,
    lastPage: 1,
    perPage: options.limit || 20,
    total: groups.length,
    hasMorePages: false,
  };

  return {
    groups: Array.isArray(groups) ? groups : [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};
