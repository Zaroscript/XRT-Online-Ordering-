import axios from 'axios';
import { API_ENDPOINTS } from './api-endpoints';
import { Attachment } from '@/types';
import { getAuthCredentials } from '@/utils/auth-utils';

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes for slow connections / large files

const uploadBaseURL =
  process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:3001/api/v1';

export interface UploadVariables {
  files: File[];
  section?: string;
  field?: string;
}

function buildUploadErrorMessage(err: any): string {
  const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
  if (isTimeout) {
    return [
      'Upload timed out. The server did not respond in time.',
      '• Ensure the customize server is running (e.g. npm run dev in customize_server).',
      '• In the server .env, set ATTACHMENT_STORAGE=disk to avoid Cloudinary timeouts.',
      `• Check that the admin API URL is correct: ${uploadBaseURL}`,
    ].join(' ');
  }
  const isNetworkError =
    err?.message === 'Network Error' ||
    err?.code === 'ERR_NETWORK' ||
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'ENOTFOUND';
  if (isNetworkError) {
    return [
      'Cannot reach the server (Network Error).',
      '• Make sure the customize server is running: in the customize_server folder run "npm run dev".',
      `• Admin is sending uploads to: ${uploadBaseURL}/attachments`,
      '• If the server runs on a different port or host, set NEXT_PUBLIC_REST_API_ENDPOINT in the admin .env.local.',
    ].join(' ');
  }
  // 504 from server (upload took too long)
  if (err?.response?.status === 504) {
    const serverMsg = err?.response?.data?.message;
    return serverMsg || 'Upload timed out on the server. Try a smaller image.';
  }
  // 401: not logged in or session expired
  if (err?.response?.status === 401) {
    return 'Upload failed: Please log in again (session may have expired).';
  }
  // 400: bad request (no file, file too large, wrong type)
  if (err?.response?.status === 400) {
    return err?.response?.data?.message || 'Upload failed: Check file type (images only) and size (max 5MB).';
  }
  return err?.response?.data?.message || err?.message || 'Upload failed.';
}

export const uploadClient = {
  upload: async (variables: UploadVariables | File[]) => {
    const formData = new FormData();

    let files: File[];
    let section: string | undefined;
    let field: string | undefined;

    if (Array.isArray(variables)) {
      files = variables;
    } else {
      files = variables.files;
      section = variables.section;
      field = variables.field;
    }

    if (section) {
      formData.append('section', section);
    }

    if (field) {
      formData.append('field', field);
    }

    files.forEach((file) => {
      if (field === 'icon') {
        formData.append('icon', file);
      } else {
        formData.append('attachment[]', file);
      }
    });

    const { token } = getAuthCredentials();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Do not set Content-Type; let the browser set it with boundary for FormData

    try {
      const response = await axios.post<{ data?: Attachment[]; success?: boolean; message?: string }>(
        `${uploadBaseURL}/${API_ENDPOINTS.ATTACHMENTS}`,
        formData,
        {
          headers,
          timeout: UPLOAD_TIMEOUT_MS,
          maxContentLength: 10 * 1024 * 1024, // 10MB
          maxBodyLength: 10 * 1024 * 1024,
        }
      );
      const data = response?.data;
      const unwrapped = data?.data !== undefined ? data.data : data;
      return Array.isArray(unwrapped) ? unwrapped : (unwrapped as any);
    } catch (err: any) {
      const message = buildUploadErrorMessage(err);
      const error = new Error(message) as Error & { response?: any; code?: string };
      error.response = err?.response;
      error.code = err?.code;
      throw error;
    }
  },
};
