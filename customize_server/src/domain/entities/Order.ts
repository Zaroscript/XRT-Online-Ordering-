export type OrderType = 'pickup' | 'delivery';
export type ServiceTimeType = 'ASAP' | 'Schedule';
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'inkitchen'
  | 'ready'
  | 'out of delivery'
  | 'completed'
  | 'canceled';

export interface OrderItemModifier {
  id?: string;
  order_item_id?: string;
  modifier_id: string;
  name_snapshot: string;
  modifier_quantity_id?: string;
  quantity_label_snapshot?: string;
  unit_price_delta: number;
  /** Side placement chosen by the customer: LEFT, RIGHT, or WHOLE */
  selected_side?: 'LEFT' | 'RIGHT' | 'WHOLE';
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  size_id?: string;
  name_snap: string;
  size_snap?: string;
  unit_price: number;
  quantity: number;
  modifier_totals: number;
  line_subtotal: number;
  special_notes?: string;
  modifiers: OrderItemModifier[];
  /** Kitchen section name for routing prints (set at order creation from Item → Category) */
  kitchen_section_snapshot?: string;
}

export interface OrderMoney {
  subtotal: number;
  discount: number;
  delivery_fee: number;
  tax_total: number;
  tips: number;
  total_amount: number;
  currency: string;
  payment: string; // payment enum/string
  payment_id?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  coupon_code?: string;
  rewards_points_used?: number;
  loyalty_discount_amount?: number;
  card_type?: string;
  last_4?: string;
}

export interface OrderDelivery {
  name?: string;
  phone?: string;
  address?: any; // object of data
}

/** Per-printer print status to prevent duplicate prints */
export interface OrderPrintStatus {
  printer_id: string;
  status: 'pending' | 'sent' | 'failed';
  attempted_at?: Date;
  error?: string;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  order_type: OrderType;
  service_time_type: ServiceTimeType;
  schedule_time?: Date | null;
  ready_time?: Date;
  actual_ready_time?: Date;
  status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  cancelled_at?: Date;
  completed_at?: Date;
  cancelled_reason?: string;
  cancelled_by?: string;
  money: OrderMoney;
  payment_status?: 'pending' | 'paid' | 'failed';
  delivery?: OrderDelivery;
  notes?: string;
  items: OrderItem[];
  /** Tracks which printers have already received this order (prevents double print) */
  print_status?: OrderPrintStatus[];
}

export interface CreateOrderDTO {
  business_id: string;
  customer_id: string;
  order_type: OrderType;
  service_time_type: ServiceTimeType;
  schedule_time?: Date | null;
  money: OrderMoney;
  payment_status?: 'pending' | 'paid' | 'failed';
  delivery?: OrderDelivery;
  notes?: string;
  items: Omit<OrderItem, 'id' | 'order_id'>[]; // items when creating a new order
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  ready_time?: Date;
  clear_schedule?: boolean;
  cancelled_reason?: string;
  cancelled_by?: string;
}
