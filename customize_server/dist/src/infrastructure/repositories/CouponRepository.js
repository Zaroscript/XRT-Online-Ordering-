"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRepository = void 0;
const CouponModel_1 = require("../database/models/CouponModel");
const AppError_1 = require("../../shared/errors/AppError");
class CouponRepository {
    toDomain(document) {
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
    async create(data) {
        const coupon = new CouponModel_1.CouponModel(data);
        await coupon.save();
        return this.toDomain(coupon);
    }
    async bulkCreate(data) {
        const coupons = await CouponModel_1.CouponModel.insertMany(data);
        return coupons.map((coupon) => this.toDomain(coupon));
    }
    async update(id, data) {
        const coupon = await CouponModel_1.CouponModel.findByIdAndUpdate(id, data, { new: true });
        if (!coupon)
            throw new AppError_1.NotFoundError('Coupon not found');
        return this.toDomain(coupon);
    }
    async delete(id) {
        const result = await CouponModel_1.CouponModel.findByIdAndDelete(id);
        if (!result)
            throw new AppError_1.NotFoundError('Coupon not found');
    }
    async findById(id) {
        const coupon = await CouponModel_1.CouponModel.findById(id);
        return coupon ? this.toDomain(coupon) : null;
    }
    async findByCode(code) {
        const coupon = await CouponModel_1.CouponModel.findOne({ code });
        return coupon ? this.toDomain(coupon) : null;
    }
    async findAll(query = {}) {
        const coupons = await CouponModel_1.CouponModel.find(query);
        return coupons.map((doc) => this.toDomain(doc));
    }
    async findPaginated(query, page, limit, sort = { created_at: -1 }) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            CouponModel_1.CouponModel.find(query).sort(sort).skip(skip).limit(limit),
            CouponModel_1.CouponModel.countDocuments(query),
        ]);
        return {
            data: data.map((doc) => this.toDomain(doc)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async verify(code) {
        const now = new Date().toISOString();
        return this.findByCode(code);
        // Additional logic like date checking can be done in service/controller or here
    }
}
exports.CouponRepository = CouponRepository;
