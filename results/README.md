# Results

Single entry point for the thesis's empirical results. Each claim from
[`THESIS_CLAIMS.md`](../THESIS_CLAIMS.md) is mapped here to the
canonical plot, table, or JSON that backs it.

All paths below are **live references** to artifacts elsewhere in the
repo. Rerun the owning script and this folder automatically reflects
the new numbers — nothing is copied, nothing drifts.

> The canonical slide deck is the password-protected
> [`PresentationPage`](../dashboard/src/pages/PresentationPage.tsx) in
> the dashboard. Every figure referenced below also appears in the
> deck (see the slide column).

---

## How to regenerate everything

```bash
# Primary mechanism audit: Claims 1, 4, 5, 6
cd onlinev2
OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE python scripts/audit_fresh_run.py

# Per-quantile calibration: Claim 6
OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE python scripts/audit_per_quantile_coverage.py

# Recalibration validation: Claims 7, 8
OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE python scripts/audit_recalibration_elia.py

# Skill layer invariants: Claim 2
OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE python -m pytest -m audit tests/audit/

# Regenerate slide figures (after numeric changes)
Rscript presentation/R/run_all.R     # or any individual plot_*.R

# Individual scripts (each fail-isolated, fast):
#   Rscript presentation/R/plot_baseline_comparison.R
#   Rscript presentation/R/plot_real_data.R
#   Rscript presentation/R/plot_skill_signal.R
#   Rscript presentation/R/plot_skill_recovery.R
#   Rscript presentation/R/plot_skill_trajectory.R
#   Rscript presentation/R/plot_forecast_aggregation.R
#   Rscript presentation/R/plot_settlement_sanity.R
#   Rscript presentation/R/plot_deposit_policy.R
#   Rscript presentation/R/plot_positioning_matrix.R
#   Rscript presentation/R/plot_sybil.R
#   Rscript presentation/R/plot_parameter_sweep.R
#   Rscript presentation/R/plot_calibration_reliability.R
#   Rscript presentation/R/plot_behaviour_concentration.R
#   Rscript presentation/R/plot_weight_rule_comparison.R
```---

## Claim-to-artifact map

### Claim 1 — Mechanism correctness

Self-financed wagering is internally consistent: 13/13 payoff invariants
pass, 35 unit tests green, 60 golden snapshots pinned.

| Artifact | Path |
|---|---|
| Audit summary | [`onlinev2/tests/audit/fixtures/counterexamples/SUMMARY.md`](../onlinev2/tests/audit/fixtures/counterexamples/SUMMARY.md) |
| Invariant suite | [`onlinev2/tests/audit/`](../onlinev2/tests/audit/) |
| Core code | [`onlinev2/payoff/`](../onlinev2/payoff/) |
| Spec | [`.kiro/specs/mechanism-correctness-audit-fix/`](../.kiro/specs/mechanism-correctness-audit-fix/) |

No slide directly — this is the safety net that lets every other claim
stand.

---

### Claim 2 — Skill layer tracks forecaster quality

EWMA-to-σ recovers the true CRPS ordering (Spearman ρ = 1.00) and
satisfies every algebraic invariant on the known-σ synthetic DGP.

| Artifact | Path |
|---|---|
| Slide figure | [`dashboard/public/presentation-plots/quantiles_crps_recovery.png`](../dashboard/public/presentation-plots/quantiles_crps_recovery.png) |
| R plot script | [`presentation/R/plot_skill_recovery.R`](../presentation/R/plot_skill_recovery.R) |
| Code | [`onlinev2/src/onlinev2/core/skill.py`](../onlinev2/src/onlinev2/core/skill.py) |
| Test | [`onlinev2/tests/audit/test_bug_condition_d_skill.py`](../onlinev2/tests/audit/test_bug_condition_d_skill.py) |
| Slide | 9 — Synthetic Validation: Convergence |

---

### Claim 3 — Forecasters train without silent failure

All seven base models train without leakage, without silent exception
swallowing, and without persistence masquerading as model output.

| Artifact | Path |
|---|---|
| Code | [`onlinev2/src/onlinev2/real_data/forecasters.py`](../onlinev2/src/onlinev2/real_data/forecasters.py) |
| Training audit tests | [`onlinev2/tests/audit/test_bug_condition_c_training.py`](../onlinev2/tests/audit/test_bug_condition_c_training.py) |
| Quantile pipeline tests | [`onlinev2/tests/test_quantile_pipeline.py`](../onlinev2/tests/test_quantile_pipeline.py) |
| Slide | 8 — Models, Data, and Synthetic Setup |

