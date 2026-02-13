// Relative /uploads/ URLs come from the API server; prepend its origin so they load in admin.
const API_BASE =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_REST_API_ENDPOINT
    ? process.env.NEXT_PUBLIC_REST_API_ENDPOINT
    : 'http://localhost:3001/api/v1';

const API_ORIGIN = API_BASE.replace(/\/api\/v\d+$/, '');

export function resolveImageUrl(url: string | undefined | null): string {
  if (url == null || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return trimmed.startsWith('/') ? `${API_ORIGIN}${trimmed}` : `${API_ORIGIN}/${trimmed}`;
}
