import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { API_ENDPOINTS } from '@/data/client/api-endpoints';
import { OrderQueryOptions, Order, CreateOrderInput } from '@/types';
import { orderClient, OrdersListResult } from './client/order';
import { useRouter } from 'next/router';
import { Routes } from '@/config/routes';
import { MappedPaginatorInfo } from '@/types';
import { serverOrderToAdminOrder } from './order/server-order-mapper';
import type { ServerOrder } from './order/server-order-mapper';

export interface UseOrdersQueryParams {
  language?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  sortedBy?: string;
  tracking_number?: string;
  /** Server status filter: single status or comma-separated (e.g. 'pending' or 'inkitchen,ready,completed') */
  status?: string;
}

export const useOrdersQuery = (
  params: UseOrdersQueryParams,
  options: any = {},
) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<OrdersListResult, Error>({
    queryKey: [API_ENDPOINTS.ORDERS, params],
    queryFn: () =>
      orderClient.getList({
        status: params.status,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    ...options,
  });
  const paginatorInfo: MappedPaginatorInfo | null = data?.paginatorInfo
    ? {
        ...data.paginatorInfo,
        hasMorePages: data.paginatorInfo.hasMorePages,
      }
    : null;
  return {
    orders: data?.data ?? [],
    paginatorInfo,
    error,
    loading: isLoading,
  };
};

export const useOrderQuery = (
  {
    id,
    language,
  }: {
    id: string;
    language: string;
  },
  options?: any,
) => {
  const {
    data,
    error,
    isPending: isLoading,
  } = useQuery<Order, Error>({
    queryKey: [API_ENDPOINTS.ORDERS, { id, language }],
    queryFn: async () => {
      const res = await orderClient.get({ id, language });
      const raw = (res as any)?.data ?? res;
      if (raw && typeof raw.id === 'string' && raw.money) {
        return serverOrderToAdminOrder(raw as ServerOrder);
      }
      return raw as Order;
    },
    enabled: Boolean(id),
    ...options,
  });

  return {
    order: data,
    error,
    isLoading,
  };
};

// export const useCreateOrderMutation = () => {
//   return useMutation(orderClient.create);
// };

export function useCreateOrderMutation() {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation();

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: orderClient.create,
    onSuccess: (data: any) => {
      if (data?.id) {
        router.push(`${Routes.order.list}/${data?.id}`);
      }
    },
    onError: (error) => {
      const {
        response: { data },
      }: any = error ?? {};
      toast.error(data?.message);
    },
  });

  function formatOrderInput(input: CreateOrderInput) {
    const formattedInputs = {
      ...input,
      language: locale,
      // TODO: Make it for Graphql too
      invoice_translated_text: {
        subtotal: t('order-sub-total'),
        discount: t('order-discount'),
        tax: t('order-tax'),
        delivery_fee: t('order-delivery-fee'),
        total: t('order-total'),
        products: t('text-products'),
        quantity: t('text-quantity'),
        invoice_no: t('text-invoice-no'),
        date: t('text-date'),
      },
    };
    createOrder(formattedInputs);
  }

  return {
    createOrder: formatOrderInput,
    isLoading: isPending,
  };
}

/** Map admin/frontend status to server API status */
export function toServerStatus(status: string): string {
  const map: Record<string, string> = {
    'order-pending': 'pending',
    'order-processing': 'accepted',
    'order-at-local-facility': 'inkitchen',
    'order-out-for-delivery': 'out of delivery',
    'order-completed': 'completed',
    'order-cancelled': 'canceled',
    'order-failed': 'canceled',
    in_kitchen: 'inkitchen',
    ready: 'ready',
    completed: 'completed',
    cancelled: 'canceled',
    canceled: 'canceled',
  };
  return map[status] ?? status;
}

/** Server order status values (custom server API) */
export const ORDER_STATUS_SERVER_VALUES = [
  'pending',
  'accepted',
  'inkitchen',
  'ready',
  'out of delivery',
  'completed',
  'canceled',
] as const;

/** Return the allowed status options for a given order type. "out of delivery" only applies to delivery orders. */
export function getStatusOptionsForOrderType(
  orderType?: string,
): (typeof ORDER_STATUS_SERVER_VALUES)[number][] {
  if (orderType === 'delivery') return [...ORDER_STATUS_SERVER_VALUES];
  return ORDER_STATUS_SERVER_VALUES.filter((s) => s !== 'out of delivery');
}

export const IN_PROGRESS_STATUSES = [
  'accepted',
  'inkitchen',
  'ready',
  'out of delivery',
];

