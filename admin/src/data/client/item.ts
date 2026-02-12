import {
  Item,
  CreateItemInput,
  ItemPaginator,
  ItemQueryOptions,
  GetParams,
  UpdateItemInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

/** Normalize form image value to URL + optional public_id, or File for multipart */
function getItemImagePayload(value: unknown): {
  imageUrl?: string;
  imagePublicId?: string;
  imageFile?: File;
} {
  if (value == null) return {};
  const single = Array.isArray(value) ? value[0] : value;
  if (single instanceof File) {
    return { imageFile: single };
  }
  if (single && typeof single === 'object' && 'original' in single) {
    const obj = single as { original?: string; thumbnail?: string; id?: string };
    const url = obj.original || obj.thumbnail;
    return url ? { imageUrl: url, imagePublicId: obj.id } : {};
  }
  if (typeof single === 'string' && single.trim()) {
    return { imageUrl: single.trim() };
  }
  return {};
}

function appendItemImageToFormData(
  formData: FormData,
  value: unknown,
  fieldImage = 'image',
  fieldPublicId = 'image_public_id',
): void {
  const { imageUrl, imagePublicId, imageFile } = getItemImagePayload(value);
  if (imageFile) {
    formData.append(fieldImage, imageFile);
  } else if (imageUrl) {
    formData.append(fieldImage, imageUrl);
    if (imagePublicId) formData.append(fieldPublicId, imagePublicId);
  } else {
    formData.append(fieldImage, '');
  }
}

export const itemClient = {
  ...crudFactory<Item, ItemQueryOptions, CreateItemInput>(API_ENDPOINTS.ITEMS),
  get: async ({
    slug,
    id,
    language,
  }: {
    slug?: string;
    id?: string;
    language: string;
  }) => {
    const itemId = id || slug || '';
    const response = await HttpClient.get<any>(
      `${API_ENDPOINTS.ITEMS}/${itemId}`,
      {
        language,
      },
    );
    return response?.data?.item || response?.data || response;
  },
  paginated: async ({
    name,
    category_id,
    is_active,
    is_available,
    ...params
  }: Partial<ItemQueryOptions>) => {
    const response = await HttpClient.get<any>(API_ENDPOINTS.ITEMS, {
      ...params,
      name,
      category_id,
      is_active: is_active !== undefined ? String(is_active) : undefined,
      is_available:
        is_available !== undefined ? String(is_available) : undefined,
    });
    return response?.data || response;
  },
  updateItem: async (data: UpdateItemInput) => {
    const formData = new FormData();
    const { id, image, image_public_id, modifier_groups, is_sizeable, default_size_id, ...rest } = data;

    appendItemImageToFormData(formData, image);

    if (modifier_groups !== undefined) {
      formData.append('modifier_groups', JSON.stringify(modifier_groups));
    }
    // When turning is_sizeable off, send default_size_id as empty so backend clears it (otherwise validation fails)
    if (is_sizeable !== undefined) {
      formData.append('is_sizeable', is_sizeable ? 'true' : 'false');
    }
    if (default_size_id !== undefined || is_sizeable === false) {
      formData.append('default_size_id', default_size_id ?? '');
    }
    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await HttpClient.put<any>(
      `${API_ENDPOINTS.ITEMS}/${id}`,
      formData,
      { headers: {} as any },
    );
    // Handle backend response format: { success: true, data: { item: {...} } }
    return response?.data?.item || response?.data || response;
  },
  create: async (variables: CreateItemInput) => {
    const formData = new FormData();
    const { image, image_public_id, modifier_groups, ...rest } = variables;

    appendItemImageToFormData(formData, image);

    if (modifier_groups !== undefined) {
      formData.append('modifier_groups', JSON.stringify(modifier_groups));
    }
    Object.entries(rest).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await HttpClient.post<any>(API_ENDPOINTS.ITEMS, formData, {
      headers: {} as any,
    });
    // Handle backend response format: { success: true, data: { item: {...} } }
    return response?.data?.item || response?.data || response;
  },
  delete: async ({ id }: { id: string }) => {
    const response = await HttpClient.delete<any>(
      `${API_ENDPOINTS.ITEMS}/${id}`,
    );
    return response?.data || response;
  },
};
