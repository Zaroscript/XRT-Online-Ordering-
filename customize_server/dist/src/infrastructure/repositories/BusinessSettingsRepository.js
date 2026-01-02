"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSettingsRepository = void 0;
const BusinessSettingsModel_1 = require("../database/models/BusinessSettingsModel");
const AppError_1 = require("../../shared/errors/AppError");
class BusinessSettingsRepository {
    toDomain(document) {
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
    async create(settingsData) {
        const settingsDoc = new BusinessSettingsModel_1.BusinessSettingsModel(settingsData);
        await settingsDoc.save();
        return this.toDomain(settingsDoc);
    }
    async findByBusinessId(businessId) {
        const settingsDoc = await BusinessSettingsModel_1.BusinessSettingsModel.findOne({ business: businessId });
        return settingsDoc ? this.toDomain(settingsDoc) : null;
    }
    async update(businessId, settingsData) {
        const settingsDoc = await BusinessSettingsModel_1.BusinessSettingsModel.findOneAndUpdate({ business: businessId }, settingsData, {
            new: true,
            runValidators: true,
        });
        if (!settingsDoc) {
            throw new AppError_1.NotFoundError('BusinessSettings');
        }
        return this.toDomain(settingsDoc);
    }
    async delete(businessId) {
        const result = await BusinessSettingsModel_1.BusinessSettingsModel.findOneAndDelete({ business: businessId });
        if (!result) {
            throw new AppError_1.NotFoundError('BusinessSettings');
        }
    }
}
exports.BusinessSettingsRepository = BusinessSettingsRepository;
