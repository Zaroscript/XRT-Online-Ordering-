import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { mapPaginatorData } from '@/utils/data-mappers';
import { API_ENDPOINTS } from './client/api-endpoints';
import { testimonialClient } from '@/data/client/testimonial';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';

export const useTestimonialsQuery = (
  params: Record<string, any>,
  options: any = {},
) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<any, Error>({
    queryKey: [API_ENDPOINTS.TESTIMONIALS, params],
    queryFn: ({ queryKey }) =>
      testimonialClient.paginated(Object.assign({}, queryKey[1])),
    placeholderData: (previousData: any) => previousData,
    ...options,
  });

  return {
    testimonials: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data),
    error,
    loading: isLoading,
  };
};

export const useTestimonialQuery = (id: string) => {
  return useQuery<any, Error>({
    queryKey: [API_ENDPOINTS.TESTIMONIALS, id],
    queryFn: () => testimonialClient.get({ slug: id, language: 'en' }),
    enabled: !!id,
  });
};

export const useCreateTestimonialMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();

  return useMutation({
    mutationFn: testimonialClient.create,
    onSuccess: () => {
      toast.success(t('common:successfully-created'));
      router.push(Routes.testimonials.list);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TESTIMONIALS] });
    },
  });
};

export const useUpdateTestimonialMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const router = useRouter();

  return useMutation({
    mutationFn: testimonialClient.update,
    onSuccess: () => {
      toast.success(t('common:successfully-updated'));
      router.push(Routes.testimonials.list);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TESTIMONIALS] });
    },
  });
};

export const useDeleteTestimonialMutation = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: testimonialClient.delete,
    onSuccess: () => {
      toast.success(t('common:successfully-deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.TESTIMONIALS] });
    },
  });
};
