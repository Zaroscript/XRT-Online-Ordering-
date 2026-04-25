import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { GetOrCreateDefaultBusinessUseCase } from '../../domain/usecases/businesses/GetOrCreateDefaultBusinessUseCase';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import { CategoryModel } from '../../infrastructure/database/models/CategoryModel';
import {
  DEFAULT_OPERATIONS_SETTINGS,
  normalizeOperationsSettings,
  resolveOperationsState,
} from '../../shared/utils/operations';

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
const DEFAULT_SEO_LOCALE = 'en';
const DEFAULT_SOCIAL_CARD_TYPE = 'summary_large_image';

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

type SeoLocaleSettings = {
  locale: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  shareTitle: string;
  shareDescription: string;
  shareImage: any;
  canonicalUrl: string;
  noindex: boolean;
  score: number;
  customized: boolean;
  updatedAt?: string;
  ogTitle: string;
  ogDescription: string;
  twitterCardType: string;
};

type SeoContext = {
  businessName: string;
  businessDescription: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  websiteUrl: string;
  hoursLabel: string;
  logo: any;
  favicon: any;
  heroImage: any;
  socialLinks: string[];
  menuCategories: string[];
};

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function getAttachmentUrl(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value?.original === 'string') return value.original.trim();
  if (typeof value?.thumbnail === 'string') return value.thumbnail.trim();
  if (typeof value?.url === 'string') return value.url.trim();
  return '';
}

function ensureHttpUrl(value: string): string {
  const input = cleanText(value);
  if (!input) return '';
  const withScheme = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const parsed = new URL(withScheme);
    if (!/^https?:$/i.test(parsed.protocol)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    const normalized = cleanText(value).toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(cleanText(value));
  });
  return result;
}

function keywordsFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(value.map((v) => cleanText(v)).filter(Boolean));
  }
  if (typeof value === 'string') {
    return uniqueStrings(value.split(',').map((v) => cleanText(v)).filter(Boolean));
  }
  return [];
}

