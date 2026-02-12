import { Coupon, CreateCouponDTO, UpdateCouponDTO } from '../../domain/entities/Coupon';
import { CouponModel, CouponDocument } from '../database/models/CouponModel';
import { NotFoundError } from '../../shared/errors/AppError';

export class CouponRepository {
  private toDomain(document: CouponDocument): Coupon {
    return {
      id: document._id.toString(),
      code: document.code,
      description: document.description,
      type: document.type,
      amount: document.amount,
      active_from: document.active_from,
      expire_at: document.expire_at,
      target: document.target,
      shop_id: document.shop_id,
      is_approve: document.is_approve ?? true,
      minimum_cart_amount: document.minimum_cart_amount ?? 0,
      translated_languages: document.translated_languages || [],
      language: document.language || 'en',
      created_at: new Date(document.created_at).toISOString(),
      updated_at: new Date(document.updated_at).toISOString(),
      max_conversions: document.max_conversions ?? null,
      orders: document.orders || [],
    };
  }

  async create(data: CreateCouponDTO): Promise<Coupon> {
    const coupon = new CouponModel(data);
    await coupon.save();
    return this.toDomain(coupon);
  }

  async bulkCreate(data: CreateCouponDTO[]): Promise<Coupon[]> {
    const coupons = await CouponModel.insertMany(data);
    return coupons.map((coupon) => this.toDomain(coupon));
  }

  async update(id: string, data: UpdateCouponDTO): Promise<Coupon> {
    const coupon = await CouponModel.findByIdAndUpdate(id, data, { new: true });
    if (!coupon) throw new NotFoundError('Coupon not found');
    return this.toDomain(coupon);
  }

  async delete(id: string): Promise<void> {
    const result = await CouponModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Coupon not found');
  }

  async findById(id: string): Promise<Coupon | null> {
    const coupon = await CouponModel.findById(id);
    return coupon ? this.toDomain(coupon) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await CouponModel.findOne({ code });
    return coupon ? this.toDomain(coupon) : null;
  }

  async findAll(query: any = {}): Promise<Coupon[]> {
    const coupons = await CouponModel.find(query);
    return coupons.map((doc) => this.toDomain(doc));
  }

  async findPaginated(query: any, page: number, limit: number, sort: any = { created_at: -1 }) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      CouponModel.find(query).sort(sort).skip(skip).limit(limit),
      CouponModel.countDocuments(query),
    ]);

    return {
      data: data.map((doc) => this.toDomain(doc)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async verify(code: string): Promise<Coupon | null> {
    const now = new Date().toISOString();
    return this.findByCode(code);
    // Additional logic like date checking can be done in service/controller or here
  }
}
