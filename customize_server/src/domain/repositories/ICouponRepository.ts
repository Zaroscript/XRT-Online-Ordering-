import { Coupon, CreateCouponDTO, UpdateCouponDTO } from '../entities/Coupon';

export interface ICouponRepository {
  create(coupon: CreateCouponDTO): Promise<Coupon>;
  bulkCreate(coupons: CreateCouponDTO[]): Promise<Coupon[]>;
  update(id: string, coupon: UpdateCouponDTO): Promise<Coupon | null>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(): Promise<Coupon[]>;
  findPaginated(query: any, page: number, limit: number, sort: any): Promise<{ data: Coupon[]; total: number; page: number; limit: number; totalPages: number }>;
  verify(code: string): Promise<Coupon | null>;
}
