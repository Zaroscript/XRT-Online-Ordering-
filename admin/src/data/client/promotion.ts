import type {
  Promotion,
  PromotionInput,
  PromotionPaginator,
  PromotionQueryOptions,
} from '@/types';
import { GetParams } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export const promotionClient = {
  all(params: PromotionQueryOptions) {
    return HttpClient.get<Promotion[]>(API_ENDPOINTS.PROMOTIONS, params);
  },
  paginated(params: Partial<PromotionQueryOptions>) {
    return HttpClient.get<PromotionPaginator>(API_ENDPOINTS.PROMOTIONS, {
      searchJoin: 'and',
      ...params,
    }).then((response: any) => response?.data ?? response);
  },
  get({ slug, language }: GetParams) {
    return HttpClient.get<Promotion>(`${API_ENDPOINTS.PROMOTIONS}/${slug}`, {
      language,
    }).then((response: any) => response?.data ?? response);
  },
  create(data: PromotionInput) {
    return HttpClient.post<Promotion>(API_ENDPOINTS.PROMOTIONS, data).then(
      (response: any) => response?.data ?? response,
    );
  },
  update({ id, ...input }: Partial<PromotionInput> & { id: string }) {
    return HttpClient.put<Promotion>(`${API_ENDPOINTS.PROMOTIONS}/${id}`, input).then(
      (response: any) => response?.data ?? response,
    );
  },
  delete({ id }: { id: string }) {
    return HttpClient.delete<boolean>(`${API_ENDPOINTS.PROMOTIONS}/${id}`);
  },
};
