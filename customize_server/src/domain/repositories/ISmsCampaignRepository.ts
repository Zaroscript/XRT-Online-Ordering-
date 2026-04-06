import { SmsCampaign, CreateSmsCampaignDTO, UpdateSmsCampaignDTO } from '../entities/SmsCampaign';

export interface ISmsCampaignRepository {
  create(data: CreateSmsCampaignDTO): Promise<SmsCampaign>;
  update(id: string, data: UpdateSmsCampaignDTO): Promise<SmsCampaign>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<SmsCampaign | null>;
  findAll(query?: any): Promise<SmsCampaign[]>;
  findPaginated(
    query: any,
    page: number,
    limit: number,
    sort?: any
  ): Promise<{
    data: SmsCampaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
