import { HttpClient } from './http-client';
import { API_ENDPOINTS } from './api-endpoints';
import { Attachment } from '@/types';

export const uploadClient = {
  upload: async (variables: any) => {
    let formData = new FormData();

    // Handle both old (array only) and new ({ files, section }) signatures
    const files = Array.isArray(variables) ? variables : variables.files;
    const section = !Array.isArray(variables) && variables.section ? variables.section : null;
    const field = !Array.isArray(variables) && variables.field ? variables.field : null;

    if (section) {
      formData.append('section', section);
    }

    if (field) {
      formData.append('field', field);
    }

    files.forEach((attachment: any) => {
      formData.append('attachment[]', attachment);
    });

    const options = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await HttpClient.post<any>(
      API_ENDPOINTS.ATTACHMENTS,
      formData,
      options
    );
    return response?.data || response;
  },
};
