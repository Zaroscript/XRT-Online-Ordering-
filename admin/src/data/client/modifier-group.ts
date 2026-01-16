import {
  ModifierGroup,
  ModifierGroupPaginator,
  ModifierGroupQueryOptions,
  CreateModifierGroupInput,
  QueryOptions,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const modifierGroupClient = {
  ...crudFactory<ModifierGroup, QueryOptions, CreateModifierGroupInput>(
    API_ENDPOINTS.MODIFIER_GROUPS
  ),
  paginated: async ({ business_id, ...params }: Partial<ModifierGroupQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.MODIFIER_GROUPS, {
      ...params,
      business_id,
    });
    
    // Backend returns: { success: true, data: { modifierGroups: [...], total, page, limit, totalPages } }
    const result = response?.data || response;
    
    // Handle both formats: direct array or PaginatedModifierGroups object
    let groups: any[] = [];
    let paginationInfo: any = {};
    
    if (Array.isArray(result)) {
      groups = result;
    } else if (result?.modifierGroups && Array.isArray(result.modifierGroups)) {
      groups = result.modifierGroups;
      paginationInfo = {
        total: result.total || groups.length,
        page: result.page || 1,
        limit: result.limit || 10,
        totalPages: result.totalPages || Math.ceil((result.total || groups.length) / (result.limit || 10)),
      };
    } else if (result?.data && Array.isArray(result.data)) {
      groups = result.data;
    }
    
    return {
      data: groups,
      current_page: paginationInfo.page || 1,
      first_page_url: '',
      from: ((paginationInfo.page || 1) - 1) * (paginationInfo.limit || 10) + 1,
      last_page: paginationInfo.totalPages || 1,
      last_page_url: '',
      links: [],
      next_page_url: null,
      path: '',
      per_page: paginationInfo.limit || 10,
      prev_page_url: null,
      to: Math.min(((paginationInfo.page || 1) - 1) * (paginationInfo.limit || 10) + groups.length, paginationInfo.total || groups.length),
      total: paginationInfo.total || groups.length,
      paginatorInfo: paginationInfo,
    };
  },
  get: async ({ id, language }: any) => {
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${id}`
    );
    // Handle backend response format: { success: true, data: {...} }
    return response?.data || response;
  },
  create: async (input: CreateModifierGroupInput) => {
    const response = await HttpClient.post<any>(API_ENDPOINTS.MODIFIER_GROUPS, input);
    return response?.data || response;
  },
  update: async ({ id, ...input }: any) => {
    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.MODIFIER_GROUPS}/${id}`,
      input
    );
    return response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(`${API_ENDPOINTS.MODIFIER_GROUPS}/${id}`);
    return response?.data || response;
  },
};

