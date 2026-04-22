import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Head-to-head comparison against the two closest prior designs:
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
      title="Head-to-Head: Raja vs Vitali vs Ours"
      slideNumber={13}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: TYPOGRAPHY.fontFamily,
          minHeight: 0,
          gap: 10,
        }}
      >
        {/* Figure fills the dominant slot */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}
        >
          <img
            src={`${BASE}presentation-plots/baseline_comparison.png`}
            alt="Mean CRPS on Elia wind and electricity for equal weights, Raja, Vitali, and our mechanism"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 10,
            }}
          />
        </div>

        {/* Three-card takeaway strip */}
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <div
            style={{
              flex: 1,
              background: 'rgba(0, 62, 116, 0.06)',
              border: `1.5px solid ${PALETTE.imperial}`,
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.imperial, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Raja et&nbsp;al. (history-free)
            </div>
            <div style={{ fontSize: '1rem', color: PALETTE.charcoal, lineHeight: 1.4, marginTop: 4 }}>
              Self-financed but no memory. Barely beats equal weights (−2.5% wind, −2.3% electricity).
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(124, 58, 237, 0.06)',
              border: `1.5px solid ${PALETTE.purple}`,
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.purple, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vitali & Pinson (OGD)
            </div>
            <div style={{ fontSize: '1rem', color: PALETTE.charcoal, lineHeight: 1.4, marginTop: 4 }}>
              Strong pure CRPS optimiser. Gives up self-financing and absolute skill — weights are relative.
            </div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(232, 93, 74, 0.08)',
              border: `1.5px solid ${PALETTE.coral}`,
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.coral, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ours (skill + self-financed)
            </div>
            <div style={{ fontSize: '1rem', color: PALETTE.charcoal, lineHeight: 1.4, marginTop: 4 }}>
              −44% wind, −8% electricity vs equal weights. Keeps Lambert&apos;s seven properties — a controlled CRPS trade for economic discipline.
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
