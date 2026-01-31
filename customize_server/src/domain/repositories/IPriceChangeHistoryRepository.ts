import { CreatePriceChangeHistoryDTO, PriceChangeHistory } from '../entities/PriceChangeHistory';

export interface IPriceChangeHistoryRepository {
  create(data: CreatePriceChangeHistoryDTO): Promise<PriceChangeHistory>;
  findById(id: string): Promise<PriceChangeHistory | null>;
  findAll(
    businessId: string | string[],
    page: number,
    limit: number
  ): Promise<{ history: PriceChangeHistory[]; total: number }>;
  markAsRolledBack(id: string, rolledBackBy: string): Promise<void>;
  markAsFailed(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteAll(businessId: string): Promise<void>;
}
