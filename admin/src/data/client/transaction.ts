import { API_ENDPOINTS } from './api-endpoints';
import { HttpClient } from './http-client';

export interface TransactionsListParams {
  page?: number;
  limit?: number;
  order_id?: string;
  status?: string;
  gateway?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  customer_id?: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  customer_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface TransactionsListResult {
  data: Transaction[];
  total: number;
}

export const transactionClient = {
  getList: (params: TransactionsListParams) => {
    return HttpClient.get<TransactionsListResult>(API_ENDPOINTS.TRANSACTIONS, params);
  },
  get: (id: string) => {
    return HttpClient.get<Transaction>(`${API_ENDPOINTS.TRANSACTIONS}/${id}`);
  },
};
