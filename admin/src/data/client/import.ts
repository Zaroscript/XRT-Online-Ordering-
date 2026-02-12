import { HttpClient } from './http-client';

export interface ImportSession {
  id: string;
  user_id: string;
  business_id: string;
  status: 'draft' | 'validated' | 'confirmed' | 'discarded' | 'rolled_back';
  parsedData: {
    categories?: any[];
    items: any[];
    itemSizes: any[];
    modifierGroups: any[];
    modifiers: any[];
    itemModifierOverrides: any[];
  };
  validationErrors: Array<{
    file: string;
    row: number;
    entity: string;
    field: string;
    message: string;
    value?: any;
  }>;
  validationWarnings: Array<{
    file: string;
    row: number;
    entity: string;
    field: string;
    message: string;
    value?: any;
  }>;
  originalFiles: string[];
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ParseImportInput {
  file: File;
  business_id?: string;
  entity_type?:
    | 'categories'
    | 'items'
    | 'sizes'
    | 'modifierGroups'
    | 'modifiers';
}

export interface UpdateImportSessionInput {
  parsedData?: any;
  status?: 'draft' | 'validated';
}

export const importClient = {
  parse: async (input: ParseImportInput) => {
    const formData = new FormData();
    formData.append('file', input.file);
    if (input.business_id) {
      formData.append('business_id', input.business_id);
    }
    if (input.entity_type) {
      formData.append('entity_type', input.entity_type);
    }
    // Content-Type is omitted by http-client when data is FormData so browser sets multipart/form-data with boundary
    const response = await HttpClient.post<{
      success: boolean;
      data: ImportSession;
      message: string;
    }>('import/parse', formData);
    return response?.data || response;
  },

  appendFile: async (
    id: string,
    file: File,
    entity_type?:
      | 'categories'
      | 'items'
      | 'sizes'
      | 'modifierGroups'
      | 'modifiers',
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (entity_type) {
      formData.append('entity_type', entity_type);
    }
    const response = await HttpClient.post<{
      success: boolean;
      data: ImportSession;
      message: string;
    }>(`import/sessions/${id}/append`, formData);
    return response?.data || response;
  },

  getSession: async (id: string) => {
    const response = await HttpClient.get<{
      success: boolean;
      data: ImportSession;
      message: string;
    }>(`import/sessions/${id}`);
    return response?.data || response;
  },

  listSessions: async (business_id?: string) => {
    const response = await HttpClient.get<{
      success: boolean;
      data: ImportSession[];
      message: string;
    }>('import/sessions', { business_id });
    return response?.data || response;
  },

  updateSession: async (id: string, input: UpdateImportSessionInput) => {
    const response = await HttpClient.put<{
      success: boolean;
      data: ImportSession;
      message: string;
    }>(`import/sessions/${id}`, input);
    return response?.data || response;
  },

  finalSave: async (id: string) => {
    const response = await HttpClient.post<{
      success: boolean;
      message: string;
    }>(`import/sessions/${id}/save`, {});
    return response;
  },

  discardSession: async (id: string) => {
    const response = await HttpClient.post<{
      success: boolean;
      message: string;
    }>(`import/sessions/${id}/discard`, {});
    return response;
  },

  deleteSession: async (id: string) => {
    const response = await HttpClient.delete<{
      success: boolean;
      message: string;
    }>(`import/sessions/${id}`);
    return response;
  },

  downloadErrors: async (id: string): Promise<Blob> => {
    const response = await HttpClient.get(`import/sessions/${id}/errors`, {
      responseType: 'blob',
    });
    return response as Blob;
  },

  rollbackSession: async (id: string) => {
    const response = await HttpClient.post<{
      success: boolean;
      message: string;
    }>(`import/sessions/${id}/rollback`, {});
    return response;
  },

  clearHistory: async (business_id: string) => {
    const response = await HttpClient.delete<{
      success: boolean;
      message: string;
    }>(`import/sessions?business_id=${business_id}`);
    return response;
  },
};
