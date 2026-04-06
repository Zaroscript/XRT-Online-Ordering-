import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { GetOrCreateDefaultBusinessUseCase } from '../../domain/usecases/businesses/GetOrCreateDefaultBusinessUseCase';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';

const LEGACY_THEME_COLOR_FIELDS = [
  'header_bg_color',
  'header_text_color',
  'footer_bg_color',
  'footer_text_color',
  'shadow_color',
  'gradient_start',
  'gradient_end',
] as const;

const DEFAULT_TERMS_TITLE = 'Terms & Conditions';

function hasVisibleRichTextContent(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const visibleText = value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return visibleText.length > 0;
}

function normalizeTermsPage(termsPage: Record<string, unknown> | null | undefined) {
  const title = typeof termsPage?.title === 'string' ? termsPage.title.trim() : '';
  const body = typeof termsPage?.body === 'string' ? termsPage.body.trim() : '';
  const hasContent = Boolean(title) || hasVisibleRichTextContent(body);

  return {
    title: title || (hasContent ? DEFAULT_TERMS_TITLE : ''),
    body,
  };
}

const getDefaultOptions = () => ({
  siteTitle: 'XRT Online Ordering',
  siteSubtitle: 'Enterprise Ordering System',
  timezone: 'America/New_York', // Default timezone
  currency: 'USD',
  guestCheckout: true,
  minimumOrderAmount: 0,
  currencyToWalletRatio: 1,
  signupPoints: 0,
  maxShopDistance: 10,
  maximumQuestionLimit: 5,
  isProductReview: true,
  enableTerms: false,
  termsPage: {
    title: '',
    body: '',
  },
  enableCoupons: true,
  enableEmailForDigitalProduct: false,
  useGoogleMap: true,
  isPromoPopUp: false,
  reviewSystem: 'default',
  footer_text: '',
  copyrightText: 'Powered by XRT',
  isUnderMaintenance: false,
  maintenance: {
    isEnable: false,
    image: null,
    title: '',
    description: '',
    start: null,
    until: null,
    isOverlayColor: false,
    overlayColor: '',
    overlayColorRange: '',
    buttonTitleOne: '',
    buttonTitleTwo: '',
    newsLetterTitle: '',
    newsLetterDescription: '',
    aboutUsTitle: '',
    contactUsTitle: '',
  },
  promoPopup: {
    isEnable: false,
    image: null,
    title: '',
    description: '',
    popupDelay: 0,
    popupExpiredIn: 0,
    isNotShowAgain: false,
  },
  contactDetails: {
    location: null,
    contact: '',
    contacts: [],
    website: '',
    socials: [],
  },
  logo: null,
  collapseLogo: null,
  taxClass: null,
  shippingClass: null,
  seo: {
    metaTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: null,
    twitterHandle: '',
    twitterCardType: '',
    metaTags: '',
    canonicalUrl: '',
  },
  google: {
    isEnable: false,
    tagManagerId: '',
  },
  facebook: {
    isEnable: false,
    appId: '',
    pageId: '',
  },
  currencyOptions: {
    formation: 'en-US',
    fractions: 2,
  },
  messages: {
    closed_message: '',
    not_accepting_orders_message: '',
  },
  orders: {
    accept_orders: true,
    allowScheduleOrder: false,
    maxDays: 30,
    deliveredOrderTime: 30,
  },
  operating_hours: {
    auto_close: false,
    schedule: [
      { day: 'Monday', open_time: '09:00', close_time: '17:00', is_closed: false },
      { day: 'Tuesday', open_time: '09:00', close_time: '17:00', is_closed: false },
      { day: 'Wednesday', open_time: '09:00', close_time: '17:00', is_closed: false },
      { day: 'Thursday', open_time: '09:00', close_time: '17:00', is_closed: false },
      { day: 'Friday', open_time: '09:00', close_time: '17:00', is_closed: false },
      { day: 'Saturday', open_time: '10:00', close_time: '16:00', is_closed: false },
      { day: 'Sunday', open_time: '10:00', close_time: '16:00', is_closed: false },
    ],
  },
  delivery: {
    enabled: true,
    radius: 10,
    fee: 5,
    min_order: 0,
    zones: [],
  },
  fees: {
    service_fee: 0,
    tip_options: [5, 10, 15, 20],
  },
  taxes: {
    sales_tax: 0,
  },

  server_info: {
    phpVersion: null,
    phpMaxExecutionTime: null,
    phpMaxInputVars: null,
    maxUploadSize: null,
    upload_max_filesize: 10240, // 10MB in KB
  },
  heroSlides: [] as any[],
  offerCards: [] as any[],
  siteLink: '',
  enableReviewPopup: false,
  nmiPublicKey: '',
  nmiPrivateKey: '',
  authorizeNetPublicKey: '',
  authorizeNetApiLoginId: '',
  authorizeNetTransactionKey: '',
  authorizeNetMode: 'ui',
  useCashOnDelivery: false,
  paymentGateway: [],
  defaultPaymentGateway: '',
  useEnableGateway: true,
  showMenuSection: true,
  primary_color: '#5C9963',
  secondary_color: '#2F3E30',
});

