import { Promotion, CreatePromotionDTO, UpdatePromotionDTO } from '../entities/Promotion';

export interface IPromotionRepository {
  create(data: CreatePromotionDTO): Promise<Promotion>;
  update(id: string, data: UpdatePromotionDTO): Promise<Promotion>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Promotion | null>;
  findByBusinessId(businessId: string): Promise<Promotion[]>;
  findPaginated(
    query: Record<string, unknown>,
    page: number,
    limit: number,
    sort?: Record<string, 1 | -1>
  ): Promise<{
    data: Promotion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  countWebsiteActive(businessId: string, excludeId?: string): Promise<number>;
  appendOrderId(promotionId: string, orderId: string): Promise<void>;
  updateSortOrder(items: { id: string; order: number }[]): Promise<void>;
}
