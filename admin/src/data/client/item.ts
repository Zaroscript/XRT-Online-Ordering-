import {
  Item,
  CreateItemInput,
  ItemPaginator,
  ItemQueryOptions,
  GetParams,
  UpdateItemInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const itemClient = {
  ...crudFactory<Item, ItemQueryOptions, CreateItemInput>(API_ENDPOINTS.ITEMS),
  get: async ({
    slug,
    id,
    language,
  }: {
    slug?: string;
    id?: string;
    language: string;
  }) => {
    const itemId = id || slug || '';
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.ITEMS}/${itemId}`,
      {
        language,
      },
    );
    return response?.data?.item || response?.data || response;
  },
  paginated: async ({
    name,
    category_id,
    is_active,
    is_available,
    ...params
  }: Partial<ItemQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.ITEMS, {
      ...params,
      name,
      category_id,
      is_active: is_active !== undefined ? String(is_active) : undefined,
      is_available:
        is_available !== undefined ? String(is_available) : undefined,
    });
    return response?.data || response;
  },
  updateItem: async (data: UpdateItemInput) => {
    const formData = new FormData();
    const { id, ...input } = data;

    Object.keys(input).forEach((key) => {
      const value = input[key as keyof typeof input];

      if (key === 'image' && value) {
        // Handle image file
        if (value instanceof File) {
          formData.append('image', value);
        } else if (typeof value === 'string') {
          // If it's a URL string, don't append (backend will handle it)
          // Only append if it's actually a file
        }
      } else if (key === 'modifier_groups' && value) {
        // Serialize modifier_groups as JSON string for backend
        formData.append('modifier_groups', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        // Convert other values to strings
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.ITEMS}/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    // Handle backend response format: { success: true, data: { item: {...} } }
    return response?.data?.item || response?.data || response;
  },
  create: async (variables: CreateItemInput) => {
    const formData = new FormData();

    Object.keys(variables).forEach((key) => {
      const value = variables[key as keyof CreateItemInput];

      if (key === 'image' && value) {
        // Handle image file
        if (value instanceof File) {
          formData.append('image', value);
        } else if (typeof value === 'string') {
          // If it's a URL string, don't append (backend will handle it)
          // Only append if it's actually a file
        }
      } else if (key === 'modifier_groups' && value) {
        // Serialize modifier_groups as JSON string for backend
        formData.append('modifier_groups', JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        // Convert other values to strings
        if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await HttpClient.post<any>(API_ENDPOINTS.ITEMS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Handle backend response format: { success: true, data: { item: {...} } }
    return response?.data?.item || response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(
      `${API_ENDPOINTS.ITEMS}/${id}`,
    );
    return response?.data || response;
  },
};
