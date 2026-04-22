import type React from 'react';

/**
 * Clean academic palette — single source of truth for all presentation colours.
 * Every colour used in text, SVG fills, or chart data series must come from this set.
 */
export const PALETTE = {
  // Primary
  navy: '#1B2A4A',        // Deep navy — headings, primary text
  white: '#FFFFFF',       // Backgrounds
  offWhite: '#F8FAFC',   // Slide backgrounds (light)

  // Accent
  imperial: '#003E74',    // Imperial blue — strong accent
  teal: '#2E8B8B',       // Teal — results, positive
  coral: '#E85D4A',      // Coral red — warnings, negative
  purple: '#7C3AED',     // Light purple — highlights, annotations

  // Neutral
  charcoal: '#2D3748',   // Body text
  slate: '#64748B',      // Secondary text, subtitles
  border: '#CBD5E1',     // Borders, grid lines
  lightBg: '#F1F5F9',    // Card backgrounds

  // Dark mode
  darkBg: '#0F172A',     // Dark slide backgrounds
  darkText: '#E2E8F0',   // Text on dark backgrounds
} as const;

/**
 * Typography tokens for consistent font sizing and spacing across all slides.
 */
export const TYPOGRAPHY = {
  fontFamily: "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif",
  heading: { fontSize: '3.2rem', fontWeight: 700, lineHeight: 1.15 },
  body: { fontSize: '1.8rem', lineHeight: 2.2, marginBottom: '16px' },
  bodySplit: { fontSize: '1.7rem', lineHeight: 2.0, marginBottom: '14px' },
  bodyContent: { fontSize: '1.9rem', lineHeight: 2.2, marginBottom: '16px' },
  chartTitle: { fontSize: '22px', fontWeight: 700 },
  chartAxis: { fontSize: '16px' },
  chartDataLabel: { fontSize: '17px', fontWeight: 600 },
} as const;

/**
 * Emphasis style mappings for inline text highlighting within bullet items.
 */
export const EMPHASIS: Record<'result' | 'method' | 'warning' | 'numeric', React.CSSProperties> = {
  result: { color: '#2E8B8B', fontWeight: 700 },
  method: { color: '#1B2A4A', fontWeight: 700 },
  warning: { color: '#E85D4A', fontWeight: 600 },
  numeric: { color: '#2D3748', fontWeight: 700 },
} as const;

/**
 * Dark gradient used for section/dark slide backgrounds.
 */
export const DARK_GRADIENT = 'linear-gradient(135deg, #1B2A4A 0%, #0F172A 100%)' as const;

/**
 * Section bar height — thicker for visual impact.
 */
export const SECTION_BAR_HEIGHT = 6;

/**
 * Consistent card styling tokens used across all slides.
 */
export const CARD_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: `1.5px solid #CBD5E1`,
  background: '#FFFFFF',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  padding: '24px 28px',
};

/**
 * Section definitions for the presentation flow.
 * Updated for the new 14-slide narrative arc.
 */
export const SECTIONS = {
  PROBLEM:    { label: 'PROBLEM',    colour: '#003E74',    slides: [1, 2, 3, 4, 5] },
  SOLUTION:   { label: 'SOLUTION',   colour: '#2E8B8B',    slides: [6, 7, 8] },
  VALIDATION: { label: 'VALIDATION', colour: '#7C3AED',    slides: [9, 10, 11, 12, 13] },
  CLOSING:    { label: '',           colour: 'transparent', slides: [14] },
} as const;

/** Get section info for a given slide number */
export function getSectionForSlide(slideNumber: number): { label: string; colour: string } {
  if (slideNumber >= 1 && slideNumber <= 5) return SECTIONS.PROBLEM;
  if (slideNumber >= 6 && slideNumber <= 8) return SECTIONS.SOLUTION;
  if (slideNumber >= 9 && slideNumber <= 14) return SECTIONS.VALIDATION;
  return SECTIONS.CLOSING;
}
