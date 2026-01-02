import Router, { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { itemClient } from './client/item';
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
    return useMutation(itemClient.create, {
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
            queryClient.invalidateQueries(API_ENDPOINTS.ITEMS);
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
    return useMutation(itemClient.updateItem, {
        onSuccess: async (data, variables) => {
            const updatedItem = (data as any)?.data?.item || (data as any)?.data || data;
            // Update the query cache with the updated item
            queryClient.setQueryData(
                [API_ENDPOINTS.ITEMS, { id: variables.id, language: router.locale }],
                updatedItem
            );
            // Force refetch the item query to ensure we have the latest data
            await queryClient.refetchQueries([API_ENDPOINTS.ITEMS, { id: variables.id }]);
            toast.success(t('common:successfully-updated'));
            // Don't redirect on update - let user stay on the page
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries(API_ENDPOINTS.ITEMS);
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred';
            toast.error(t(`common:${errorMessage}`) || errorMessage);
        },
    });
};

export const useDeleteItemMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation(itemClient.delete, {
        onSuccess: () => {
            toast.success(t('common:successfully-deleted'));
        },
        // Always refetch after error or success:
        onSettled: () => {
            queryClient.invalidateQueries(API_ENDPOINTS.ITEMS);
        },
        onError: (error: any) => {
            toast.error(t(`common:${error?.response?.data.message}`));
        },
    });
};

export const useItemQuery = ({ slug, id, language }: GetParams & { id?: string }, options: any = {}) => {
    const { data, error, isLoading, refetch } = useQuery<Item, Error>(
        [API_ENDPOINTS.ITEMS, { slug, id, language }],
        () => itemClient.get({ slug, id, language }),
        {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            ...options,
        }
    );

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
    const { data, error, isLoading } = useQuery<ItemPaginator, Error>(
        [API_ENDPOINTS.ITEMS, params],
        ({ queryKey, pageParam }) =>
            itemClient.paginated(Object.assign({}, queryKey[1], pageParam)),
        {
            keepPreviousData: true,
            ...options,
        },
    );

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
