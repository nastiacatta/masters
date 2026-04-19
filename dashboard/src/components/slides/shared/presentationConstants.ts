import type React from 'react';

/**
 * Imperial Palette — single source of truth for all presentation colours.
 * Every colour used in text, SVG fills, or chart data series must come from this set.
 */
export const PALETTE = {
  navy: '#002147',
  teal: '#00847F',
  warmGrey: '#4A5568',
  lightBg: '#F7FAFC',
  white: '#FFFFFF',
  dark: '#1a1a2e',
  darkSlate: '#1A202C',
  deepRed: '#C53030',
  lightGrey: '#E2E8F0',
  warmCream: '#FFFBF0',
} as const;

/**
 * Typography tokens for consistent font sizing and spacing across all slides.
 */
export const TYPOGRAPHY = {
  fontFamily: "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif",
  heading: { fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.15 },
  body: { fontSize: '1.6rem', lineHeight: 2.0, marginBottom: '14px' },
  bodySplit: { fontSize: '1.6rem', lineHeight: 2.0, marginBottom: '14px' },
  bodyContent: { fontSize: '1.7rem', lineHeight: 2.0, marginBottom: '14px' },
  chartTitle: { fontSize: '20px', fontWeight: 700 },
  chartAxis: { fontSize: '16px' },
  chartDataLabel: { fontSize: '15px', fontWeight: 600 },
} as const;

/**
 * Emphasis style mappings for inline text highlighting within bullet items.
 * Each maps to a React.CSSProperties-compatible object.
 */
export const EMPHASIS: Record<'result' | 'method' | 'warning' | 'numeric', React.CSSProperties> = {
  result: { color: '#00847F', fontWeight: 700 },
  method: { color: '#002147', fontWeight: 700 },
  warning: { color: '#C53030', fontWeight: 600 },
  numeric: { color: '#1A202C', fontWeight: 700 },
} as const;

/**
 * Dark gradient used for section/dark slide backgrounds.
 */
export const DARK_GRADIENT = 'linear-gradient(135deg, #002147 0%, #1a1a2e 100%)' as const;
