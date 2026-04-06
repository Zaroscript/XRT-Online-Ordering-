import { EmailCampaign, CreateEmailCampaignDTO, UpdateEmailCampaignDTO } from '../entities/EmailCampaign';

export interface IEmailCampaignRepository {
  create(data: CreateEmailCampaignDTO): Promise<EmailCampaign>;
  update(id: string, data: UpdateEmailCampaignDTO): Promise<EmailCampaign>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<EmailCampaign | null>;
  findAll(query?: any): Promise<EmailCampaign[]>;
  findPaginated(
    query: any,
    page: number,
    limit: number,
    sort?: any
  ): Promise<{
    data: EmailCampaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
