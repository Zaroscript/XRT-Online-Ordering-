import { BusinessSettings, CreateBusinessSettingsDTO, UpdateBusinessSettingsDTO } from '../entities/BusinessSettings';

export interface IBusinessSettingsRepository {
  create(settingsData: CreateBusinessSettingsDTO): Promise<BusinessSettings>;
  findByBusinessId(businessId: string): Promise<BusinessSettings | null>;
  update(businessId: string, settingsData: UpdateBusinessSettingsDTO): Promise<BusinessSettings>;
  delete(businessId: string): Promise<void>;
}

