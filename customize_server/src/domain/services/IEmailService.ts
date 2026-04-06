export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

export interface BulkEmailServiceOptions {
  emails: string[];
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
  sendBulkEmail(options: BulkEmailServiceOptions): Promise<void>;
}

