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
  parseFile: async (
    file: File,
    entity_type?: string,
    business_id?: string
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (business_id) {
      formData.append('business_id', business_id);
    }
    if (entity_type) {
      formData.append('entity_type', entity_type);
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

  listSessions: async () => {
    const response = await HttpClient.get<{
      success: boolean;
      data: ImportSession[];
      message: string;
    }>('import/sessions');
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
    const response = await HttpClient.get<Blob>(
      `import/sessions/${id}/errors`,
      undefined,
      { responseType: 'blob' },
    );
    return response instanceof Blob ? response : new Blob([response as BlobPart]);
  },

  rollbackSession: async (id: string) => {
    const response = await HttpClient.post<{
      success: boolean;
      message: string;
    }>(`import/sessions/${id}/rollback`, {});
    return response;
  },

  clearHistory: async () => {
    const response = await HttpClient.delete<{
      success: boolean;
      message: string;
    }>('import/sessions');
    return response;
  },
};
