import { Settings, SettingsInput, SettingsOptionsInput } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from '@/data/client/http-client';

/**
 * Custom server returns { success, message, data: { id, options, language, translated_languages } }.
 * Unwrap so the dashboard gets { id, options, language } for settings?.options and SettingsProvider.
 */
function unwrap<T = any>(response: any): T {
  if (response?.data !== undefined) return response.data as T;
  return response as T;
}

export const settingsClient = {
  ...crudFactory<Settings, any, SettingsOptionsInput>(API_ENDPOINTS.SETTINGS),
  all({ language }: { language: string }) {
    return HttpClient.get<Settings>(API_ENDPOINTS.SETTINGS, {
      language,
    }).then(unwrap) as Promise<Settings>;
  },
  update: ({ ...data }: SettingsInput) => {
    const payload = data.options ? { ...data.options } : { ...data };
    return HttpClient.patch<Settings>(API_ENDPOINTS.SETTINGS, payload).then(
      unwrap
    ) as Promise<Settings>;
  },
  getSeo(params?: { locale?: string }) {
    return HttpClient.get<any>(API_ENDPOINTS.SETTINGS_SEO, params).then(unwrap);
  },
  updateSeo(payload: { locale?: string; seoSettings: Record<string, any> }) {
    return HttpClient.put<any>(API_ENDPOINTS.SETTINGS_SEO, payload).then(unwrap);
  },
  generateSeo(payload?: { locale?: string; force?: boolean }) {
    return HttpClient.post<any>(API_ENDPOINTS.SETTINGS_SEO_GENERATE, payload ?? {}).then(unwrap);
  },
  getSeoHealth(params?: { locale?: string }) {
    return HttpClient.get<any>(API_ENDPOINTS.SETTINGS_SEO_HEALTH, params).then(unwrap);
  },
};
