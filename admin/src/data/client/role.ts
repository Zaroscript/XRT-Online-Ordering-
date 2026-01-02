import {
  Role,
  RolePaginator,
  QueryOptionsType,
  CreateRoleInput,
  UpdateRoleInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const roleClient = {
  fetchRoles: async ({ ...params }: Partial<QueryOptionsType>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.ROLES, params);
    // Handle backend response format: { success: true, data: { roles: [...], paginatorInfo: {...} } }
    return response?.data || response;
  },
  fetchRole: async ({ id }: { id: string }) => {
    const response = await HttpClient.get<any>(`${API_ENDPOINTS.ROLES}/${id}`);
    // Handle backend response format: { success: true, data: { role: {...} } }
    return response?.data?.role || response?.data || response;
  },
  create: async (variables: CreateRoleInput) => {
    const response = await HttpClient.post<any>(API_ENDPOINTS.ROLES, variables);
    return response?.data?.role || response?.data || response;
  },
  update: async ({ id, input }: { id: string; input: UpdateRoleInput }) => {
    const response = await HttpClient.patch<any>(`${API_ENDPOINTS.ROLES}/${id}`, input);
    return response?.data?.role || response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(`${API_ENDPOINTS.ROLES}/${id}`);
    return response?.data || response;
  },
  fetchAllPermissions: async () => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.ALL_PERMISSIONS);
    // Handle backend response format: { success: true, data: { permissions: [...] } }
    return response?.data?.permissions || response?.data || [];
  },
  assignRoleToUser: ({
    userId,
    roleId,
  }: {
    userId: string;
    roleId: string;
  }) => {
    return HttpClient.patch<any>(
      `${API_ENDPOINTS.ROLES}/users/${userId}/assign`,
      { roleId },
    );
  },
  removeRoleFromUser: ({ userId }: { userId: string }) => {
    return HttpClient.patch<any>(
      `${API_ENDPOINTS.ROLES}/users/${userId}/remove`,
      {},
    );
  },
};
