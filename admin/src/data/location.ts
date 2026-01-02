import { useQuery } from 'react-query';
import { API_ENDPOINTS } from './client/api-endpoints';
import { get } from './client';

export const useLocationsQuery = ({
  limit = 20,
  page = 1,
  search = '',
  business_id,
}: {
  limit?: number;
  page?: number;
  search?: string;
  business_id?: string;
}) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    ...(search && { search }),
    ...(business_id && { business_id }),
  });

  const url = `${API_ENDPOINTS.LOCATIONS}?${params}`;

  return useQuery(
    [API_ENDPOINTS.LOCATIONS, { limit, page, search, business_id }],
    () => get(url),
    {
      staleTime: 60 * 1000, // 1 minute
      select: (data: any) => {
        // Backend returns { status, data: [...] } - the array is directly in data.data
        return data.data || [];
      },
    },
  );
};

export const useLocationQuery = (id: string) => {
  return useQuery(
    [API_ENDPOINTS.LOCATIONS, id],
    () => get(`${API_ENDPOINTS.LOCATIONS}/${id}`),
    {
      enabled: !!id,
      select: (data: any) => data.data?.location,
    },
  );
};
