import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M2 — how each of the seven forecasters is trained.
 * Standalone table + quantile-generation footer.
 */

interface ForecasterRow {
  name: string;
  training: string;
  refit: string;
  role: string;
}

const FORECASTERS: ForecasterRow[] = [
  {
    name: 'Naive',
    training: 'predict = norm[t − 1]',
    refit: 'every round (trivial)',
    role: 'Persistence baseline. Surprisingly strong on autocorrelated wind.',
  },
  {
    name: 'EWMA(5)',
    training: 'Exponential smoothing, span 5',
    refit: 'every round (closed-form)',
    role: 'Smoother than Naive; catches slow trends.',
  },
  {
    name: 'ARIMA(2,1,1)',
    training: 'statsmodels SARIMAX on norm[:t]',
    refit: 'every round',
    role: 'Linear time-series baseline. is_persistence flag surfaces solver failures.',
  },
  {
    name: 'XGBoost',
    training: 'Lag + calendar features, n_estimators ≤ 300',
    refit: 'every 24 rounds',
    role: 'Best single on wind. Expanding-window CV with val_gap = 24.',
  },
  {
    name: 'MLP',
    training: '2 hidden layers, Adam, deterministic seed from runner',
    refit: 'every 96 rounds',
    role: 'Neural baseline. Seed comes from runner, not len(history) % 1000.',
  },
  {
    name: 'Theta',
    training: 'Assimakopoulos–Nikolopoulos Theta method',
    refit: 'every round',
    role: 'Classical decomposition. Weakest on wind; kept for diversity.',
  },
  {
    name: 'Ensemble',
    training: 'Mean of Naive + EWMA',
    refit: 'every round',
    role: 'Sanity check on aggregation. Naive fan widened by EWMA residual std.',
  },
];

export default function ForecasterPanelSlide() {
  return (
    <SlideShell
      title="The seven-forecaster panel"
      subtitle="What each model does and how often it refits"
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ ...CARD_STYLE, padding: '24px 28px' }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr 1fr 1.4fr',
              gap: 16,
              paddingBottom: 12,
              borderBottom: `2px solid ${PALETTE.border}`,
              marginBottom: 6,
            }}
          >
            {['Forecaster', 'Training', 'Refit cadence', 'Role in the panel'].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: PALETTE.slate,
                  fontFamily: TYPOGRAPHY.fontFamily,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {FORECASTERS.map((row, i) => (
            <div
              key={row.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr 1fr 1.4fr',
                gap: 16,
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < FORECASTERS.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
                {row.name}
              </span>
              <span style={{ fontSize: '0.88rem', color: PALETTE.charcoal, fontFamily: 'monospace', lineHeight: 1.45 }}>
                {row.training}
              </span>
              <span style={{ fontSize: '0.9rem', color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.45 }}>
                {row.refit}
              </span>
              <span style={{ fontSize: '0.9rem', color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.5 }}>
                {row.role}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...CARD_STYLE, padding: '18px 24px', borderLeft: `4px solid ${PALETTE.purple}` }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: PALETTE.purple, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.12em', marginBottom: 8 }}>
            QUANTILE GENERATION (ALL SEVEN)
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
            Point forecast plus rolling residual bootstrap: keep the last 500 (y, ŷ) residuals, take empirical quantiles at taus, add to the point forecast, enforce monotonicity with PAV isotonic regression (symmetric around the weighted mean of any violating block — not running-max).
          </p>
        </div>

        <div style={{ ...CARD_STYLE, padding: '18px 24px', borderLeft: `4px solid ${PALETTE.coral}` }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: PALETTE.coral, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.12em', marginBottom: 8 }}>
            FALLBACK COUNTERS
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
            Every forecaster exposes <code style={{ fontFamily: 'monospace' }}>fallback_counter: int = 0</code>. Any exception path (solver divergence, NaN features, not enough history) increments it and silently returns persistence. The runner emits <code style={{ fontFamily: 'monospace' }}>fallback_summary</code> in every output JSON; <code style={{ fontFamily: 'monospace' }}>strict_no_fallback=True</code> raises at end-of-run on any ML fallback &gt; 0.
          </p>
        </div>

      </div>
    </SlideShell>
  );
}
