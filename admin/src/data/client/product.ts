import {
  Product,
  CreateProduct,
  ProductPaginator,
  QueryOptions,
  GetParams,
  ProductQueryOptions,
  GenerateDescriptionInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';

export const productClient = {
  ...crudFactory<Product, QueryOptions, CreateProduct>(API_ENDPOINTS.PRODUCTS),
  get({ slug, language }: GetParams) {
    return HttpClient.get<Product>(`${API_ENDPOINTS.PRODUCTS}/${slug}`, {
      language,
      with: 'type;shop;categories;tags;variations.attribute.values;variation_options;variation_options.digital_file;author;manufacturer;digital_file',
    });
  },
  paginated: ({
    type,
    name,
    categories,
    product_type,
    status,
    ...params
  }: Partial<ProductQueryOptions>) => {
    return HttpClient.get<ProductPaginator>(API_ENDPOINTS.PRODUCTS, {
      searchJoin: 'and',
      with: 'shop;type;categories',
      ...params,
      search: HttpClient.formatSearchParams({
        type,
        name,
        categories,
        product_type,
        status,
      }),
    });
  },
  popular({ ...params }: Partial<ProductQueryOptions>) {
    return HttpClient.get<Product[]>(API_ENDPOINTS.POPULAR_PRODUCTS, {
      searchJoin: 'and',
      with: 'type;shop',
      ...params,
      search: HttpClient.formatSearchParams({}),
    });
  },
  lowStock({ ...params }: Partial<ProductQueryOptions>) {
    return HttpClient.get<Product[]>(
      API_ENDPOINTS.LOW_STOCK_PRODUCTS_ANALYTICS,
      {
        searchJoin: 'and',
        with: 'type;shop',
        ...params,
        search: HttpClient.formatSearchParams({}),
      },
    );
  },
  generateDescription: (data: GenerateDescriptionInput) => {
    return HttpClient.post<any>(API_ENDPOINTS.GENERATE_DESCRIPTION, data);
  },
  newOrInActiveProducts: ({
    user_id,
    status,
    name,
    ...params
  }: Partial<ProductQueryOptions>) => {
    return HttpClient.get<ProductPaginator>(
      API_ENDPOINTS.NEW_OR_INACTIVE_PRODUCTS,
      {
        searchJoin: 'and',
        user_id,
        status,
        name,
        ...params,
        search: HttpClient.formatSearchParams({
          status,
          name,
        }),
      },
    );
  },
  lowOrOutOfStockProducts: ({
    user_id,
    status,
    categories,
    name,
    type,
    ...params
  }: Partial<ProductQueryOptions>) => {
    return HttpClient.get<ProductPaginator>(
      API_ENDPOINTS.LOW_OR_OUT_OF_STOCK_PRODUCTS,
      {
        searchJoin: 'and',
        user_id,
        status,
        name,
        ...params,
        search: HttpClient.formatSearchParams({
          status,
          name,
          categories,
          type,
        }),
      },
    );
  },
  productByCategory({
    limit,
    language,
  }: {
    limit?: number;
    language?: string;
  }) {
    return HttpClient.get<any>(API_ENDPOINTS.CATEGORY_WISE_PRODUCTS, {
      limit,
      language,
    });
  },
  mostSoldProductByCategory({ ...params }: Partial<ProductQueryOptions>) {
    return HttpClient.get<Product[]>(
      API_ENDPOINTS.CATEGORY_WISE_PRODUCTS_SALE,
      {
        searchJoin: 'and',
        ...params,
        search: HttpClient.formatSearchParams({}),
      },
    );
  },
  getProductsByFlashSale: ({ user_id, slug, name, ...params }: any) => {
    return HttpClient.get<ProductPaginator>(
      API_ENDPOINTS.PRODUCTS_BY_FLASH_SALE,
      {
        searchJoin: 'and',
        user_id,
        slug,
        name,
        ...params,
        search: HttpClient.formatSearchParams({
          name,
        }),
      },
    );
  },
  topRated({ ...params }: Partial<ProductQueryOptions>) {
    return HttpClient.get<Product[]>(API_ENDPOINTS.TOP_RATED_PRODUCTS, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({}),
    });
  },
};
