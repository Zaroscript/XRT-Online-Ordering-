export interface Business {
  id: string;
  business_id: string; // Custom ID field
  owner: string; // User ID
  name: string;
  legal_name: string;
  primary_content_name: string;
  primary_content_email: string;
  primary_content_phone: string;
  description?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  logo?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  google_maps_verification: boolean;
  social_media?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  header_info?: string;
  footer_text?: string;
  messages?: {
    closed_message?: string;
    not_accepting_orders_message?: string;
  };
  timezone?: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBusinessDTO {
  owner: string;
  name: string;
  legal_name: string;
  primary_content_name: string;
  primary_content_email: string;
  primary_content_phone: string;
  description?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  google_maps_verification?: boolean;
  social_media?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  header_info?: string;
  footer_text?: string;
  messages?: {
    closed_message?: string;
    not_accepting_orders_message?: string;
  };
  timezone?: string;
}

export interface UpdateBusinessDTO {
  name?: string;
  legal_name?: string;
  primary_content_name?: string;
  primary_content_email?: string;
  primary_content_phone?: string;
  description?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  logo?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  google_maps_verification?: boolean;
  social_media?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  header_info?: string;
  footer_text?: string;
  messages?: {
    closed_message?: string;
    not_accepting_orders_message?: string;
  };
  timezone?: string;
}