---

### Claim 4 — Mechanism aggregate is competitive with Michael's OGD

Wager-weighted linear pool matches Vitali-style pinball-OGD within
0.3% CRPS on a stationary Elia wind slice.

| Artifact | Path |
|---|---|
| Slide figure | [`dashboard/public/presentation-plots/baseline_comparison.png`](../dashboard/public/presentation-plots/baseline_comparison.png) |
| R plot script | [`presentation/R/plot_baseline_comparison.R`](../presentation/R/plot_baseline_comparison.R) |
| Driver script | [`onlinev2/scripts/audit_fresh_run.py`](../onlinev2/scripts/audit_fresh_run.py) |
| Julia reference | [`michael/main_rewards.jl`](../michael/main_rewards.jl) |
| Port | [`onlinev2/src/onlinev2/mechanism/michael_port.py`](../onlinev2/src/onlinev2/mechanism/michael_port.py) |
| Slide | 11 — Benchmark: CRPS Comparison |

---

### Claim 5 — XGBoost is the best individual forecaster

XGBoost leads the panel and is correctly identified as top-skill by
the mechanism's EWMA layer.

| Artifact | Path |
|---|---|
| Live chart (slide 10) | [`dashboard/public/data/real_data/elia_wind/data/comparison.json`](../dashboard/public/data/real_data/elia_wind/data/comparison.json) |
| Driver script | [`onlinev2/scripts/audit_fresh_run.py`](../onlinev2/scripts/audit_fresh_run.py) |
| Slide | 10 — Real Data: Elia Wind + Electricity |

---

### Claim 6 — Aggregate miscalibration is real but small

Linear-pool aggregate is Ranjan-Gneiting miscalibrated. Mean tail
deviation on stationary Elia wind is 0.017.

| Artifact | Path |
|---|---|
| Raw output | [`onlinev2/outputs/audit_per_quantile/coverage.json`](../onlinev2/outputs/audit_per_quantile/coverage.json) |
| Slide figure | [`dashboard/public/presentation-plots/calibration_reliability.png`](../dashboard/public/presentation-plots/calibration_reliability.png) |
| Driver script | [`onlinev2/scripts/audit_per_quantile_coverage.py`](../onlinev2/scripts/audit_per_quantile_coverage.py) |
| Slide (appendix) | Appendix — Calibration reliability diagram |

---

### Claim 7 — Recalibration closes the gap

Rolling isotonic (Kuleshov-Fenner-Ermon) closes ~41% of tail deviation
for ~1.6% CRPS cost.

| Artifact | Path |
|---|---|
| Summary | [`onlinev2/outputs/audit_per_quantile/RECALIBRATION_SUMMARY.md`](../onlinev2/outputs/audit_per_quantile/RECALIBRATION_SUMMARY.md) |
| Numeric output | [`onlinev2/outputs/audit_per_quantile/coverage_recal.json`](../onlinev2/outputs/audit_per_quantile/coverage_recal.json) |
| Code | [`onlinev2/src/onlinev2/core/recalibration.py`](../onlinev2/src/onlinev2/core/recalibration.py) |
| Spec | [`.kiro/specs/mechanism-recalibration-layer/`](../.kiro/specs/mechanism-recalibration-layer/) |

---

### Claim 8 — Economic structure and calibration fix are orthogonal

Recalibration is purely additive: aggregation, skill, wager, and
settlement layers are untouched.

| Artifact | Path |
|---|---|
| Pre-feature snapshot (byte-identical check) | [`onlinev2/tests/fixtures/pre_recalibration_comparison.json`](../onlinev2/tests/fixtures/pre_recalibration_comparison.json) |
| Runner hook | [`onlinev2/src/onlinev2/real_data/runner.py`](../onlinev2/src/onlinev2/real_data/runner.py) |
| Design doc | [`.kiro/specs/mechanism-recalibration-layer/design.md`](../.kiro/specs/mechanism-recalibration-layer/design.md) |

---

## Supporting figures (not tied to a single claim)

