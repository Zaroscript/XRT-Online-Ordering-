import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { PromotionRepository } from '../../infrastructure/repositories/PromotionRepository';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { MAX_WEBSITE_PROMOTIONS, PROMOTION_TEMPLATES } from '../../shared/constants/promotions';
import type { CreatePromotionDTO } from '../../domain/entities/Promotion';
import { ValidationError } from '../../shared/errors/AppError';
import {
  applyPromotionToCart,
  assertPromotionWindowAndLimits,
  assertPromotionWeekdayActive,
  CartLineInput,
} from '../../domain/services/PromotionApplicationService';
import { promotionAppliesOnWeekday } from '../../shared/utils/promotionWeekdays';
import { CouponRepository } from '../../infrastructure/repositories/CouponRepository';
import {
  assertCouponScheduleAndUsage,
  computeCouponCartImpact,
  couponMatchesBusiness,
} from '../../domain/services/couponApplyHelpers';

function sanitizePromotionRulesForPublicList(
  template: string,
  rules: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (template === 'linked_coupon') return {};
  return rules && typeof rules === 'object' ? rules : {};
}

function normalizeCtaLabel(raw: unknown): string {
  const s = String(raw ?? '').trim().slice(0, 24);
  return s || 'Redeem';
}

/**
 * Body payload: subset of 0–6 (Sun–Sat). Empty or all seven → unrestricted (stored as []).
 */
function normalizePromotionWeekdaysInput(raw: unknown): number[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new ValidationError(
      'active_weekdays must be an array of weekday numbers (0 = Sunday … 6 = Saturday)'
    );
  }
  const nums = raw.map((x) => Number(x));
  if (!nums.every((n) => Number.isInteger(n) && n >= 0 && n <= 6)) {
    throw new ValidationError(
      'Each active_weekdays value must be an integer from 0 (Sunday) through 6 (Saturday)'
    );
  }
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  if (uniq.length >= 7) return [];
  return uniq;
}

export class PromotionController {
  private repository = new PromotionRepository();

  private async resolveBusinessId(): Promise<string> {
    const businessRepository = new BusinessRepository();
    const business = await businessRepository.findOne();
    if (!business) throw new Error('Business not configured');
    return business.id;
  }

  /** Admin / authenticated — expects coupons:* permission on routes */
  create = asyncHandler(async (req: Request, res: Response) => {
    const business_id = await this.resolveBusinessId();
    const body = req.body as Partial<CreatePromotionDTO>;
    const tmpl = body.template as string;
    if (!tmpl || !(PROMOTION_TEMPLATES as readonly string[]).includes(tmpl)) {
      return sendError(res, 'Invalid promotion template', 400);
    }
    if (!body.headline?.trim()) {
      return sendError(res, 'Headline is required', 400);
    }
    if (tmpl === 'linked_coupon') {
      const code = String((body.rules as { coupon_code?: string })?.coupon_code || '').trim();
      if (!code) {
        return sendError(
          res,
          'Linked coupon promotions require rules.coupon_code matching an existing coupon code',
          400
        );
      }
    }
    if (!body.active_from || !body.expire_at) {
      return sendError(res, 'Active from and expire dates are required', 400);
    }

    let active_weekdays: number[] = [];
    try {
      active_weekdays = normalizePromotionWeekdaysInput(body.active_weekdays);
    } catch (e: any) {
      return sendError(res, e?.message || 'Invalid active_weekdays', 400);
    }

    if (body.is_active_on_website) {
      const n = await this.repository.countWebsiteActive(business_id);
      if (n >= MAX_WEBSITE_PROMOTIONS) {
        return sendError(
          res,
          `Maximum ${MAX_WEBSITE_PROMOTIONS} promotions can be active on the website. Disable another first.`,
          400
        );
      }
    }

    const promotion = await this.repository.create({
      business_id,
      template: body.template!,
      headline: body.headline ?? '',
      description: body.description,
      image_url: body.image_url,
      rules: body.rules ?? {},
      active_weekdays,
      active_from: body.active_from!,
      expire_at: body.expire_at!,
      minimum_cart_amount: body.minimum_cart_amount ?? 0,
      max_conversions: body.max_conversions ?? null,
      is_active_on_website: body.is_active_on_website ?? false,
      sort_order: body.sort_order ?? 0,
      cta_label: normalizeCtaLabel(body.cta_label),
    });

    return sendSuccess(res, 'Promotion created successfully', promotion, 201);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await this.repository.findById(id);
    if (!existing) return sendError(res, 'Promotion not found', 404);

    const patch = req.body as Record<string, unknown>;
    if (patch.is_active_on_website === true && !existing.is_active_on_website) {
      const others = await this.repository.countWebsiteActive(existing.business_id, id);
      if (others >= MAX_WEBSITE_PROMOTIONS) {
        return sendError(
          res,
          `Maximum ${MAX_WEBSITE_PROMOTIONS} promotions can be active on the website.`,
          400
        );
      }
    }

    const nextTemplate = (patch.template as string | undefined) ?? existing.template;
    const nextRules =
      patch.rules !== undefined ? (patch.rules as Record<string, unknown>) : existing.rules;
    if (nextTemplate === 'linked_coupon') {
      const code = String((nextRules as { coupon_code?: string })?.coupon_code || '').trim();
      if (!code) {
        return sendError(
          res,
          'Linked coupon promotions require rules.coupon_code matching an existing coupon code',
          400
        );
      }
    }

    const patchWithCta =
      patch.cta_label !== undefined
        ? { ...patch, cta_label: normalizeCtaLabel(patch.cta_label) }
        : patch;

    const promotion = await this.repository.update(id, patchWithCta as any);
    return sendSuccess(res, 'Promotion updated successfully', promotion);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.repository.delete(id);
    return sendSuccess(res, 'Promotion deleted successfully');
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const promotion = await this.repository.findById(req.params.id);
    if (!promotion) return sendError(res, 'Promotion not found', 404);
    return sendSuccess(res, 'Promotion retrieved successfully', promotion);
  });

