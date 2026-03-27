import type {
  ImportValidationError,
  ImportValidationWarning,
} from '../../domain/entities/ImportSession';

/**
 * Ensure subdocuments match ImportSessionModel strict schema (avoids Mongoose ValidationError on save).
 */
export function sanitizeImportValidationErrors(
  entries: ImportValidationError[],
  fileFallback: string
): ImportValidationError[] {
  return entries.map((e) => sanitizeErrorLike(e, fileFallback));
}

export function sanitizeImportValidationWarnings(
  entries: ImportValidationWarning[],
  fileFallback: string
): ImportValidationWarning[] {
  return entries.map((e) => sanitizeErrorLike(e, fileFallback));
}

function sanitizeErrorLike<T extends ImportValidationError | ImportValidationWarning>(
  e: T,
  fileFallback: string
): T {
  const rowNum = Number(e.row);
  const row = Number.isFinite(rowNum) && rowNum >= 0 ? Math.floor(rowNum) : 0;
  const base = {
    file: String(e.file ?? fileFallback).slice(0, 2000),
    row,
    entity: String(e.entity ?? 'Unknown').slice(0, 200),
    field: String(e.field ?? '').slice(0, 200),
    message: String(e.message ?? '').slice(0, 2000),
  };
  if (e.value !== undefined && e.value !== null) {
    return { ...base, value: e.value } as T;
  }
  return base as T;
}
