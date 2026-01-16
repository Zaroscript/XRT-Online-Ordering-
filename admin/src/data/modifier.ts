import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  Modifier,
  ModifierPaginator,
  ModifierQueryOptions,
  GetParams,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { modifierClient } from './client/modifier';
import { Config } from '@/config';

export const useCreateModifierMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: modifierClient.create,
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MODIFIERS] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useDeleteModifierMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: modifierClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MODIFIERS] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
    },
  });
};

export const useUpdateModifierMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: modifierClient.update,
    onSuccess: async (data, variables) => {
      const updatedModifier = (data as any)?.data || data;
      queryClient.setQueryData(
        [
          API_ENDPOINTS.MODIFIERS,
          { id: variables.id, language: router.locale },
        ],
        (old: any) => {
          return { data: updatedModifier };
        },
      );
      toast.success(t('common:successfully-updated'));
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.MODIFIERS] });
      queryClient.invalidateQueries({
        queryKey: [API_ENDPOINTS.MODIFIER_GROUPS],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
  });
};

export const useModifierQuery = ({
  slug,
  id,
  language,
}: GetParams & { id?: string }) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<Modifier, Error>({
    queryKey: [API_ENDPOINTS.MODIFIERS, { slug, id, language }],
    queryFn: () =>
      modifierClient.get({ id, modifier_group_id: slug, language }), // Using slug as modifier_group_id based on typical pattern here, or I need to check caller.
    enabled: Boolean(id && slug), // Require both ID and Group ID (slug)
  });

  const modifier = (data as any)?.data || data;

  return {
    modifier,
    error,
    isLoading,
  };
};

export const useModifiersQuery = (options: Partial<ModifierQueryOptions>) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<ModifierPaginator, Error>({
    queryKey: [API_ENDPOINTS.MODIFIERS, options],
    queryFn: ({ queryKey, pageParam }) =>
      modifierClient.paginated(
        Object.assign({}, queryKey[1] as any, pageParam),
      ),
    placeholderData: (previousData) => previousData,
  });

  const modifiers = (data as any)?.data ?? [];
  // The paginated function returns a PaginatorInfo structure, so mapPaginatorData should work
  // But we need to ensure it has a fallback
  const mappedPaginator = mapPaginatorData(data);
  const paginatorInfo = mappedPaginator || {
    currentPage: 1,
    lastPage: 1,
    perPage: options.limit || 20,
    total: modifiers.length,
    hasMorePages: false,
  };

  return {
    modifiers: Array.isArray(modifiers) ? modifiers : [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};
