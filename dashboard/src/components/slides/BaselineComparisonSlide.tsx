import SlideShell from './shared/SlideShell';
import { TYPOGRAPHY, FIGURE_FRAME } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Benchmark comparison against the two closest prior designs:
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
      slideNumber={14}
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
        {/* Figure fills the full content area */}
        <div
          style={{
            flex: 1,
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
      </div>
    </SlideShell>
  );
}
