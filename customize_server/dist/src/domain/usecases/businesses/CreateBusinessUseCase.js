"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBusinessUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CreateBusinessUseCase {
    constructor(businessRepository, businessSettingsRepository) {
        this.businessRepository = businessRepository;
        this.businessSettingsRepository = businessSettingsRepository;
    }
    async execute(businessData) {
        // Validate required fields
        if (!businessData.name ||
            !businessData.legal_name ||
            !businessData.primary_content_name ||
            !businessData.primary_content_email ||
            !businessData.primary_content_phone) {
            throw new AppError_1.ValidationError('Name, legal name, primary contact name, email, and phone are required');
        }
        const business = await this.businessRepository.create(businessData);
        // Automatically create default settings for the business
        try {
            await this.businessSettingsRepository.create({
                business: business.id,
            });
        }
        catch (error) {
            // If settings creation fails, log but don't fail the business creation
            console.error('Failed to create default business settings:', error);
        }
        return business;
    }
}
exports.CreateBusinessUseCase = CreateBusinessUseCase;
