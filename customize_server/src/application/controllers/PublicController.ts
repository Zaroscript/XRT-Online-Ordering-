import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';
import { AuthRequest } from '../middlewares/auth';
import { env } from '../../shared/config/env';
import { APIContracts, APIControllers, Constants as AuthNetConstants } from 'authorizenet';
import { CustomerRepository } from '../../infrastructure/repositories/CustomerRepository';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { CreateOrderUseCase } from '../../domain/usecases/order/CreateOrderUseCase';
import { TransactionRepository } from '../../infrastructure/repositories/TransactionRepository';
import { CouponRepository } from '../../infrastructure/repositories/CouponRepository';

function getBaseUrl(req: Request): string {
  const fromEnv = (env as any).PUBLIC_ORIGIN;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '');
  }
  return `${req.protocol}://${req.get('host') || `localhost:${process.env.PORT || 3001}`}`.replace(
    /\/$/,
    ''
  );
}

/** Rewrite relative or localhost image URLs to the public API origin so disk uploads and frontends load correctly. */
function imageUrlForRequest(url: string | undefined, req: Request): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  const baseUrl = getBaseUrl(req);
  if (trimmed.startsWith('/')) return `${baseUrl}${trimmed}`;
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${baseUrl}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // not a valid URL
  }
  return trimmed;
}

/** Default when no settings in DB. Hero slides = admin Settings > Hero Slider. */
function getDefaultPublicSiteSettings() {
  return {
    heroSlides: [] as Array<{
      bgImage?: { id?: string; original?: string; thumbnail?: string };
      title?: string;
      subtitle?: string;
      btnText?: string;
      btnLink?: string;
    }>,
    siteTitle: 'XRT Online Ordering',
    siteSubtitle: '',
    logo: null as any,
    collapseLogo: null as any,
    promoPopup: null as any,
    seo: {
      metaTitle: '',
      metaDescription: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: null as any,
      twitterHandle: '',
      twitterCardType: 'summary_large_image',
      metaTags: '',
      canonicalUrl: '',
    },
    isUnderMaintenance: false,
    maintenance: null as any,
  };
}

export class PublicController {
  getSiteSettings = asyncHandler(async (req: Request, res: Response) => {
    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();

    const business = await businessRepository.findOne();
    if (!business) {
      const defaults = getDefaultPublicSiteSettings();
      return sendSuccess(res, 'Site settings retrieved', defaults);
    }

    const settings = await businessSettingsRepository.findByBusinessId(business.id);
    if (!settings) {
      const defaults = getDefaultPublicSiteSettings();
      return sendSuccess(res, 'Site settings retrieved', defaults);
    }

    const rawSlides = settings.heroSlides ?? [];
    const heroSlides = rawSlides.map((slide: any) => {
      const bg = slide?.bgImage;
      const url =
        typeof bg === 'string'
          ? bg
          : ((bg && (typeof bg === 'object' ? (bg.original ?? bg.thumbnail) : undefined)) ?? '');
      const normalized = imageUrlForRequest(url, req);
      return {
        title: slide?.title ?? '',
        subtitle: slide?.subtitle ?? '',
        subtitleTwo: slide?.subtitleTwo ?? '',
        btnText: slide?.btnText ?? '',
        btnLink: slide?.btnLink ?? '',
        offer: slide?.offer ?? '',
        bgImage: normalized ? { original: normalized, thumbnail: normalized } : {},
      };
    });

    const logo = settings.logo;
    const logoNormalized =
      logo && typeof logo === 'object' && logo.original
        ? {
            ...logo,
            original: imageUrlForRequest(logo.original, req),
            thumbnail:
              imageUrlForRequest((logo as any).thumbnail, req) ||
              imageUrlForRequest(logo.original, req),
          }
        : logo;

    const collapseLogoRaw = (settings as any).collapseLogo;
    const collapseLogoNormalized =
      collapseLogoRaw && typeof collapseLogoRaw === 'object' && collapseLogoRaw.original
        ? {
            ...collapseLogoRaw,
            original: imageUrlForRequest(collapseLogoRaw.original, req),
            thumbnail:
              imageUrlForRequest(collapseLogoRaw.thumbnail, req) ||
              imageUrlForRequest(collapseLogoRaw.original, req),
          }
        : collapseLogoRaw;
    const promoPopup = settings.promoPopup;
    const promoPopupNormalized =
      promoPopup && typeof promoPopup === 'object' && (promoPopup as any).image?.original
        ? {
            ...promoPopup,
            image: {
              ...(promoPopup as any).image,
              original: imageUrlForRequest((promoPopup as any).image?.original, req),
              thumbnail:
                imageUrlForRequest((promoPopup as any).image?.thumbnail, req) ||
                imageUrlForRequest((promoPopup as any).image?.original, req),
            },
          }
        : promoPopup;

    // Restaurant location/address: prefer Business model (GeoJSON), fallback to BusinessSettings.contactDetails.location
    const contactDetailsFromSettings = settings.contactDetails ?? null;
    const contactDetails = (() => {
      const base =
        contactDetailsFromSettings && typeof contactDetailsFromSettings === 'object'
          ? { ...contactDetailsFromSettings }
          : ({} as Record<string, unknown>);
      // 1) Business.location is GeoJSON Point: coordinates = [longitude, latitude]
      const businessCoords = (business as any).location?.coordinates;
      if (Array.isArray(businessCoords) && businessCoords.length >= 2) {
        base.location = { lat: Number(businessCoords[1]), lng: Number(businessCoords[0]) };
      } else {
        // 2) Use BusinessSettings.contactDetails.location (e.g. from admin map: { lat, lng } or coordinates)
        const loc =
          contactDetailsFromSettings && typeof contactDetailsFromSettings === 'object'
            ? (contactDetailsFromSettings as any).location
            : undefined;
        if (loc && typeof loc === 'object') {
          const lat = Number(loc.lat);
          const lng = Number(loc.lng);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            base.location = { lat, lng };
          } else if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
            base.location = { lat: Number(loc.coordinates[1]), lng: Number(loc.coordinates[0]) };
          }
        }
      }
      // Business.address for restaurant address string (map popup / display)
      const addr = (business as any).address;
      if (addr && typeof addr === 'object') {
        const parts = [
          addr.street,
          [addr.city, addr.state].filter(Boolean).join(', '),
          addr.zipCode,
          addr.country,
        ].filter(Boolean);
        (base as any).address = addr;
        (base as any).formattedAddress = parts.join(', ');
      }
      return Object.keys(base).length ? base : null;
    })();