| Figure | Where used | Path |
|---|---|---|
| Skill signal curve | Slide 7 (Skill Signal) | [`dashboard/public/presentation-plots/skill_signal_clean.png`](../dashboard/public/presentation-plots/skill_signal_clean.png) |
| Positioning matrix | Slide 4 (Where This Work Fits) | rendered live in React, no PNG |
| Mechanism pipeline | Slide 6 (Round-by-Round) | rendered live in React, no PNG |
| Sybil attack | Appendix (Strategic Robustness) | [`dashboard/public/presentation-plots/sybil.png`](../dashboard/public/presentation-plots/sybil.png) |
| Arbitrage heatmap | Appendix | [`dashboard/public/presentation-plots/arbitrage_heatmap.png`](../dashboard/public/presentation-plots/arbitrage_heatmap.png) |
| Parameter sweep | Appendix | [`dashboard/public/presentation-plots/parameter_sweep.png`](../dashboard/public/presentation-plots/parameter_sweep.png) |
| Behaviour concentration | Appendix | [`dashboard/public/presentation-plots/behaviour_concentration.png`](../dashboard/public/presentation-plots/behaviour_concentration.png) |
| Deposit policy | Appendix | [`dashboard/public/presentation-plots/deposit_policy_comparison.png`](../dashboard/public/presentation-plots/deposit_policy_comparison.png) |
| Bankroll ablation | Appendix | [`dashboard/public/presentation-plots/bankroll_ablation_four_panel.png`](../dashboard/public/presentation-plots/bankroll_ablation_four_panel.png) |
| Real data validation | Appendix (seasonality) | [`dashboard/public/presentation-plots/real_data_validation.png`](../dashboard/public/presentation-plots/real_data_validation.png) |

---

## Figure ↔ script provenance

Every PNG in `dashboard/public/presentation-plots/` is generated by an
R script in `presentation/R/`. The table below records the mapping so
a stale figure can be regenerated in one command.

| PNG | Generator |
|---|---|
| `baseline_comparison.png` | `presentation/R/plot_baseline_comparison.R` |
| `behaviour_concentration.png` | `presentation/R/plot_behaviour_concentration.R` |
| `calibration_reliability.png` | `presentation/R/plot_calibration_reliability.R` |
| `deposit_policy_comparison.png` | `presentation/R/plot_deposit_policy.R` |
| `forecast_aggregation.png`, `forecast_aggregation_four_panel.png`, `motivation_aggregation.png` | `presentation/R/plot_forecast_aggregation.R` |
| `parameter_sweep.png` | `presentation/R/plot_parameter_sweep.R` |
| `positioning_matrix.png` | `presentation/R/plot_positioning_matrix.R` |
| `real_data_validation.png` | `presentation/R/plot_real_data.R` |
| `settlement_sanity.png` | `presentation/R/plot_settlement_sanity.R` |
| `skill_recovery` figures — `quantiles_crps_recovery.png`, `point_mae_recovery.png` | `presentation/R/plot_skill_recovery.R` |
| `skill_signal_clean.png` | `presentation/R/plot_skill_signal.R` |
| `skill_wager.png` — σ trajectory on known-noise panel (Figure F4) | `presentation/R/plot_skill_trajectory.R` |
| `sybil.png` | `presentation/R/plot_sybil.R` |
| `weight_rule_comparison.png` | `presentation/R/plot_weight_rule_comparison.R` |

The slide deck also uses a handful of composite figures
(`master_comparison*.png`, `bankroll_ablation*.png`,
`behaviour_wealth.png`,
`crps_calibration.png`,
`mechanism_steps.png`, `scoring_validation.png`,
`selective_participation.png`,
`fixed_deposit.png`, `arbitrage_heatmap.png`, `title_background.png`)
that come out of the experiment runners in
`onlinev2/src/onlinev2/experiments/runners/runner_module.py` and the
behaviour plotters in `onlinev2/src/onlinev2/behaviour/plotting/`.
Their matplotlib palette lives in
[`onlinev2/src/onlinev2/plotting/style.py`](../onlinev2/src/onlinev2/plotting/style.py)
and is aligned with `theme_thesis.R` so colours match end-to-end.

The following legacy generators are **deprecated** and now raise an
error if invoked — they used a mismatched palette and (in several
cases) hardcoded illustrative numbers:

- `onlinev2/scripts/generate_presentation_plots.py`
- `onlinev2/scripts/gen_slides_plots.py`
- `onlinev2/scripts/gen_slides_r.R`
- `onlinev2/scripts/gen_final_plots.R`
- `scripts/plot_all_slides.R`

---

_Last updated: 2026-05-07. When the current experiment run finishes,
re-run `Rscript presentation/R/run_all.R` — paths in this file will
pick up the new artifacts automatically._
