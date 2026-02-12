import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { CouponRepository } from '../../infrastructure/repositories/CouponRepository';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class CouponController {
  private repository: CouponRepository;

  constructor() {
    this.repository = new CouponRepository();
  }

  create = asyncHandler(async (req: Request, res: Response) => {
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
      return sendSuccess(res, 'Coupons created successfully', coupons);
    }

    const coupon = await this.repository.create(req.body);
    return sendSuccess(res, 'Coupon created successfully', coupon);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const coupon = await this.repository.update(id, req.body);
    return sendSuccess(res, 'Coupon updated successfully', coupon);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.repository.delete(id);
    return sendSuccess(res, 'Coupon deleted successfully');
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    // Check params first (for /:code), then query (for ?code=...)
    const code = req.params.code || req.query.code;

    if (code) {
      const coupon = await this.repository.findByCode(code as string);
      if (!coupon) return sendError(res, 'Coupon not found', 404);
      return sendSuccess(res, 'Coupon retrieved successfully', coupon);
    }

    return sendError(res, 'Coupon code is required', 400);
  });

  paginated = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 15, code, orderBy, sortedBy, language, search } = req.query;
    const query: any = {};

    if (code) {
      query.code = { $regex: code, $options: 'i' };
    }

    if (search) {
      const searchString = search as string;
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

    const sort: any = {};
    if (orderBy) {
      sort[orderBy as string] = sortedBy === 'asc' ? 1 : -1;
    } else {
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

    return sendSuccess(res, 'Coupons retrieved successfully', response);
  });

  verify = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    // Basic verification - checking existence.
    // Logic for validity (date, amount) should ideally be robust.
    const coupon = await this.repository.verify(code);
    if (!coupon) return sendError(res, 'Invalid coupon', 404);

    const now = new Date();
    const activeFrom = new Date(coupon.active_from);
    const expireAt = new Date(coupon.expire_at);

    if (now < activeFrom || now > expireAt) {
      return sendError(res, 'Coupon expired or not active', 400);
    }

    if (
      coupon.max_conversions !== null &&
      coupon.max_conversions !== undefined &&
      coupon.orders &&
      coupon.orders.length >= coupon.max_conversions
    ) {
      return sendError(res, 'Coupon usage limit exceeded', 400);
    }

    return sendSuccess(res, 'Coupon is valid', { is_valid: true, coupon });
  });

  approve = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.body;
    const coupon = await this.repository.update(id, { is_approve: true });
    return sendSuccess(res, 'Coupon approved successfully', coupon);
  });

  disapprove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.body;
    const coupon = await this.repository.update(id, { is_approve: false });
    return sendSuccess(res, 'Coupon disapproved successfully', coupon);
  });
}