function buildSlug(value: string): string {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildHoursLabel(schedule: any): string {
  if (!Array.isArray(schedule) || !schedule.length) return '';
  const openDays = schedule.filter((entry) => !entry?.is_closed);
  if (!openDays.length) return 'Closed';
  const first = openDays[0];
  if (openDays.length === 7) return `Daily ${first.open_time || ''} - ${first.close_time || ''}`.trim();
  return `${openDays.length} days/week`;
}

function defaultSeoLocaleSettings(): SeoLocaleSettings {
  return {
    locale: DEFAULT_SEO_LOCALE,
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    slug: '',
    shareTitle: '',
    shareDescription: '',
    shareImage: null,
    canonicalUrl: '',
    noindex: false,
    score: 0,
    customized: false,
    updatedAt: undefined,
    ogTitle: '',
    ogDescription: '',
    twitterCardType: DEFAULT_SOCIAL_CARD_TYPE,
  };
}

function scoreSeo(settings: SeoLocaleSettings, context: SeoContext): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 0;

  const titleLength = cleanText(settings.metaTitle).length;
  const descriptionLength = cleanText(settings.metaDescription).length;

  if (titleLength > 0) score += 20;
  else warnings.push('Missing meta title.');

  if (descriptionLength > 0) score += 20;
  else warnings.push('Missing meta description.');

  if (settings.keywords.length > 0) score += 15;
  else warnings.push('Add at least one keyword.');

  if (getAttachmentUrl(settings.shareImage)) score += 15;
  else warnings.push('Missing social share image.');

  if (cleanText(context.phone)) score += 10;
  else warnings.push('Business phone is missing in source settings.');

  const hasAddress = Boolean(cleanText(context.city) || cleanText(context.state) || cleanText(context.country));
  if (hasAddress) score += 10;
  else warnings.push('Business address is missing in source settings.');

  let qualityLengthPoints = 0;
  if (titleLength >= 30 && titleLength <= 60) qualityLengthPoints += 5;
  else if (titleLength > 0) warnings.push('Meta title length should be between 30 and 60 characters.');
  if (descriptionLength >= 70 && descriptionLength <= 160) qualityLengthPoints += 5;
  else if (descriptionLength > 0) warnings.push('Meta description length should be between 70 and 160 characters.');
  score += qualityLengthPoints;

  return {
    score: Math.max(0, Math.min(100, score)),
    warnings,
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
  operationsSettings: {
    ...DEFAULT_OPERATIONS_SETTINGS,
    updatedAt: new Date().toISOString(),
  },
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
  favicon: null,
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
  seoSettings: {},
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

  const operationsResolved = resolveOperationsState({
    operationsSettings: sanitizedOptions.operationsSettings,
    isUnderMaintenance: sanitizedOptions.isUnderMaintenance,
    orders: sanitizedOptions.orders,
    operating_hours: sanitizedOptions.operating_hours,
  });

  sanitizedOptions.operationsSettings = {
    ...normalizeOperationsSettings({
      operationsSettings: sanitizedOptions.operationsSettings,
      isUnderMaintenance: sanitizedOptions.isUnderMaintenance,
      orders: sanitizedOptions.orders,
    }),
    updatedAt: new Date().toISOString(),
  };
  sanitizedOptions.isUnderMaintenance = operationsResolved.isUnderMaintenance;
  sanitizedOptions.orders = {
    ...(sanitizedOptions.orders ?? {}),
    accept_orders: operationsResolved.accept_orders,
    allowScheduleOrder: operationsResolved.allowScheduleOrder,
  };

  return sanitizedOptions;
}

export class SettingsController {
  private async getBusinessAndSettings(userId?: string) {
    if (!userId) {
      return {
        business: null,
        settings: null,
        categories: [] as string[],
      };
    }

    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const getOrCreateUseCase = new GetOrCreateDefaultBusinessUseCase(
      businessRepository,
      businessSettingsRepository
    );
    const business = await getOrCreateUseCase.execute(userId);
    const settings = await businessSettingsRepository.findByBusinessId(business.id);
    const categoryDocs = await CategoryModel.find({
      business_id: { $in: [business.id, business.business_id] },
      is_active: { $ne: false },
    })
      .select('name')
      .lean();

    return {
      business,
      settings,
      categories: uniqueStrings(categoryDocs.map((category: any) => cleanText(category?.name)).filter(Boolean)),
    };
  }

  private buildSeoContext(business: any, settings: any, categories: string[]): SeoContext {
    const contactLocation = settings?.contactDetails?.location ?? {};
    const socialLinksFromSettings = Array.isArray(settings?.contactDetails?.socials)
      ? settings.contactDetails.socials.map((social: any) => cleanText(social?.url)).filter(Boolean)
      : [];
    const socialLinksFromBusiness = business?.social_media
      ? Object.values(business.social_media).map((value) => cleanText(value)).filter(Boolean)
      : [];

    return {
      businessName: cleanText(settings?.siteTitle) || cleanText(business?.name) || 'Restaurant',
      businessDescription:
        cleanText(settings?.siteSubtitle) || cleanText(business?.description) || 'Fresh meals and fast delivery.',
      city: cleanText(contactLocation?.city) || cleanText(business?.address?.city),
      state: cleanText(contactLocation?.state) || cleanText(business?.address?.state),
      country: cleanText(contactLocation?.country) || cleanText(business?.address?.country),
      phone: cleanText(settings?.contactDetails?.contact) || cleanText(business?.primary_content_phone),
      email: cleanText(settings?.contactDetails?.emailAddress) || cleanText(business?.primary_content_email),
      websiteUrl:
        ensureHttpUrl(cleanText(settings?.contactDetails?.website)) ||
        ensureHttpUrl(cleanText(settings?.siteLink)) ||
        ensureHttpUrl(cleanText(business?.website)),
      hoursLabel: buildHoursLabel(settings?.operating_hours?.schedule),
      logo: settings?.logo ?? null,
      favicon: settings?.favicon ?? null,
      heroImage: settings?.heroSlides?.[0]?.bgImage ?? null,
      socialLinks: uniqueStrings([...socialLinksFromSettings, ...socialLinksFromBusiness]),
      menuCategories: categories,
    };
  }

  private generateSeoDefaults(context: SeoContext): Partial<SeoLocaleSettings> {
    const locationText = context.city || context.state || context.country || 'your area';
    const metaTitle = `${context.businessName} | Best Food in ${locationText}`;
    const metaDescription = `Order fresh food from ${context.businessName} in ${locationText}. Fast delivery and quality meals.`;
    const keywordSeeds = [
      context.businessName,
      context.city,
      context.state,
      context.country,
      'restaurant',
      'online ordering',
      ...context.menuCategories,
    ];
    const keywords = uniqueStrings(keywordSeeds.filter(Boolean)).slice(0, 18);
    const slug = buildSlug(`${context.businessName} ${context.city}`);
    const shareImage = context.heroImage || context.logo || context.favicon || null;
    const canonicalUrl = context.websiteUrl
      ? ensureHttpUrl(`${context.websiteUrl.replace(/\/+$/, '')}/${slug}`.replace(/\/$/, ''))
      : '';

    return {
      metaTitle,
      metaDescription,
      keywords,
      slug,
      shareTitle: metaTitle,
      shareDescription: metaDescription,
      shareImage,
      canonicalUrl,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      twitterCardType: DEFAULT_SOCIAL_CARD_TYPE,
    };
  }

  private resolveSeoLocaleSettings(settings: any, locale: string, context: SeoContext) {
    const normalizedLocale = cleanText(locale).toLowerCase() || DEFAULT_SEO_LOCALE;
    const defaults = defaultSeoLocaleSettings();
    const generated = this.generateSeoDefaults(context);
    const localeEntry = settings?.seoSettings?.[normalizedLocale] ?? {};
    const legacySeo = settings?.seo ?? {};

    const merged: SeoLocaleSettings = {
      ...defaults,
      ...generated,
      ...localeEntry,
      locale: normalizedLocale,
      metaTitle: cleanText(localeEntry?.metaTitle ?? legacySeo?.metaTitle ?? generated.metaTitle ?? ''),
      metaDescription: cleanText(
        localeEntry?.metaDescription ?? legacySeo?.metaDescription ?? generated.metaDescription ?? ''
      ),
      keywords: keywordsFromUnknown(
        localeEntry?.keywords ?? legacySeo?.metaTags ?? generated.keywords ?? defaults.keywords
      ),
      slug: cleanText(localeEntry?.slug ?? generated.slug ?? ''),
      shareTitle: cleanText(localeEntry?.shareTitle ?? localeEntry?.ogTitle ?? legacySeo?.ogTitle ?? generated.metaTitle ?? ''),
      shareDescription: cleanText(
        localeEntry?.shareDescription ??
          localeEntry?.ogDescription ??
          legacySeo?.ogDescription ??
          generated.metaDescription ??
          ''
      ),
      shareImage:
        localeEntry?.shareImage ??
        localeEntry?.ogImage ??
        legacySeo?.ogImage ??
        generated.shareImage ??
        null,
      canonicalUrl: ensureHttpUrl(
        localeEntry?.canonicalUrl ?? legacySeo?.canonicalUrl ?? generated.canonicalUrl ?? ''
      ),
      noindex: Boolean(localeEntry?.noindex ?? defaults.noindex),
      customized: Boolean(localeEntry?.customized),
      updatedAt:
        typeof localeEntry?.updatedAt === 'string'
          ? localeEntry.updatedAt
          : localeEntry?.updatedAt instanceof Date
            ? localeEntry.updatedAt.toISOString()
            : undefined,
      ogTitle: cleanText(localeEntry?.ogTitle ?? localeEntry?.shareTitle ?? legacySeo?.ogTitle ?? generated.metaTitle ?? ''),
      ogDescription: cleanText(
        localeEntry?.ogDescription ??
          localeEntry?.shareDescription ??
          legacySeo?.ogDescription ??
          generated.metaDescription ??
          ''
      ),
      twitterCardType: cleanText(localeEntry?.twitterCardType ?? legacySeo?.twitterCardType) || DEFAULT_SOCIAL_CARD_TYPE,
      score: 0,
    };

    if (!merged.canonicalUrl && context.websiteUrl) {
      merged.canonicalUrl = ensureHttpUrl(
        `${context.websiteUrl.replace(/\/+$/, '')}/${merged.slug || generated.slug || ''}`.replace(/\/$/, '')
      );
    }
    if (!merged.shareImage) {
      merged.shareImage = context.heroImage || context.logo || context.favicon || null;
    }
    if (!merged.shareTitle) merged.shareTitle = merged.metaTitle;
    if (!merged.shareDescription) merged.shareDescription = merged.metaDescription;
    if (!merged.ogTitle) merged.ogTitle = merged.shareTitle;
    if (!merged.ogDescription) merged.ogDescription = merged.shareDescription;
    if (!merged.slug) merged.slug = buildSlug(`${context.businessName} ${context.city}`);

    const { score, warnings } = scoreSeo(merged, context);
    merged.score = score;
    return { seoSettings: merged, warnings };
  }

  private sanitizeIncomingSeo(input: Record<string, any>) {
    return {
      metaTitle: cleanText(input?.metaTitle),
      metaDescription: cleanText(input?.metaDescription),
      keywords: keywordsFromUnknown(input?.keywords),
      slug: buildSlug(cleanText(input?.slug)),
      shareTitle: cleanText(input?.shareTitle),
      shareDescription: cleanText(input?.shareDescription),
      shareImage: input?.shareImage ?? null,
      canonicalUrl: ensureHttpUrl(cleanText(input?.canonicalUrl)),
      noindex: Boolean(input?.noindex),
      ogTitle: cleanText(input?.ogTitle),
      ogDescription: cleanText(input?.ogDescription),
      twitterCardType: cleanText(input?.twitterCardType) || DEFAULT_SOCIAL_CARD_TYPE,
    };
  }

  private async upsertSeoSettings(
    userId: string,
    locale: string,
    seoSettings: SeoLocaleSettings,
  ) {
    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const getOrCreateUseCase = new GetOrCreateDefaultBusinessUseCase(
      businessRepository,
      businessSettingsRepository
    );
    const business = await getOrCreateUseCase.execute(userId);
    const existing = await businessSettingsRepository.findByBusinessId(business.id);
    const currentSeoSettingsMap = { ...(existing?.seoSettings ?? {}) };

    currentSeoSettingsMap[locale] = {
      ...seoSettings,
      locale,
      updatedAt: new Date().toISOString(),
    };

    const legacySeo = {
      metaTitle: seoSettings.metaTitle,
      metaDescription: seoSettings.metaDescription,
      ogTitle: seoSettings.ogTitle || seoSettings.shareTitle,
      ogDescription: seoSettings.ogDescription || seoSettings.shareDescription,
      ogImage: seoSettings.shareImage,
      twitterHandle: existing?.seo?.twitterHandle ?? '',
      twitterCardType: seoSettings.twitterCardType || DEFAULT_SOCIAL_CARD_TYPE,
      metaTags: seoSettings.keywords.join(', '),
      canonicalUrl: seoSettings.canonicalUrl,
    };

    if (!existing) {
      return businessSettingsRepository.create({
        business: business.id,
        seo: legacySeo,
        seoSettings: currentSeoSettingsMap,
      });
    }

    return businessSettingsRepository.update(business.id, {
      seo: legacySeo,
      seoSettings: currentSeoSettingsMap,
    });
  }

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
      operationsSettings: normalizeOperationsSettings({
        operationsSettings: (rest as any).operationsSettings,
        isUnderMaintenance: (rest as any).isUnderMaintenance,
        orders: (rest as any).orders,
      }),
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
          operationsSettings: normalizeOperationsSettings({
            operationsSettings: (created as any).operationsSettings,
            isUnderMaintenance: (created as any).isUnderMaintenance,
            orders: (created as any).orders,
          }),
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
      operationsSettings: normalizeOperationsSettings({
        operationsSettings: (updatedRest as any).operationsSettings,
        isUnderMaintenance: (updatedRest as any).isUnderMaintenance,
        orders: (updatedRest as any).orders,
      }),
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

  getSeoSettings = asyncHandler(async (req: Request, res: Response) => {
    const locale = String(req.query.locale || DEFAULT_SEO_LOCALE);
    const userId = (req as AuthRequest).user?.id;
    const { business, settings, categories } = await this.getBusinessAndSettings(userId);
    const context = this.buildSeoContext(business, settings ?? getDefaultOptions(), categories);
    const { seoSettings, warnings } = this.resolveSeoLocaleSettings(settings ?? {}, locale, context);

    return sendSuccess(res, 'SEO settings retrieved successfully', {
      locale: seoSettings.locale,
      seoSettings,
      warnings,
      sources: context,
    });
  });

  updateSeoSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id;
    const locale = cleanText(req.body?.locale || req.query?.locale || DEFAULT_SEO_LOCALE).toLowerCase() || DEFAULT_SEO_LOCALE;
    const incomingRaw = req.body?.seoSettings ?? req.body ?? {};
    const { business, settings, categories } = await this.getBusinessAndSettings(userId);
    const context = this.buildSeoContext(business, settings ?? getDefaultOptions(), categories);
    const resolved = this.resolveSeoLocaleSettings(settings ?? {}, locale, context);
    const sanitizedIncoming = this.sanitizeIncomingSeo(incomingRaw);

    const merged: SeoLocaleSettings = {
      ...resolved.seoSettings,
      ...sanitizedIncoming,
      keywords: sanitizedIncoming.keywords?.length ? sanitizedIncoming.keywords : resolved.seoSettings.keywords,
      customized: true,
      locale,
    };
    const { score, warnings } = scoreSeo(merged, context);
    merged.score = score;
    merged.updatedAt = new Date().toISOString();

    if (userId) {
      await this.upsertSeoSettings(userId, locale, merged);
    }

    return sendSuccess(res, 'SEO settings updated successfully', {
      locale,
      seoSettings: merged,
      warnings,
      sources: context,
    });
  });

  generateSeoSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.id;
    const locale = cleanText(req.body?.locale || req.query?.locale || DEFAULT_SEO_LOCALE).toLowerCase() || DEFAULT_SEO_LOCALE;
    const force = Boolean(req.body?.force);
    const { business, settings, categories } = await this.getBusinessAndSettings(userId);
    const context = this.buildSeoContext(business, settings ?? getDefaultOptions(), categories);
    const resolved = this.resolveSeoLocaleSettings(settings ?? {}, locale, context);
    const generated = this.generateSeoDefaults(context);

    const nextSettings: SeoLocaleSettings = {
      ...resolved.seoSettings,
      metaTitle: force || !resolved.seoSettings.metaTitle ? cleanText(generated.metaTitle) : resolved.seoSettings.metaTitle,
      metaDescription:
        force || !resolved.seoSettings.metaDescription
          ? cleanText(generated.metaDescription)
          : resolved.seoSettings.metaDescription,
      keywords:
        force || !resolved.seoSettings.keywords.length
          ? keywordsFromUnknown(generated.keywords)
          : resolved.seoSettings.keywords,
      slug: force || !resolved.seoSettings.slug ? cleanText(generated.slug) : resolved.seoSettings.slug,
      shareTitle: force || !resolved.seoSettings.shareTitle ? cleanText(generated.shareTitle) : resolved.seoSettings.shareTitle,
      shareDescription:
        force || !resolved.seoSettings.shareDescription
          ? cleanText(generated.shareDescription)
          : resolved.seoSettings.shareDescription,
      shareImage: force || !resolved.seoSettings.shareImage ? generated.shareImage : resolved.seoSettings.shareImage,
      canonicalUrl:
        force || !resolved.seoSettings.canonicalUrl
          ? ensureHttpUrl(cleanText(generated.canonicalUrl ?? ''))
          : resolved.seoSettings.canonicalUrl,
      ogTitle: force || !resolved.seoSettings.ogTitle ? cleanText(generated.ogTitle) : resolved.seoSettings.ogTitle,
      ogDescription:
        force || !resolved.seoSettings.ogDescription
          ? cleanText(generated.ogDescription)
          : resolved.seoSettings.ogDescription,
      twitterCardType: resolved.seoSettings.twitterCardType || DEFAULT_SOCIAL_CARD_TYPE,
      noindex: false,
      customized: false,
      locale,
      updatedAt: new Date().toISOString(),
      score: 0,
    };

    const { score, warnings } = scoreSeo(nextSettings, context);
    nextSettings.score = score;

    if (userId) {
      await this.upsertSeoSettings(userId, locale, nextSettings);
    }

    return sendSuccess(res, 'SEO settings generated successfully', {
      locale,
      seoSettings: nextSettings,
      warnings,
      sources: context,
    });
  });

  getSeoHealthScore = asyncHandler(async (req: Request, res: Response) => {
    const locale = String(req.query.locale || DEFAULT_SEO_LOCALE);
    const userId = (req as AuthRequest).user?.id;
    const { business, settings, categories } = await this.getBusinessAndSettings(userId);
    const context = this.buildSeoContext(business, settings ?? getDefaultOptions(), categories);
    const { seoSettings, warnings } = this.resolveSeoLocaleSettings(settings ?? {}, locale, context);

    return sendSuccess(res, 'SEO health score retrieved successfully', {
      locale: seoSettings.locale,
      score: seoSettings.score,
      warnings,
    });
  });
}
