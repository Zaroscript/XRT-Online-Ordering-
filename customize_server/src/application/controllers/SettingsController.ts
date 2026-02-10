import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { GetOrCreateDefaultBusinessUseCase } from '../../domain/usecases/businesses/GetOrCreateDefaultBusinessUseCase';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';

const getDefaultOptions = () => ({
  siteTitle: 'XRT Online Ordering',
  siteSubtitle: 'Enterprise Ordering System',
  currency: 'USD',
  useOtp: false,
  useAi: false,
  guestCheckout: true,
  freeShipping: false,
  freeShippingAmount: 0,
  minimumOrderAmount: 0,
  currencyToWalletRatio: 1,
  signupPoints: 0,
  maxShopDistance: 10,
  maximumQuestionLimit: 5,
  isProductReview: true,
  enableTerms: false,
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
  },
  fees: {
    service_fee: 0,
    tip_options: [5, 10, 15, 20],
  },
  taxes: {
    sales_tax: 0,
  },
  timezone: 'America/New_York',
  server_info: {
    phpVersion: null,
    phpMaxExecutionTime: null,
    phpMaxInputVars: null,
    maxUploadSize: null,
    upload_max_filesize: null,
  },
  heroSlides: [] as any[],
});

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
      heroSlides: settings.heroSlides ?? defaultOptions.heroSlides,
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

    const settingsData = req.body.options ? req.body.options : req.body;

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
          heroSlides: created.heroSlides ?? settingsData.heroSlides,
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
      heroSlides: updated.heroSlides ?? defaultOptions.heroSlides,
    };

    return sendSuccess(res, 'Settings updated successfully', {
      id: updated.id,
      options,
    });
  });
}
