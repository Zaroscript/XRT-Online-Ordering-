import { Promotion, CreatePromotionDTO, UpdatePromotionDTO } from '../../domain/entities/Promotion';
import { IPromotionRepository } from '../../domain/repositories/IPromotionRepository';
import mongoose from 'mongoose';
import { PromotionModel, PromotionDocument } from '../database/models/PromotionModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class PromotionRepository implements IPromotionRepository {
  private toDomain(doc: PromotionDocument): Promotion {
    return {
      id: doc._id.toString(),
      business_id: doc.business_id?.toString(),
      template: doc.template as Promotion['template'],
      headline: doc.headline,
      description: doc.description,
      image_url: doc.image_url,
      rules: (doc.rules || {}) as Promotion['rules'],
      active_from: doc.active_from,
      expire_at: doc.expire_at,
      minimum_cart_amount: doc.minimum_cart_amount ?? 0,
      max_conversions: doc.max_conversions ?? null,
      is_active_on_website: doc.is_active_on_website ?? false,
      sort_order: doc.sort_order ?? 0,
      cta_label:
        doc.cta_label != null && String(doc.cta_label).trim()
          ? String(doc.cta_label).trim().slice(0, 24)
          : 'Redeem',
      orders: (doc.orders || []).map((o) => o.toString()),
      created_at: new Date(doc.created_at).toISOString(),
      updated_at: new Date(doc.updated_at).toISOString(),
    };
  }

  async create(data: CreatePromotionDTO): Promise<Promotion> {
    const p = new PromotionModel(data);
    await p.save();
    return this.toDomain(p);
  }

  async update(id: string, data: UpdatePromotionDTO): Promise<Promotion> {
    const p = await PromotionModel.findByIdAndUpdate(id, data, { new: true });
    if (!p) throw new NotFoundError('Promotion not found');
    return this.toDomain(p);
  }

  async delete(id: string): Promise<boolean> {
    const r = await PromotionModel.findByIdAndDelete(id);
    if (!r) throw new NotFoundError('Promotion not found');
    return true;
  }

  async findById(id: string): Promise<Promotion | null> {
    const p = await PromotionModel.findById(id);
    return p ? this.toDomain(p) : null;
  }

  async findByBusinessId(businessId: string): Promise<Promotion[]> {
    const rows = await PromotionModel.find({ business_id: businessId }).sort({
      sort_order: 1,
      created_at: -1,
    });
    return rows.map((d) => this.toDomain(d));
  }

  async findPaginated(
    query: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { created_at: -1 }
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      PromotionModel.find(query).sort(sort).skip(skip).limit(limit),
      PromotionModel.countDocuments(query),
    ]);
    return {
      data: data.map((d) => this.toDomain(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countWebsiteActive(businessId: string, excludeId?: string): Promise<number> {
    const q: Record<string, unknown> = {
      business_id: businessId,
      is_active_on_website: true,
    };
    if (excludeId) {
      q._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }
    return PromotionModel.countDocuments(q);
  }

  async appendOrderId(promotionId: string, orderId: string): Promise<void> {
    await PromotionModel.findByIdAndUpdate(promotionId, {
      $push: { orders: orderId },
    });
  }

  async updateSortOrder(items: { id: string; order: number }[]): Promise<void> {
    if (!items || items.length === 0) return;

    const operations = items.map((item) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(item.id) },
        update: { sort_order: item.order },
      },
    }));

    await PromotionModel.bulkWrite(operations);
  }
}
