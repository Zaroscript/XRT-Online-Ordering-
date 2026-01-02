import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { IBusinessSettingsRepository } from '../../repositories/IBusinessSettingsRepository';
import { Business, CreateBusinessDTO } from '../../entities/Business';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateBusinessUseCase {
  constructor(
    private businessRepository: IBusinessRepository,
    private businessSettingsRepository: IBusinessSettingsRepository
  ) {}

  async execute(businessData: CreateBusinessDTO): Promise<Business> {
    // Validate required fields
    if (
      !businessData.name ||
      !businessData.legal_name ||
      !businessData.primary_content_name ||
      !businessData.primary_content_email ||
      !businessData.primary_content_phone
    ) {
      throw new ValidationError(
        'Name, legal name, primary contact name, email, and phone are required'
      );
    }

    const business = await this.businessRepository.create(businessData);

    // Automatically create default settings for the business
    try {
      await this.businessSettingsRepository.create({
        business: business.id,
      });
    } catch (error) {
      // If settings creation fails, log but don't fail the business creation
      console.error('Failed to create default business settings:', error);
    }

    return business;
  }
}

