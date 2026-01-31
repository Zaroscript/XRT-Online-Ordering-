import { Business, CreateBusinessDTO, UpdateBusinessDTO } from '../entities/Business';

export interface IBusinessRepository {
  create(businessData: CreateBusinessDTO): Promise<Business>;
  findOne(): Promise<Business | null>;
  update(id: string, businessData: UpdateBusinessDTO): Promise<Business>;
  delete(id: string): Promise<void>;
}
