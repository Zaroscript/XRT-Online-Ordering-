import { IBusinessSettingsRepository } from '../../domain/repositories/IBusinessSettingsRepository';
import {
  BusinessSettings,
  CreateBusinessSettingsDTO,
  UpdateBusinessSettingsDTO,
} from '../../domain/entities/BusinessSettings';
import { BusinessSettingsModel, BusinessSettingsDocument } from '../database/models/BusinessSettingsModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class BusinessSettingsRepository implements IBusinessSettingsRepository {
  private toDomain(document: BusinessSettingsDocument): BusinessSettings {
    return {
      id: document._id.toString(),
      business: document.business.toString(),
      operating_hours: document.operating_hours,
      delivery: document.delivery,
      fees: document.fees,
      taxes: document.taxes,
      orders: document.orders,
      siteTitle: document.siteTitle,
      siteSubtitle: document.siteSubtitle,
      logo: document.logo,
      contactDetails: document.contactDetails,
      currency: document.currency,
      heroSlides: document.heroSlides,
      currencyOptions: document.currencyOptions,
      seo: document.seo,
      google: document.google,
      facebook: document.facebook,
      isUnderMaintenance: document.isUnderMaintenance,
      maintenance: document.maintenance,
      footer_text: document.footer_text,
      messages: document.messages,
      promoPopup: document.promoPopup,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
  }

  async create(settingsData: CreateBusinessSettingsDTO): Promise<BusinessSettings> {
    const settingsDoc = new BusinessSettingsModel(settingsData);
    await settingsDoc.save();
    return this.toDomain(settingsDoc);
  }

  async findByBusinessId(businessId: string): Promise<BusinessSettings | null> {
    const settingsDoc = await BusinessSettingsModel.findOne({ business: businessId });
    return settingsDoc ? this.toDomain(settingsDoc) : null;
  }

  async update(
    businessId: string,
    settingsData: UpdateBusinessSettingsDTO
  ): Promise<BusinessSettings> {
    const settingsDoc = await BusinessSettingsModel.findOneAndUpdate(
      { business: businessId },
      settingsData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!settingsDoc) {
      throw new NotFoundError('BusinessSettings');
    }

    return this.toDomain(settingsDoc);
  }

  async delete(businessId: string): Promise<void> {
    const result = await BusinessSettingsModel.findOneAndDelete({ business: businessId });
    if (!result) {
      throw new NotFoundError('BusinessSettings');
    }
  }
}

