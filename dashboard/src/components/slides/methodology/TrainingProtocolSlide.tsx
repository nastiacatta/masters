import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M1 — the online round, step by step.
 * Paired with M2 (how each forecaster is trained) and M3 (what "held-out" means).
 */

interface StepCard {
  index: string;
  title: string;
  body: string;
  code?: string;
}

const STEPS: StepCard[] = [
  {
    index: '1',
    title: 'Causal normalisation',
    body: 'Rescale the raw series to [0, 1] using only values from rounds ≤ t. The expanding min/max is updated each round.',
    code: 'runner.py :: causal_normalize_expanding',
  },
  {
    index: '2',
    title: 'Each forecaster predicts',
    body: 'fc.fit(norm[:t]); point = fc.predict(); q = fc.predict_quantiles(taus). Retraining follows a cadence: every 24 rounds for XGBoost, every 96 for MLP, every round for the cheap models.',
    code: 'taus = (0.1, 0.2, …, 0.9)',
  },
  {
    index: '3',
    title: 'Aggregate and settle',
    body: 'The mechanism combines the seven quantile fans into a market fan using skill-weighted simplex weights, scores it with CRPS-hat against the (still hidden) outcome, and runs Lambert settlement.',
  },
  {
    index: '4',
    title: 'Reveal y(t), update state',
    body: 'Each forecaster updates its residual buffer with (y_t, point). The mechanism updates its EWMA of normalised loss per agent, so σ_i(t+1) moves.',
  },
  {
    index: '5',
    title: 'Score and log',
    body: 'The runner records agent_crps[i, t], mech_crps[t], plus every baseline (uniform, median, trimmed mean, inverse-CRPS, rolling best single, hindsight inverse-CRPS, per-round oracle, shifted-median OGD fan).',
  },
];

export default function TrainingProtocolSlide() {
  return (
    <SlideShell
      title="How the seven forecasters are trained"
      subtitle="One round at a time — strictly online, strictly causal"
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STEPS.map((step) => (
          <div
            key={step.index}
            style={{
              ...CARD_STYLE,
              padding: '16px 22px',
              display: 'grid',
              gridTemplateColumns: '56px 1fr',
              gap: 18,
              alignItems: 'start',
              borderLeft: `4px solid ${PALETTE.teal}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: 'rgba(46, 139, 139, 0.12)',
                color: PALETTE.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'monospace',
              }}
            >
              {step.index}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, marginBottom: 6 }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.98rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
                {step.body}
              </div>
              {step.code && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '6px 12px',
                    background: 'rgba(27, 42, 74, 0.05)',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: '0.88rem',
                    color: PALETTE.slate,
                    display: 'inline-block',
                  }}
                >
                  {step.code}
                </div>
              )}
            </div>
          </div>
        ))}

        <div
          style={{
            ...CARD_STYLE,
            padding: '14px 22px',
            background: 'rgba(27, 42, 74, 0.03)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.slate, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
            <strong>Reproducibility.</strong> Every RNG seed is fixed at the runner level and threaded into <code style={{ fontFamily: 'monospace' }}>MLPForecaster.seed</code> and <code style={{ fontFamily: 'monospace' }}>XGBoostForecaster.seed</code>. <code style={{ fontFamily: 'monospace' }}>OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE</code> on macOS pins the thread pool.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}
