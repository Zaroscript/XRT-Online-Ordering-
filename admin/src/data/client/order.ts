import {
  Order,
  CreateOrderInput,
  OrderQueryOptions,
  OrderPaginator,
  QueryOptions,
  GenerateInvoiceDownloadUrlInput,
} from '@/types';
import { API_ENDPOINTS } from './api-endpoints';
import { crudFactory } from './curd-factory';
import { HttpClient } from './http-client';
import {
  ServerOrder,
  ServerOrderResponse,
  serverOrderToAdminOrder,
} from '@/data/order/server-order-mapper';

/** Custom server list response shape */
interface OrdersListApiResponse {
  success?: boolean;
  message?: string;
  data?: ServerOrderResponse;
}

export interface OrdersListParams {
  status?: string;
  order_type?: string;
  page?: number;
  limit?: number;
  customer_id?: string;
}

export interface OrdersListResult {
  data: Order[];
  paginatorInfo: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    hasMorePages: boolean;
  };
}

export const orderClient = {
  ...crudFactory<Order, QueryOptions, CreateOrderInput>(API_ENDPOINTS.ORDERS),
  get: ({ id, language }: { id: string; language: string }) => {
    return HttpClient.get<Order>(`${API_ENDPOINTS.ORDERS}/${id}`, {
      language,
    });
  },
  /** Fetch orders from custom server (GET /orders). Returns admin Order[] and paginatorInfo. */
  getList: async (params: OrdersListParams): Promise<OrdersListResult> => {
    const res = await HttpClient.get<OrdersListApiResponse>(
      API_ENDPOINTS.ORDERS,
      {
        status: params.status,
        order_type: params.order_type,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        customer_id: params.customer_id,
      }
    );
    const payload = (res as any)?.data ?? res;
    const list = Array.isArray(payload?.data) ? payload.data : payload?.data?.data ?? [];
    const total = payload?.total ?? payload?.data?.total ?? 0;
    const page = params.page ?? 1;
    const perPage = params.limit ?? 20;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const serverOrders = (list as ServerOrder[]) ?? [];
    return {
      data: serverOrders.map(serverOrderToAdminOrder),
      paginatorInfo: {
        currentPage: page,
        lastPage,
        total,
        perPage,
        hasMorePages: page < lastPage,
      },
    };
  },
  updateStatus: (id: string, status: string, body?: { cancelled_reason?: string; cancelled_by?: string; ready_time?: string; clear_schedule?: boolean }) => {
    const orderId = String(id).trim();
    if (!orderId) return Promise.reject(new Error('Order id is required'));
    return HttpClient.put<Order>(`${API_ENDPOINTS.ORDERS}/${orderId}/status`, {
      status,
      ...body,
    });
  },
  refund: (id: string, amount?: number) => {
    const orderId = String(id).trim();
    if (!orderId) return Promise.reject(new Error('Order id is required'));
    return HttpClient.post<Order>(`${API_ENDPOINTS.ORDERS}/${orderId}/refund`, {
      amount,
    });
  },
  reprint: (id: string, printerId?: string) => {
    const orderId = String(id).trim();
    if (!orderId) return Promise.reject(new Error('Order id is required'));
    return HttpClient.post<{ orderId: string; printerId: string }>(
      API_ENDPOINTS.ORDER_REPRINT.replace(':id', orderId),
      printerId ? { printerId } : {}
    );
  },
  paginated: ({ tracking_number, ...params }: Partial<OrderQueryOptions>) => {
    return HttpClient.get<OrderPaginator>(API_ENDPOINTS.ORDERS, {
      searchJoin: 'and',
      ...params,
      search: HttpClient.formatSearchParams({ tracking_number }),
    });
  },
  downloadInvoice: (input: GenerateInvoiceDownloadUrlInput) => {
    return HttpClient.post<string>(
      `${API_ENDPOINTS.ORDER_INVOICE_DOWNLOAD}`,
      input
    );
  },
  orderSeen({ id }: { id: string }) {
    return HttpClient.post<any>(`${API_ENDPOINTS.ORDER_SEEN}/${id}`, id);
  },
};
