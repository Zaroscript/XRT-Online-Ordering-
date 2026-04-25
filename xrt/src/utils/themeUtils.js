

export function getContrastColor(hexColor) {
  if (!hexColor) return "black";
  const cleanHex = hexColor.replace("#", "");
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return "black";
  
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
  return yiq >= 128 ? "black" : "white";
}

export function hexToRgb(hex) {
  if (!hex) return "";
  hex = hex.replace(/^#/, "");

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  if (hex.length !== 6) return "";

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

export const DEFAULT_PRIMARY_COLOR = "#5C9963";
export const DEFAULT_SECONDARY_COLOR = "#2F3E30";


export function normalizeThemeColor(value, fallback) {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  // Allow any truthy string directly to support named colors like 'black' or 'red'
  return trimmed || fallback;
}



export function buildWebsiteBrandTheme(primaryInput, secondaryInput) {
  const primary = normalizeThemeColor(primaryInput, DEFAULT_PRIMARY_COLOR);
  const secondary = normalizeThemeColor(secondaryInput, DEFAULT_SECONDARY_COLOR);
  const primaryHover = primary;
  const secondaryHover = secondary;
  const headerBg = secondary;
  const footerBg = secondary;
  const gradientStart = primary;
  const gradientEnd = secondary;
  const shadow = "#000000";

  return {
    primary,
    secondary,
    primaryContrast: getContrastColor(primary),
    secondaryContrast: getContrastColor(secondary),
    primaryHover,
    secondaryHover,
    primaryRgb: hexToRgb(primary),
    secondaryRgb: hexToRgb(secondary),
    headerBg,
    headerText: getContrastColor(headerBg),
    footerBg,
    footerText: getContrastColor(footerBg),
    gradientStart,
    gradientEnd,
    shadowRgb: hexToRgb(shadow),
  };
}

export function applyWebsiteBrandTheme(primaryInput, secondaryInput) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const theme = buildWebsiteBrandTheme(primaryInput, secondaryInput);

  root.style.setProperty("--color-primary", theme.primary);
  root.style.setProperty("--color-primary-rgb", theme.primaryRgb);
  root.style.setProperty("--color-primary-contrast", theme.primaryContrast);
  root.style.setProperty("--color-primary-hover", theme.primaryHover);
  
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-secondary-rgb", theme.secondaryRgb);
  root.style.setProperty("--color-secondary-contrast", theme.secondaryContrast);
  root.style.setProperty("--color-secondary-hover", theme.secondaryHover);

  root.style.setProperty("--color-header-bg", theme.headerBg);
  root.style.setProperty("--color-header-text", theme.headerText);
  root.style.setProperty("--color-footer-bg", theme.footerBg);
  root.style.setProperty("--color-footer-text", theme.footerText);
  root.style.setProperty("--color-shadow", theme.shadowRgb);
  root.style.setProperty("--color-gradient-start", theme.gradientStart);
  root.style.setProperty("--color-gradient-end", theme.gradientEnd);
}
