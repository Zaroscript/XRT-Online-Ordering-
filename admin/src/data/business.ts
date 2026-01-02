import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { businessClient, Business, CreateBusinessInput, UpdateBusinessInput } from './client/business';
import { API_ENDPOINTS } from './client/api-endpoints';

export const useBusinessesQuery = () => {
  const { data, error, isLoading } = useQuery<Business[], Error>(
    [API_ENDPOINTS.BUSINESSES],
    () => businessClient.getAll()
  );

  return {
    businesses: Array.isArray(data) ? data : [],
    loading: isLoading,
    error,
  };
};

export const useBusinessQuery = ({ id }: { id: string }) => {
  const { data, error, isLoading } = useQuery<Business, Error>(
    [API_ENDPOINTS.BUSINESSES, id],
    () => businessClient.get({ id }),
    {
      enabled: Boolean(id),
    }
  );

  return {
    business: data,
    loading: isLoading,
    error,
  };
};

export const useCreateBusinessMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(businessClient.create, {
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      queryClient.invalidateQueries(API_ENDPOINTS.BUSINESSES);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:create-failed'));
    },
  });
};

export const useUpdateBusinessMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(
    ({ id, ...input }: UpdateBusinessInput & { id: string }) =>
      businessClient.update({ id, ...input }),
    {
      onSuccess: () => {
        toast.success(t('common:successfully-updated'));
        queryClient.invalidateQueries(API_ENDPOINTS.BUSINESSES);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || t('common:update-failed'));
      },
    }
  );
};

export const useDeleteBusinessMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation(businessClient.delete, {
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
      queryClient.invalidateQueries(API_ENDPOINTS.BUSINESSES);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('common:delete-failed'));
    },
  });
};

