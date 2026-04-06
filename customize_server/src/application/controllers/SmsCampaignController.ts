import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { SmsCampaignRepository } from '../../infrastructure/repositories/SmsCampaignRepository';
import { TwilioSmsService } from '../../infrastructure/services/TwilioSmsService';
import { CustomerModel } from '../../infrastructure/database/models/CustomerModel';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { logger } from '../../shared/utils/logger';
import { SmsAudienceFilter } from '../../domain/entities/SmsCampaign';

function normalizeBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
}

export class SmsCampaignController {
  private repository: SmsCampaignRepository;
  private smsService: TwilioSmsService;

  constructor() {
    this.repository = new SmsCampaignRepository();
    this.smsService = new TwilioSmsService();
  }

  /**
   * Resolve phone numbers from audience filters.
   * Mirrors the email campaign audience resolver but uses `phoneNumber` instead of `email`.
   */
  private async resolveAudience(
    filters: SmsAudienceFilter[],
    marketingConsentOnly = true
  ): Promise<string[]> {
    const customerQuery: any = {
      phoneNumber: { $exists: true, $ne: '' },
    };

    if (marketingConsentOnly) {
      customerQuery.accepts_marketing_messages = { $ne: false };
    }

    if (!filters || filters.length === 0) {
      const customers = await CustomerModel.find(customerQuery).select('phoneNumber').lean();
      return customers.map((c: any) => c.phoneNumber).filter(Boolean);
    }

    const now = new Date();

    for (const filter of filters) {
      const rule = filter.rule?.value;
      const val = filter.value ? parseFloat(filter.value as string) : 0;
      const dateVal = filter.value ? new Date(filter.value as string) : null;

      switch (rule) {
        case 'ordered_after_date':
          if (dateVal) customerQuery.last_order_at = { ...(customerQuery.last_order_at || {}), $gte: dateVal };
          break;
        case 'ordered_before_date':
          if (dateVal) customerQuery.last_order_at = { ...(customerQuery.last_order_at || {}), $lte: dateVal };
          break;
        case 'never_ordered':
          customerQuery.last_order_at = null;
          break;
        case 'inactive_x_days': {
          const cutoff = new Date(now.getTime() - val * 24 * 60 * 60 * 1000);
          customerQuery.last_order_at = { ...(customerQuery.last_order_at || {}), $lte: cutoff };
          break;
        }
        case 'active_x_days': {
          const cutoff = new Date(now.getTime() - val * 24 * 60 * 60 * 1000);
          customerQuery.last_order_at = { ...(customerQuery.last_order_at || {}), $gte: cutoff };
          break;
        }
        case 'no_orders_x_days': {
          const cutoff = new Date(now.getTime() - val * 24 * 60 * 60 * 1000);
          customerQuery.last_order_at = { ...(customerQuery.last_order_at || {}), $lte: cutoff };
          break;
        }
        case 'last_order_before_date':
          if (dateVal) customerQuery.last_order_at = { ...(customerQuery.last_order_at || {}), $lte: dateVal };
          break;
        case 'at_least_1_order':
          customerQuery.last_order_at = { $ne: null };
          break;
        default:
          break;
      }
    }

    const customers = await CustomerModel.find(customerQuery).select('phoneNumber').lean();
    return customers.map((c: any) => c.phoneNumber).filter(Boolean);
  }

