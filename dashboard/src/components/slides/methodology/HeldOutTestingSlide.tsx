import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M3 — what "held-out" means when the protocol is purely online.
 */

interface Item {
  label: string;
  body: string;
}

const ITEMS: Item[] = [
  {
    label: 'Warmup window (rounds 1 … 200)',
    body: 'Forecasters train, skill state initialises, residual buffers fill. Not scored. For the day-ahead horizon experiments, warmup is bumped to ≥ 70 so XGBoost and MLP are not silently reduced to persistence in the early rounds (fix B14).',
  },
  {
    label: 'Evaluation window (rounds 201 … T)',
    body: 'Every round is a one-step-ahead (or h-step-ahead) forecast made strictly from past data. No look-ahead, no cache reuse from a buggy pipeline version.',
  },
  {
    label: 'Sensitivity split for (γ, ρ, λ)',
    body: 'Parameters come from a held-out sweep on an Elia partition disjoint from the headline window. Artefact: outputs/real_data/*/sensitivity_sweep.json. The runner reads optimal_params from that file rather than a hardcoded constant (fix B3).',
  },
  {
    label: 'Horizon protocol',
    body: 'For h-step-ahead, residuals are formed with a pending-prediction deque so (y_u, ŷ_u) pairs match at the correct target index (fix B4). The older code paired y_{t−h−1} with ŷ_t — a residual of no well-defined horizon.',
  },
  {
    label: 'Regime-shift protocol',
    body: 'Two variants coexist. Legacy "within-run seasonal slice" buckets per-round CRPS by calendar season and is now labelled as such. run_regime_shift_restart_per_season resets forecaster and skill state at each boundary; it delivers −0.8% to −1.2% vs uniform in every season without exception.',
  },
];

export default function HeldOutTestingSlide() {
  return (
    <SlideShell
      title='What "held-out" means when the protocol is purely online'
      subtitle="No train/test split in the classical sense. Here are the four equivalents."
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {ITEMS.map((item) => (
          <div key={item.label} style={{ ...CARD_STYLE, padding: '18px 24px', borderLeft: `4px solid ${PALETTE.teal}` }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, marginBottom: 6 }}>
              {item.label}
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
              {item.body}
            </p>
          </div>
        ))}

      </div>
    </SlideShell>
  );
}