    const seoRaw = settings.seo ?? ({} as Record<string, unknown>);
    const ogImg = (seoRaw as any).ogImage;
    const ogImageNormalized =
      ogImg && typeof ogImg === 'object' && (ogImg as any).original
        ? {
            ...ogImg,
            original: imageUrlForRequest((ogImg as any).original, req),
            thumbnail:
              imageUrlForRequest((ogImg as any).thumbnail, req) ||
              imageUrlForRequest((ogImg as any).original, req),
          }
        : ogImg ?? null;

    const maint = settings.maintenance as any;
    const maintenanceNormalized =
      maint && typeof maint === 'object'
        ? {
            ...maint,
            image:
              maint.image?.original
                ? {
                    ...maint.image,
                    original: imageUrlForRequest(maint.image.original, req),
                    thumbnail:
                      imageUrlForRequest(maint.image.thumbnail, req) ||
                      imageUrlForRequest(maint.image.original, req),
                  }
                : maint.image,
          }
        : maint ?? null;

    const publicSettings = {
      heroSlides,
      siteTitle: settings.siteTitle ?? 'XRT Online Ordering',
      siteSubtitle: settings.siteSubtitle ?? '',
      logo: logoNormalized ?? null,
      collapseLogo: collapseLogoNormalized ?? null,
      promoPopup: promoPopupNormalized ?? null,
      contactDetails,
      footer_text: settings.footer_text ?? '',
      copyrightText: settings.copyrightText ?? 'Powered by XRT',
      orders: settings.orders ?? null,
      messages: settings.messages ?? null,
      operating_hours: settings.operating_hours ?? null,
      siteLink: settings.siteLink ?? '',
      timezone: settings.timezone ?? 'America/New_York',
      currency: settings.currency ?? 'USD',
      currencyOptions: settings.currencyOptions ?? {
        formation: 'standard',
        fractions: 2,
      },
      fees: settings.fees ?? { service_fee: 0, tip_options: [10, 15, 20, 25] },
      taxes: settings.taxes ?? { sales_tax: 0 },
      delivery: (() => {
        const d = settings.delivery ?? { enabled: false, radius: 0, fee: 0, min_order: 0 };
        return { ...d, zones: d.zones ?? [] };
      })(),
      isProductReview: settings.isProductReview ?? false,
      enableTerms: settings.enableTerms ?? false,
      enableCoupons: settings.enableCoupons ?? false,
      enableEmailForDigitalProduct: settings.enableEmailForDigitalProduct ?? false,
      enableReviewPopup: settings.enableReviewPopup ?? false,
      reviewSystem: settings.reviewSystem ?? 'review_single_time',
      maxShopDistance: settings.maxShopDistance ?? 0,
      nmiPublicKey: settings.nmiPublicKey ?? null,
      authorizeNetPublicKey: settings.authorizeNetPublicKey ?? null,
      authorizeNetApiLoginId: settings.authorizeNetApiLoginId ?? null,
      authorizeNetMode: settings.authorizeNetMode ?? 'ui',
      seo: {
        metaTitle: (seoRaw as any).metaTitle ?? '',
        metaDescription: (seoRaw as any).metaDescription ?? '',
        ogTitle: (seoRaw as any).ogTitle ?? '',
        ogDescription: (seoRaw as any).ogDescription ?? '',
        ogImage: ogImageNormalized,
        twitterHandle: (seoRaw as any).twitterHandle ?? '',
        twitterCardType: (seoRaw as any).twitterCardType ?? 'summary_large_image',
        metaTags: (seoRaw as any).metaTags ?? '',
        canonicalUrl: (seoRaw as any).canonicalUrl ?? '',
      },
      isUnderMaintenance: settings.isUnderMaintenance ?? false,
      maintenance: maintenanceNormalized,
    };

