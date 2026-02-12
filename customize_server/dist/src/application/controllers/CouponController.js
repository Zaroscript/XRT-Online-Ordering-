"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const CouponRepository_1 = require("../../infrastructure/repositories/CouponRepository");
const response_1 = require("../../shared/utils/response");
class CouponController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { quantity, code, ...rest } = req.body;
            if (quantity && Number(quantity) > 1) {
                const couponsData = [];
                const generateUniqueCode = () => {
                    return code + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                };
                for (let i = 0; i < Number(quantity); i++) {
                    couponsData.push({
                        ...rest,
                        code: generateUniqueCode(),
                    });
                }
                const coupons = await this.repository.bulkCreate(couponsData);
                return (0, response_1.sendSuccess)(res, 'Coupons created successfully', coupons);
            }
            const coupon = await this.repository.create(req.body);
            return (0, response_1.sendSuccess)(res, 'Coupon created successfully', coupon);
        });
        this.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const coupon = await this.repository.update(id, req.body);
            return (0, response_1.sendSuccess)(res, 'Coupon updated successfully', coupon);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await this.repository.delete(id);
            return (0, response_1.sendSuccess)(res, 'Coupon deleted successfully');
        });
        this.get = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // Check params first (for /:code), then query (for ?code=...)
            const code = req.params.code || req.query.code;
            if (code) {
                const coupon = await this.repository.findByCode(code);
                if (!coupon)
                    return (0, response_1.sendError)(res, 'Coupon not found', 404);
                return (0, response_1.sendSuccess)(res, 'Coupon retrieved successfully', coupon);
            }
            return (0, response_1.sendError)(res, 'Coupon code is required', 400);
        });
        this.paginated = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { page = 1, limit = 15, code, orderBy, sortedBy, language, search } = req.query;
            const query = {};
            if (code) {
                query.code = { $regex: code, $options: 'i' };
            }
            if (search) {
                const searchString = search;
                // Search format: field:value;field2:value2
                const searchParams = searchString.split(';');
                searchParams.forEach((param) => {
                    const [key, value] = param.split(':');
                    if (key === 'code' && value) {
                        query.code = { $regex: value, $options: 'i' };
                    }
                });
            }
            // If language logic is needed, add specific query filters.
            const sort = {};
            if (orderBy) {
                sort[orderBy] = sortedBy === 'asc' ? 1 : -1;
            }
            else {
                sort.created_at = -1;
            }
            const result = await this.repository.findPaginated(query, Number(page), Number(limit), sort);
            // Map to Paginator format expected by frontend
            const response = {
                data: result.data,
                current_page: result.page,
                per_page: result.limit,
                total: result.total,
                last_page: result.totalPages,
            };
            return (0, response_1.sendSuccess)(res, 'Coupons retrieved successfully', response);
        });
        this.verify = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { code } = req.body;
            // Basic verification - checking existence.
            // Logic for validity (date, amount) should ideally be robust.
            const coupon = await this.repository.verify(code);
            if (!coupon)
                return (0, response_1.sendError)(res, 'Invalid coupon', 404);
            const now = new Date();
            const activeFrom = new Date(coupon.active_from);
            const expireAt = new Date(coupon.expire_at);
            if (now < activeFrom || now > expireAt) {
                return (0, response_1.sendError)(res, 'Coupon expired or not active', 400);
            }
            if (coupon.max_conversions !== null &&
                coupon.max_conversions !== undefined &&
                coupon.orders &&
                coupon.orders.length >= coupon.max_conversions) {
                return (0, response_1.sendError)(res, 'Coupon usage limit exceeded', 400);
            }
            return (0, response_1.sendSuccess)(res, 'Coupon is valid', { is_valid: true, coupon });
        });
        this.approve = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.body;
            const coupon = await this.repository.update(id, { is_approve: true });
            return (0, response_1.sendSuccess)(res, 'Coupon approved successfully', coupon);
        });
        this.disapprove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.body;
            const coupon = await this.repository.update(id, { is_approve: false });
            return (0, response_1.sendSuccess)(res, 'Coupon disapproved successfully', coupon);
        });
        this.repository = new CouponRepository_1.CouponRepository();
    }
}
exports.CouponController = CouponController;