function sanitizeSettingsOptions(options: Record<string, any>) {
  const sanitizedOptions = { ...options };

  for (const field of LEGACY_THEME_COLOR_FIELDS) {
    delete sanitizedOptions[field];
  }

  if (Object.prototype.hasOwnProperty.call(sanitizedOptions, 'termsPage')) {
    sanitizedOptions.termsPage = normalizeTermsPage(sanitizedOptions.termsPage);
    sanitizedOptions.enableTerms =
      Boolean(sanitizedOptions.termsPage.title) ||
      hasVisibleRichTextContent(sanitizedOptions.termsPage.body);
  }

  return sanitizedOptions;
}

export class SettingsController {
  // Get settings - loads from BusinessSettings for the single business (get-or-create)
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    const { language } = req.query;
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return sendSuccess(res, 'Settings retrieved successfully', {
        id: '1',
        options: getDefaultOptions(),
        language: language || 'en',
        translated_languages: ['en'],
      });
    }

    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const getOrCreateUseCase = new GetOrCreateDefaultBusinessUseCase(
      businessRepository,
      businessSettingsRepository
    );
    const business = await getOrCreateUseCase.execute(userId);
    const defaultOptions = getDefaultOptions();

    const settings = await businessSettingsRepository.findByBusinessId(business.id);
    if (!settings) {
      return sendSuccess(res, 'Settings retrieved successfully', {
        id: '1',
        options: defaultOptions,
        language: language || 'en',
        translated_languages: ['en'],
      });
    }
    const { id: _sid, business: _b, created_at: _c, updated_at: _u, ...rest } = settings as any;
    const options = {
      ...defaultOptions,
      ...rest,
      termsPage: normalizeTermsPage((rest as any).termsPage),
      enableTerms:
        settings.enableTerms ??
        (Boolean((settings.termsPage as any)?.title) ||
          hasVisibleRichTextContent((settings.termsPage as any)?.body)),
      heroSlides: settings.heroSlides ?? defaultOptions.heroSlides,
      offerCards: settings.offerCards ?? defaultOptions.offerCards,
      server_info: defaultOptions.server_info,
    };

    return sendSuccess(res, 'Settings retrieved successfully', {
      id: settings?.id ?? '1',
      options,
      language: language || 'en',
      translated_languages: ['en'],
    });
  });

  // Update settings - persists to BusinessSettings for the single business (get-or-create)
  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) {
      return sendSuccess(res, 'Settings updated successfully', {
        id: '1',
        options: req.body,
      });
    }

    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const getOrCreateUseCase = new GetOrCreateDefaultBusinessUseCase(
      businessRepository,
      businessSettingsRepository
    );
    const business = await getOrCreateUseCase.execute(userId);

    const settingsData = sanitizeSettingsOptions(
      req.body.options ? req.body.options : req.body,
    );

    const existing = await businessSettingsRepository.findByBusinessId(business.id);
    if (!existing) {
      const created = await businessSettingsRepository.create({
        business: business.id,
        ...settingsData,
      });
      return sendSuccess(res, 'Settings updated successfully', {
        id: created.id,
        options: {
          ...getDefaultOptions(),
          ...settingsData,
          termsPage: normalizeTermsPage((created as any).termsPage),
          enableTerms:
            created.enableTerms ??
            (Boolean((created.termsPage as any)?.title) ||
              hasVisibleRichTextContent((created.termsPage as any)?.body)),
          heroSlides: created.heroSlides ?? settingsData.heroSlides,
          offerCards: created.offerCards ?? settingsData.offerCards,
        },
      });
    }

    const updated = await businessSettingsRepository.update(business.id, settingsData);
    const defaultOptions = getDefaultOptions();
    const {
      id: _uid,
      business: _ub,
      created_at: _uc,
      updated_at: _uu,
      ...updatedRest
    } = updated as any;
    const options = {
      ...defaultOptions,
      ...updatedRest,
      termsPage: normalizeTermsPage((updatedRest as any).termsPage),
      enableTerms:
        updated.enableTerms ??
        (Boolean((updated.termsPage as any)?.title) ||
          hasVisibleRichTextContent((updated.termsPage as any)?.body)),
      heroSlides: updated.heroSlides ?? defaultOptions.heroSlides,
      offerCards: updated.offerCards ?? defaultOptions.offerCards,
      server_info: defaultOptions.server_info,
    };

    return sendSuccess(res, 'Settings updated successfully', {
      id: updated.id,
      options,
    });
  });
}
