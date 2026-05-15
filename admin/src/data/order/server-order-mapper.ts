import { Order } from '@/types';

/** Shape returned by the custom server GET /orders */
export interface ServerOrderResponse {
  data: ServerOrder[];
  total: number;
}

export interface ServerOrderItemModifier {
  id?: string;
  modifier_id: string;
  name_snapshot: string;
  modifier_quantity_id?: string;
  quantity_label_snapshot?: string;
  unit_price_delta: number;
  selected_side?: string;
}

export interface ServerOrderItem {
  id?: string;
  menu_item_id: string;
  size_id?: string;
  name_snap: string;
  size_snap?: string;
  unit_price: number;
  quantity: number;
  modifier_totals: number;
  line_subtotal: number;
  special_notes?: string;
  modifiers: ServerOrderItemModifier[];
}

export interface ServerOrder {
  id: string;
  customer_id:
    | string
    | {
        id?: string;
        _id?: string;
        name?: string;
        email?: string;
        phoneNumber?: string;
        phone?: string;
      };
  order_number: string;
  order_type: string;
  service_time_type: string;
  schedule_time?: string | null;
  ready_time?: string;
  actual_ready_time?: string;
  status: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  completed_at?: string;
  cancelled_reason?: string;
  cancelled_by?: string;
  money: {
    subtotal: number;
    discount: number;
    delivery_fee: number;
    tax_total: number;
    tips: number;
    total_amount: number;
    currency: string;
    payment: string;
  };
  delivery?: {
    name?: string;
    phone?: string;
    address?: Record<string, unknown>;
  };
  notes?: string;
  items: ServerOrderItem[];
}

/** Map server order to admin Order type for list/cards/details */
export function serverOrderToAdminOrder(server: ServerOrder): Order {
  const customer =
    typeof server.customer_id === 'object' && server.customer_id !== null
      ? server.customer_id
      : undefined;
  const delivery = server.delivery;
  const address = delivery?.address as
    | {
        line1?: string;
        city?: string;
        state?: string;
        formatted_address?: string;
      }
    | undefined;
  const formattedAddress =
    address?.formatted_address ||
    [
      address?.line1,
      (address as any)?.line2,
      address?.city,
      address?.state,
      (address as any)?.zip,
      (address as any)?.country,
    ]
      .filter(Boolean)
      .join(', ');
  const mappedAddress = formattedAddress
    ? ({
        formatted_address: formattedAddress,
        street_address: address?.line1,
        city: address?.city,
        state: address?.state,
        zip: (address as any)?.zip,
        country: (address as any)?.country,
      } as any)
    : undefined;
  const customerName = customer?.name || delivery?.name || '';
  const customerContact = customer?.phoneNumber || customer?.phone || delivery?.phone || '';
  const customerId =
    typeof server.customer_id === 'string'
      ? Number(server.customer_id) || 0
      : Number(customer?.id || customer?._id) || 0;

  return {
    id: server.id,
    parent_id: '',
    tracking_number: server.order_number,
    customer_contact: customerContact,
    customer_name: customerName,
    customer_id: customerId,
    customer:
      customerName || customer?.email
        ? ({
            name: customerName,
            email: customer?.email,
          } as any)
        : undefined,
    amount: server.money?.subtotal ?? 0,
    sales_tax: server.money?.tax_total ?? 0,
    total: server.money?.total_amount ?? 0,
    paid_total: server.money?.total_amount ?? 0,
    delivery_fee: server.money?.delivery_fee ?? 0,
    discount: server.money?.discount ?? 0,
    delivery_time: server.ready_time ?? server.created_at ?? '',
    order_status: server.status,
    order_type: server.order_type,
    schedule_time: server.schedule_time ?? null,
    payment_status: server.money?.payment ?? 'pending',
    created_at:
      typeof server.created_at === 'string'
        ? server.created_at
        : ((server as any).created_at?.toString?.() ?? ''),
    updated_at:
      typeof server.updated_at === 'string'
        ? server.updated_at
        : ((server as any).updated_at?.toString?.() ?? ''),
    translated_languages: [],
    language: '',
    products: (server.items ?? []).map(
      (item) =>
        ({
          id: item.id ?? item.menu_item_id,
          name: item.name_snap,
          pivot: {
            order_quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.line_subtotal,
            variation: item.size_snap,
            modifiers: (item.modifiers ?? []).map((m) => ({
              id: m.id,
              modifier_name_snap: m.name_snapshot,
              quantity_label_snapshot: m.quantity_label_snapshot,
              unit_price_delta: m.unit_price_delta,
              selected_side: m.selected_side,
            })),
          },
          special_notes: item.special_notes,
        }) as any,
    ),
    shipping_address: mappedAddress,
    billing_address: mappedAddress,
    note: server.notes,
    cancelled_reason: server.cancelled_reason,
    cancelled_by: server.cancelled_by,
    // Preserve raw server data for the new order modal
    ...({
      money: server.money,
      delivery: server.delivery,
      ready_time: server.ready_time,
      actual_ready_time: server.actual_ready_time,
      completed_at: server.completed_at,
      cancelled_at: server.cancelled_at,
      service_time_type: server.service_time_type,
    } as any),
  } as Order;
}
