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

/** Single-tenant: one business, no :id in paths. */
export const businessClient = {
  getAll: async () => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.BUSINESSES);
    const data = response?.data?.data ?? response?.data;
    const business = data?.business;
    return Array.isArray(business) ? business : business ? [business] : [];
  },
  get: async ({ id: _id }: { id: string }) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.BUSINESSES);
    const data = response?.data?.data ?? response?.data;
    return data?.business ?? data ?? null;
  },
  create: async (_input: CreateBusinessInput) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.BUSINESSES);
    const data = response?.data?.data ?? response?.data;
    return data?.business ?? data ?? null;
  },
  update: async ({ id: _id, ...input }: UpdateBusinessInput & { id: string }) => {
    const response = await HttpClient.patch<any>(API_ENDPOINTS.BUSINESSES, input);
    const data = response?.data?.data ?? response?.data;
    return data?.business ?? data ?? null;
  },
  delete: async (_params: { id: string }) => {
    return Promise.reject(
      new Error('Single-tenant: you cannot delete the only business.')
    );
  },
};