    return sendSuccess(res, 'Site settings retrieved', publicSettings);
  });

  verifyCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const couponRepository = new CouponRepository();
    const coupon = await couponRepository.verify(code);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    const now = new Date();
    const activeFrom = new Date(coupon.active_from);
    const expireAt = new Date(coupon.expire_at);

    if (now < activeFrom || now > expireAt) {
      return res.status(400).json({ success: false, message: 'Coupon is not active at this time' });
    }

    if (
      coupon.max_conversions !== null &&
      coupon.max_conversions !== undefined &&
      coupon.orders &&
      coupon.orders.length >= coupon.max_conversions
    ) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit exceeded' });
    }

    return sendSuccess(res, 'Coupon is valid', {
      is_valid: true,
      code: coupon.code,
      type: coupon.type,
      amount: coupon.amount,
      minimum_cart_amount: coupon.minimum_cart_amount,
    });
  });

  getAuthorizeNetEnvironment = asyncHandler(async (req: Request, res: Response) => {
    const { BusinessRepository } = await import(
      '../../infrastructure/repositories/BusinessRepository'
    );
    const { BusinessSettingsRepository } = await import(
      '../../infrastructure/repositories/BusinessSettingsRepository'
    );

    const businessRepository = new BusinessRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();

    const business = await businessRepository.findOne();
    if (!business) {
      return res.status(500).json({ success: false, message: 'Business not configured' });
    }

    const settings = await businessSettingsRepository.findByBusinessId(business.id);
    const authNetApiLoginId = settings?.authorizeNetApiLoginId;
    const authNetTransactionKey = settings?.authorizeNetTransactionKey;

    if (!authNetApiLoginId || !authNetTransactionKey) {
      return res.status(500).json({ success: false, message: 'Authorize.Net is not configured' });
    }

    try {
      const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(authNetApiLoginId);
      merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

      const request = new APIContracts.AuthenticateTestRequest();
      request.setMerchantAuthentication(merchantAuthenticationType);

      const testEnv = async (envPath: string): Promise<boolean> => {
        const ctrl = new APIControllers.AuthenticateTestController(request.getJSON());
        ctrl.setEnvironment(envPath);

        return new Promise((resolve) => {
          ctrl.execute(() => {
            const apiResponse = ctrl.getResponse();
            const response = new APIContracts.AuthenticateTestResponse(apiResponse);
            if (response != null && response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
      };

      const isProd = await testEnv(AuthNetConstants.endpoint.production);
      if (isProd) {
        return sendSuccess(res, 'Environment retrieved', { environment: 'production' });
      }

      const isSandbox = await testEnv(AuthNetConstants.endpoint.sandbox);
      if (isSandbox) {
        return sendSuccess(res, 'Environment retrieved', { environment: 'sandbox' });
      }

      // If both fail, default to sandbox but note failure
      return sendSuccess(res, 'Environment retrieved', { environment: 'sandbox', warning: 'Keys invalid in both environments' });
    } catch (err: any) {
       return sendSuccess(res, 'Environment retrieved', { environment: 'sandbox', warning: err.message });
    }
  });

  getTestimonials = asyncHandler(async (_req: Request, res: Response) => {
    const { TestimonialRepository } = await import(
      '../../infrastructure/repositories/TestimonialRepository'
    );
    const testimonialRepository = new TestimonialRepository();

    // Fetch only active testimonials
    const testimonials = await testimonialRepository.findAll({ is_active: true });

    return sendSuccess(res, 'Testimonials retrieved successfully', testimonials);
  });

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { GetCategoriesUseCase } = await import(
      '../../domain/usecases/categories/GetCategoriesUseCase'
    );
    const { CategoryRepository } = await import(
      '../../infrastructure/repositories/CategoryRepository'
    );
    const { BusinessRepository } = await import(
      '../../infrastructure/repositories/BusinessRepository'
    );

    const businessRepository = new BusinessRepository();
    const categoryRepository = new CategoryRepository();
    const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

    // Get the first business (assuming single tenant for now or first one found)
    const business = await businessRepository.findOne();
    if (!business) {
      return sendSuccess(res, 'Categories retrieved successfully', []);
    }

    // Fetch active categories for this business
    // We want all active categories, so we can pass limit: 1000 or similar if pagination is default
    const filters: any = {
      business_id: business.id,
      is_active: true,
      limit: 1000,
      page: 1,
    };

    const result: any = await getCategoriesUseCase.execute(filters);

    const rawCategories = result.data || result;
    const categories = (Array.isArray(rawCategories) ? rawCategories : []).map((cat: any) => ({
      ...cat,
      image: cat?.image ? imageUrlForRequest(cat.image, req) : cat?.image,
      icon: cat?.icon ? imageUrlForRequest(cat.icon, req) : cat?.icon,
    }));

    return sendSuccess(res, 'Categories retrieved successfully', categories);
  });

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const { GetItemsUseCase } = await import('../../domain/usecases/items/GetItemsUseCase');
    const { ItemRepository } = await import('../../infrastructure/repositories/ItemRepository');
    const { BusinessRepository } = await import(
      '../../infrastructure/repositories/BusinessRepository'
    );

    const businessRepository = new BusinessRepository();
    const itemRepository = new ItemRepository();
    const getItemsUseCase = new GetItemsUseCase(itemRepository);

    const business = await businessRepository.findOne();
    if (!business) {
      return sendSuccess(res, 'Products retrieved successfully', []);
    }

    const filters: any = {
      is_active: true,
      // is_available: true, // Removed to show all active items (e.g. out of stock)
      limit: 1000, // Fetch all for now
      page: 1,
      orderBy: 'sort_order',
      sortedBy: 'asc',
    };

    // The ItemRepository filters by business implicitly via categories?
    // Wait, ItemRepository doesn't filter by business_id directly usually, it filters by category which has business_id.
    // Or we need to get categories for this business first and filter items by those categories?
    // Let's check ItemRepository.findAll. It accepts category_id.
    // UseCase just delegates to Repo.
    // Repo findAll has: if (filters.category_id) ...
    // It does NOT seem to filter by business_id directly on Items. Items have category_id.
    // Categories have business_id.
    // So to get all products for a business, we might need to find all categories for the business first,
    // OR we rely on the fact that we only expose a single business's data for now (single tenant-ish).
    // The previous `getCategories` gets business first.
    // Items don't have business_id on them directly usually? ref: ItemModel.ts
    // ItemModel does NOT have business_id. It has `category_id`.
    // So we should strictly filter by categories belonging to this business.
    // However, `ItemRepository.findAll` doesn't support list of category IDs easily?

    // Let's check if we can filter by business via data logic.
    // If I cannot filter items by business directly, maybe I should fetch all items and filter in code?
    // OR, better: `ItemModel` might not be tenant-aware directly.
    // But `check_db.js` showed items? No, I didn't check items in `check_db.js`.
    // Let's assume for now we fetch all active items.
    // If there are multiple businesses, this is a risk.
    // But `PublicController` `getCategories` fetched business specific categories.
    // If I fetch all items, I might get items from other businesses.
    // I should get all categories for the business, then find items in those categories.

    // For this implementation, I will assume I can fetch all active items and maybe filtered by the categories I find?
    // Or I can update `ItemRepository` to support `category_ids` array?
    // `ItemRepository.findAll` uses `ItemModel.find(query)`.
    // I can pass `category_id: { $in: categoryIds }`.

    // Quick fix: Get all categories for business, extract IDs, then fetch items.
    // reusing getCategories logic or repository.

    const { CategoryRepository } = await import(
      '../../infrastructure/repositories/CategoryRepository'
    );
    const categoryRepository = new CategoryRepository();
    const categories = await categoryRepository.findAll({ business_id: business.id });
    const categoryIds = categories.map((c) => c.id);

    if (categoryIds.length === 0) {
      return sendSuccess(res, 'Products retrieved successfully', []);
    }

    // Now strict filter items by these categories
    // But `ItemFilters` interface might not support array of categories.
    // Let's check `ItemFilters` in `IItemRepository`.
    // If it doesn't support it, I might need to cast or just pass it if Mongoose handles it (it usually does if I pass object to find).
    // But I'm using UseCase -> Repository.
    // `ItemRepository` constructs query: `if (filters.category_id) { query.category_id = filters.category_id; }`
    // If I pass an object `{ $in: [...] }` as `category_id`, it might work if TS allows.

    // Let's try passing it.

    filters.category_id = { $in: categoryIds }; // This might break TS if interface expects string.

    // Actually, let's look at `ItemFilters` definition. It is active in `ItemRepository.ts` imports?
    // `import { ItemFilters } from '../../domain/entities/Item';`

    // If I can't pass it easily, I might just fetch all and filter in memory (bad for perf but ok for now with small data)
    // OR I can use `ItemModel` directly here to skip the restricted Repository interface if needed?
    // But cleaner is to use Repository.

    // Let's try to bypass TS for the filter value:
    const queryFilters: any = {
      ...filters,
      category_id: { $in: categoryIds },
    };

    const result: any = await getItemsUseCase.execute(queryFilters);
    const rawProducts = result.data || result.items || result;
    const products = (Array.isArray(rawProducts) ? rawProducts : []).map((item: any) => {
      const image = item?.image;
      const imageStr =
        typeof image === 'string' ? image : (image?.original ?? image?.thumbnail ?? '');
      const absoluteImage = imageUrlForRequest(imageStr || '', req) || imageStr || item?.image;
      return { ...item, image: absoluteImage };
    });

    return sendSuccess(res, 'Products retrieved successfully', products);
  });

  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const {
      customer,
      order_type,
      service_time_type,
      schedule_time,
      money,
      delivery,
      notes,
      items,
      paymentToken,
      authNetMethod,
    } = req.body;

    // Validate required fields
    if (!customer?.phone) {
      return res.status(400).json({ success: false, message: 'Customer phone number is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }
    if (!money) {
      return res.status(400).json({ success: false, message: 'Money/payment info is required' });
    }

    // 1. Get business
    const businessRepository = new BusinessRepository();
    const business = await businessRepository.findOne();
    if (!business) {
      return res.status(500).json({ success: false, message: 'Business not configured' });
    }

    // 2. Find or create customer by phone number
    const customerRepository = new CustomerRepository();
    const customerPhone = String(customer.phone);
    let existingCustomer = await customerRepository.findByPhone(customerPhone, business.id);

    if (!existingCustomer) {
      existingCustomer = await customerRepository.create({
        business_id: business.id,
        name: customer.name || 'Guest',
        email: customer.email || `${customerPhone.replace(/\D/g, '')}@guest.local`,
        phoneNumber: customerPhone,
      });
    } else if (
      (existingCustomer.name === 'Guest' || !existingCustomer.name) &&
      customer.name &&
      customer.name !== 'Guest'
    ) {
      // Update the customer name if it was previously set to Guest
      await customerRepository.update(existingCustomer.id, { name: customer.name }, business.id);
      existingCustomer.name = customer.name;
    }

    // 3. Process NMI Payment if applicable
    let nmiTransactionId = '';
    /** Which Authorize.Net API host processed the charge (used later for refunds). */
    let authorizeNetChargeEnvironment: 'production' | 'sandbox' | undefined;
    if (money?.payment === 'nmi') {
      if (!money.paymentToken) {
        return res.status(400).json({ success: false, message: 'NMI payment token is required' });
      }

      const businessSettingsRepository = new BusinessSettingsRepository();
      const settings = await businessSettingsRepository.findByBusinessId(business.id);

      const nmiPrivateKey = settings?.nmiPrivateKey;
      if (!nmiPrivateKey) {
        return res
          .status(500)
          .json({ success: false, message: 'NMI payment gateway is not configured' });
      }

      try {
        const rawAmount = parseFloat(String(money.total_amount || 0));
        const validAmount = (isNaN(rawAmount) ? 0 : rawAmount).toFixed(2);
        
        if (Number(validAmount) <= 0) {
          return res.status(400).json({ success: false, message: 'Invalid order total: A positive amount is required.' });
        }


        const params = new URLSearchParams();
        params.append('security_key', nmiPrivateKey);
        params.append('type', 'sale');
        params.append('amount', validAmount);
        params.append('payment_token', money.paymentToken);

        const nmiEndpoint = 'https://secure.nmi.com/api/transact.php';
        let nmiRes = await fetch(nmiEndpoint, {
          method: 'POST',
          body: params,
        });

        let responseText = await nmiRes.text();
        let responseParams = new URLSearchParams(responseText);

        // Auto-retry on sandbox if the production endpoint rejects it as a sandbox account
        if (
          responseParams.get('response') !== '1' &&
          responseParams.get('responsetext')?.includes('sandbox.nmi.com')
        ) {
          nmiRes = await fetch('https://sandbox.nmi.com/api/transact.php', {
            method: 'POST',
            body: params,
          });
          responseText = await nmiRes.text();
          responseParams = new URLSearchParams(responseText);
        }

        if (responseParams.get('response') !== '1') {
          return res.status(400).json({
            success: false,
            message: `Payment declined: ${responseParams.get('responsetext')}`,
          });
        }
        nmiTransactionId = responseParams.get('transactionid') || '';
        const nmiCardType = responseParams.get('type');
        const nmiLast4 = responseParams.get('cc_number') ? String(responseParams.get('cc_number')).slice(-4) : undefined;
        
        if (nmiCardType) {
           if (!money.cardDetails) money.cardDetails = {};
           money.cardDetails.cardType = nmiCardType;
        }
        if (nmiLast4) {
           if (!money.cardDetails) money.cardDetails = {};
           money.cardDetails.last4 = nmiLast4;
        }
      } catch (err: any) {
        return res
          .status(500)
          .json({ success: false, message: 'Payment gateway error', error: err.message });
      }
    } else if (money?.payment === 'authorize_net_iframe') {
      if (!money.paymentToken) {
        return res
          .status(400)
          .json({ success: false, message: 'Authorize.Net transaction ID is required' });
      }
      // For the iframe, the paymentToken is actually the successful transaction ID.
      // The payment has already been processed and captured by the Authorize.net iframe.
      // We do not need to process it again, we just save the order.
      nmiTransactionId = money.paymentToken;
      const iframeSettingsRepo = new BusinessSettingsRepository();
      const iframeSettings = await iframeSettingsRepo.findByBusinessId(business.id);
      authorizeNetChargeEnvironment =
        iframeSettings?.authorizeNetEnvironment === 'production' ? 'production' : 'sandbox';
    } else if (money?.payment === 'authorize_net' || money?.payment === 'card') {
      if (!paymentToken && !money.paymentToken) {
        return res
          .status(400)
          .json({ success: false, message: 'Authorize.Net payment token is required' });
      }

      const businessSettingsRepository = new BusinessSettingsRepository();
      const settings = await businessSettingsRepository.findByBusinessId(business.id);

      const authNetApiLoginId = settings?.authorizeNetApiLoginId;
      const authNetTransactionKey = settings?.authorizeNetTransactionKey;

      if (!authNetApiLoginId || !authNetTransactionKey) {
        return res
          .status(500)
          .json({ success: false, message: 'Authorize.Net payment gateway is not configured' });
      }

      try {
        const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(authNetApiLoginId);
        merchantAuthenticationType.setTransactionKey(authNetTransactionKey);

        let dataDesc = 'COMMON.ACCEPT.INAPP.PAYMENT';
        if (authNetMethod === 'apple_pay') {
          dataDesc = 'COMMON.APPLE.INAPP.PAYMENT';
        } else if (authNetMethod === 'google_pay') {
          dataDesc = 'COMMON.GOOGLE.INAPP.PAYMENT';
        }

        const opaqueData = new APIContracts.OpaqueDataType();
        opaqueData.setDataDescriptor(dataDesc);
        opaqueData.setDataValue(paymentToken || money.paymentToken);

        const paymentType = new APIContracts.PaymentType();
        paymentType.setOpaqueData(opaqueData);

        const orderDetails = new APIContracts.OrderType();
        orderDetails.setInvoiceNumber(`WEB-${Date.now()}`);

        const rawAmount = parseFloat(String(money.total_amount || 0));
        const validAmount = (isNaN(rawAmount) ? 0 : rawAmount).toFixed(2);

        if (Number(validAmount) <= 0) {
          return res.status(400).json({ success: false, message: 'Invalid order total: A positive amount is required.' });
        }


        const transactionRequestType = new APIContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(
          APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
        );
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(validAmount);
        transactionRequestType.setOrder(orderDetails);

        const createRequest = new APIContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);

        const executeTransaction = async (envPath: string): Promise<{transId: string, cardType?: string, last4?: string}> => {
          const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
          ctrl.setEnvironment(envPath);

          return new Promise((resolve, reject) => {
            ctrl.execute(() => {
              const apiResponse = ctrl.getResponse();
              const response = new APIContracts.CreateTransactionResponse(apiResponse);

              if (
                response != null &&
                response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK
              ) {
                const tr = response.getTransactionResponse();
                if (tr && tr.getMessages() != null) {
                  resolve({
                    transId: tr.getTransId(),
                    cardType: tr.getAccountType(),
                    last4: tr.getAccountNumber() ? String(tr.getAccountNumber()).slice(-4) : undefined
                  });
                } else {
                  let errorMsg = 'Transaction Failed.';
                  if (tr && tr.getErrors() != null) {
                    errorMsg = tr.getErrors().getError()[0].getErrorText();
                  }
                  reject(new Error(errorMsg));
                }
              } else {
                let errorMsg = 'Transaction Failed.';
                const tr = response?.getTransactionResponse();
                if (tr && tr.getErrors() != null) {
                  errorMsg = tr.getErrors().getError()[0].getErrorText();
                } else if (response && response.getMessages() != null) {
                  errorMsg = response.getMessages().getMessage()[0].getText();
                }
                reject(new Error(errorMsg));
              }
            });
          });
        };

        try {
          const result = await executeTransaction(AuthNetConstants.endpoint.production);
          nmiTransactionId = result.transId;
          authorizeNetChargeEnvironment = 'production';
          if (result.cardType) {
            if (!money.cardDetails) money.cardDetails = {};
            money.cardDetails.cardType = result.cardType;
          }
          if (result.last4) {
             if (!money.cardDetails) money.cardDetails = {};
             money.cardDetails.last4 = result.last4;
          }
        } catch (prodErr: any) {
          console.warn(`Authorize.Net SDK Production failed: ${prodErr.message}. Retrying mapping on Sandbox...`);
          try {
             const result = await executeTransaction(AuthNetConstants.endpoint.sandbox);
             nmiTransactionId = result.transId;
             authorizeNetChargeEnvironment = 'sandbox';
             if (result.cardType) {
                if (!money.cardDetails) money.cardDetails = {};
                money.cardDetails.cardType = result.cardType;
             }
             if (result.last4) {
                if (!money.cardDetails) money.cardDetails = {};
                money.cardDetails.last4 = result.last4;
             }
          } catch (sandboxErr: any) {
             throw new Error(`Transaction failed in both Production and Sandbox. Last error: ${sandboxErr.message}`);
          }
        }
      } catch (err: any) {
        return res
          .json({ success: false, message: err.message || 'Payment gateway error' });
      }
    }

    // 3. Create the order
    const orderRepository = new OrderRepository();
    const itemRepository = new ItemRepository();
    const categoryRepository = new CategoryRepository();
    const businessSettingsRepository = new BusinessSettingsRepository();
    const couponRepository = new CouponRepository();
    const createOrderUseCase = new CreateOrderUseCase(
      orderRepository,
      itemRepository,
      categoryRepository,
      businessSettingsRepository,
      couponRepository,
      customerRepository
    );
    
    // Normalize address structure (frontend uses address1/zipcode, backend/admin expects street/zipCode)
    if (delivery?.address) {
      const addr = delivery.address;
      delivery.address = {
        ...addr,
        street: addr.street || addr.address1 || '',
        zipCode: addr.zipCode || addr.zipcode || '',
        city: addr.city || '',
        state: addr.state || '',
      };
    }

    // 3.4 Capturing customer data and creating the order
    // Update customer address if provided in checkout
    if (delivery?.address) {
       await customerRepository.update(existingCustomer.id, { 
         address: delivery.address 
       }, business.id);
       existingCustomer.address = delivery.address; // Update local copy for enrichedOrder
    }

    const orderData = {
      business_id: business.id,
      customer_id: existingCustomer.id,
      order_type: order_type || 'pickup',
      service_time_type: service_time_type || 'ASAP',
      schedule_time: schedule_time || null,
      money: {
        subtotal: money.subtotal || 0,
        discount: money.discount || 0,
        delivery_fee: money.delivery_fee || 0,
        tax_total: money.tax_total || 0,
        tips: money.tips || 0,
        total_amount: money.total_amount || 0,
        currency: money.currency || 'USD',
        payment: money.payment || 'cash',
        payment_id: nmiTransactionId || undefined,
        payment_status: (nmiTransactionId ? 'paid' : 'pending') as 'paid' | 'pending',
        coupon_code: money?.coupon_code,
        rewards_points_used: money?.rewards_points_used,
        card_type: money?.cardDetails?.cardType || req.body.cardDetails?.cardType,
        last_4: money?.cardDetails?.last4 || req.body.cardDetails?.last4,
      },
      delivery: delivery || undefined,
      notes: notes || '',
      items: items.map((item: any) => {
        const modifier_totals =
          item.modifiers?.reduce(
            (sum: number, m: any) => sum + (m.unit_price_delta || 0) * (item.quantity || 1),
            0
          ) || 0;
        const line_subtotal = (item.unit_price || 0) * (item.quantity || 1) + modifier_totals;


        return {
          menu_item_id: item.menu_item_id || item.id,
          size_id: item.size_id || undefined,
          name_snap: item.name_snap || item.name || 'Item',
          size_snap: item.size_snap || undefined,
          unit_price: item.unit_price || 0,
          quantity: item.quantity || 1,
          modifier_totals,
          line_subtotal,
          special_notes: item.special_notes || undefined,
          modifiers: (item.modifiers || []).map((mod: any) => ({
            modifier_id: mod.modifier_id || mod.id,
            name_snapshot: mod.name_snapshot || mod.name || mod.label || 'Modifier',
            modifier_quantity_id: mod.modifier_quantity_id,
            quantity_label_snapshot: mod.quantity_label_snapshot,
            unit_price_delta: mod.unit_price_delta || mod.price || 0,
            selected_side: mod.selected_side,
          })),
        };
      }),
    };

    const order = await createOrderUseCase.execute(orderData);

    // 3.5 Create Transaction record if payment was successful
    if (nmiTransactionId) {
      try {
        const transactionRepository = new TransactionRepository();
        const cardDetails = money?.cardDetails || req.body.cardDetails;
        const finalCardType = cardDetails?.cardType || cardDetails?.brand || (money?.payment === 'nmi' ? 'Card' : 'Authorize_net');
        const finalLast4 = cardDetails?.last4 || cardDetails?.last_4;

        await transactionRepository.create({
          order_id: order.id,
          customer_id: existingCustomer.id,
          transaction_id: nmiTransactionId,
          amount: order.money.total_amount,
          currency: order.money.currency || 'USD',
          gateway: (money?.payment === 'nmi' ? 'nmi' : 'authorize_net') as any,
          status: 'completed',
          payment_method: finalCardType,
          card_type: finalCardType,
          last_4: finalLast4,
          metadata: {
            authNetMethod: req.body.authNetMethod || money?.authNetMethod,
            authorizeNetEnvironment: authorizeNetChargeEnvironment,
            customer_ip: req.ip,
            customer_name: customer?.name || existingCustomer.name,
            customer_email: customer?.email || existingCustomer.email,
            ...cardDetails
          },
        });
      } catch (err: any) {
        console.error('Failed to create transaction record:', err.message);
        // We don't fail the order creation if transaction logging fails, but it's a concern
      }
    }

    // 4. Emit full order via socket.io for admin real-time notification
    // Enrich with customer info so the admin modal can display it
    const enrichedOrder = {
      ...order,
      delivery: order.delivery || {
        name: existingCustomer.name,
        phone: existingCustomer.phoneNumber,
        address: existingCustomer.address,
      },
    };
    // Ensure customer name/phone are always present
    if (enrichedOrder.delivery && !enrichedOrder.delivery.name) {
      enrichedOrder.delivery.name = existingCustomer.name;
    }
    if (enrichedOrder.delivery && !enrichedOrder.delivery.phone) {
      enrichedOrder.delivery.phone = existingCustomer.phoneNumber;
    }

    const { Server: SocketIOServer } = await import('socket.io');
    const socketIo = req.app.get('io') as InstanceType<typeof SocketIOServer> | undefined;
    if (socketIo) {
      socketIo.emit('new-order', enrichedOrder);
    }
    // 5. Also trigger printer events
    try {
      const { emitNewOrder } = await import('../../services/printer/orderPrintEvents');
      emitNewOrder({ orderId: order.id, orderNumber: order.order_number });
    } catch {
      // Printer events are optional
    }

    return sendSuccess(res, 'Order created successfully', order, 201);
  });

  // Apple Pay Session Validation
  applePaySession = asyncHandler(async (req: Request, res: Response) => {
    const { validationUrl } = req.body;
    if (!validationUrl) {
      return res.status(400).json({ success: false, message: 'validationUrl is required' });
    }

    try {
      const { BusinessSettingsRepository } = await import(
        '../../infrastructure/repositories/BusinessSettingsRepository'
      );
      const businessSettingsRepository = new BusinessSettingsRepository();
      // Since it's public, we might not have a business ID directly, but for now we fallback to default
      const businessId = (req as AuthRequest).user?.id || 'default_business'; // Needs proper resolution if multi-tenant

      // In a real scenario, you'd load your Apple Pay Merchant Identity Certificate and Key here.
      // These are required by Apple to validate the session.
      // const httpsAgent = new https.Agent({
      //   cert: fs.readFileSync(path.join(__dirname, 'merchant_id.pem')),
      //   key: fs.readFileSync(path.join(__dirname, 'merchant_id.key')),
      // });

      const payload = {
        merchantIdentifier: 'merchant.com.yourdomain', // Replace with your Merchant ID
        displayName: 'XRT Online Ordering',
        initiative: 'web',
        initiativeContext: req.hostname,
      };

      const response = await fetch(validationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // If using node-fetch or similar, pass agent: httpsAgent
      });

      if (!response.ok) {
        throw new Error(`Apple Pay validation failed: ${response.statusText}`);
      }

      const session = await response.json();
      return sendSuccess(res, 'Session validated', session);
    } catch (error: any) {
      console.error('Apple Pay Session Error:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Failed to validate session', error: error.message });
    }
  });
}
