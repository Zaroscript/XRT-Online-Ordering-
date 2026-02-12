import { IKitchenSectionRepository } from '../../domain/repositories/IKitchenSectionRepository';
import {
  KitchenSection,
  CreateKitchenSectionDTO,
  KitchenSectionFilters,
} from '../../domain/entities/KitchenSection';
import {
  KitchenSectionModel,
  KitchenSectionDocument,
} from '../database/models/KitchenSectionModel';

export class KitchenSectionRepository implements IKitchenSectionRepository {
  private toDomain(doc: KitchenSectionDocument): KitchenSection {
    return {
      id: doc._id.toString(),
      name: doc.name,
      business_id: doc.business_id,
      is_active: doc.is_active,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }

  async create(data: CreateKitchenSectionDTO): Promise<KitchenSection> {
    const doc = await KitchenSectionModel.create(data);
    return this.toDomain(doc);
  }

  async findAll(filters: KitchenSectionFilters): Promise<KitchenSection[]> {
    const query: any = {};
    // if (filters.business_id) query.business_id = filters.business_id;
    if (filters.name) query.name = new RegExp(`^${filters.name}$`, 'i'); // Case insensitive exact match

    const docs = await KitchenSectionModel.find(query);
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByName(name: string, business_id: string): Promise<KitchenSection | null> {
    const doc = await KitchenSectionModel.findOne({
      // business_id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<KitchenSection | null> {
    const doc = await KitchenSectionModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }
}
