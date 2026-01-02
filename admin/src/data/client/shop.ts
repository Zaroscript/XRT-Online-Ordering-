import {
  QueryOptions,
  Shop,
  ShopInput,
  ShopPaginator,
  ShopQueryOptions,
  TransferShopOwnershipInput,
} from '@/types';
import { ApproveShopInput } from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';
import { businessClient } from './business';

export const shopClient = {
  // Use business endpoints - shops are businesses in the backend
  get: async ({ slug, id }: { slug?: string; id?: string }) => {
    const identifier = id || slug;
    if (!identifier) throw new Error('Shop ID or slug is required');
    const business = await businessClient.get({ id: identifier });
    // Map business to shop format
    return {
      ...business,
      slug: business.id,
      is_active: business.isActive,
      owner: typeof business.owner === 'string' ? { id: business.owner } : business.owner,
    };
  },
  paginated: async ({ name, ...params }: Partial<ShopQueryOptions>) => {
    const response = await businessClient.getAll();
    let businesses = Array.isArray(response) ? response : [];
    
    // Filter by name if provided
    if (name) {
      businesses = businesses.filter((b: any) => 
        b.name?.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    // Map businesses to shops format
    const shops = businesses.map((business: any) => ({
      ...business,
      slug: business.id,
      is_active: business.isActive,
      owner: typeof business.owner === 'string' ? { id: business.owner } : business.owner,
    }));
    
    return {
      data: shops,
      paginatorInfo: {
        total: shops.length,
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        count: shops.length,
      },
    };
  },
  create: async (input: ShopInput) => {
    // Map shop input to business input
    const businessInput = {
      owner: (input as any).owner_id || (input as any).owner,
      name: input.name,
      legal_name: input.name,
      primary_content_name: input.name,
      primary_content_email: (input as any).email || '',
      primary_content_phone: (input as any).phone || '',
      description: (input as any).description,
      website: (input as any).website,
    };
    const business = await businessClient.create(businessInput);
    return {
      ...business,
      slug: business.id,
      is_active: business.isActive,
    };
  },
  update: async ({ id, ...input }: Partial<ShopInput> & { id: string }) => {
    const businessInput: any = {};
    if (input.name) businessInput.name = input.name;
    if ((input as any).description) businessInput.description = (input as any).description;
    if ((input as any).website) businessInput.website = (input as any).website;
    if ((input as any).is_active !== undefined) businessInput.isActive = (input as any).is_active;
    
    const business = await businessClient.update({ id, ...businessInput });
    return {
      ...business,
      slug: business.id,
      is_active: business.isActive,
    };
  },
  delete: async ({ id }: { id: string }) => {
    return businessClient.delete({ id });
  },
  newOrInActiveShops: ({
    is_active,
    name,
    ...params
  }: Partial<ShopQueryOptions>) => {
    return HttpClient.get<ShopPaginator>(API_ENDPOINTS.NEW_OR_INACTIVE_SHOPS, {
      searchJoin: 'and',
      is_active,
      name,
      ...params,
      search: HttpClient.formatSearchParams({ is_active, name }),
    });
  },
  approve: (variables: ApproveShopInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.APPROVE_SHOP, variables);
  },
  disapprove: (variables: { id: string }) => {
    return HttpClient.post<{ id: string }>(
      API_ENDPOINTS.DISAPPROVE_SHOP,
      variables
    );
  },
  transferShopOwnership: (variables: TransferShopOwnershipInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.TRANSFER_SHOP_OWNERSHIP, variables);
  },
};
