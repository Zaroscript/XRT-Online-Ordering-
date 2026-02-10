/**
 * API configuration for the custom server.
 * Vite exposes env vars prefixed with VITE_ via import.meta.env.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1";

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
};
