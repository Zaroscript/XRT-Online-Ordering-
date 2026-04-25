import { HttpClient } from './http-client';
import { Customer, CustomerPaginator, MappedPaginatorInfo, SortOrder } from '@/types';

export const customerClient = {
  fetchCustomers: async (params: {
    limit?: number;
    page?: number;
    search?: string;
    orderBy?: string;
    sortedBy?: SortOrder;
    isActive?: boolean;
  }): Promise<{
    customers: Customer[];
    paginatorInfo: MappedPaginatorInfo;
  }> => {
    const response = await HttpClient.get<any>('/customers', { params });
    return response?.data || response;
  },

  fetchCustomer: async ({ id }: { id: string }): Promise<Customer> => {
    const response = await HttpClient.get<any>(`/customers/${id}`);
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },

  getDeleteSafety: async (id: string): Promise<{
    canDelete: boolean;
    hasHistory: boolean;
    counts: {
      orders: number;
      loyaltyTransactions: number;
      paymentTransactions: number;
    };
    loyalty: {
      accountId: string;
      pointsBalance: number;
    } | null;
  }> => {
    const response = await HttpClient.get<any>(`/customers/${id}/delete-safety`);
    return response?.data || response;
  },

  create: async (input: {
    name: string;
    email: string;
    phoneNumber: string;
    rewards?: number;
    notes?: string;
  }): Promise<Customer> => {
    const response = await HttpClient.post<any>('/customers', input);
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },

  update: async ({ id, input }: { id: string; input: any }): Promise<Customer> => {
    const response = await HttpClient.put<any>(`/customers/${id}`, input);
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },

  delete: async (id: string): Promise<void> => {
    await HttpClient.delete(`/customers/${id}`);
  },
};

