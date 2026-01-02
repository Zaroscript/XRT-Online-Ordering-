import Router, { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
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

  return useMutation(categoryClient.create, {
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
      queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(categoryClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
    },
  });
};

export const useUpdateCategoryMutation = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(categoryClient.update, {
    onSuccess: async (data, variables) => {
      // Update the cache immediately with the returned data
      const updatedCategory = (data as any)?.data || data;
      // Update individual category query
      queryClient.setQueryData(
        [API_ENDPOINTS.CATEGORIES, { id: variables.id, language: router.locale }],
        (old: any) => {
          // Backend structure usually returns { data: Category } or just Category
          // We try to match what useCategoryQuery expects
          return { data: updatedCategory };
        }
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
      queryClient.invalidateQueries(API_ENDPOINTS.CATEGORIES);
    },
  });
};

export const useCategoryQuery = ({ slug, id, language }: GetParams & { id?: string }) => {
  const { data, error, isLoading } = useQuery<Category, Error>(
    [API_ENDPOINTS.CATEGORIES, { slug, id, language }],
    () => categoryClient.get({ slug, id, language }),
    {
      enabled: Boolean(id),
    }
  );

  // Handle backend response format
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
  const { data, error, isLoading } = useQuery<CategoryPaginator, Error>(
    [API_ENDPOINTS.CATEGORIES, options],
    ({ queryKey, pageParam }) =>
      categoryClient.paginated(Object.assign({}, queryKey[1], pageParam)),
    {
      keepPreviousData: true,
    }
  );

  // Handle backend response format
  const categories = (data as any)?.data ?? [];
  const paginatorInfo = (data as any)?.paginatorInfo ?? mapPaginatorData(data);

  return {
    categories: Array.isArray(categories) ? categories : [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};
