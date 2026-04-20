import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 11: Real Data Validation — just one clear graph.
 * The master_comparison.png shows CRPS across all methods on real Elia wind data.
 */
export default function ContributionsChartSlide() {
  return (
    <SlideShell title="Real Data Validation" slideNumber={11}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <img
          src={`${BASE}presentation-plots/master_comparison.png`}
          alt="CRPS comparison across aggregation methods on Elia wind data"
          style={{ maxWidth: '95%', maxHeight: '90%', objectFit: 'contain', borderRadius: 10 }}
        />
        <p style={{
          fontSize: '1rem',
          color: PALETTE.slate,
          fontFamily: TYPOGRAPHY.fontFamily,
          marginTop: 12,
          textAlign: 'center',
        }}>
          Elia wind — 17,544 rounds — ARIMA, XGBoost, MLP, Moving Average, Naive
        </p>
      </div>
    </SlideShell>
  );
}
