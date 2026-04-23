import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { EmailCampaignModel } from '../../infrastructure/database/models/EmailCampaignModel';
import { logger } from '../../shared/utils/logger';
import crypto from 'crypto';
import { env } from '../../shared/config/env';

/**
 * SendGrid Event Webhook Controller
 *
 * Receives POST events from SendGrid's Event Webhook.
 * Each request body is an array of event objects.
 *
 * Relevant event types we handle:
 *   open, click, bounce, unsubscribe, spamreport
 *
 * How campaign IDs flow back:
 *   When sending, we embed a custom argument `campaign_id` in the SendGrid
 *   message payload (via customArgs). SendGrid echoes this back in every event.
 */
export class EmailWebhookController {
  /**
   * Verify the SendGrid webhook signature to prevent spoofed events.
   * If SENDGRID_WEBHOOK_KEY is not set we skip verification (dev mode).
   */
  private verifySignature(req: Request): boolean {
    const webhookKey = env.SENDGRID_WEBHOOK_KEY;
    if (!webhookKey) return true; // Skip in dev/no-key mode

    const signature = req.headers['x-twilio-email-event-webhook-signature'] as string;
    const timestamp  = req.headers['x-twilio-email-event-webhook-timestamp'] as string;

    if (!signature || !timestamp) return false;

    const payload = timestamp + JSON.stringify(req.body);
    const hmac    = crypto.createHmac('sha256', webhookKey);
    hmac.update(payload);
    const expected = hmac.digest('base64');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  handleEvents = asyncHandler(async (req: Request, res: Response) => {
    // Signature check (skip gracefully in dev)
    if (!this.verifySignature(req)) {
      logger.warn('[EmailWebhook] Invalid signature – request rejected');
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const events: any[] = Array.isArray(req.body) ? req.body : [req.body];

    // Deduplicate opens/clicks per email address within this batch
    const openedBy  = new Set<string>();
    const clickedBy = new Set<string>();

    // Group increments per campaign
    const updates: Record<string, {
      open_count: number;
      click_count: number;
      bounce_count: number;
      unsubscribe_count: number;
      spam_count: number;
      new_unique_opens: Set<string>;
      new_unique_clicks: Set<string>;
    }> = {};

    const ensureCampaign = (id: string) => {
      if (!updates[id]) {
        updates[id] = {
          open_count: 0,
          click_count: 0,
          bounce_count: 0,
          unsubscribe_count: 0,
          spam_count: 0,
          new_unique_opens: new Set(),
          new_unique_clicks: new Set(),
        };
      }
      return updates[id];
    };

    for (const event of events) {
      const campaignId: string | undefined = event.campaign_id || event['custom_args']?.campaign_id;
      if (!campaignId) continue; // Not our campaign event – skip

      const email: string = (event.email || '').toLowerCase();
      const bucket = ensureCampaign(campaignId);

      switch (event.event) {
        case 'open':
          bucket.open_count++;
          if (email && !openedBy.has(`${campaignId}:${email}`)) {
            openedBy.add(`${campaignId}:${email}`);
            bucket.new_unique_opens.add(email);
          }
          break;

        case 'click':
          bucket.click_count++;
          if (email && !clickedBy.has(`${campaignId}:${email}`)) {
            clickedBy.add(`${campaignId}:${email}`);
            bucket.new_unique_clicks.add(email);
          }
          break;

        case 'bounce':
        case 'blocked':
          bucket.bounce_count++;
          break;

        case 'unsubscribe':
        case 'group_unsubscribe':
          bucket.unsubscribe_count++;
          break;

        case 'spamreport':
          bucket.spam_count++;
          break;

        default:
          // delivered, deferred, processed – ignore
          break;
      }
    }

    // Flush all increments to MongoDB in parallel
    const flushOps = Object.entries(updates).map(async ([campaignId, delta]) => {
      try {
        await EmailCampaignModel.findByIdAndUpdate(
          campaignId,
          {
            $inc: {
              open_count:        delta.open_count,
              click_count:       delta.click_count,
              bounce_count:      delta.bounce_count,
              unsubscribe_count: delta.unsubscribe_count,
              spam_count:        delta.spam_count,
              unique_opens:      delta.new_unique_opens.size,
              unique_clicks:     delta.new_unique_clicks.size,
            },
          },
          { new: false }
        );
        logger.info(
          `[EmailWebhook] Campaign ${campaignId} | ` +
          `+${delta.open_count} opens, +${delta.click_count} clicks, ` +
          `+${delta.bounce_count} bounces, +${delta.unsubscribe_count} unsubs`
        );
      } catch (err) {
        logger.error(`[EmailWebhook] Failed to update campaign ${campaignId}:`, err);
      }
    });

    await Promise.allSettled(flushOps);

    // Always respond 200 to SendGrid so it doesn't retry
    return res.status(200).json({ success: true, processed: events.length });
  });
}
