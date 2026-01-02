import { Business, CreateBusinessDTO, UpdateBusinessDTO } from '../entities/Business';

export interface IBusinessRepository {
  create(businessData: CreateBusinessDTO): Promise<Business>;
  findById(id: string, ownerId?: string): Promise<Business | null>;
  findByOwner(ownerId: string): Promise<Business[]>;
  findByBusinessId(businessId: string): Promise<Business | null>;
  update(id: string, ownerId: string, businessData: UpdateBusinessDTO): Promise<Business>;
  delete(id: string, ownerId: string): Promise<void>;
  exists(businessId: string): Promise<boolean>;
}

