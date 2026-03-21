import { resolveImageUrl } from "../../utils/resolveImageUrl";

export default function MaintenanceScreen({ settings }) {
  const m = settings?.maintenance && typeof settings.maintenance === "object" ? settings.maintenance : {};
  const title = (m.title && String(m.title).trim()) || settings?.siteTitle || "We'll be right back";
  const description = (m.description && String(m.description).trim()) || "";
  const imgRaw = m.image?.original || m.image?.thumbnail;
  const imgSrc = imgRaw ? resolveImageUrl(imgRaw) : "";
  const useOverlay = Boolean(m.isOverlayColor && m.overlayColor);

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
      <div className="relative z-10 max-w-lg">
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description ? (
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-200">{description}</p>
        ) : (
          <p className="text-lg text-slate-300">
            Our site is temporarily unavailable. Please check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
