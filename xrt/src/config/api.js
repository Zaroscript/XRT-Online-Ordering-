// Set VITE_API_BASE_URL in Vercel to your API base, e.g. https://your-api.vercel.app/api/v1 (include /api/v1).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? "/api/v1" : "http://localhost:3001/api/v1");

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
};
