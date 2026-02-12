import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const testimonialClient = {
  all(params?: any) {
    return HttpClient.get<any[]>(
      `${API_ENDPOINTS.TESTIMONIALS}/all`,
      params,
    ).then((response: any) => response?.data ?? response);
  },
  paginated(params?: any) {
    return HttpClient.get<any>(API_ENDPOINTS.TESTIMONIALS, params).then(
      (response: any) => response?.data ?? response,
    );
  },
  get({ slug, language }: { slug: string; language: string }) {
    return HttpClient.get<any>(`${API_ENDPOINTS.TESTIMONIALS}/${slug}`, {
      language,
    }).then((response: any) => response?.data ?? response);
  },
  create(data: any) {
    return HttpClient.post<any>(API_ENDPOINTS.TESTIMONIALS, data).then(
      (response: any) => response?.data ?? response,
    );
  },
  update({ id, ...input }: any) {
    return HttpClient.put<any>(
      `${API_ENDPOINTS.TESTIMONIALS}/${id}`,
      input,
    ).then((response: any) => response?.data ?? response);
  },
  delete({ id }: { id: string }) {
    return HttpClient.delete<any>(`${API_ENDPOINTS.TESTIMONIALS}/${id}`).then(
      (response: any) => response?.data ?? response,
    );
  },
};
