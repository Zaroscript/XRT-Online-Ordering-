/**
 * Resolve image URL for display on the XRT site.
 * Relative paths (e.g. /uploads/...) are served by the customize server, not the frontend origin.
 * Prepends the API server origin so images load correctly.
 */
import { API_BASE_URL } from "../config/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+$/, "");

export function resolveImageUrl(url) {
  if (url == null || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.startsWith("/") ? `${API_ORIGIN}${trimmed}` : `${API_ORIGIN}/${trimmed}`;
}