  paginated = asyncHandler(async (req: Request, res: Response) => {
    const business_id = await this.resolveBusinessId();
    const {
      page = 1,
      limit = 15,
      template,
      headline,
      orderBy,
      sortedBy,
    } = req.query;

    const query: Record<string, unknown> = { business_id };
    if (template) query.template = template;
    if (headline) query.headline = { $regex: headline, $options: 'i' };

    const sort: Record<string, 1 | -1> = {};
    if (orderBy) sort[orderBy as string] = sortedBy === 'asc' ? 1 : -1;
    else sort.created_at = -1;

    const result = await this.repository.findPaginated(
      query,
      Number(page),
      Number(limit),
      sort
    );

    const activeOnSite = await this.repository.countWebsiteActive(business_id);

    return sendSuccess(res, 'Promotions retrieved successfully', {
      ...result,
      website_active_count: activeOnSite,
      website_active_max: MAX_WEBSITE_PROMOTIONS,
    });
  });

  updateSortOrder = asyncHandler(async (req: Request, res: Response) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    await this.repository.updateSortOrder(items);
    return sendSuccess(res, 'Promotion sort order updated successfully');
  });

  /** Public — listed in PublicController routes */
  static async listWebsitePromotions(req: Request, res: Response) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const businessRepository = new BusinessRepository();
    const promotionRepository = new PromotionRepository();
    const business = await businessRepository.findOne();
    if (!business) {
      return res.status(500).json({ success: false, message: 'Business not configured' });
    }

    const tz = business.timezone?.trim() || 'UTC';
    const all = await promotionRepository.findByBusinessId(business.id);
    const now = new Date();
    const filtered = all.filter((p) => {
      if (!p.is_active_on_website) return false;
      if (now < new Date(p.active_from) || now > new Date(p.expire_at)) return false;
      if (p.max_conversions != null && p.orders.length >= p.max_conversions) return false;
      if (!promotionAppliesOnWeekday(p.active_weekdays ?? [], now, tz)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const trimmed = filtered.slice(0, MAX_WEBSITE_PROMOTIONS).map((p) => ({
      id: p.id,
      template: p.template,
      headline: p.headline,
      description: p.description || '',
      image_url: p.image_url || '',
      rules: sanitizePromotionRulesForPublicList(p.template, p.rules as Record<string, unknown>),
      minimum_cart_amount: p.minimum_cart_amount,
      cta_label: p.cta_label ?? 'Redeem',
    }));

    return sendSuccess(res, 'Promotions retrieved successfully', trimmed);
  }

  /** Public preview / validate selection */
  static async selectPromotion(req: Request, res: Response) {
    const promotionRepository = new PromotionRepository();
    const businessRepository = new BusinessRepository();
    const business = await businessRepository.findOne();
    if (!business) {
      return res.status(500).json({ success: false, message: 'Business not configured' });
    }

    const { id } = req.params;
    const promotion = await promotionRepository.findById(id);
    if (!promotion || promotion.business_id !== business.id || !promotion.is_active_on_website) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    const tz = business.timezone?.trim() || 'UTC';

    try {
      assertPromotionWindowAndLimits(promotion);
      assertPromotionWeekdayActive(promotion, tz);
    } catch (e: any) {
      return res.status(400).json({ success: false, message: e.message || 'Invalid promotion' });
    }

    const rawLines = req.body?.lines as CartLineInput[] | undefined;
    const orderType = (req.body?.order_type as 'pickup' | 'delivery') || 'pickup';
    const deliveryFee = Number(req.body?.delivery_fee || 0);
    const cartSubtotalFullRaw = req.body?.cart_subtotal_full;
    const cartSubtotalFull =
      cartSubtotalFullRaw != null && cartSubtotalFullRaw !== ''
        ? Number(cartSubtotalFullRaw)
        : NaN;

    let preview: { discount: number; delivery_fee_after: number } | null = null;

    if (rawLines && Array.isArray(rawLines) && rawLines.length > 0) {
      const discountBaseSubtotal = rawLines.reduce((s, l) => s + (l.line_subtotal || 0), 0);
      const minimumCheckSubtotal =
        Number.isFinite(cartSubtotalFull) && cartSubtotalFull > 0
          ? cartSubtotalFull
          : discountBaseSubtotal;
      try {
        if (promotion.template === 'linked_coupon') {
          const code = String(
            (promotion.rules as { coupon_code?: string })?.coupon_code || ''
          ).trim();
          const couponRepo = new CouponRepository();
          const coupon = await couponRepo.verify(code);
          if (!coupon || !couponMatchesBusiness(coupon, business.id)) {
            return res.status(400).json({ success: false, message: 'Promotion is not valid' });
          }
          assertCouponScheduleAndUsage(coupon);
          const minCart = Math.max(
            promotion.minimum_cart_amount || 0,
            coupon.minimum_cart_amount || 0
          );
          if (minimumCheckSubtotal < minCart) {
            return res.status(400).json({
              success: false,
              message: `Minimum order for this promotion is ${minCart}`,
            });
          }
          const impact = computeCouponCartImpact(
            coupon,
            discountBaseSubtotal,
            orderType,
            deliveryFee
          );
          preview = {
            discount: impact.discount,
            delivery_fee_after: impact.deliveryFeeAfter,
          };
        } else {
          const applied = applyPromotionToCart({
            promotion,
            lines: rawLines,
            cartSubtotal: discountBaseSubtotal,
            cartSubtotalForMinimum: minimumCheckSubtotal,
            orderType,
            deliveryFee,
            businessTimeZone: tz,
          });
          preview = {
            discount: applied.discount,
            delivery_fee_after: applied.deliveryFeeAfter,
          };
        }
      } catch (e: any) {
        return res.status(400).json({ success: false, message: e.message || 'Promotion failed' });
      }
    }

    const promotionPayloadRules =
      promotion.template === 'linked_coupon'
        ? {}
        : promotion.rules;

    return sendSuccess(res, 'Promotion is valid', {
      promotion: {
        id: promotion.id,
        template: promotion.template,
        headline: promotion.headline,
        description: promotion.description,
        image_url: promotion.image_url,
        rules: promotionPayloadRules,
        minimum_cart_amount: promotion.minimum_cart_amount,
        cta_label: promotion.cta_label ?? 'Redeem',
      },
      preview,
    });
  }
}
