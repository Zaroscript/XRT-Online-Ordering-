import { ILoyaltyProgramRepository } from '../../domain/repositories/ILoyaltyProgramRepository';
import { LoyaltyProgram, UpsertLoyaltyProgramDTO } from '../../domain/entities/LoyaltyProgram';
import { LoyaltyProgramModel } from '../database/models/LoyaltyProgramModel';

export class LoyaltyProgramRepository implements ILoyaltyProgramRepository {
  private toEntity(doc: any): LoyaltyProgram {
    return {
      id: doc._id.toString(),
      is_active: doc.is_active,
      earn_rate_points_per_currency: doc.earn_rate_points_per_currency,
      redeem_rate_currency_per_point: doc.redeem_rate_currency_per_point,
      minimum_points_to_redeem: doc.minimum_points_to_redeem,
      max_discount_percent_per_order: doc.max_discount_percent_per_order,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async get(): Promise<LoyaltyProgram | null> {
    const doc = await LoyaltyProgramModel.findOne();
    return doc ? this.toEntity(doc) : null;
  }

  async upsert(data: UpsertLoyaltyProgramDTO): Promise<LoyaltyProgram> {
    const doc = await LoyaltyProgramModel.findOneAndUpdate(
      {}, // matches the singleton document (the first one it finds)
      { $set: data },
      { new: true, upsert: true }
    );
    return this.toEntity(doc);
  }
}
