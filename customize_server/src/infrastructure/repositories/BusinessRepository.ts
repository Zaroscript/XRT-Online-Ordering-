import { IBusinessRepository } from '../../domain/repositories/IBusinessRepository';
import { Business, CreateBusinessDTO, UpdateBusinessDTO } from '../../domain/entities/Business';
import { BusinessModel, BusinessDocument } from '../database/models/BusinessModel';
import { NotFoundError } from '../../shared/errors/AppError';
import { randomUUID } from 'crypto';

export class BusinessRepository implements IBusinessRepository {
  private toDomain(document: BusinessDocument): Business {
    return {
      id: document._id.toString(),
      business_id: document.id,
      owner: document.owner.toString(),
      name: document.name,
      legal_name: document.legal_name,
      primary_content_name: document.primary_content_name,
      primary_content_email: document.primary_content_email,
      primary_content_phone: document.primary_content_phone,
      description: document.description,
      website: document.website,
      address: document.address,
      logo: document.logo,
      location: document.location,
      google_maps_verification: document.google_maps_verification,
      social_media: document.social_media,
      header_info: document.header_info,
      footer_text: document.footer_text,
      messages: document.messages,
      timezone: document.timezone,
      isActive: document.isActive,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(businessData: CreateBusinessDTO): Promise<Business> {
    const businessDoc = new BusinessModel({
      ...businessData,
      id: randomUUID(),
    });
    await businessDoc.save();
    return this.toDomain(businessDoc);
  }

  async findOne(): Promise<Business | null> {
    const businessDoc = await BusinessModel.findOne();
    return businessDoc ? this.toDomain(businessDoc) : null;
  }

  async update(id: string, businessData: UpdateBusinessDTO): Promise<Business> {
    const businessDoc = await BusinessModel.findOneAndUpdate({ _id: id }, businessData, {
      new: true,
      runValidators: true,
    });

    if (!businessDoc) {
      throw new NotFoundError('Business');
    }

    return this.toDomain(businessDoc);
  }

  async delete(id: string): Promise<void> {
    const result = await BusinessModel.findOneAndDelete({ _id: id });
    if (!result) {
      throw new NotFoundError('Business');
    }
  }
}
