import { HttpClient } from './http-client';
import { API_ENDPOINTS } from './api-endpoints';

export interface Business {
  id: string;
  name: string;
  legal_name: string;
  owner: string;
  primary_content_name: string;
  primary_content_email: string;
  primary_content_phone: string;
  description?: string;
  website?: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessInput {
  owner: string;
  name: string;
  legal_name: string;
  primary_content_name: string;
  primary_content_email: string;
  primary_content_phone: string;
  description?: string;
  website?: string;
  address?: any;
  logo?: string;
}

export interface UpdateBusinessInput extends Partial<CreateBusinessInput> {
  isActive?: boolean;
}

export const businessClient = {
  getAll: async () => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.BUSINESSES);
    // Handle backend response format: { success: true, data: { businesses: [...] } }
    return response?.data?.businesses || response?.data || response || [];
  },
  get: async ({ id }: { id: string }) => {
    const response = await HttpClient.get<any>(`${API_ENDPOINTS.BUSINESSES}/${id}`);
    // Handle backend response format: { success: true, data: { business: {...} } }
    return response?.data?.business || response?.data || response;
  },
  create: async (input: CreateBusinessInput) => {
    const response = await HttpClient.post<any>(API_ENDPOINTS.BUSINESSES, input);
    return response?.data?.business || response?.data || response;
  },
  update: async ({ id, ...input }: UpdateBusinessInput & { id: string }) => {
    const response = await HttpClient.patch<any>(
      `${API_ENDPOINTS.BUSINESSES}/${id}`,
      input
    );
    return response?.data?.business || response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(`${API_ENDPOINTS.BUSINESSES}/${id}`);
    return response?.data || response;
  },
};

