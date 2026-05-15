import AdsCard from "./AdsCard";
import AdsCardSkeleton from "./AdsCardSkeleton";
import { usePublicPromotionsQuery } from "@/api/hooks/usePublicPromotions";
import { PROMOTIONS_CELL_CLASSES, PROMOTIONS_ROW_CLASSES } from "./promotionsRowLayout";

const MAX_PROMO_CARDS = 4;

/**
 * Same layout as AdsList but sources cards from GET /public/promotions (AdsCard UI).
 */
export default function PromotionsAdsGrid() {
  const { data = [], isLoading, isError } = usePublicPromotionsQuery();

  if (isError) return null;

  const capped = data.slice(0, MAX_PROMO_CARDS);
  if (!isLoading && capped.length === 0) return null;

  const items = isLoading
    ? Array.from({ length: MAX_PROMO_CARDS }, () => null)
    : capped;
  const isSingle = !isLoading && capped.length === 1;

  return (
    <div className="px-6 lg:px-12 py-10">
      <div
        className={
          isSingle
            ? "mx-auto flex w-full max-w-[1260px] justify-center"
            : PROMOTIONS_ROW_CLASSES
        }
      >
        {items.map((p, i) => (
          <div
            key={p?.id ?? `promo-skel-${i}`}
            className={
              isSingle
                ? `${PROMOTIONS_CELL_CLASSES} w-full lg:w-[65%] lg:max-w-[65%]`
                : PROMOTIONS_CELL_CLASSES
            }
          >
            {isLoading ? (
              <AdsCardSkeleton />
            ) : (
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
