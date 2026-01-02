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
    const response = await HttpClient.get<{
      success: boolean;
      data: {
        customers: Customer[];
        paginatorInfo: MappedPaginatorInfo;
      };
    }>('/customers', { params });
    return response.data.data || response.data;
  },

  fetchCustomer: async ({ id }: { id: string }): Promise<Customer> => {
    const response = await HttpClient.get<{
      success: boolean;
      data: Customer;
    }>(`/customers/${id}`);
    const customer = response.data?.data || response.data;
    return customer;
  },

  create: async (input: {
    name: string;
    email: string;
    phoneNumber: string;
    rewards?: number;
    notes?: string;
  }): Promise<Customer> => {
    const response = await HttpClient.post<{
      success: boolean;
      data: Customer;
    }>('/customers', input);
    return response.data.data || response.data;
  },

  update: async ({ id, input }: { id: string; input: any }): Promise<Customer> => {
    const response = await HttpClient.put<{
      success: boolean;
      data: Customer;
    }>(`/customers/${id}`, input);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await HttpClient.delete(`/customers/${id}`);
  },
};

