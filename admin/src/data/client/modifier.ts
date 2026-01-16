import {
  Modifier,
  ModifierPaginator,
  ModifierQueryOptions,
  CreateModifierInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const modifierClient = {
  ...crudFactory<Modifier, QueryOptions, CreateModifierInput>(
    API_ENDPOINTS.MODIFIERS,
  ),
  paginated: async ({
    modifier_group_id,
    ...params
  }: Partial<ModifierQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.MODIFIERS, {
      ...params,
      modifier_group_id,
    });
    const modifiers = response?.data || response || [];
    return {
      data: Array.isArray(modifiers) ? modifiers : [],
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
      to: Array.isArray(modifiers) ? modifiers.length : 0,
      total: Array.isArray(modifiers) ? modifiers.length : 0,
    };
  },
  get: async ({ id, modifier_group_id, language }: any) => {
    let url = `${API_ENDPOINTS.MODIFIERS}/${id}`;

    // If we have modifier_group_id, use the nested route
    if (modifier_group_id) {
      url = `${API_ENDPOINTS.MODIFIER_GROUPS}/${modifier_group_id}/${API_ENDPOINTS.MODIFIERS}/${id}`;
    }

    const response = await HttpClient.get<any>(url, {
      language,
    });
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },
  create: async (input: CreateModifierInput) => {
    if (!input.modifier_group_id) {
      throw new Error('Modifier Group ID is required to create a modifier');
    }
    const response = await HttpClient.post<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${input.modifier_group_id}/${API_ENDPOINTS.MODIFIERS}`,
      input,
    );
    return response?.data || response;
  },
  update: async ({ id, ...input }: any) => {
    if (!input.modifier_group_id) {
      throw new Error('Modifier Group ID is required to update a modifier');
    }
    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${input.modifier_group_id}/${API_ENDPOINTS.MODIFIERS}/${id}`,
      input,
    );
    return response?.data || response;
  },
  delete: async ({
    id,
    modifier_group_id,
  }: {
    id: string;
    modifier_group_id: string;
  }) => {
    const response = await HttpClient.delete<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${modifier_group_id}/${API_ENDPOINTS.MODIFIERS}/${id}`,
    );
    return response?.data || response;
  },
};