/** Whether the order should be treated as a scheduled order */
export function isScheduledOrder(order: {
  order_status?: string;
  schedule_time?: string | null;
}): boolean {
  const s = (order.order_status ?? '').toLowerCase().replace(/\s+/g, ' ');
  return !!order.schedule_time && IN_PROGRESS_STATUSES.includes(s);
}

/** Translation key for order status label (use with t(`common:${getOrderStatusLabelKey(s)}`)) */
export function getOrderStatusLabelKey(
  status: string,
  scheduled?: boolean,
): string {
  if (scheduled) return 'text-scheduled';
  const normalized = (status ?? '').toLowerCase().replace(/\s+/g, ' ');
  const map: Record<string, string> = {
    pending: 'text-order-status-pending',
    accepted: 'text-in-progress',
    inkitchen: 'text-in-progress',
    ready: 'text-in-progress',
    'out of delivery': 'text-in-progress',
    completed: 'text-order-status-completed',
    canceled: 'text-order-status-canceled',
    cancelled: 'text-order-status-canceled',
  };
  return map[normalized] ?? 'text-order-status-pending';
}

export interface StatusColors {
  badge: string;
  dot: string;
}

export const SCHEDULED_COLORS: StatusColors = {
  badge: 'bg-purple-50 text-purple-700 border-purple-200',
  dot: 'bg-purple-500',
};
const IN_PROGRESS_COLORS: StatusColors = {
  badge: 'bg-blue-50 text-blue-700 border-blue-200',
  dot: 'bg-blue-500',
};

/** Tailwind classes for status badge (bg + text + border) and dot color */
export function getOrderStatusColors(
  status: string,
  scheduled?: boolean,
): StatusColors {
  if (scheduled) return SCHEDULED_COLORS;
  const s = (status ?? '').toLowerCase().replace(/\s+/g, ' ');
  const palette: Record<string, StatusColors> = {
    pending: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    accepted: IN_PROGRESS_COLORS,
    inkitchen: IN_PROGRESS_COLORS,
    ready: IN_PROGRESS_COLORS,
    'out of delivery': IN_PROGRESS_COLORS,
    completed: {
      badge: 'bg-accent/10 text-accent-hover border-accent/20',
      dot: 'bg-accent',
    },
    canceled: {
      badge: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
    cancelled: {
      badge: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
  };
  return palette[s] ?? palette.pending;
}

export const useUpdateOrderMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      ready_time,
      clear_schedule,
      cancelled_reason,
      cancelled_by,
      silent,
    }: {
      id: string;
      status: string;
      ready_time?: string;
      clear_schedule?: boolean;
      cancelled_reason?: string;
      cancelled_by?: string;
      silent?: boolean;
    }) =>
      orderClient.updateStatus(String(id), toServerStatus(status), {
        ready_time,
        clear_schedule,
        cancelled_reason,
        cancelled_by,
      }),
    onSuccess: (data, variables) => {
      if (!variables.silent) {
        toast.success(t('common:successfully-updated'));
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('common:error-update');
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ORDERS] });
    },
  });
};

export const useRefundOrderMutation = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
      orderClient.refund(id, amount),
    onSuccess: () => {
      toast.success(t('common:text-refund-success'));
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t('common:error-refund-failed');
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ORDERS] });
    },
  });
};

export const useDownloadInvoiceMutation = (
  {
    order_id,
    isRTL,
    language,
  }: { order_id: string; isRTL: boolean; language: string },
  options: any = {},
) => {
  const { t } = useTranslation();
  const formattedInput = {
    order_id,
    is_rtl: isRTL,
    language,
    translated_text: {
      subtotal: t('order-sub-total'),
      discount: t('order-discount'),
      tax: t('order-tax'),
      delivery_fee: t('order-delivery-fee'),
      total: t('order-total'),
      products: t('text-products'),
      quantity: t('text-quantity'),
      invoice_no: t('text-invoice-no'),
      date: t('text-date'),
      paid_from_wallet: t('text-paid_from_wallet'),
      amount_due: t('text-amount-due'),
    },
  };

  return useQuery<string, Error>({
    queryKey: [API_ENDPOINTS.ORDER_INVOICE_DOWNLOAD],
    queryFn: () => orderClient.downloadInvoice(formattedInput),
    ...options,
  });
};

export function useOrderSeen() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('common');
  const {
    mutate: readOrderNotice,
    isPending: isLoading,
    isSuccess,
  } = useMutation({
    mutationFn: orderClient.orderSeen,
    onSuccess: () => {},
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ORDER_SEEN] });
    },
  });

  return { readOrderNotice, isLoading, isSuccess };
}