  paginated = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 15, search, status } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const sort: any = { created_at: -1 };
    const result = await this.repository.findPaginated(query, Number(page), Number(limit), sort);

    return sendSuccess(res, 'SMS campaigns retrieved successfully', {
      data: result.data,
      current_page: result.page,
      per_page: result.limit,
      total: result.total,
      last_page: result.totalPages,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { subject, body, filters } = req.body;
    const marketingConsentOnly = normalizeBoolean(req.body.marketing_consent_only, true);

    if (!subject || !body) {
      return sendError(res, 'Subject and body are required', 400);
    }

    // 1. Save campaign as 'sending'
    const campaign = await this.repository.create({
      subject,
      body,
      filters: filters || [],
      marketing_consent_only: marketingConsentOnly,
    });
    await this.repository.update(campaign.id, { status: 'sending' });

    // 2. Resolve recipient phone numbers
    let recipients: string[] = [];
    try {
      recipients = await this.resolveAudience(filters || [], marketingConsentOnly);
    } catch (err) {
      logger.error('[SmsCampaignController] Audience resolution failed:', err);
    }

    // 3. Send via Twilio
    try {
      const { sent, failed } = await this.smsService.sendBulkSms(recipients, body);

      const updated = await this.repository.update(campaign.id, {
        status: 'sent',
        recipient_count: recipients.length,
        sent_at: new Date().toISOString(),
        error_message: failed > 0 ? `${failed} of ${recipients.length} messages failed` : null,
      });

      return sendSuccess(res, 'SMS campaign created and sent successfully', updated, 201);
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown Twilio error';
      await this.repository.update(campaign.id, {
        status: 'failed',
        recipient_count: recipients.length,
        error_message: errorMsg,
      });
      logger.error('[SmsCampaignController] Bulk SMS failed:', errorMsg);
      return sendError(res, `Campaign saved but sending failed: ${errorMsg}`, 500);
    }
  });

  countAudience = asyncHandler(async (req: Request, res: Response) => {
    const { filters } = req.body;
    const marketingConsentOnly = normalizeBoolean(req.body.marketing_consent_only, true);
    let recipients: string[] = [];
    try {
      recipients = await this.resolveAudience(filters || [], marketingConsentOnly);
      return sendSuccess(res, 'Audience count calculated', { count: recipients.length });
    } catch (err) {
      logger.error('[SmsCampaignController] Audience resolution failed:', err);
      return sendError(res, 'Failed to resolve audience count', 500);
    }
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { subject, body, filters } = req.body;
    const marketingConsentOnly = normalizeBoolean(req.body.marketing_consent_only, true);

    const campaign = await this.repository.findById(id);
    if (!campaign) return sendError(res, 'SMS campaign not found', 404);

    if (!subject || !body) {
      return sendError(res, 'Subject and body are required', 400);
    }

    // Update with new content and reset status to sending
    await this.repository.update(id, {
      subject,
      body,
      filters: filters || [],
      marketing_consent_only: marketingConsentOnly,
      status: 'sending',
    });

    let recipients: string[] = [];
    try {
      recipients = await this.resolveAudience(filters || [], marketingConsentOnly);
    } catch (err) {
      logger.error('[SmsCampaignController] Audience resolution failed:', err);
    }

    try {
      const { sent, failed } = await this.smsService.sendBulkSms(recipients, body);

      const updated = await this.repository.update(id, {
        status: 'sent',
        recipient_count: recipients.length,
        sent_at: new Date().toISOString(),
        error_message: failed > 0 ? `${failed} of ${recipients.length} messages failed` : null,
      });

      return sendSuccess(res, 'SMS campaign updated and sent successfully', updated);
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown Twilio error';
      await this.repository.update(id, {
        status: 'failed',
        recipient_count: recipients.length,
        error_message: errorMsg,
      });
      return sendError(res, `Campaign updated but sending failed: ${errorMsg}`, 500);
    }
  });

  resend = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.repository.findById(id);
    if (!campaign) return sendError(res, 'SMS campaign not found', 404);

    await this.repository.update(id, { status: 'sending' });

    let recipients: string[] = [];
    try {
      recipients = await this.resolveAudience(
        campaign.filters,
        campaign.marketing_consent_only ?? true
      );
      const { sent, failed } = await this.smsService.sendBulkSms(recipients, campaign.body);

      const updated = await this.repository.update(id, {
        status: 'sent',
        recipient_count: recipients.length,
        sent_at: new Date().toISOString(),
        error_message: failed > 0 ? `${failed} of ${recipients.length} messages failed` : null,
      });

      return sendSuccess(res, 'SMS campaign resent successfully', updated);
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown Twilio error';
      await this.repository.update(id, { status: 'failed', recipient_count: recipients.length, error_message: errorMsg });
      return sendError(res, `Resend failed: ${errorMsg}`, 500);
    }
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.repository.findById(id);
    if (!campaign) return sendError(res, 'SMS campaign not found', 404);
    return sendSuccess(res, 'SMS campaign retrieved successfully', campaign);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.repository.delete(id);
    return sendSuccess(res, 'SMS campaign deleted successfully');
  });
}
