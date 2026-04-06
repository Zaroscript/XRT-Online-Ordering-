import { LoyaltyProgram, UpsertLoyaltyProgramDTO } from '../entities/LoyaltyProgram';

export interface ILoyaltyProgramRepository {
  get(): Promise<LoyaltyProgram | null>;
  upsert(data: UpsertLoyaltyProgramDTO): Promise<LoyaltyProgram>;
}
