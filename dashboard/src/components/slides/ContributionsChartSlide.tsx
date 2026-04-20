import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 11: Real Data Validation — uses master_comparison.png for a professional
 * multi-method comparison chart instead of a sparse 2-bar Recharts chart.
 */

export default function ContributionsChartSlide() {
  return (
    <SlideShell title="Real Data Validation" slideNumber={11}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header with key finding */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              background: 'rgba(46, 139, 139, 0.06)',
              border: `1.5px solid ${PALETTE.teal}`,
              borderRadius: 12,
              padding: '16px 24px',
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: PALETTE.teal,
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: 0,
              }}
            >
              Mechanism achieves −34% CRPS improvement on Elia wind data (tuned params)
            </p>
            <p
              style={{
                fontSize: '1rem',
                color: PALETTE.charcoal,
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: '6px 0 0 0',
              }}
            >
              17,544 rounds, 7 forecasters
            </p>
          </div>
          <p
            style={{
              fontSize: '1rem',
              color: PALETTE.slate,
              fontFamily: TYPOGRAPHY.fontFamily,
              margin: 0,
            }}
          >
            Forecasters: Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble
          </p>
        </div>

        {/* Real experimental comparison chart */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={`${BASE}presentation-plots/master_comparison.png`}
            alt="CRPS comparison across methods on real data"
            style={{ maxWidth: '100%', maxHeight: '85%', objectFit: 'contain', borderRadius: 10 }}
          />
        </div>

        {/* Key findings row */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          <div style={{ flex: 1, background: 'rgba(46, 139, 139, 0.06)', borderLeft: `6px solid ${PALETTE.teal}`, borderRadius: '0 12px 12px 0', padding: '12px 16px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
              Wind: −34% CRPS improvement over equal weights (tuned params)
            </span>
          </div>
          <div style={{ flex: 1, background: 'rgba(232, 93, 74, 0.06)', borderLeft: `6px solid ${PALETTE.coral}`, borderRadius: '0 12px 12px 0', padding: '12px 16px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}>
              Limitation: gains conditional on forecaster heterogeneity
            </span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
