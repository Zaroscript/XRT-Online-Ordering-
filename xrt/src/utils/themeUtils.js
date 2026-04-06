export function adjustColorBrightness(hex, amount) {
  if (!hex) return hex;
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  const toHex = (c) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

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

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeThemeColor(value, fallback) {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

export function mixHexColors(colorA, colorB, weight) {
  const normalizedWeight = Math.max(0, Math.min(1, weight));
  const expandHex = (hex) =>
    hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;

  const start = expandHex(
    normalizeThemeColor(colorA, DEFAULT_PRIMARY_COLOR).replace(/^#/, ""),
  );
  const end = expandHex(
    normalizeThemeColor(colorB, DEFAULT_SECONDARY_COLOR).replace(/^#/, ""),
  );

  const mixChannel = (index) => {
    const startValue = parseInt(start.substring(index, index + 2), 16);
    const endValue = parseInt(end.substring(index, index + 2), 16);
    return Math.round(startValue + (endValue - startValue) * normalizedWeight);
  };

  const red = mixChannel(0);
  const green = mixChannel(2);
  const blue = mixChannel(4);

  return `#${[red, green, blue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function buildWebsiteBrandTheme(primaryInput, secondaryInput) {
  const primary = normalizeThemeColor(primaryInput, DEFAULT_PRIMARY_COLOR);
  const secondary = normalizeThemeColor(secondaryInput, DEFAULT_SECONDARY_COLOR);
  const primaryHover = mixHexColors(primary, secondary, 0.22);
  const headerBg = secondary;
  const footerBg = mixHexColors(secondary, "#000000", 0.14);
  const gradientStart = mixHexColors(primary, "#ffffff", 0.12);
  const gradientEnd = secondary;
  const shadow = mixHexColors(secondary, "#000000", 0.5);

  return {
    primary,
    secondary,
    primaryHover,
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
  root.style.setProperty("--color-primary-hover", theme.primaryHover);
  root.style.setProperty("--color-secondary", theme.secondary);
  root.style.setProperty("--color-secondary-rgb", theme.secondaryRgb);
  root.style.setProperty("--color-header-bg", theme.headerBg);
  root.style.setProperty("--color-header-text", theme.headerText);
  root.style.setProperty("--color-footer-bg", theme.footerBg);
  root.style.setProperty("--color-footer-text", theme.footerText);
  root.style.setProperty("--color-shadow", theme.shadowRgb);
  root.style.setProperty("--color-gradient-start", theme.gradientStart);
  root.style.setProperty("--color-gradient-end", theme.gradientEnd);
}
