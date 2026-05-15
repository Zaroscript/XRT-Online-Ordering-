import Router, { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { itemClient } from './client/item';
import { HttpClient } from './client/http-client';
import {
    ItemQueryOptions,
    GetParams,
    ItemPaginator,
    Item,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';
import { Routes } from '@/config/routes';
import { Config } from '@/config';

export const useCreateItemMutation = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: itemClient.create,
        onSuccess: async () => {
            const generateRedirectUrl = router.query.shop
                ? `/${router.query.shop}${Routes.item.list}`
                : Routes.item.list;
            await Router.push(generateRedirectUrl, undefined, {
                locale: Config.defaultLanguage,
            });
            toast.success(t('common:successfully-created'));
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
        },
        onError: (error: any) => {
            const { data, status } = error?.response;
            if (status === 422) {
                const errorMessage: any = Object.values(data).flat();
                toast.error(errorMessage[0]);
            } else {
                toast.error(t(`common:${error?.response?.data.message}`));
            }
        },
    });
};

export const useUpdateItemMutation = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: itemClient.updateItem,
        // Optimistic update for faster UI response
        onMutate: async (variables) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: [API_ENDPOINTS.ITEMS] });

            // Snapshot the previous value for rollback
            const previousQueries = queryClient.getQueriesData({ queryKey: [API_ENDPOINTS.ITEMS] });

            // Optimistically update all items queries
            queryClient.setQueriesData({ queryKey: [API_ENDPOINTS.ITEMS] }, (old: any) => {
                if (!old) return old;
                // Handle paginated response (ItemPaginator with data array)
                if (old.data && Array.isArray(old.data)) {
                    return {
                        ...old,
                        data: old.data.map((item: any) =>
                            item.id === variables.id
                                ? { ...item, ...variables }
                                : item
                        ),
                    };
                }
                // Handle direct array response
                if (Array.isArray(old)) {
                    return old.map((item: any) =>
                        item.id === variables.id
                            ? { ...item, ...variables }
                            : item
                    );
                }
                return old;
            });

            return { previousQueries };
        },
        onSuccess: (data, variables) => {
            const updatedItem = (data as any)?.data?.item || (data as any)?.data || data;
            // Update the query cache with the actual response
            queryClient.setQueryData(
                [API_ENDPOINTS.ITEMS, { id: variables.id, language: router.locale }],
                updatedItem
            );
            // Update items list cache with actual response (non-blocking)
            queryClient.setQueriesData({ queryKey: [API_ENDPOINTS.ITEMS] }, (old: any) => {
                if (!old) return old;
                // Handle paginated response (ItemPaginator with data array)
                if (old.data && Array.isArray(old.data)) {
                    return {
                        ...old,
                        data: old.data.map((item: any) =>
                            item.id === variables.id ? updatedItem : item
                        ),
                    };
                }
                // Handle direct array response
                if (Array.isArray(old)) {
                    return old.map((item: any) =>
                        item.id === variables.id ? updatedItem : item
                    );
                }
                return old;
            });
            toast.success(t('common:successfully-updated'));
        },
        // Invalidate queries in background (non-blocking)
        onSettled: () => {
            // Invalidate in background without blocking
            queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] }).catch(() => { });
        },
        onError: (error: any, variables, context) => {
            // Rollback optimistic update on error
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
            toast.error(t(`common:${errorMessage}`) || errorMessage);
        },
    });
};

export const useDeleteItemMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: itemClient.delete,
        onSuccess: () => {
            toast.success(t('common:successfully-deleted'));
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
        },
        onError: (error: any) => {
            toast.error(t(`common:${error?.response?.data.message}`));
        },
    });
};

export const useUpdateItemsSortOrderMutation = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (items: { id: string; order: number }[]) =>
            HttpClient.post(API_ENDPOINTS.ITEMS_SORT_ORDER, { items }),
        onSuccess: () => {
            toast.success(t('common:successfully-updated'));
            queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ITEMS] });
        },
        onError: (error: any) => {
            toast.error(t('common:update-failed'));
        },
    });
};

export const useItemQuery = ({ slug, id, language }: { slug?: string; id?: string; language: string }, options: any = {}) => {
    const { data, error, isLoading, refetch } = useQuery<Item, Error>({
        queryKey: [API_ENDPOINTS.ITEMS, { slug, id, language }],
        queryFn: () => itemClient.get({ slug: slug || '', id, language }),
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        ...options,
    });

    return {
        item: data,
        error,
        isLoading,
        refetch,
    };
};

export const useItemsQuery = (
    params: Partial<ItemQueryOptions>,
    options: any = {},
) => {
    const { data, error, isPending: isLoading } = useQuery<ItemPaginator, Error>({
        queryKey: [API_ENDPOINTS.ITEMS, params],
        queryFn: ({ queryKey, pageParam }) =>
            itemClient.paginated(Object.assign({}, queryKey[1], pageParam)),
        placeholderData: (previousData) => previousData,
        ...options,
    });

    // Handle backend response format: { success: true, data: { items: [...], paginatorInfo: {...} } }
    const responseData = (data as any)?.data || data;
    const items = responseData?.items ?? [];
    const paginatorInfo = responseData?.paginatorInfo ?? mapPaginatorData(data);

    return {
        items: Array.isArray(items) ? items : [],
        paginatorInfo,
        error,
        loading: isLoading,
    };
};
