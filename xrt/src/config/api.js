/**
 * API configuration for the custom server.
 * Vite exposes env vars prefixed with VITE_ via import.meta.env.
 *
 * Production (Vercel): Set VITE_API_BASE_URL in project settings to your API origin + path.
 * - If the API is a separate Vercel project: https://<api-project>.vercel.app/api/v1
 * - If the API is on the same domain via rewrites: https://xrt-online-ordering.vercel.app/api/v1
 * Do not omit /api/v1 or requests to /public/site-settings etc. will 404.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? "/api/v1" : "http://localhost:3001/api/v1");

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
};
