import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface EmailCampaignPayload {
  heading: string;
  subject: string;
  body: string;
  marketing_consent_only?: boolean;
  filters: Array<{
    rule: { value: string; label: string } | null;
    value?: string | null;
  }>;
}

export interface EmailCampaignAudiencePayload {
  filters: EmailCampaignPayload['filters'];
  marketing_consent_only?: boolean;
}

export const emailCampaignClient = {
  paginated: (params: { page?: number; limit?: number; search?: string }) => {
    return HttpClient.get<any>(API_ENDPOINTS.EMAIL_CAMPAIGNS, params).then(
      (res: any) => res?.data ?? res
    );
  },

  create: (data: EmailCampaignPayload) => {
    return HttpClient.post<any>(API_ENDPOINTS.EMAIL_CAMPAIGNS, data).then(
      (res: any) => res?.data ?? res
    );
  },

  countAudience: (data: EmailCampaignAudiencePayload) => {
    return HttpClient.post<any>(`${API_ENDPOINTS.EMAIL_CAMPAIGNS}/count`, data).then(
      (res: any) => res?.data ?? res
    );
  },

  update: (id: string, data: any) => {
    return HttpClient.put<any>(`${API_ENDPOINTS.EMAIL_CAMPAIGNS}/${id}`, data).then(
      (res: any) => res?.data ?? res
    );
  },

  get: (id: string) => {
    return HttpClient.get<any>(`${API_ENDPOINTS.EMAIL_CAMPAIGNS}/${id}`).then(
      (res: any) => res?.data ?? res
    );
  },

  resend: (id: string) => {
    return HttpClient.post<any>(`${API_ENDPOINTS.EMAIL_CAMPAIGNS}/${id}/resend`, {}).then(
      (res: any) => res?.data ?? res
    );
  },

  delete: (id: string) => {
    return HttpClient.delete<any>(`${API_ENDPOINTS.EMAIL_CAMPAIGNS}/${id}`).then(
      (res: any) => res?.data ?? res
    );
  },

  getAnalytics: () => {
    return HttpClient.get<any>(`${API_ENDPOINTS.EMAIL_CAMPAIGNS}/analytics`).then(
      (res: any) => res?.data ?? res
    );
  },
};
