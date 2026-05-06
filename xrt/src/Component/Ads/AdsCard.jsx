import React from "react";
import { useAppliedPromotion } from "@/hooks/useAppliedPromotion";
import { setAppliedPromotion } from "@/utils/promotionStorage";

const shellCore =
  "relative isolate flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[var(--color-secondary)] " +
  "shadow-[0_10px_40px_-12px_rgba(47,62,48,0.45)] outline-none " +
  "transition-[transform,box-shadow,border-color] duration-300 ease-out " +
  "min-h-[268px] sm:min-h-[304px] lg:min-h-[360px] p-6 sm:p-7";

const shellInteractive = `${shellCore} group/card cursor-pointer border border-[var(--color-primary)]/30 ring-1 ring-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]`;

const shellApplied = `${shellCore} cursor-default border border-[var(--color-primary)] shadow-[0_16px_48px_-14px_rgba(92,153,99,0.35)] ring-[3px] ring-[var(--color-primary)] ring-offset-[3px] ring-offset-[#f3f6f4]`;

export default function AdsCard({ item }) {
  const applied = useAppliedPromotion();
  const title = item.title;
  const description = item.offer || item.description;
  const image =
    item.src ||
    (typeof item.image === "string" ? item.image : item.image?.original);
  const offerColor = item.offer_color || "#F5B400";
  const promotionId = item.promotionId || item.promotion_id;
  const pid =
    promotionId != null && String(promotionId).trim()
      ? String(promotionId).trim()
      : null;

  const btnLabel =
    (item.cta_label || item.buttonText || item.ctaLabel || "Redeem").trim() ||
    "Redeem";
  const isApplied = Boolean(
    pid && applied?.id != null && String(applied.id) === pid,
  );
  const canActivate = Boolean(pid && !isApplied);

  const handleActivate = () => {
    if (!pid || isApplied) return;
    setAppliedPromotion({
      id: pid,
      headline: title,
      image_url:
        typeof image === "string" ? image : image?.original || image?.thumbnail,
      template: item.template,
      cta_label: btnLabel,
    });
  };

  const bgStyle = image
    ? {
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: "var(--color-secondary)",
        backgroundImage:
          "linear-gradient(155deg, rgba(112,169,119,0.35) 0%, var(--color-secondary) 42%, #1a241b 100%)",
      };

  /** Brand-tinted scrim — readable on any photo */
  const overlays = (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-[var(--color-secondary)]/95 via-[#1f2e21]/78 to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15"
        aria-hidden
      />
    </>
  );

  const bodyTop = (
    <div className="relative z-[1] min-w-0 flex-1 pr-1">
      {isApplied && (
        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
          <i className="fa-solid fa-circle-check text-[13px]" aria-hidden />
          <span className="leading-tight">Active on your order</span>
        </div>
      )}
      <h2 className="text-lg font-bold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] line-clamp-2 sm:text-2xl lg:!text-[1.75rem] xl:!text-[2rem]">
        {title}
      </h2>
      {description ? (
        <p
          className="mt-2 text-sm font-semibold leading-snug text-white/95 drop-shadow-md sm:text-[15px] line-clamp-4 lg:line-clamp-5"
          style={{ color: offerColor }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );

  const bodyFooter = (
    <div className="relative z-[1] mt-4 flex flex-shrink-0 flex-col gap-3 border-t border-white/10 pt-4">
      {pid && !isApplied && (
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/85 sm:text-xs">
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] text-white shadow-md"
            aria-hidden
          >
            %
          </span>
          <span className="leading-snug">
            Tap to activate this offer for your current order
          </span>
        </p>
      )}
      {isApplied ? (
        <div className="rounded-xl border border-[var(--color-primary)]/40 bg-[var(--color-secondary)]/55 px-4 py-3 backdrop-blur-md">
          <div className="flex gap-3 text-white">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg shadow-inner">
              <i className="fa-solid fa-check" aria-hidden />
            </span>
            <div className="min-w-0 text-[13px] leading-snug sm:text-sm">
              <span className="font-semibold text-white">
                You&apos;re all set this offer stays on your cart.
              </span>
              <span className="mt-1 block text-white/75">
                Browse the menu and build your order; this promotion can&apos;t be
                applied twice.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-center text-[15px] font-semibold text-white shadow-[0_6px_24px_-4px_rgba(92,153,99,0.55)] ring-1 ring-white/20">
          <span>{btnLabel}</span>
          <i className="fa-solid fa-arrow-right text-sm opacity-90" aria-hidden />
        </span>
      )}
    </div>
  );

  const inner = (
    <>
      {overlays}
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col justify-between">
        {bodyTop}
        {bodyFooter}
      </div>
    </>
  );

  if (isApplied) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={shellApplied}
        style={bgStyle}
      >
        {inner}
      </div>
    );
  }

  if (!pid) {
    return (
      <div className={shellInteractive} style={bgStyle}>
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleActivate}
      className={shellInteractive}
      style={bgStyle}
      aria-pressed={isApplied}
      aria-label={`Activate offer: ${title}`}
      disabled={!canActivate}
    >
      {inner}
    </button>
  );
}
