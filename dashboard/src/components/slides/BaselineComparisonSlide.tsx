import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY, FIGURE_FRAME } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 14 — Benchmark comparison against the two closest prior designs,
 * with compact takeaway cards below the figure.
 *
 *   • Raja et al. — history-free self-financed wagering (Lambert settlement).
 *   • Vitali & Pinson — per-quantile OGD on the probability simplex.
 *
 * Figure `baseline_comparison.png` is produced by
 * `presentation/R/plot_baseline_comparison.R` from the per-round CRPS series
 * computed by `scripts/run_baseline_comparison.py`.  All three methods are
 * evaluated on the same 7-forecaster panel, same warm-up, same quantile grid.
 */
export default function BaselineComparisonSlide() {
  return (
    <SlideShell
      title="Benchmark: CRPS Comparison"
      slideNumber={11}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: TYPOGRAPHY.fontFamily,
          minHeight: 0,
        }}
      >
        {/* Figure — takes maximum space */}
        <div
          style={{
            flex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            ...FIGURE_FRAME,
          }}
        >
          <img
            src={`${BASE}presentation-plots/baseline_comparison.png`}
            alt="Mean CRPS on Elia wind and electricity for equal weights, Raja, Vitali, and the project's mechanism"
            style={{
              flex: 1,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />
        </div>

        {/* Compact takeaway cards strip */}
        <div
          style={{
            flex: 0,
            display: 'flex',
            gap: 14,
            marginTop: 14,
          }}
        >
          {/* Raja card */}
          <div
            style={{
              flex: 1,
              background: 'rgba(0, 62, 116, 0.06)',
              border: `1.5px solid ${PALETTE.imperial}`,
              borderRadius: 10,
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.imperial, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Raja et&nbsp;al. (history-free)
            </div>
            <div style={{ fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.45, marginTop: 4 }}>
              Self-financed but history-free — small gains vs equal weights.
            </div>
          </div>

          {/* Vitali card */}
          <div
            style={{
              flex: 1,
              background: 'rgba(124, 58, 237, 0.06)',
              border: `1.5px solid ${PALETTE.purple}`,
              borderRadius: 10,
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.purple, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vitali &amp; Pinson (OGD)
            </div>
            <div style={{ fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.45, marginTop: 4 }}>
              Lowest CRPS in this benchmark — not self-financed; relative weights.
            </div>
          </div>

          {/* This project card */}
          <div
            style={{
              flex: 1,
              background: 'rgba(232, 93, 74, 0.08)',
              border: `1.5px solid ${PALETTE.coral}`,
              borderRadius: 10,
              padding: '10px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.coral, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              This project (skill + self-financed)
            </div>
            <div style={{ fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.45, marginTop: 4 }}>
              −44% wind, −8% electricity. Retains Lambert&apos;s properties; absolute skill.
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
