import { IBusinessSettingsRepository } from '../../domain/repositories/IBusinessSettingsRepository';
import {
  BusinessSettings,
  CreateBusinessSettingsDTO,
  UpdateBusinessSettingsDTO,
} from '../../domain/entities/BusinessSettings';
import {
  BusinessSettingsModel,
  BusinessSettingsDocument,
} from '../database/models/BusinessSettingsModel';
import { NotFoundError } from '../../shared/errors/AppError';

const LEGACY_THEME_COLOR_UNSET = {
  header_bg_color: 1,
  header_text_color: 1,
  footer_bg_color: 1,
  footer_text_color: 1,
  shadow_color: 1,
  gradient_start: 1,
  gradient_end: 1,
};

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
      minimumOrderAmount: document.minimumOrderAmount,
      siteTitle: document.siteTitle,
      siteSubtitle: document.siteSubtitle,
      logo: document.logo,
      collapseLogo: document.collapseLogo,
      favicon: (document as any).favicon,
      contactDetails: document.contactDetails,
      currency: document.currency,
      heroSlides: document.heroSlides,
      currencyOptions: document.currencyOptions,
      seo: document.seo,
      seoSettings: (document as any).seoSettings,
      google: document.google,
      facebook: document.facebook,
      isUnderMaintenance: document.isUnderMaintenance,
      operationsSettings: (document as any).operationsSettings,
      maintenance: document.maintenance,
      footer_text: document.footer_text,
      copyrightText: document.copyrightText,
      messages: document.messages,
      promoPopup: document.promoPopup,
      offerCards: document.offerCards,
      created_at: document.created_at,
      updated_at: document.updated_at,
      siteLink: document.siteLink,
      timezone: document.timezone,
      isProductReview: document.isProductReview,
      enableTerms: document.enableTerms,
      termsPage: document.termsPage,
      enableCoupons: document.enableCoupons,
      enableEmailForDigitalProduct: document.enableEmailForDigitalProduct,
      enableReviewPopup: document.enableReviewPopup,
      reviewSystem: document.reviewSystem,
      maxShopDistance: document.maxShopDistance,
      nmiPublicKey: document.nmiPublicKey,
      nmiPrivateKey: document.nmiPrivateKey,
      authorizeNetPublicKey: document.authorizeNetPublicKey,
      authorizeNetApiLoginId: document.authorizeNetApiLoginId,
      authorizeNetTransactionKey: document.authorizeNetTransactionKey,
      authorizeNetMode: document.authorizeNetMode,
      useCashOnDelivery: document.useCashOnDelivery,
      paymentGateway: document.paymentGateway,
      defaultPaymentGateway: document.defaultPaymentGateway,
      useEnableGateway: document.useEnableGateway,
      showMenuSection: document.showMenuSection,
      primary_color: document.primary_color,
      secondary_color: document.secondary_color,
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

  async findAll(): Promise<BusinessSettings[]> {
    const docs = await BusinessSettingsModel.find();
    return docs.map((doc) => this.toDomain(doc));
  }

  async update(
    businessId: string,
    settingsData: UpdateBusinessSettingsDTO
  ): Promise<BusinessSettings> {
    const settingsDoc = await BusinessSettingsModel.findOneAndUpdate(
      { business: businessId },
      {
        $set: settingsData,
        $unset: LEGACY_THEME_COLOR_UNSET,
      },
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
