import { IBusinessRepository } from '../../repositories/IBusinessRepository';
import { IBusinessSettingsRepository } from '../../repositories/IBusinessSettingsRepository';
import { Business } from '../../entities/Business';
import { ValidationError } from '../../../shared/errors/AppError';

/**
 * Single-tenant: returns the one business, or creates it with defaults if none exists.
 * Requires ownerId (authenticated user) when creating.
 */
export class GetOrCreateDefaultBusinessUseCase {
  constructor(
    private businessRepository: IBusinessRepository,
    private businessSettingsRepository: IBusinessSettingsRepository
  ) {}

  async execute(ownerId: string): Promise<Business> {
    if (!ownerId) {
      throw new ValidationError('Owner ID is required to get or create the default business');
    }

    const existing = await this.businessRepository.findOne();
    if (existing) {
      return existing;
    }

    const defaults = {
      owner: ownerId,
      name: 'My Business',
      legal_name: 'My Business',
      primary_content_name: 'Store',
      primary_content_email: 'store@example.com',
      primary_content_phone: '+1000000000',
    };

    const business = await this.businessRepository.create(defaults);

    try {
      await this.businessSettingsRepository.create({
        business: business.id,
      });
    } catch (error) {
      console.error('Failed to create default business settings:', error);
    }

    return business;
  }
}
