import { useSiteSettingsQuery } from "@/api";

function hasVisibleRichTextContent(value) {
  return Boolean(
    value
      ?.replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export default function TermsAndConditions() {
  const { data: settings, isLoading } = useSiteSettingsQuery();
  const termsPage = settings?.termsPage ?? { title: "", body: "" };
  const title = termsPage.title?.trim() || "Terms & Conditions";
  const body = termsPage.body ?? "";
  const hasContent = hasVisibleRichTextContent(body);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14 lg:px-[70px]">
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div
            className="px-6 py-8 md:px-10 md:py-12"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 16%, white), color-mix(in srgb, var(--color-secondary) 14%, white))",
            }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-secondary/70">
              Website Policy
            </p>
            <h1 className="max-w-3xl text-3xl font-black text-secondary md:text-5xl">
              {title}
            </h1>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            {isLoading ? (
              <p className="text-base text-slate-500">Loading terms and conditions...</p>
            ) : hasContent ? (
              <div
                className="terms-page-content"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-slate-600">
                Terms and conditions content is not available right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
