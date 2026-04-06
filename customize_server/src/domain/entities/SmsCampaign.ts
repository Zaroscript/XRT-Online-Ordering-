export type SmsCampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface SmsAudienceFilter {
  rule: {
    value: string;
    label: string;
  } | null;
  value?: string | null;
}

export interface SmsCampaign {
  id: string;
  subject: string;
  body: string;
  filters: SmsAudienceFilter[];
  marketing_consent_only: boolean;
  status: SmsCampaignStatus;
  recipient_count: number;
  sent_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSmsCampaignDTO {
  subject: string;
  body: string;
  filters: SmsAudienceFilter[];
  marketing_consent_only?: boolean;
}

export interface UpdateSmsCampaignDTO {
  subject?: string;
  body?: string;
  filters?: SmsAudienceFilter[];
  marketing_consent_only?: boolean;
  status?: SmsCampaignStatus;
  recipient_count?: number;
  sent_at?: string | null;
  error_message?: string | null;
}
