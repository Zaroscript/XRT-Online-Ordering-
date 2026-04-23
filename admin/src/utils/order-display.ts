const ORDER_DISPLAY_SEPARATOR_PATTERN = /[_-]+/g;
const ORDER_DISPLAY_SPACES_PATTERN = /\s+/g;

export function formatOrderDisplayValue(value?: string | null) {
  const normalizedValue = String(value ?? '')
    .trim()
    .replace(ORDER_DISPLAY_SEPARATOR_PATTERN, ' ')
    .replace(ORDER_DISPLAY_SPACES_PATTERN, ' ');

  if (!normalizedValue) {
    return 'N/A';
  }

  return normalizedValue.replace(/\b\w/g, (character) =>
    character.toUpperCase(),
  );
}
