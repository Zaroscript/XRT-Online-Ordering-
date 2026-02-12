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
}
