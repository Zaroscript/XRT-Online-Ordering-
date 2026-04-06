import { SmsCampaign, CreateSmsCampaignDTO, UpdateSmsCampaignDTO } from '../../domain/entities/SmsCampaign';
import { ISmsCampaignRepository } from '../../domain/repositories/ISmsCampaignRepository';
import { SmsCampaignModel, SmsCampaignDocument } from '../database/models/SmsCampaignModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class SmsCampaignRepository implements ISmsCampaignRepository {
  private toDomain(doc: SmsCampaignDocument): SmsCampaign {
    return {
      id: doc._id.toString(),
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

  async create(data: CreateSmsCampaignDTO): Promise<SmsCampaign> {
    const doc = new SmsCampaignModel(data);
    await doc.save();
    return this.toDomain(doc);
  }

  async update(id: string, data: UpdateSmsCampaignDTO): Promise<SmsCampaign> {
    const doc = await SmsCampaignModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) throw new NotFoundError('SMS campaign not found');
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await SmsCampaignModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('SMS campaign not found');
    return true;
  }

  async findById(id: string): Promise<SmsCampaign | null> {
    const doc = await SmsCampaignModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(query: any = {}): Promise<SmsCampaign[]> {
    const docs = await SmsCampaignModel.find(query).sort({ created_at: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findPaginated(
    query: any,
    page: number,
    limit: number,
    sort: any = { created_at: -1 }
  ): Promise<{
    data: SmsCampaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      SmsCampaignModel.find(query).sort(sort).skip(skip).limit(limit),
      SmsCampaignModel.countDocuments(query),
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
