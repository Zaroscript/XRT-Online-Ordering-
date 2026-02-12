import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { BusinessRepository } from '../../infrastructure/repositories/BusinessRepository';
import { BusinessSettingsRepository } from '../../infrastructure/repositories/BusinessSettingsRepository';

/**
 * Public site settings for the storefront (no auth).
 * Returns hero slides, site title, logo, etc. from BusinessSettings.
 * Hero slides are the single source of truth: only slides added in the admin dashboard
 * (Settings > Hero Slider) are returned; the xrt storefront shows only these.
 */
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
    promoPopup: null as any,
  };
}

export class PublicController {
  getSiteSettings = asyncHandler(async (_req: Request, res: Response) => {
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

    // Normalize heroSlides so each slide has bgImage as { original, thumbnail } for the storefront
    const rawSlides = settings.heroSlides ?? [];
    const heroSlides = rawSlides.map((slide: any) => {
      const bg = slide?.bgImage;
      const url =
        typeof bg === 'string'
          ? bg
          : ((bg && (typeof bg === 'object' ? (bg.original ?? bg.thumbnail) : undefined)) ?? '');
      return {
        title: slide?.title ?? '',
        subtitle: slide?.subtitle ?? '',
        subtitleTwo: slide?.subtitleTwo ?? '',
        btnText: slide?.btnText ?? '',
        btnLink: slide?.btnLink ?? '',
        offer: slide?.offer ?? '',
        bgImage: url ? { original: url, thumbnail: url } : {},
      };
    });

    const publicSettings = {
      heroSlides,
      siteTitle: settings.siteTitle ?? 'XRT Online Ordering',
      siteSubtitle: settings.siteSubtitle ?? '',
      logo: settings.logo ?? null,
      promoPopup: settings.promoPopup ?? null,
      contactDetails: settings.contactDetails ?? null,
      footer_text: settings.footer_text ?? '',
      copyrightText: settings.copyrightText ?? 'Powered by XRT',
      orders: settings.orders ?? null,
      messages: settings.messages ?? null,
    };

    return sendSuccess(res, 'Site settings retrieved', publicSettings);
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

  getCategories = asyncHandler(async (_req: Request, res: Response) => {
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

    // Handle both paginated and non-paginated responses just in case
    const categories = result.data || result;

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
      is_available: true,
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
    const baseUrl = `${req.protocol}://${req.get('host') || `localhost:${process.env.PORT || 3001}`}`;

    // Return absolute image URLs so the storefront (XRT) can display images without client-side resolution
    const products = (Array.isArray(rawProducts) ? rawProducts : []).map((item: any) => {
      const image = item?.image;
      const imageStr =
        typeof image === 'string' ? image : (image?.original ?? image?.thumbnail ?? '');
      const absoluteImage =
        imageStr && typeof imageStr === 'string' && imageStr.startsWith('/')
          ? `${baseUrl}${imageStr}`
          : imageStr || item?.image;
      return { ...item, image: absoluteImage };
    });

    return sendSuccess(res, 'Products retrieved successfully', products);
  });
}
