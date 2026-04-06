import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { EmailCampaignRepository } from '../../infrastructure/repositories/EmailCampaignRepository';
import { EmailService } from '../../infrastructure/services/EmailService';
import { CustomerModel } from '../../infrastructure/database/models/CustomerModel';
import { OrderModel } from '../../infrastructure/database/models/OrderModel';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { logger } from '../../shared/utils/logger';
import { AudienceFilter } from '../../domain/entities/EmailCampaign';

function normalizeBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
}

export class EmailCampaignController {
  private repository: EmailCampaignRepository;
  private emailService: EmailService;

  constructor() {
    this.repository = new EmailCampaignRepository();
    this.emailService = new EmailService();
  }

  /**
   * Resolve recipient emails from audience filters.
   * Each filter has a `rule.value` (e.g. 'inactive_x_days') and a `value` (e.g. 30).
   */
  private async resolveAudience(
    filters: AudienceFilter[],
    marketingConsentOnly = true
  ): Promise<string[]> {
    const customerQuery: any = {
      email: { $exists: true, $ne: '', $not: /@(guest\.local|placeholder\.com)$/i },
    };

    if (marketingConsentOnly) {
      customerQuery.accepts_marketing_messages = { $ne: false };
    }

    if (!filters || filters.length === 0) {
      // No filters = all customers
      const customers = await CustomerModel.find(customerQuery).select('email').lean();
      return customers.map((c: any) => c.email).filter(Boolean);
    }

    // Build a mongo query from all filters (AND logic)
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
        // For spending / order-count rules, we fall back to all active customers
        // (these require aggregation; can be extended later)
        default:
          break;
      }
    }

    const customers = await CustomerModel.find(customerQuery).select('email').lean();
    return customers.map((c: any) => c.email).filter(Boolean);
  }

  paginated = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 15, search, status } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { heading: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const sort: any = { created_at: -1 };
    const result = await this.repository.findPaginated(query, Number(page), Number(limit), sort);

    return sendSuccess(res, 'Email campaigns retrieved successfully', {
      data: result.data,
      current_page: result.page,
      per_page: result.limit,
      total: result.total,
      last_page: result.totalPages,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const { heading, subject, body, filters } = req.body;
    const marketingConsentOnly = normalizeBoolean(req.body.marketing_consent_only, true);

    if (!heading || !subject || !body) {
      return sendError(res, 'Heading, subject, and body are required', 400);
    }

    // 1. Save the campaign first as 'sending'
    const campaign = await this.repository.create({
      heading,
      subject,
      body,
      filters: filters || [],
      marketing_consent_only: marketingConsentOnly,
    });
    await this.repository.update(campaign.id, { status: 'sending' });

    // 2. Resolve audience
    let recipientEmails: string[] = [];
    try {
      recipientEmails = await this.resolveAudience(filters || [], marketingConsentOnly);
    } catch (err) {
      logger.error('[EmailCampaignController] Audience resolution failed:', err);
    }

    // 3. Send emails via SendGrid
    try {
      if (recipientEmails.length > 0) {
        await this.emailService.sendBulkEmail({
          emails: recipientEmails,
          subject,
          html: body,
        });
      }

      const updated = await this.repository.update(campaign.id, {
        status: 'sent',
        recipient_count: recipientEmails.length,
        sent_at: new Date().toISOString(),
        error_message: null,
      });

      return sendSuccess(res, 'Email campaign created and sent successfully', updated, 201);
    } catch (err: any) {
      const errorMsg = err?.response?.body?.errors?.[0]?.message || err?.message || 'Unknown error';
      await this.repository.update(campaign.id, {
        status: 'failed',
        recipient_count: recipientEmails.length,
        error_message: errorMsg,
      });
      logger.error('[EmailCampaignController] Send failed:', errorMsg);
      return sendError(res, `Campaign saved but sending failed: ${errorMsg}`, 500);
    }
  });

  countAudience = asyncHandler(async (req: Request, res: Response) => {
    const { filters } = req.body;
    const marketingConsentOnly = normalizeBoolean(req.body.marketing_consent_only, true);
    let recipientEmails: string[] = [];
    try {
      recipientEmails = await this.resolveAudience(filters || [], marketingConsentOnly);
      return sendSuccess(res, 'Audience count calculated', { count: recipientEmails.length });
    } catch (err) {
      logger.error('[EmailCampaignController] Audience resolution failed:', err);
      return sendError(res, 'Failed to resolve audience count', 500);
    }
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { heading, subject, body, filters } = req.body;
    const marketingConsentOnly = normalizeBoolean(req.body.marketing_consent_only, true);

    const campaign = await this.repository.findById(id);
    if (!campaign) return sendError(res, 'Campaign not found', 404);

    if (!heading || !subject || !body) {
      return sendError(res, 'Heading, subject, and body are required', 400);
    }

    // Update with new content and reset status to sending
    await this.repository.update(id, {
      heading,
      subject,
      body,
      filters: filters || [],
      marketing_consent_only: marketingConsentOnly,
      status: 'sending',
    });

    let recipientEmails: string[] = [];
    try {
      recipientEmails = await this.resolveAudience(filters || [], marketingConsentOnly);
    } catch (err) {
      logger.error('[EmailCampaignController] Audience resolution failed:', err);
    }

    try {
      if (recipientEmails.length > 0) {
        await this.emailService.sendBulkEmail({
          emails: recipientEmails,
          subject,
          html: body,
        });
      }

      const updated = await this.repository.update(id, {
        status: 'sent',
        recipient_count: recipientEmails.length,
        sent_at: new Date().toISOString(),
        error_message: null,
      });

      return sendSuccess(res, 'Email campaign updated and sent successfully', updated);
    } catch (err: any) {
      const errorMsg = err?.response?.body?.errors?.[0]?.message || err?.message || 'Unknown error';
      await this.repository.update(id, {
        status: 'failed',
        recipient_count: recipientEmails.length,
        error_message: errorMsg,
      });
      return sendError(res, `Campaign updated but sending failed: ${errorMsg}`, 500);
    }
  });

  resend = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.repository.findById(id);
    if (!campaign) return sendError(res, 'Campaign not found', 404);

    await this.repository.update(id, { status: 'sending' });

    let recipientEmails: string[] = [];
    try {
      recipientEmails = await this.resolveAudience(
        campaign.filters,
        campaign.marketing_consent_only ?? true
      );

      await this.emailService.sendBulkEmail({
        emails: recipientEmails,
        subject: campaign.subject,
        html: campaign.body,
      });

      const updated = await this.repository.update(id, {
        status: 'sent',
        recipient_count: recipientEmails.length,
        sent_at: new Date().toISOString(),
        error_message: null,
      });

      return sendSuccess(res, 'Email campaign resent successfully', updated);
    } catch (err: any) {
      const errorMsg = err?.response?.body?.errors?.[0]?.message || err?.message || 'Unknown error';
      await this.repository.update(id, { status: 'failed', recipient_count: recipientEmails.length, error_message: errorMsg });
      return sendError(res, `Resend failed: ${errorMsg}`, 500);
    }
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const campaign = await this.repository.findById(id);
    if (!campaign) return sendError(res, 'Campaign not found', 404);
    return sendSuccess(res, 'Campaign retrieved successfully', campaign);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.repository.delete(id);
    return sendSuccess(res, 'Email campaign deleted successfully');
  });
}
