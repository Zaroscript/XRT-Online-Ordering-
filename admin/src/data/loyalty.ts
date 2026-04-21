import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from './client/api-endpoints';
import { HttpClient } from './client/http-client';
import {
  LoyaltyProgram,
  LoyaltyProgramInput,
  LoyaltyAccount,
  LoyaltyAccountPaginator,
  LoyaltyTransactionPaginator,
  QueryOptions,
} from '@/types';
import { mapPaginatorData } from '@/utils/data-mappers';

// Client abstraction
export const loyaltyClient = {
  getProgram: () => {
    return HttpClient.get<LoyaltyProgram>(API_ENDPOINTS.LOYALTY_PROGRAM).then(
      (response: any) => response?.data ?? response
    );
  },
  upsertProgram: (input: LoyaltyProgramInput) => {
    return HttpClient.put<LoyaltyProgram>(API_ENDPOINTS.LOYALTY_PROGRAM, input);
  },
  getMembers: (params: Partial<QueryOptions> & { search?: string }) => {
    return HttpClient.get<LoyaltyAccountPaginator>(API_ENDPOINTS.LOYALTY_MEMBERS, params).then(
      (response: any) => response?.data ?? response
    );
  },
  getMember: (id: string) => {
    return HttpClient.get<LoyaltyAccount>(`${API_ENDPOINTS.LOYALTY_MEMBERS}/${id}`).then(
      (response: any) => response?.data ?? response
    );
  },
  getMemberTransactions: (params: { id: string } & Partial<QueryOptions>) => {
    return HttpClient.get<LoyaltyTransactionPaginator>(
      `${API_ENDPOINTS.LOYALTY_MEMBERS}/${params.id}/transactions`,
      params
    ).then((response: any) => response?.data ?? response);
  },
};

// React Query Hooks
export const useLoyaltyProgramQuery = () => {
  const { data, error, isPending: isLoading } = useQuery<LoyaltyProgram, Error>({
    queryKey: [API_ENDPOINTS.LOYALTY_PROGRAM],
    queryFn: loyaltyClient.getProgram,
  });

  return {
    program: data,
    error,
    loading: isLoading,
  };
};

export const useUpdateLoyaltyProgramMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loyaltyClient.upsertProgram,
    onSuccess: (data) => {
      const updatedProgram = (data as any)?.data || data;
      queryClient.setQueryData([API_ENDPOINTS.LOYALTY_PROGRAM], updatedProgram);
      toast.success(t('common:successfully-updated'));
    },
    onError: (error: any) => {
      toast.error(t(`common:${error?.response?.data.message || 'Error saving settings'}`));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.LOYALTY_PROGRAM] });
    },
  });
};

export const useLoyaltyMembersQuery = (options: Partial<QueryOptions> & { search?: string }) => {
  const { data, error, isPending: isLoading } = useQuery<LoyaltyAccountPaginator, Error>({
    queryKey: [API_ENDPOINTS.LOYALTY_MEMBERS, options],
    queryFn: () => loyaltyClient.getMembers(options),
    placeholderData: (previousData) => previousData,
  });

  return {
    members: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any) as any,
    error,
    loading: isLoading,
  };
};

export const useLoyaltyTransactionsQuery = (options: { id: string } & Partial<QueryOptions>) => {
  const { data, error, isPending: isLoading } = useQuery<LoyaltyTransactionPaginator, Error>({
    queryKey: [API_ENDPOINTS.LOYALTY_MEMBERS, options.id, 'transactions', options],
    queryFn: () => loyaltyClient.getMemberTransactions(options),
    placeholderData: (previousData) => previousData,
    enabled: !!options.id,
  });

  return {
    transactions: data?.data ?? [],
    paginatorInfo: mapPaginatorData(data as any) as any,
    error,
    loading: isLoading,
  };
};

export const useLoyaltyMemberQuery = (id: string) => {
  const { data, error, isPending: isLoading } = useQuery<LoyaltyAccount, Error>({
    queryKey: [API_ENDPOINTS.LOYALTY_MEMBERS, id],
    queryFn: () => loyaltyClient.getMember(id),
    enabled: !!id,
  });

  return {
    member: data,
    error,
    loading: isLoading,
  };
};
