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
    zones?: Array<{
      radius: number;
      fee: number;
      min_order?: number;
    }>;
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
    auto_accept_orders?: boolean;
    auto_accept_order_types?: string[];
    auto_accept_ready_time_pickup?: number;
    auto_accept_ready_time_delivery?: number;
  };
  minimumOrderAmount?: number;
  siteLink?: string;
  isProductReview?: boolean;
  enableTerms?: boolean;
  termsPage?: {
    title?: string;
    body?: string;
  };
  enableCoupons?: boolean;
  enableEmailForDigitalProduct?: boolean;
  enableReviewPopup?: boolean;
  reviewSystem?: string;
  maxShopDistance?: number;
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: any;
  collapseLogo?: any;
  contactDetails?: {
    location?: any;
    contact?: string;
    contacts?: string[];
    socials?: Array<{
      icon: string;
      url: string;
    }>;
    website?: string;
    emailAddress?: string;
  };
  timezone?: string;
  currency?: string;
  heroSlides?: Array<{
    bgImage?: any;
    bgType?: string;
    bgVideo?: any;
    title?: string;
    subtitle?: string;
    subtitleTwo?: string;
    offer?: string;
    btnText?: string;
    btnLink?: string;
  }>;
  offerCards?: Array<{
    title?: string;
    description?: string;
    image?: any;
    couponCode?: string;
    showCouponCode?: boolean;
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
  copyrightText?: string;
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
  nmiPublicKey?: string;
  nmiPrivateKey?: string;
  authorizeNetPublicKey?: string;
  authorizeNetApiLoginId?: string;
  authorizeNetTransactionKey?: string;
  authorizeNetMode?: 'ui' | 'iframe';
  authorizeNetEnvironment?: 'sandbox' | 'production';
  useCashOnDelivery?: boolean;
  paymentGateway?: any[];
  defaultPaymentGateway?: string;
  useEnableGateway?: boolean;
  showMenuSection?: boolean;
  primary_color?: string;
  secondary_color?: string;
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
  minimumOrderAmount?: number;
  siteLink?: string;
  isProductReview?: boolean;
  enableTerms?: boolean;
  termsPage?: BusinessSettings['termsPage'];
  enableCoupons?: boolean;
  enableEmailForDigitalProduct?: boolean;
  enableReviewPopup?: boolean;
  reviewSystem?: string;
  maxShopDistance?: number;
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: any;
  collapseLogo?: any;
  contactDetails?: BusinessSettings['contactDetails'];
  currency?: string;
  heroSlides?: BusinessSettings['heroSlides'];
  offerCards?: BusinessSettings['offerCards'];
  currencyOptions?: BusinessSettings['currencyOptions'];
  seo?: BusinessSettings['seo'];
  google?: BusinessSettings['google'];
  facebook?: BusinessSettings['facebook'];
  isUnderMaintenance?: boolean;
  maintenance?: BusinessSettings['maintenance'];
  footer_text?: string;
  copyrightText?: string;
  messages?: BusinessSettings['messages'];
  promoPopup?: BusinessSettings['promoPopup'];
  nmiPublicKey?: string;
  nmiPrivateKey?: string;
  authorizeNetPublicKey?: string;
  authorizeNetApiLoginId?: string;
  authorizeNetTransactionKey?: string;
  authorizeNetMode?: 'ui' | 'iframe';
  authorizeNetEnvironment?: BusinessSettings['authorizeNetEnvironment'];
  useCashOnDelivery?: boolean;
  paymentGateway?: any[];
  defaultPaymentGateway?: string;
  useEnableGateway?: boolean;
  showMenuSection?: boolean;
  primary_color?: string;
  secondary_color?: string;
}

export interface UpdateBusinessSettingsDTO {
  operating_hours?: BusinessSettings['operating_hours'];
  delivery?: BusinessSettings['delivery'];
  fees?: BusinessSettings['fees'];
  taxes?: BusinessSettings['taxes'];
  orders?: BusinessSettings['orders'];
  minimumOrderAmount?: number;
  siteLink?: string;
  isProductReview?: boolean;
  enableTerms?: boolean;
  termsPage?: BusinessSettings['termsPage'];
  enableCoupons?: boolean;
  enableEmailForDigitalProduct?: boolean;
  enableReviewPopup?: boolean;
  reviewSystem?: string;
  maxShopDistance?: number;
  siteTitle?: string;
  siteSubtitle?: string;
  logo?: any;
  collapseLogo?: any;
  contactDetails?: BusinessSettings['contactDetails'];
  currency?: string;
  heroSlides?: BusinessSettings['heroSlides'];
  offerCards?: BusinessSettings['offerCards'];
  currencyOptions?: BusinessSettings['currencyOptions'];
  seo?: BusinessSettings['seo'];
  google?: BusinessSettings['google'];
  facebook?: BusinessSettings['facebook'];
  isUnderMaintenance?: boolean;
  maintenance?: BusinessSettings['maintenance'];
  footer_text?: string;
  copyrightText?: string;
  messages?: BusinessSettings['messages'];
  promoPopup?: BusinessSettings['promoPopup'];
  nmiPublicKey?: string;
  nmiPrivateKey?: string;
  authorizeNetPublicKey?: string;
  authorizeNetApiLoginId?: string;
  authorizeNetTransactionKey?: string;
  authorizeNetMode?: 'ui' | 'iframe';
  authorizeNetEnvironment?: BusinessSettings['authorizeNetEnvironment'];
  useCashOnDelivery?: boolean;
  paymentGateway?: any[];
  defaultPaymentGateway?: string;
  useEnableGateway?: boolean;
  showMenuSection?: boolean;
  primary_color?: string;
  secondary_color?: string;
}
