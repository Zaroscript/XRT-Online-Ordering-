type AttachmentLike =
  | string
  | {
      original?: string;
      thumbnail?: string;
      url?: string;
    }
  | null
  | undefined;

const INVALID_LEGACY_PATHS = new Set(['/logo.png']);

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (INVALID_LEGACY_PATHS.has(trimmed)) return null;
  return trimmed;
}

export function resolveAttachmentUrl(value: AttachmentLike): string | null {
  if (!value) return null;
  if (typeof value === 'string') return asNonEmptyString(value);

  return (
    asNonEmptyString(value.original) ??
    asNonEmptyString(value.thumbnail) ??
    asNonEmptyString(value.url) ??
    null
  );
}

export function pickFirstAttachmentUrl(
  ...values: AttachmentLike[]
): string | null {
  for (const value of values) {
    const resolved = resolveAttachmentUrl(value);
    if (resolved) return resolved;
  }
  return null;
}
