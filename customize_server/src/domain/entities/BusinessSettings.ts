export interface BusinessSettings {
  id: string;
  business: string; // Business ID
  operating_hours?: {
    auto_close?: boolean;
    schedule?: Array<{
      day: string;
      open_time?: string;
      close_time?: string;
      is_closed?: boolean;
    }>;
  };
  delivery?: {
    enabled?: boolean;
    radius?: number;
    fee?: number;
    min_order?: number;
  };
  fees?: {
    service_fee?: number;
    tip_options?: number[];
  };
  taxes?: {
    sales_tax?: number;
  };
  orders?: {
    accept_orders?: boolean;
    allowScheduleOrder?: boolean;
    maxDays?: number;
    deliveredOrderTime?: number;
  };
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: any;
  contactDetails?: {
    location?: any;
    contact?: string;
    contacts?: string[];
    socials?: Array<{
      icon: string;
      url: string;
    }>;
    website?: string;
  };
  currency?: string;
  heroSlides?: Array<{
    bgImage?: any;
    title?: string;
    subtitle?: string;
    btnText?: string;
    btnLink?: string;
  }>;
  currencyOptions?: {
    formation?: string;
    fractions?: number;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: any;
    twitterHandle?: string;
    twitterCardType?: string;
    metaTags?: string;
    canonicalUrl?: string;
  };
  google?: {
    isEnable?: boolean;
    tagManagerId?: string;
  };
  facebook?: {
    isEnable?: boolean;
    appId?: string;
    pageId?: string;
  };
  isUnderMaintenance?: boolean;
  maintenance?: {
    image?: {
      id?: string;
      original?: string;
      thumbnail?: string;
    };
    title?: string;
    description?: string;
    start?: Date;
    until?: Date;
    isOverlayColor?: boolean;
    overlayColor?: string;
    overlayColorRange?: string;
    buttonTitleOne?: string;
    buttonTitleTwo?: string;
    newsLetterTitle?: string;
    newsLetterDescription?: string;
    aboutUsTitle?: string;
    aboutUsDescription?: string;
    contactUsTitle?: string;
  };
  footer_text?: string;
  messages?: {
    closed_message?: string;
    not_accepting_orders_message?: string;
  };
  promoPopup?: {
    isEnable?: boolean;
    image?: {
      id?: string;
      original?: string;
      thumbnail?: string;
    };
    title?: string;
    description?: string;
    popupDelay?: number;
    popupExpiredIn?: number;
    isNotShowAgain?: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateBusinessSettingsDTO {
  business: string;
  operating_hours?: BusinessSettings['operating_hours'];
  delivery?: BusinessSettings['delivery'];
  fees?: BusinessSettings['fees'];
  taxes?: BusinessSettings['taxes'];
  orders?: BusinessSettings['orders'];
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: any;
  contactDetails?: BusinessSettings['contactDetails'];
  currency?: string;
  heroSlides?: BusinessSettings['heroSlides'];
  currencyOptions?: BusinessSettings['currencyOptions'];
  seo?: BusinessSettings['seo'];
  google?: BusinessSettings['google'];
  facebook?: BusinessSettings['facebook'];
  isUnderMaintenance?: boolean;
  maintenance?: BusinessSettings['maintenance'];
  footer_text?: string;
  messages?: BusinessSettings['messages'];
  promoPopup?: BusinessSettings['promoPopup'];
}

export interface UpdateBusinessSettingsDTO {
  operating_hours?: BusinessSettings['operating_hours'];
  delivery?: BusinessSettings['delivery'];
  fees?: BusinessSettings['fees'];
  taxes?: BusinessSettings['taxes'];
  orders?: BusinessSettings['orders'];
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: any;
  contactDetails?: BusinessSettings['contactDetails'];
  currency?: string;
  heroSlides?: BusinessSettings['heroSlides'];
  currencyOptions?: BusinessSettings['currencyOptions'];
  seo?: BusinessSettings['seo'];
  google?: BusinessSettings['google'];
  facebook?: BusinessSettings['facebook'];
  isUnderMaintenance?: boolean;
  maintenance?: BusinessSettings['maintenance'];
  footer_text?: string;
  messages?: BusinessSettings['messages'];
  promoPopup?: BusinessSettings['promoPopup'];
}

