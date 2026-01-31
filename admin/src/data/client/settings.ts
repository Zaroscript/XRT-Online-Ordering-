import { Settings, SettingsInput, SettingsOptionsInput } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from '@/data/client/http-client';

export const settingsClient = {
  ...crudFactory<Settings, any, SettingsOptionsInput>(API_ENDPOINTS.SETTINGS),
  all({ language }: { language: string }) {
    return HttpClient.get<Settings>(API_ENDPOINTS.SETTINGS, {
      language,
    });
  },
  update: ({ ...data }: SettingsInput) => {
    // Flatten the options for the backend and use PATCH
    const payload = data.options ? { ...data.options } : { ...data };
    return HttpClient.patch<Settings>(API_ENDPOINTS.SETTINGS, payload);
  },
};
