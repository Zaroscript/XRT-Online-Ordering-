import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { Routes } from '@/config/routes';
import { API_ENDPOINTS } from './client/api-endpoints';
import {
  Category,
  CategoryPaginator,
  CategoryQueryOptions,
  GetParams,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { categoryClient } from './client/category';
import { Config } from '@/config';

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: categoryClient.create,
    onSuccess: () => {
      Router.push(Routes.category.list, undefined, {
        locale: Config.defaultLanguage,
      });
      toast.success(t('common:successfully-created'));
    },
    onError: (error: any) => {
      console.error('❌ Create Category Error:', error);
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: categoryClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryClient.update,
    onSuccess: async (data, variables) => {
      // Update the cache immediately with the returned data
      const updatedCategory = (data as any)?.data || data;
      // Update individual category query
      queryClient.setQueryData(
        [
          API_ENDPOINTS.CATEGORIES,
          { id: variables.id, language: router.locale },
        ],
        (old: any) => {
          // Backend structure usually returns { data: Category } or just Category
          // We try to match what useCategoryQuery expects
          return { data: updatedCategory };
        },
      );
      toast.success(t('common:successfully-updated'));
      router.push(Routes.category.list, undefined, {
        locale: Config.defaultLanguage,
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:update-failed'));
    },
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
    },
  });
};

export const useCategoryQuery = ({
  slug,
  id,
  language,
}: GetParams & { id?: string }) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<Category, Error>({
    queryKey: [API_ENDPOINTS.CATEGORIES, { slug, id, language }],
    queryFn: () => categoryClient.get({ slug, id, language }),
    enabled: Boolean(id || slug),
  });
  let category = (data as any)?.data || data;

  if (category && category.description && !category.details) {
    category = { ...category, details: category.description };
  }

  return {
    category,
    error,
    isLoading,
  };
};

export const useCategoriesQuery = (options: Partial<CategoryQueryOptions>) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<CategoryPaginator, Error>({
    queryKey: [API_ENDPOINTS.CATEGORIES, options],
    queryFn: ({ queryKey, pageParam }) =>
      categoryClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    placeholderData: (previousData) => previousData,
  });
  const categories = (data as any)?.data ?? [];
  const paginatorInfo = (data as any)?.paginatorInfo ?? mapPaginatorData(data);

  return {
    categories: Array.isArray(categories) ? categories : [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};

export const useImportCategoriesMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: categoryClient.importCategories,
    onSuccess: (data: any) => {
      // Refresh categories list
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
      const stats = data?.data || data;
      toast.success(
        t('common:category-import-success', {
          created: stats?.created || 0,
          updated: stats?.updated || 0,
          errors: stats?.errors?.length || 0,
        }),
      );
      if (stats?.errors?.length > 0) {
        console.error('Import errors:', stats.errors);
        toast.warn(t('common:category-import-partial-error'));
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:import-failed'));
    },
  });
};
