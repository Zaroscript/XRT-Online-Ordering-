import AdsCard from "./AdsCard";
import AdsCardSkeleton from "./AdsCardSkeleton";
import { usePublicPromotionsQuery } from "@/api/hooks/usePublicPromotions";
import { useSiteSettingsQuery } from "@/api/hooks/useSiteSettings";
import { cards_items } from "../../config/constants";

const MAX_API = 4;
const MAX_LANDING = 4;

/** Matches Menulist horizontal rhythm — full-width content area */
const sectionPad = "px-4 md:px-8 lg:px-[70px]";

/**
 * Cards use CSS repeat(auto-fit, minmax(...)) so each tile grows to fill the row
 * (1 card = full width, 2 = half-half, up to 4 columns on wide screens).
 */
export default function HomePromotionsStrip() {
  const { data = [], isLoading: promoLoading, isError } = usePublicPromotionsQuery();
  const { offerCards, isLoading: settingsLoading } = useSiteSettingsQuery();

  const loading = promoLoading || settingsLoading;

  const apiPromos = !isError && Array.isArray(data) ? data.slice(0, MAX_API) : [];
  const landingSource = offerCards?.length > 0 ? offerCards : cards_items;
  const landingCards = Array.isArray(landingSource)
    ? landingSource
        .filter((card) => {
          const pid = card?.promotionId ?? card?.promotion_id;
          return pid != null && String(pid).trim().length > 0;
        })
        .slice(0, MAX_LANDING)
    : [];

  // API promotions are the source of truth for storefront order (matches dashboard sort_order).
  const dedupedApiPromos = apiPromos.filter((p, index, arr) => {
    const pid = String(p?.id || "").trim();
    return pid && arr.findIndex((x) => String(x?.id || "").trim() === pid) === index;
  });
  // Fallback only when no API promotions exist.
  const dedupedLandingCards =
    dedupedApiPromos.length === 0
      ? landingCards.filter((card, index, arr) => {
          const pid = String(card?.promotionId ?? card?.promotion_id ?? "").trim();
          return (
            pid &&
            arr.findIndex(
              (x) => String(x?.promotionId ?? x?.promotion_id ?? "").trim() === pid,
            ) === index
          );
        })
      : [];

  if (
    !loading &&
    dedupedApiPromos.length === 0 &&
    dedupedLandingCards.length === 0
  ) {
    return null;
  }

  const visiblePromoCount =
    dedupedApiPromos.length > 0
      ? dedupedApiPromos.length
      : dedupedLandingCards.length;
  const isSinglePromo = !loading && visiblePromoCount === 1;

  const gridStyle =
    !isSinglePromo
      ? {
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        }
      : undefined;

  return (
    <section
      className={`border-t border-[var(--color-secondary)]/10 bg-gradient-to-b from-[#f6faf7] via-[#f3f6f4] to-transparent pb-12 pt-10 md:pb-16 md:pt-12 ${sectionPad}`}
      aria-label="Promotions and special offers"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-flex h-2 w-8 rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_rgba(92,153,99,0.45)]"
                  aria-hidden
                />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                  Deals for you
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-secondary)] md:text-3xl lg:text-[2rem]">
                Special offers
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c665e] md:text-base">
                Choose an offer below  we&apos;ll attach it to your order. You can only
                use one promotion at a time; discount details are confirmed at
                checkout.
              </p>
            </div>
            <p className="shrink-0 rounded-xl border border-[var(--color-primary)]/20 bg-white/80 px-4 py-3 text-xs leading-snug text-[var(--color-secondary)] shadow-sm backdrop-blur-sm md:max-w-[280px] md:text-sm">
              <span className="font-semibold text-[var(--color-primary)]">Tip:</span>{" "}
              Tap <strong>Redeem</strong>, then browse the menu  your savings apply when
              you check out.
            </p>
          </div>
        </header>

        <div
          className={
            isSinglePromo
              ? "flex w-full justify-center"
              : "grid w-full gap-5 md:gap-6"
          }
          style={gridStyle}
        >
          {loading ? (
            <>
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`promo-skel-${i}`}
                  className="flex min-h-[200px] min-w-0 items-stretch"
                >
                  <AdsCardSkeleton />
                </div>
              ))}
            </>
          ) : (
            <>
              {dedupedApiPromos.map((p) => (
                <div
                  key={`api-${p.id}`}
                  className={
                    isSinglePromo
                      ? "flex w-full min-w-0 max-w-full items-stretch lg:w-[65%] lg:max-w-[65%]"
                      : "flex min-h-[200px] min-w-0 items-stretch"
                  }
                >
                  <AdsCard
                    item={{
                      title: p.headline,
                      offer: p.description,
                      description: p.description,
                      image: p.image_url ? { original: p.image_url } : undefined,
                      promotionId: p.id,
                      cta_label: p.cta_label,
                    }}
                  />
                </div>
              ))}
              {dedupedLandingCards.map((item, i) => (
                <div
                  key={`landing-${i}-${item.title ?? i}`}
                  className={
                    isSinglePromo
                      ? "flex w-full min-w-0 max-w-full items-stretch lg:w-[65%] lg:max-w-[65%]"
                      : "flex min-h-[200px] min-w-0 items-stretch"
                  }
                >
                  <AdsCard item={item} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
