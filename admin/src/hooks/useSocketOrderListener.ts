import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAtom } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { pendingOrdersAtom } from '@/store/order-atoms';
import { getAuthCredentials } from '@/utils/auth-utils';
import {
  serverOrderToAdminOrder,
  ServerOrder,
} from '@/data/order/server-order-mapper';
import { invalidateOrderRealtimeQueries } from '@/utils/invalidate-order-realtime-queries';

/**
 * Derive the socket.io base URL from NEXT_PUBLIC_REST_API_ENDPOINT.
 * The env var is e.g. "http://localhost:3001/api/v1" – we only want the origin.
 */
function getSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:3001/api/v1';
  try {
    const parsed = new URL(apiUrl);
    return parsed.origin; // e.g. "http://localhost:3001"
  } catch {
    return 'http://localhost:3001';
  }
}

/**
 * Hook that connects to the backend socket.io server and listens for
 * order-related events. `new-order` events enqueue the modal notification,
 * while both `new-order` and `order-changed` invalidate dashboard/order
 * queries so the UI refreshes immediately.
 */
export function useSocketOrderListener() {
  const socketRef = useRef<Socket | null>(null);
  const [, setPendingOrders] = useAtom(pendingOrdersAtom);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { token } = getAuthCredentials();
    // Avoid connection churn/noise when user is not authenticated.
    if (!token) {
      return;
    }

    const url = getSocketUrl();
    const socket = io(url, {
      // Keep polling-first for better reverse-proxy compatibility in production.
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    const refreshOrderRelatedData = () => {
      invalidateOrderRealtimeQueries(queryClient);
    };

    const handleNewOrder = (data: any) => {
      refreshOrderRelatedData();

      // The backend emits the full server order object
      let order;
      try {
        order = serverOrderToAdminOrder(data as ServerOrder);
      } catch {
        // If mapping fails, build a minimal order from what we have
        order = {
          id: data?.id || data?.orderId || '',
          tracking_number: data?.order_number || data?.orderNumber || '',
          order_status: data?.status || 'pending',
          total: data?.money?.total_amount ?? 0,
          amount: data?.money?.subtotal ?? 0,
          created_at: data?.created_at || new Date().toISOString(),
          updated_at: data?.updated_at || new Date().toISOString(),
          money: data?.money,
          delivery: data?.delivery,
          items: data?.items || [],
          products: (data?.items || []).map((item: any) => ({
            id: item?.id || item?.menu_item_id,
            name: item?.name_snap || 'Item',
            pivot: {
              order_quantity: item?.quantity || 1,
              unit_price: item?.unit_price || 0,
              subtotal: item?.line_subtotal || 0,
            },
          })),
        } as any;
      }

      // Add to the pending orders queue
      setPendingOrders((prev) => [...prev, order]);
    };

    const handleOrderChanged = () => {
      refreshOrderRelatedData();
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-changed', handleOrderChanged);


    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-changed', handleOrderChanged);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, setPendingOrders]);
}
