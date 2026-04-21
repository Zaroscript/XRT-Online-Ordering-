export function hexToRgb(hex: string): string | null {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Parse shorthand hex to full
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

export function adjustColorBrightness(hex: string, amount: number): string {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getContrastColor(hexColor: string): 'white' | 'black' {
  if (!hexColor) return 'black';
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return 'black';
  
  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

export const DEFAULT_PRIMARY_COLOR = '#5C9963';
export const DEFAULT_SECONDARY_COLOR = '#2F3E30';

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeThemeColor(
  value: string | undefined | null,
  fallback: string,
): string {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

export function mixHexColors(colorA: string, colorB: string, weight: number): string {
  const normalizedWeight = Math.max(0, Math.min(1, weight));
  const start = normalizeThemeColor(colorA, DEFAULT_PRIMARY_COLOR).replace(/^#/, '');
  const end = normalizeThemeColor(colorB, DEFAULT_SECONDARY_COLOR).replace(/^#/, '');

  const expand = (hex: string) =>
    hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;

  const a = expand(start);
  const b = expand(end);

  const mixChannel = (index: number) => {
    const startValue = parseInt(a.substring(index, index + 2), 16);
    const endValue = parseInt(b.substring(index, index + 2), 16);
    return Math.round(startValue + (endValue - startValue) * normalizedWeight);
  };

  const red = mixChannel(0);
  const green = mixChannel(2);
  const blue = mixChannel(4);

  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

export function buildAdminBrandTheme(
  primaryInput?: string | null,
  secondaryInput?: string | null,
) {
  const primary = normalizeThemeColor(primaryInput, DEFAULT_PRIMARY_COLOR);
  const secondary = normalizeThemeColor(secondaryInput, DEFAULT_SECONDARY_COLOR);
  const primaryHover = mixHexColors(primary, secondary, 0.22);
  const secondaryHover = mixHexColors(secondary, '#000000', 0.1);
  const accent300 = mixHexColors(primary, '#ffffff', 0.68);
  const accent400 = mixHexColors(primary, '#ffffff', 0.4);
  const accent500 = primary;
  const accent600 = mixHexColors(primary, secondary, 0.28);
  const accent700 = mixHexColors(primary, secondary, 0.52);

  return {
    primary,
    secondary,
    primaryContrast: getContrastColor(primary),
    secondaryContrast: getContrastColor(secondary),
    primaryRgb: hexToRgb(primary) || hexToRgb(DEFAULT_PRIMARY_COLOR) || '',
    secondaryRgb: hexToRgb(secondary) || hexToRgb(DEFAULT_SECONDARY_COLOR) || '',
    primaryHover,
    secondaryHover,
    primaryHoverRgb:
      hexToRgb(primaryHover) || hexToRgb(mixHexColors(DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, 0.22)) || '',
    accent300Rgb: hexToRgb(accent300) || '',
    accent400Rgb: hexToRgb(accent400) || '',
    accent500Rgb: hexToRgb(accent500) || '',
    accent600Rgb: hexToRgb(accent600) || '',
    accent700Rgb: hexToRgb(accent700) || '',
  };
}

export function applyAdminBrandTheme(options?: {
  primary_color?: string | null;
  secondary_color?: string | null;
} | null) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const theme = buildAdminBrandTheme(
    options?.primary_color,
    options?.secondary_color,
  );

  root.style.setProperty('--color-primary', theme.primaryRgb);
  root.style.setProperty('--color-primary-hex', theme.primary);
  root.style.setProperty('--color-primary-contrast', theme.primaryContrast);
  root.style.setProperty('--color-primary-hover', theme.primaryHoverRgb);
  
  root.style.setProperty('--color-secondary', theme.secondaryRgb);
  root.style.setProperty('--color-secondary-hex', theme.secondary);
  root.style.setProperty('--color-secondary-contrast', theme.secondaryContrast);
  root.style.setProperty('--color-secondary-hover', theme.secondaryHover);

  root.style.setProperty('--color-accent', theme.primaryRgb);
  root.style.setProperty('--color-accent-hover', theme.primaryHoverRgb);
  root.style.setProperty('--color-accent-300', theme.accent300Rgb);
  root.style.setProperty('--color-accent-400', theme.accent400Rgb);
  root.style.setProperty('--color-accent-500', theme.accent500Rgb);
  root.style.setProperty('--color-accent-600', theme.accent600Rgb);
  root.style.setProperty('--color-accent-700', theme.accent700Rgb);
}
