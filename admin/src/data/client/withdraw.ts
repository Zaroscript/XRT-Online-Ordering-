import {
  Withdraw,
  WithdrawPaginator,
  WithdrawQueryOptions,
  CreateWithdrawInput,
  QueryOptions,
  ApproveWithdrawInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const withdrawClient = {
  get: async ({ id }: { id: string }) => {
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.WITHDRAWS}/${id}`,
    );
    // Handle backend response format: { success: true, data: { withdraw: {...} } }
    return response?.data?.withdraw || response?.data || response;
  },
  paginated: async ({ ...params }: Partial<WithdrawQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.WITHDRAWS, {
      ...params,
    });
    return response?.data || response;
  },
  create: async (variables: CreateWithdrawInput) => {
    const response = await HttpClient.post<any>(API_ENDPOINTS.WITHDRAWS, {
      ...variables,
    });
    return response?.data?.withdraw || response?.data || response;
  },
  update: async ({
    id,
    ...input
  }: Partial<CreateWithdrawInput> & { id: string }) => {
    const response = await HttpClient.patch<any>(
      `${API_ENDPOINTS.WITHDRAWS}/${id}`,
      input,
    );
    return response?.data?.withdraw || response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(
      `${API_ENDPOINTS.WITHDRAWS}/${id}`,
    );
    return response?.data || response;
  },
  approve: async (data: ApproveWithdrawInput) => {
    const response = await HttpClient.post<any>(
      `${API_ENDPOINTS.WITHDRAWS}/${data.id}/approve`,
      { status: data.status, note: data.note },
    );
    return response?.data?.withdraw || response?.data || response;
  },
};
