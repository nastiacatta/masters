import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M6 — pre-fix vs post-fix headline numbers, side by side.
 */

interface Row {
  metric: string;
  pre: string;
  post: string;
  cause: string;
}

const ROWS: Row[] = [
  { metric: 'Mechanism vs uniform (wind, full series)', pre: '−44.1%', post: '−7.1%', cause: 'B1 + B13 + B14' },
  { metric: 'Mechanism vs uniform (wind, 3 000-pt audit)', pre: 'not a headline', post: '−5.4%', cause: 'B1' },
  { metric: 'Mechanism vs uniform (electricity)', pre: '−8%', post: '≈ 0.0% (null)', cause: 'B1' },
  { metric: 'DM t-stat mechanism vs uniform (wind)', pre: 'no Andrews', post: '22.35 (Andrews), 40.77 (h=1)', cause: 'Andrews 1991 HAC bandwidth' },
  { metric: 'Mechanism vs Elia real-time (grid-matched)', pre: '+6% better (3-grid artefact)', post: '+8% better (9-grid)', cause: 'Grid-match fix A2' },
  { metric: 'XGBoost CRPS (wind, audit slice)', pre: '—', post: '0.01777', cause: 'Post-fix baseline' },
  { metric: 'Spearman(σ_learned, CRPS_truth)', pre: '—', post: '1.0', cause: 'Skill layer correctness' },
];

export default function BeforeAfterNumbersSlide() {
  return (
    <SlideShell
      title="Pre-fix vs post-fix, side by side"
      subtitle="Every headline number tracked across the audit"
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ ...CARD_STYLE, padding: '20px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.1fr 1.4fr 1.2fr',
              gap: 16,
              padding: '8px 6px 12px',
              borderBottom: `2px solid ${PALETTE.border}`,
            }}
          >
            {['Metric', 'Pre-fix', 'Post-fix', 'Attributable to'].map((h) => (
              <span key={h} style={{ fontSize: '0.82rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.metric}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.1fr 1.4fr 1.2fr',
                gap: 16,
                padding: '12px 6px',
                alignItems: 'center',
                borderBottom: i < ROWS.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
              }}
            >
              <span style={{ fontSize: '0.95rem', color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.45 }}>
                {row.metric}
              </span>
              <span style={{ fontSize: '0.98rem', fontWeight: 700, color: PALETTE.coral, fontFamily: 'monospace' }}>
                {row.pre}
              </span>
              <span style={{ fontSize: '0.98rem', fontWeight: 700, color: PALETTE.teal, fontFamily: 'monospace' }}>
                {row.post}
              </span>
              <span style={{ fontSize: '0.85rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.45 }}>
                {row.cause}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...CARD_STYLE, padding: '18px 24px', background: 'rgba(27, 42, 74, 0.04)' }}>
          <p style={{ margin: 0, fontSize: '0.97rem', color: PALETTE.charcoal, lineHeight: 1.6, fontFamily: TYPOGRAPHY.fontFamily }}>
            <strong>The honest reading.</strong> The mechanism still wins against uniform on wind, but by a much smaller margin (−7.1%, not −44%). On electricity it returns a null instead of a spurious regression — the correct behaviour on an undifferentiated panel. The external Elia comparison <em>flipped sign</em> once Elia's fan was re-scored on the matched 9-level τ-grid: the pre-fix comparison scored Elia on a 3-point trapezoidal rule that under-integrates the pinball integrand and artificially flattered Elia by ~20%.
          </p>
        </div>

      </div>
    </SlideShell>
  );
}
