import express from 'express';
import { EmailWebhookController } from '../controllers/EmailWebhookController';

const router = express.Router();
const controller = new EmailWebhookController();

/**
 * POST /api/v1/webhooks/sendgrid
 *
 * SendGrid Event Webhook endpoint.
 * This route must be PUBLIC (no requireAuth) because SendGrid POSTs here.
 * Security is handled via HMAC signature verification inside the controller.
 *
 * Required SendGrid Dashboard setup:
 *   1. Go to Settings → Mail Settings → Event Webhook
 *   2. Set HTTP Post URL to: https://your-domain.com/api/v1/webhooks/sendgrid
 *   3. Enable: Opened, Clicked, Bounced, Unsubscribed, Spam Reports
 *   4. Copy the signing key into your .env as SENDGRID_WEBHOOK_KEY
 */
router.post('/sendgrid', controller.handleEvents);

export default router;
