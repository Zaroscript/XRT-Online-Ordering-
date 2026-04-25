import { resolveImageUrl } from "../../utils/resolveImageUrl";

export default function MaintenanceScreen({ settings }) {
  const m =
    settings?.maintenance && typeof settings.maintenance === "object"
      ? settings.maintenance
      : {};
  const operations = settings?.operationsSettings || {};
  const title =
    (operations.messageTitle && String(operations.messageTitle).trim()) ||
    (m.title && String(m.title).trim()) ||
    settings?.siteTitle ||
    "We'll be right back";
  const description =
    (operations.messageBody && String(operations.messageBody).trim()) ||
    (m.description && String(m.description).trim()) ||
    "We are upgrading your ordering experience and will be back shortly.";
  const imgRaw = m.image?.original || m.image?.thumbnail;
  const imgSrc = imgRaw ? resolveImageUrl(imgRaw) : "";
  const useOverlay = Boolean(m.isOverlayColor && m.overlayColor);
  const logo = settings?.logo?.original || settings?.logo?.thumbnail || "";
  const logoSrc = logo ? resolveImageUrl(logo) : "";
  const phone = settings?.contactDetails?.contact || "";
  const socials = settings?.contactDetails?.socials || [];
  const overrideUntil = operations?.overrideUntil
    ? new Date(operations.overrideUntil)
    : null;
  const countdown =
    overrideUntil && !Number.isNaN(overrideUntil.getTime())
      ? `Estimated reopening on ${overrideUntil.toLocaleString()}`
      : "";

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
      style={{
        backgroundColor: useOverlay ? m.overlayColor : "#1e293b",
        color: "#f8fafc",
      }}
    >
      {imgSrc ? (
        <>
          <img
            src={imgSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: useOverlay ? 0.35 : 0.5 }}
          />
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden
          />
        </>
      ) : null}
      <div className="relative z-10 max-w-xl rounded-3xl border border-white/20 bg-black/35 px-8 py-10 backdrop-blur-md">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={settings?.siteTitle || "Restaurant logo"}
            className="mx-auto mb-6 h-16 w-auto object-contain"
          />
        ) : null}
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-100">
          {description}
        </p>
        {operations?.showCountdown && countdown ? (
          <p className="mt-4 text-sm font-semibold text-amber-200">{countdown}</p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:opacity-90"
            >
              Call Store
            </a>
          ) : null}
          {socials.slice(0, 3).map((social, index) => (
            <a
              key={`${social?.url || "social"}-${index}`}
              href={social?.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              {social?.icon || "Social"}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
