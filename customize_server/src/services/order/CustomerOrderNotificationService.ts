import { Business } from '../../domain/entities/Business';
import { Customer } from '../../domain/entities/Customer';
import { Order } from '../../domain/entities/Order';
import { EmailService } from '../../infrastructure/services/EmailService';
import { TwilioSmsService } from '../../infrastructure/services/TwilioSmsService';
import { logger } from '../../shared/utils/logger';

type NotificationKind = 'created' | 'status_changed';

interface NotificationPayload {
  business: Business;
  customer: Customer;
  order: Order;
  kind: NotificationKind;
}

export class CustomerOrderNotificationService {
  private emailService = new EmailService();
  private smsService = new TwilioSmsService();

  async sendOrderCreatedNotifications(payload: Omit<NotificationPayload, 'kind'>): Promise<void> {
    await this.sendOrderNotifications({ ...payload, kind: 'created' });
  }

  async sendOrderStatusNotifications(payload: Omit<NotificationPayload, 'kind'>): Promise<void> {
    await this.sendOrderNotifications({ ...payload, kind: 'status_changed' });
  }

  private async sendOrderNotifications({
    business,
    customer,
    order,
    kind,
  }: NotificationPayload): Promise<void> {
    if (customer.accepts_order_updates === false) {
      return;
    }

    const email = this.getDeliverableEmail(customer.email);
    const phone = this.normalizeSmsPhone(customer.phoneNumber);

    if (!email && !phone) {
      return;
    }

    const messages = this.buildMessages({ business, customer, order, kind });
    const tasks: Promise<void>[] = [];

    if (email) {
      tasks.push(
        this.emailService.sendEmail({
          email,
          subject: messages.emailSubject,
          message: messages.emailBody,
        })
      );
    }

    if (phone) {
      tasks.push(
        this.smsService.sendSms({
          to: phone,
          body: messages.smsBody,
        })
      );
    }

    const results = await Promise.allSettled(tasks);

    results.forEach((result) => {
      if (result.status === 'rejected') {
        logger.error(
          '[CustomerOrderNotificationService] Failed to deliver order notification:',
          result.reason
        );
      }
    });
  }

  private buildMessages({
    business,
    customer,
    order,
    kind,
  }: NotificationPayload): { emailSubject: string; emailBody: string; smsBody: string } {
    const businessName = business.name?.trim() || 'our restaurant';
    const customerName = customer.name?.trim() || 'Customer';
    const serviceLabel = order.order_type === 'delivery' ? 'Delivery' : 'Pickup';
    const totalLabel = this.formatCurrency(order.money.total_amount, order.money.currency);
    const timeLabel =
      order.service_time_type === 'Schedule' && order.schedule_time
        ? `Scheduled for ${this.formatDate(order.schedule_time)}`
        : 'ASAP';

    if (kind === 'created') {
      return {
        emailSubject: `${businessName}: order ${order.order_number} received`,
        emailBody: [
          `Hi ${customerName},`,
          '',
          `Thanks for ordering from ${businessName}. We received your order ${order.order_number}.`,
          `Order type: ${serviceLabel}`,
          `Requested time: ${timeLabel}`,
          `Total: ${totalLabel}`,
          '',
          'We will keep you posted with future order updates.',
        ].join('\n'),
        smsBody: `${businessName}: we received order ${order.order_number}. ${serviceLabel}. ${timeLabel}. Total ${totalLabel}.`,
      };
    }

    const statusLabel = this.humanizeStatus(order.status);
    const readyTimeLine = order.ready_time ? `Ready time: ${this.formatDate(order.ready_time)}` : null;

    return {
      emailSubject: `${businessName}: order ${order.order_number} is ${statusLabel}`,
      emailBody: [
        `Hi ${customerName},`,
        '',
        `Your order ${order.order_number} from ${businessName} is now ${statusLabel}.`,
        `Order type: ${serviceLabel}`,
        `Total: ${totalLabel}`,
        ...(readyTimeLine ? [readyTimeLine] : []),
        '',
        'Thank you for ordering with us.',
      ].join('\n'),
      smsBody: `${businessName}: order ${order.order_number} is now ${statusLabel}.${readyTimeLine ? ` ${readyTimeLine}.` : ''}`,
    };
  }

  private getDeliverableEmail(email?: string): string | null {
    if (!email) return null;

    const normalized = String(email).trim().toLowerCase();
    if (!normalized) return null;
    if (normalized.endsWith('@guest.local') || normalized.endsWith('@placeholder.com')) {
      return null;
    }

    return normalized;
  }

  private normalizeSmsPhone(phone?: string): string | null {
    if (!phone) return null;

    const trimmed = String(phone).trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('+')) {
      const digits = trimmed.slice(1).replace(/\D/g, '');
      return digits ? `+${digits}` : null;
    }

    if (trimmed.startsWith('00')) {
      const digits = trimmed.slice(2).replace(/\D/g, '');
      return digits ? `+${digits}` : null;
    }

    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;

    if (digits.length === 10) {
      return `+1${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    if (digits.length > 10) {
      return `+${digits}`;
    }

    return trimmed;
  }

  private humanizeStatus(status?: string): string {
    return String(status || 'updated').replace(/_/g, ' ');
  }

  private formatCurrency(amount: number, currency?: string): string {
    const normalizedAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    const normalizedCurrency = (currency || 'USD').toUpperCase();

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: normalizedCurrency,
      }).format(normalizedAmount);
    } catch {
      return `${normalizedCurrency} ${normalizedAmount.toFixed(2)}`;
    }
  }

  private formatDate(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'soon';

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }
}
