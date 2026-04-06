import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface SmsCampaignPayload {
  subject: string;
  body: string;
  marketing_consent_only?: boolean;
  filters: Array<{
    rule: { value: string; label: string } | null;
    value?: string | null;
  }>;
}

export interface SmsCampaignAudiencePayload {
  filters: SmsCampaignPayload['filters'];
  marketing_consent_only?: boolean;
}

export const smsCampaignClient = {
  paginated: (params: { page?: number; limit?: number; search?: string }) => {
    return HttpClient.get<any>(API_ENDPOINTS.SMS_CAMPAIGNS, params).then(
      (res: any) => res?.data ?? res
    );
  },

  create: (data: SmsCampaignPayload) => {
    return HttpClient.post<any>(API_ENDPOINTS.SMS_CAMPAIGNS, data).then(
      (res: any) => res?.data ?? res
    );
  },

  countAudience: (data: SmsCampaignAudiencePayload) => {
    return HttpClient.post<any>(`${API_ENDPOINTS.SMS_CAMPAIGNS}/count`, data).then(
      (res: any) => res?.data ?? res
    );
  },

  update: (id: string, data: any) => {
    return HttpClient.put<any>(`${API_ENDPOINTS.SMS_CAMPAIGNS}/${id}`, data).then(
      (res: any) => res?.data ?? res
    );
  },

  get: (id: string) => {
    return HttpClient.get<any>(`${API_ENDPOINTS.SMS_CAMPAIGNS}/${id}`).then(
      (res: any) => res?.data ?? res
    );
  },

  resend: (id: string) => {
    return HttpClient.post<any>(`${API_ENDPOINTS.SMS_CAMPAIGNS}/${id}/resend`, {}).then(
      (res: any) => res?.data ?? res
    );
  },

  delete: (id: string) => {
    return HttpClient.delete<any>(`${API_ENDPOINTS.SMS_CAMPAIGNS}/${id}`).then(
      (res: any) => res?.data ?? res
    );
  },
};
