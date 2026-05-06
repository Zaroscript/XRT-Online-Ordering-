/**
 * Ensures a color string is valid or returns a fallback.
 */
export function normalizeColor(color: string | undefined, fallback = '#6b7280'): string {
  if (!color) return fallback;
  
  // Basic validation for HEX, RGB, RGBA
  const isValidColor = 
    /^#([0-9A-F]{3}){1,2}$/i.test(color) || 
    /^rgb\((\s*\d+\s*,){2}\s*\d+\s*\)$/i.test(color) ||
    /^rgba\((\s*\d+\s*,){3}\s*[\d.]+\s*\)$/i.test(color);
    
  return isValidColor ? color : fallback;
}

/**
 * Returns an RGBA version of a HEX color with given opacity.
 * Useful for soft backgrounds or rings.
 */
export function getSoftColor(hex: string, opacity = 0.1): string {
  let r = 0, g = 0, b = 0;
  
  // Clean hex
  const cleanHex = hex.replace('#', '');
  
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    // Fallback if not hex
    return hex;
  }
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
