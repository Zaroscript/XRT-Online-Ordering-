import { Withdraw, CreateWithdrawDTO, UpdateWithdrawDTO } from '../entities/Withdraw';

export interface WithdrawFilters {
  page?: number;
  limit?: number;
  orderBy?: string;
  sortedBy?: 'asc' | 'desc';
  search?: string;
  business_id?: string;
  status?: string;
}

export interface PaginatedWithdraws {
  withdraws: Withdraw[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IWithdrawRepository {
  create(withdrawData: CreateWithdrawDTO, createdBy: string): Promise<Withdraw>;
  findById(id: string): Promise<Withdraw | null>;
  findAll(filters: WithdrawFilters): Promise<PaginatedWithdraws>;
  update(id: string, withdrawData: UpdateWithdrawDTO): Promise<Withdraw>;
  delete(id: string): Promise<void>;
}

