import sendgrid from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { IEmailService, EmailOptions } from '../../domain/services/IEmailService';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';

export interface BulkEmailOptions {
  emails: string[];
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

// ---------------------------------------------------------------------------
// Dev-mode Ethereal fallback
// Creates a one-time Ethereal test account and returns a nodemailer transporter.
// Emails are NOT delivered; a preview URL is logged to the console instead.
// ---------------------------------------------------------------------------
let _devTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;


async function getDevTransporter(): Promise<ReturnType<typeof nodemailer.createTransport>> {
  if (_devTransporter) return _devTransporter;
  const testAccount = await nodemailer.createTestAccount();
  _devTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  logger.info(`[EmailService][DEV] Ethereal test account created → ${testAccount.user}`);
  return _devTransporter;
}

async function sendDevEmail(to: string | string[], subject: string, html: string, text?: string): Promise<void> {
  const transporter = await getDevTransporter();
  const from = `"${env.EMAIL_FROM_NAME || 'XRT'}" <${env.EMAIL_FROM || 'noreply@example.com'}>`;
  const info = await transporter.sendMail({ from, to, subject, html, text });
  logger.info(`[EmailService][DEV] Preview URL → ${nodemailer.getTestMessageUrl(info)}`);
}

// ---------------------------------------------------------------------------

export class EmailService implements IEmailService {
  private readonly useDevMode: boolean;

  constructor() {
    if (env.SENDGRID_API_KEY) {
      sendgrid.setApiKey(env.SENDGRID_API_KEY);
      this.useDevMode = false;
    } else {
      logger.warn(
        '[EmailService] SENDGRID_API_KEY not set — falling back to Ethereal dev mode. ' +
          'Check the console for email preview URLs.',
      );
      this.useDevMode = true;
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const html = `<p>${options.message.replace(/\n/g, '<br>')}</p>`;

    if (this.useDevMode) {
      await sendDevEmail(options.email, options.subject, html, options.message);
      return;
    }

    const msg = {
      to: options.email,
      from: {
        email: env.EMAIL_FROM || 'noreply@example.com',
        name: env.EMAIL_FROM_NAME || 'XRT',
      },
      subject: options.subject,
      text: options.message,
      html,
    };

    try {
      await sendgrid.send(msg);
      logger.info(`[EmailService] Email sent to ${options.email}`);
    } catch (error: any) {
      logger.error(`[EmailService] Failed to send email to ${options.email}:`, error?.response?.body || error);
      throw error;
    }
  }

  async sendBulkEmail(options: BulkEmailOptions): Promise<void> {
    if (!options.emails || options.emails.length === 0) {
      logger.warn('[EmailService] No recipients provided for bulk email.');
      return;
    }

    const fromEmail = options.fromEmail || env.EMAIL_FROM || 'noreply@example.com';
    const fromName = options.fromName || env.EMAIL_FROM_NAME || 'XRT';

    // Dev mode: send via Ethereal (one combined email to all recipients)
    if (this.useDevMode) {
      await sendDevEmail(options.emails, options.subject, options.html);
      logger.info(`[EmailService][DEV] Bulk preview sent to ${options.emails.length} recipients via Ethereal.`);
      return;
    }

    // Production: SendGrid with 500-recipient chunks
    const CHUNK_SIZE = 500;
    const chunks: string[][] = [];
    for (let i = 0; i < options.emails.length; i += CHUNK_SIZE) {
      chunks.push(options.emails.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      const msg = {
        to: chunk.map((email) => ({ email })),
        from: { email: fromEmail, name: fromName },
        subject: options.subject,
        html: options.html,
        isMultiple: true,
      };

      try {
        await sendgrid.send(msg as any);
        logger.info(`[EmailService] Bulk email sent to ${chunk.length} recipients.`);
      } catch (error: any) {
        logger.error('[EmailService] Bulk send failed:', error?.response?.body || error);
        throw error;
      }
    }
  }
}
