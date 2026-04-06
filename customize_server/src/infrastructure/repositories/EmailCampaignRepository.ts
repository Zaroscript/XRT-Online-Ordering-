import { EmailCampaign, CreateEmailCampaignDTO, UpdateEmailCampaignDTO } from '../../domain/entities/EmailCampaign';
import { IEmailCampaignRepository } from '../../domain/repositories/IEmailCampaignRepository';
import { EmailCampaignModel, EmailCampaignDocument } from '../database/models/EmailCampaignModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class EmailCampaignRepository implements IEmailCampaignRepository {
  private toDomain(doc: EmailCampaignDocument): EmailCampaign {
    return {
      id: doc._id.toString(),
      heading: doc.heading,
      subject: doc.subject,
      body: doc.body,
      filters: doc.filters || [],
      marketing_consent_only: doc.marketing_consent_only ?? true,
      status: doc.status,
      recipient_count: doc.recipient_count ?? 0,
      sent_at: doc.sent_at ?? null,
      error_message: doc.error_message ?? null,
      created_at: new Date(doc.created_at).toISOString(),
      updated_at: new Date(doc.updated_at).toISOString(),
    };
  }

  async create(data: CreateEmailCampaignDTO): Promise<EmailCampaign> {
    const doc = new EmailCampaignModel(data);
    await doc.save();
    return this.toDomain(doc);
  }

  async update(id: string, data: UpdateEmailCampaignDTO): Promise<EmailCampaign> {
    const doc = await EmailCampaignModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) throw new NotFoundError('Email campaign not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await EmailCampaignModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Email campaign not found');
    return true;
  }

  async findById(id: string): Promise<EmailCampaign | null> {
    const doc = await EmailCampaignModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(query: any = {}): Promise<EmailCampaign[]> {
    const docs = await EmailCampaignModel.find(query).sort({ created_at: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findPaginated(
    query: any,
    page: number,
    limit: number,
    sort: any = { created_at: -1 }
  ): Promise<{
    data: EmailCampaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      EmailCampaignModel.find(query).sort(sort).skip(skip).limit(limit),
      EmailCampaignModel.countDocuments(query),
    ]);

    return {
      data: data.map((d) => this.toDomain(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
