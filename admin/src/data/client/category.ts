import {
  Category,
  CategoryQueryOptions,
  CreateCategoryInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const categoryClient = {
  ...crudFactory<Category, QueryOptions, CreateCategoryInput>(
    API_ENDPOINTS.CATEGORIES,
  ),
  paginated: async ({
    type,
    name,
    self,
    ...params
  }: Partial<CategoryQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.CATEGORIES, {
      ...params,
    });
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
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
    );
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },
  create: async (input: CreateCategoryInput) => {
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (key === 'image' && input.image) {
        formData.append('image', input.image instanceof File ? input.image : input.image);
      } else if (key === 'icon' && input.icon) {
        formData.append('icon', input.icon instanceof File ? input.icon : input.icon);
      } else if (key === 'kitchen_section_id') {
        const value = input[key as keyof CreateCategoryInput] as string | null | undefined;
        formData.append(key, value ?? '');
      } else if (
        key === 'modifier_groups' &&
        (input as any).modifier_groups !== undefined
      ) {
        formData.append(key, JSON.stringify((input as any).modifier_groups));
      } else if (input[key as keyof CreateCategoryInput] !== undefined && input[key as keyof CreateCategoryInput] !== null) {
        const value = input[key as keyof CreateCategoryInput];
        if (typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    // Do not set Content-Type so axios/browser sets multipart/form-data with boundary
    const response = await HttpClient.post<any>(
      API_ENDPOINTS.CATEGORIES,
      formData,
      { headers: { 'Content-Type': undefined } as any },
    );
    return response?.data || response;
  },
  update: async ({ id, ...input }: any) => {
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (key === 'image' && input.image) {
        formData.append('image', input.image instanceof File ? input.image : input.image);
      } else if (key === 'icon' && input.icon) {
        formData.append('icon', input.icon instanceof File ? input.icon : input.icon);
      } else if (key === 'kitchen_section_id') {
        formData.append(key, input[key] ?? '');
      } else if (
        key === 'modifier_groups' &&
        input.modifier_groups !== undefined
      ) {
        formData.append(key, JSON.stringify(input.modifier_groups));
      } else if (input[key] !== undefined && input[key] !== null) {
        if (typeof input[key] === 'boolean') {
          formData.append(key, String(input[key]));
        } else if (typeof input[key] === 'object') {
          formData.append(key, JSON.stringify(input[key]));
        } else {
          formData.append(key, String(input[key]));
        }
      }
    });
    // Do not set Content-Type so axios/browser sets multipart/form-data with boundary
    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
      formData,
      { headers: { 'Content-Type': undefined } as any },
    );
    return response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`,
    );
    return response?.data || response;
  },
  importCategories: (data: FormData) => {
    return HttpClient.post<any>(API_ENDPOINTS.CATEGORY_IMPORT, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
