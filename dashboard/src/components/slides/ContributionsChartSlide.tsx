import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 11: Real Data Validation — key finding text + master_comparison graph.
 * Brings back the headline results while keeping the clear graph.
 */
export default function ContributionsChartSlide() {
  return (
    <SlideShell title="Real Data Validation" slideNumber={11}>
      {/* Key finding highlight box */}
      <div style={{
        background: 'rgba(46, 139, 139, 0.08)',
        border: `2px solid ${PALETTE.teal}`,
        borderRadius: 12,
        padding: '14px 24px',
        marginBottom: 10,
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: PALETTE.teal,
          fontFamily: TYPOGRAPHY.fontFamily,
        }}>
          −34% CRPS improvement on Elia wind data (γ=16, ρ=0.5)
        </span>
      </div>

      {/* Experiment details */}
      <p style={{
        fontSize: '1.05rem',
        color: PALETTE.slate,
        fontFamily: TYPOGRAPHY.fontFamily,
        textAlign: 'center',
        margin: '0 0 12px 0',
      }}>
        17,544 rounds · 7 forecasters: Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble
      </p>

      {/* Main chart image */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={`${BASE}presentation-plots/master_comparison.png`}
          alt="CRPS comparison across aggregation methods on Elia wind data"
          style={{ maxWidth: '95%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10 }}
        />
      </div>

      {/* Bottom finding boxes */}
      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        <div style={{
          flex: 1,
          background: 'rgba(46, 139, 139, 0.06)',
          border: `1.5px solid ${PALETTE.teal}`,
          borderRadius: 10,
          padding: '12px 20px',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: PALETTE.teal,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            Wind: −34% CRPS vs equal weights
          </span>
        </div>
        <div style={{
          flex: 1,
          background: 'rgba(232, 93, 74, 0.06)',
          border: `1.5px solid ${PALETTE.coral}`,
          borderRadius: 10,
          padding: '12px 20px',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: PALETTE.coral,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            Electricity: −4% (less forecaster heterogeneity)
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
