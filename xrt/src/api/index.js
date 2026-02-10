/**
 * API layer for the custom server.
 * - apiClient: axios instance (use in React Query fetchers or direct calls)
 * - Add query hooks and mutations here as you integrate endpoints
 */
export { apiClient } from "./client";
export { getSiteSettings } from "./siteSettings";
export { useSiteSettingsQuery } from "./hooks/useSiteSettings";
