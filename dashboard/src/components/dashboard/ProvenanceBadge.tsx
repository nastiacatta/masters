export interface ProvenanceBadgeProps {
  /** Data source type controlling the badge colour. */
  type: 'real' | 'synthetic' | 'demo';
  /**
   * Full provenance label including context, e.g.
   * "Real data — Elia offshore wind, Jan–Dec 2023, N=8,760"
   */
  label: string;
}

/** Colour mapping per provenance type: [background, text]. */
const COLOUR_MAP: Record<ProvenanceBadgeProps['type'], { bg: string; text: string }> = {
  real:      { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  synthetic: { bg: 'bg-amber-100',   text: 'text-amber-700' },
  demo:      { bg: 'bg-slate-100',   text: 'text-slate-600' },
};

/**
 * Inline pill badge indicating the provenance of chart data.
 *
 * Renders as a small rounded pill with colour-coded background.
 * Positioning (e.g. top-left of chart area) is handled by the parent.
 */
export default function ProvenanceBadge({ type, label }: ProvenanceBadgeProps) {
  const colours = COLOUR_MAP[type];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 ${colours.bg} ${colours.text}`}
      style={{ fontSize: '11px', lineHeight: '16px' }}
    >
      {label}
    </span>
  );
}
