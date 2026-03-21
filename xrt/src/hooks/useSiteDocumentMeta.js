import { useEffect } from "react";
import { resolveImageUrl } from "../utils/resolveImageUrl";

function setOrUpdateMeta(attrName, key, value) {
  if (value == null || String(value).trim() === "") return;
  const v = String(value).trim();
  let el = document.querySelector(`meta[${attrName}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", v);
}

function setCanonical(href) {
  if (!href || String(href).trim() === "") return;
  const h = String(href).trim();
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = h;
}

/**
 * Applies dashboard SEO fields to document head (title, description, Open Graph, Twitter).
 * @param {Record<string, unknown> | null | undefined} data - Full public site-settings payload.
 */
export function useSiteDocumentMeta(data) {
  useEffect(() => {
    if (!data || typeof data !== "object") return;

    const siteTitle = data.siteTitle ?? "";
    const siteSubtitle = data.siteSubtitle ?? "";
    const seo = data.seo ?? {};

    const title = (seo.metaTitle && String(seo.metaTitle).trim()) || siteTitle || "";
    const desc =
      (seo.metaDescription && String(seo.metaDescription).trim()) || siteSubtitle || "";
    const ogTitle = (seo.ogTitle && String(seo.ogTitle).trim()) || title;
    const ogDesc =
      (seo.ogDescription && String(seo.ogDescription).trim()) || desc;
    const ogImageRaw = seo.ogImage?.original || seo.ogImage?.thumbnail;
    const ogImageUrl = ogImageRaw ? resolveImageUrl(ogImageRaw) : "";

    if (title) document.title = title;

    setOrUpdateMeta("name", "description", desc);
    setOrUpdateMeta("property", "og:title", ogTitle);
    setOrUpdateMeta("property", "og:description", ogDesc);
    setOrUpdateMeta("property", "og:type", "website");
    if (ogImageUrl) setOrUpdateMeta("property", "og:image", ogImageUrl);

    const twCard = (seo.twitterCardType && String(seo.twitterCardType).trim()) || "summary_large_image";
    setOrUpdateMeta("name", "twitter:card", twCard);
    if (seo.twitterHandle) {
      const handle = String(seo.twitterHandle).trim();
      if (handle) setOrUpdateMeta("name", "twitter:site", handle);
    }

    setCanonical(seo.canonicalUrl && String(seo.canonicalUrl).trim());
  }, [data]);
}
