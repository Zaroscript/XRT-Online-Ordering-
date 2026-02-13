import { API_BASE_URL } from "../config/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, "");

/** Resolve image URL: relative paths use API origin; localhost URLs are rewritten to deployed API. */
export function resolveImageUrl(url) {
  if (url == null || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed);
      if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
        return `${API_ORIGIN}${u.pathname}${u.search}`;
      }
    } catch (_) {}
    return trimmed;
  }
  return trimmed.startsWith("/") ? `${API_ORIGIN}${trimmed}` : `${API_ORIGIN}/${trimmed}`;
}
