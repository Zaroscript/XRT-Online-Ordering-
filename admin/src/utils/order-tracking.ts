const ORDER_TRACKING_PREFIX = 'ORD-';
const ORDER_TRACKING_PATTERN = /^ORD-[A-Z0-9]+$/i;
const SHORT_TRACKING_PATTERN = /^[A-Z0-9-]{4,12}$/i;
const LEADING_HASH_PATTERN = /^#/;

function normalizeTrackingValue(value?: string | null) {
  const normalizedValue = String(value ?? '')
    .trim()
    .replace(LEADING_HASH_PATTERN, '');

  if (!normalizedValue) {
    return '';
  }

  if (ORDER_TRACKING_PATTERN.test(normalizedValue)) {
    return normalizedValue.toUpperCase();
  }

  if (/^\d+$/.test(normalizedValue)) {
    return `${ORDER_TRACKING_PREFIX}${normalizedValue}`;
  }

  if (SHORT_TRACKING_PATTERN.test(normalizedValue)) {
    return normalizedValue.toUpperCase();
  }

  return '';
}

export function getOrderTrackingNumberValue(
  ...values: Array<string | null | undefined>
) {
  for (const value of values) {
    const normalizedValue = normalizeTrackingValue(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return '';
}

export function formatOrderTrackingLabel(
  ...values: Array<string | null | undefined>
) {
  const trackingNumber = getOrderTrackingNumberValue(...values);

  return trackingNumber ? `#${trackingNumber}` : '';
}
