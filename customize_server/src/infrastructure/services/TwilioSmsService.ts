import twilio from 'twilio';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';

export interface SmsOptions {
  to: string;
  body: string;
}

export class TwilioSmsService {
  private client: twilio.Twilio | null = null;

  constructor() {
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    } else {
      logger.warn('[TwilioSmsService] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set. SMS will not be sent.');
    }
  }

  async sendSms(options: SmsOptions): Promise<void> {
    if (!this.client) {
      logger.warn(`[TwilioSmsService] Skipping SMS to ${options.to} – Twilio not configured.`);
      return;
    }

    if (!env.TWILIO_PHONE_NUMBER) {
      logger.warn('[TwilioSmsService] TWILIO_PHONE_NUMBER not set. Cannot send SMS.');
      return;
    }

    try {
      await this.client.messages.create({
        from: env.TWILIO_PHONE_NUMBER,
        to: options.to,
        body: options.body,
      });
      logger.info(`[TwilioSmsService] SMS sent to ${options.to}`);
    } catch (error: any) {
      logger.error(`[TwilioSmsService] Failed to send SMS to ${options.to}:`, error?.message);
      throw error;
    }
  }

  /**
   * Send SMS to multiple recipients sequentially with a small delay
   * to avoid Twilio rate limiting.
   */
  async sendBulkSms(recipients: string[], body: string): Promise<{ sent: number; failed: number }> {
    if (!this.client) {
      logger.warn('[TwilioSmsService] Skipping bulk SMS – Twilio not configured.');
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const phoneNumber of recipients) {
      // Normalise: strip HTML tags for SMS (plain text only)
      const plainBody = body.replace(/<[^>]*>/g, '').trim();

      try {
        await this.sendSms({ to: phoneNumber, body: plainBody });
        sent++;
      } catch {
        failed++;
      }

      // 50ms throttle between messages to respect Twilio rate limits
      await new Promise((r) => setTimeout(r, 50));
    }

    logger.info(`[TwilioSmsService] Bulk SMS complete — sent: ${sent}, failed: ${failed}`);
    return { sent, failed };
  }
}
