import SlideShell from '../shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from '../shared/presentationConstants';

/**
 * Backup slide M5 — the code fixes for each of the 14 defects.
 */

interface FixRow {
  code: string;
  fix: string;
  where: string;
}

const FIXES: FixRow[] = [
  { code: 'B1', fix: 'causal_normalize_expanding replaces normalize_series. Invoked at the top of every runner.', where: 'real_data/runner.py, experiments.py, scripts/run_baseline_comparison.py' },
  { code: 'B2', fix: 'Cache files embed pipeline_version = "v2-causal-norm" + forecaster_config_hash; ensure_cache auto-invalidates on mismatch.', where: 'outputs_cache/*.npz, ensure_cache' },
  { code: 'B3', fix: 'Proper held-out grid sweep. Runner reads optimal_params / optimal_improvement_pct from emitted JSON rather than a constant.', where: 'scripts/run_sensitivity_sweep.py' },
  { code: 'B4', fix: 'Pending-prediction deque matches (y_u, ŷ_u) at the correct target index before updating residuals. Sentinel-injection test guards it.', where: 'experiments.py :: _run_horizon_comparison' },
  { code: 'B5', fix: 'val_gap = 24 spaces the validation fold from the test point.', where: 'forecasters.py :: XGBoostForecaster.fit' },
  { code: 'B6', fix: 'Seed is a constant propagated from the runner seed argument.', where: 'forecasters.py :: MLPForecaster.seed' },
  { code: 'B7', fix: 'fallback_summary emitted in every output JSON. strict_no_fallback=True raises at end-of-run on any ML fallback > 0.', where: 'runner.py :: run_real_data_comparison' },
  { code: 'B8', fix: 'Order reordered to transform → score → update → refit on cadence. G used at round t was fitted on PITs from rounds strictly < t.', where: 'runner.py recalibration branch' },
  { code: 'B9', fix: 'Shared helper best_single_by_crps(crps_per_agent, lookback=100). Both runners call it.', where: 'real_data/baselines_shared.py' },
  { code: 'B10', fix: 'Baseline row renamed michael_ogd_centered_median_fan so the label matches the object.', where: 'runner.py emit block' },
  { code: 'B11 / B12', fix: 'rep_holdout → online_window_mean; prequential_blocks → online_block_mean. No citations to Cerqueira 2020 / Tashman 2000 / Dawid 1984 on blocks that do not refit.', where: 'runner.py emit blocks' },
  { code: 'B13', fix: 'regime_shift.json carries within_run_seasonal_slice: true. run_regime_shift_restart_per_season is the main-body table.', where: 'experiments.py' },
  { code: 'B14', fix: 'min_warmup_for(forecasters) returns ≥ 70 for the day-ahead horizon with the current set.', where: 'experiments.py' },
];

export default function FixesCodeSlide() {
  return (
    <SlideShell
      title="What the fixes look like in the code"
      subtitle="Every defect maps to a named function or flag"
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ ...CARD_STYLE, padding: '12px 18px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '86px 2.1fr 1.3fr',
              gap: 14,
              padding: '8px 6px 10px',
              borderBottom: `2px solid ${PALETTE.border}`,
            }}
          >
            {['Code', 'What changed', 'Location'].map((h) => (
              <span key={h} style={{ fontSize: '0.78rem', fontWeight: 700, color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {FIXES.map((row, i) => (
            <div
              key={row.code}
              style={{
                display: 'grid',
                gridTemplateColumns: '86px 2.1fr 1.3fr',
                gap: 14,
                padding: '10px 6px',
                alignItems: 'start',
                borderBottom: i < FIXES.length - 1 ? `1px solid ${PALETTE.border}` : 'none',
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: PALETTE.teal, fontFamily: 'monospace' }}>
                {row.code}
              </span>
              <span style={{ fontSize: '0.88rem', color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, lineHeight: 1.5 }}>
                {row.fix}
              </span>
              <span style={{ fontSize: '0.82rem', color: PALETTE.slate, fontFamily: 'monospace', lineHeight: 1.45 }}>
                {row.where}
              </span>
            </div>
          ))}
        </div>

        <div style={{ ...CARD_STYLE, padding: '14px 22px', background: 'rgba(46, 139, 139, 0.05)', borderLeft: `4px solid ${PALETTE.teal}` }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: PALETTE.charcoal, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
            <strong>Test status after fixes:</strong> 14/14 bug-condition tests green, 10/10 preservation tests green, 105 audit tests pass, 418 non-audit tests pass.
          </p>
        </div>

      </div>
    </SlideShell>
  );
}
