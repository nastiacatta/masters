import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M4 — the 14 training-audit defects, in one table.
 */

interface DefectRow {
  code: string;
  defect: string;
  impact: string;
}

const DEFECTS: DefectRow[] = [
  { code: 'B1', defect: 'Whole-series min/max normalisation leaked evaluation-window extremes into every training round.', impact: 'All headline CRPS values. The biggest single mover.' },
  { code: 'B2', defect: 'Forecast cache at outputs_cache/*.npz had no pipeline version, so a single buggy run contaminated every subsequent baseline comparison.', impact: 'All baseline tables consuming the cache.' },
  { code: 'B3', defect: 'optimal_improvement_pct: −27.2 and (γ=16, ρ=0.5) were hardcoded constants with no held-out sweep artefact.', impact: 'Tuned-parameter claim.' },
  { code: 'B4', defect: '_run_horizon_comparison paired (y_{t−h−1}, ŷ_t) when updating residuals.', impact: 'All horizon experiments (day-ahead, 4h-ahead, regime-shift).' },
  { code: 'B5', defect: 'XGBoost early-stopping validation was the last 20% of training (time-adjacent to the test point), not an expanding-window fold with a gap.', impact: 'XGBoost quantile fan quality.' },
  { code: 'B6', defect: 'MLP seed was len(history) % 1000; MLP output moved whenever the retraining schedule shifted.', impact: 'MLP reproducibility.' },
  { code: 'B7', defect: 'fallback_counter existed on ML models but was never surfaced. Silent persistence masqueraded as "XGBoost" / "MLP".', impact: 'Any run where ML models hit an exception.' },
  { code: 'B8', defect: 'Recalibration update → transform order leaked the current round\'s PIT into the next refit window.', impact: 'mechanism_recal CRPS.' },
  { code: 'B9', defect: 'best_single had two incompatible definitions (CRPS-based in one runner, variance-of-point-error in the other).', impact: 'Any cross-table comparison of "best_single".' },
  { code: 'B10', defect: 'michael_ogd was not Michael\'s algorithm — it was the ensemble\'s per-τ median plus a constant per-round shift, labelled as an OGD baseline.', impact: 'The OGD reference row.' },
  { code: 'B11', defect: 'rep_holdout block cited Cerqueira 2020 / Tashman 2000 but was a windowed mean of a single online run.', impact: 'rep_holdout block in comparison.json.' },
  { code: 'B12', defect: 'prequential_blocks did not refit per block either.', impact: 'prequential_blocks block.' },
  { code: 'B13', defect: 'Regime-shift was a single online run with per-month-index slicing; by the time "winter 2025" was scored, the mechanism had already seen spring/summer/autumn 2024.', impact: 'regime_shift.json.' },
  { code: 'B14', defect: 'Day-ahead warmup was 30 rounds; XGBoost needed ≥ 70. First ~40 scored rounds silently ran persistence.', impact: 'Day-ahead horizon experiments.' },
];

export default function DefectsBeforeSlide() {
  return (
    <SlideShell
      title="What was wrong before the audit (B1 … B14)"
      subtitle="Fourteen methodological defects surfaced by the model-training-testing-audit spec"
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ ...CARD_STYLE, padding: '12px 18px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '56px 2.2fr 1fr',
              gap: 14,
              padding: '8px 6px 10px',
              borderBottom: `2px solid ${PALETTE.border}`,
            }}
          >
            {['Code', 'Defect', 'Where it hit'].map((h) => (
              <span key={h} style={{ fontSize: '0.78rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {DEFECTS.map((row, i) => (
            <div
              key={row.code}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 2.2fr 1fr',
                gap: 14,
                padding: '10px 6px',
                alignItems: 'start',
                borderBottom: i < DEFECTS.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: PALETTE.coral, fontFamily: 'monospace' }}>
                {row.code}
              </span>
              <span style={{ fontSize: '0.88rem', color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.5 }}>
                {row.defect}
              </span>
              <span style={{ fontSize: '0.85rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.5 }}>
                {row.impact}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...CARD_STYLE, padding: '16px 22px', background: 'rgba(232, 93, 74, 0.05)', borderLeft: `4px solid ${PALETTE.coral}` }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
            The pre-fix headline was "mechanism −44.1% CRPS vs uniform" on wind. Most of that was B1: normalising by the full-series max pushed the training signal into a tighter range than the forecasters would see at test time. Under strictly-causal expanding normalisation the honest figure is <strong style={{ color: PALETTE.teal }}>−7.1%</strong>.
          </p>
        </div>

      </div>
    </SlideShell>
  );
}
