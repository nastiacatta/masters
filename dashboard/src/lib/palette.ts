/**
 * Colourblind-safe palette and contrast utilities.
 *
 * CB_PALETTE: 8 colours distinguishable under protanopia, deuteranopia,
 * and tritanopia. Based on Wong (2011) "Points of view: Color blindness",
 * Nature Methods 8, 441.
 *
 * VERDICT_COLOURS: semantic good/neutral/bad colours with foreground,
 * background, and border values that maintain WCAG 2.1 AA contrast
 * (≥ 4.5:1 for fg on bg).
 */

/**
 * Wong (2011) colourblind-safe palette — 8 colours.
 * Order: blue, orange, green, pink, sky blue, vermillion, yellow, black.
 */
export const CB_PALETTE = [
  '#0072B2', // blue
  '#E69F00', // orange
  '#009E73', // green
  '#CC79A7', // pink
  '#56B4E9', // sky blue
  '#D55E00', // vermillion
  '#F0E442', // yellow
  '#000000', // black
] as const;

/**
 * Verdict colours with WCAG 4.5:1 contrast ratio (fg on bg).
 *
 * good:    emerald tones — fg #065f46 on bg #ecfdf5 ≈ 7.4:1
 * neutral: amber tones   — fg #78350f on bg #fffbeb ≈ 8.6:1
 * bad:     red tones      — fg #991b1b on bg #fef2f2 ≈ 7.8:1
 */
export const VERDICT_COLOURS = {
  good:    { fg: '#065f46', bg: '#ecfdf5', border: '#10b981' },
  neutral: { fg: '#78350f', bg: '#fffbeb', border: '#f59e0b' },
  bad:     { fg: '#991b1b', bg: '#fef2f2', border: '#ef4444' },
} as const;

// ── Contrast ratio helpers ──────────────────────────────────────────

/** Parse a 3- or 6-digit hex colour string into [r, g, b] (0–255). */
function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Convert an sRGB channel value (0–255) to its linear-light value.
 * Per WCAG 2.1 relative luminance definition.
 */
function linearise(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/**
 * Relative luminance of a hex colour per WCAG 2.1.
 * Returns a value in [0, 1] where 0 is darkest and 1 is lightest.
 */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRGB(hex);
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/**
 * WCAG 2.1 contrast ratio between two hex colours.
 *
 * @param fg - Foreground colour as a hex string (e.g. "#065f46")
 * @param bg - Background colour as a hex string (e.g. "#ecfdf5")
 * @returns Contrast ratio in the range [1, 21]. A ratio ≥ 4.5 satisfies
 *          WCAG 2.1 AA for normal text.
 */
export function contrastRatio(fg: string, bg: string): number {
  const lFg = relativeLuminance(fg);
  const lBg = relativeLuminance(bg);
  const lighter = Math.max(lFg, lBg);
  const darker = Math.min(lFg, lBg);
  return (lighter + 0.05) / (darker + 0.05);
}
