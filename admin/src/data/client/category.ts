import {
  Category,
  CategoryPaginator,
  CategoryQueryOptions,
  CreateCategoryInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const categoryClient = {
  ...crudFactory<Category, QueryOptions, CreateCategoryInput>(
    API_ENDPOINTS.CATEGORIES
  ),
  paginated: async ({ type, name, self, business_id, ...params }: Partial<CategoryQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.CATEGORIES, {
      ...params,
      business_id,
    });
    // Handle backend response format: { success: true, data: [...] }
    const categories = response?.data || response || [];
    return {
      data: Array.isArray(categories) ? categories : [],
      current_page: 1,
      first_page_url: '',
      from: 1,
      last_page: 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: 10,
      prev_page_url: null,
      to: Array.isArray(categories) ? categories.length : 0,
      total: Array.isArray(categories) ? categories.length : 0,
    };
  },
  get: async ({ id, language }: any) => {
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`
    );
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },
  create: async (input: CreateCategoryInput) => {
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (key === 'image' && input.image) {
        formData.append('image', input.image);
      } else if (key === 'icon' && input.icon) {
        formData.append('icon', input.icon);
      } else if (input[key as keyof CreateCategoryInput] !== undefined) {
        formData.append(key, String(input[key as keyof CreateCategoryInput]));
      }
    });
    const response = await HttpClient.post<any>(API_ENDPOINTS.CATEGORIES, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data || response;
  },
  update: async ({ id, ...input }: any) => {
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (key === 'image' && input.image) {
        formData.append('image', input.image);
      } else if (key === 'icon' && input.icon) {
        formData.append('icon', input.icon);
      } else if (input[key] !== undefined) {
        formData.append(key, String(input[key]));
      }
    });
    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(`${API_ENDPOINTS.CATEGORIES}/${id}`);
    return response?.data || response;
  },
};
