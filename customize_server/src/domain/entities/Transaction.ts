export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'voided';

export interface Transaction {
  id: string;
  order_id: string | any;
  customer_id: string | any;
  transaction_id: string; // Gateway transaction ID
  amount: number;
  currency: string;
  gateway: 'nmi' | 'authorize_net';
  status: TransactionStatus;
  payment_method: string; // e.g., 'card', 'bank', 'apple_pay'
  card_type?: string; // e.g., 'Visa', 'MasterCard'
  last_4?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: any;
}

export interface CreateTransactionDTO {
  order_id: string;
  customer_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  gateway: 'nmi' | 'authorize_net';
  status: TransactionStatus;
  payment_method: string;
  card_type?: string;
  last_4?: string;
  metadata?: any;
}
