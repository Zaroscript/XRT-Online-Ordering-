export type EmailCampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface AudienceFilter {
  rule: {
    value: string;
    label: string;
  } | null;
  value?: string | null;
}

export interface EmailCampaign {
  id: string;
  heading: string;
  subject: string;
  body: string;
  filters: AudienceFilter[];
  marketing_consent_only: boolean;
  status: EmailCampaignStatus;
  recipient_count: number;
  sent_at?: string | null;
  error_message?: string | null;
  // SendGrid event tracking
  open_count?: number;
  click_count?: number;
  bounce_count?: number;
  unsubscribe_count?: number;
  spam_count?: number;
  unique_opens?: number;
  unique_clicks?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailCampaignDTO {
  heading: string;
  subject: string;
  body: string;
  filters: AudienceFilter[];
  marketing_consent_only?: boolean;
}

export interface UpdateEmailCampaignDTO {
  heading?: string;
  subject?: string;
  body?: string;
  filters?: AudienceFilter[];
  marketing_consent_only?: boolean;
  status?: EmailCampaignStatus;
  recipient_count?: number;
  sent_at?: string | null;
  error_message?: string | null;
  // SendGrid tracking increments
  open_count?: number;
  click_count?: number;
  bounce_count?: number;
  unsubscribe_count?: number;
  spam_count?: number;
  unique_opens?: number;
  unique_clicks?: number;
}
