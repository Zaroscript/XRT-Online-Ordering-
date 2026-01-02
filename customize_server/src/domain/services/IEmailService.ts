export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
}

