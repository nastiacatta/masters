# Figures and tables — master index

Every figure and table that will appear in the thesis. Each entry has:

- **ID**: `F#` for figures, `T#` for tables. Use these IDs in prose.
- **Title**: one-line caption seed.
- **Source**: where the underlying data or plot file lives.
- **Chapter**: which `writing/*.md` file it supports.
- **Status**: LOCKED / PARTIAL / PENDING.

## Tables

| ID | Title | Source | Chapter | Status |
|---|---|---|---|:---:|
| T1 | Mechanism correctness invariants (1000 rounds × 20 seeds) | `onlinev2/outputs/core/experiments/settlement_sanity/data/summary.csv` + `onlinev2/tests/audit/test_bug_condition_e_payoff.py` | 50_results_synthetic | LOCKED |
| T2 | Skill recovery on known-noise panel | `experiments.py --exp skill_recovery` output | 50_results_synthetic | LOCKED |
| T3 | Deposit policy ablation | `experiments.py --exp deposit_policies` output | 50_results_synthetic | LOCKED |
| T4 | Weight rule comparison (fixed vs bankroll deposits) | `experiments.py --exp weight_rules` output | 50_results_synthetic | LOCKED |
| T5 | Bankroll pipeline ablation (A–E) | `onlinev2/outputs/core/experiments/bankroll_ablation/data/bankroll_ablation.csv` | 50_results_synthetic | LOCKED |
| T6 | Elia wind full-length run: aggregate comparison (post-fix, expanding-mode) | `dashboard/public/data/real_data/elia_wind/data/comparison.json` | 60_results_real_data | LOCKED |
| T6a | Elia wind audit slice: aggregate comparison (static-mode, calibration anchor) | `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json` | 60_results_real_data | LOCKED |
| T6b | Elia wind baselines head-to-head (vitali_ogd, raja, mechanism) — static-mode | `dashboard/public/data/real_data/elia_wind/data/baselines.json` | 60_results_real_data | LOCKED (static) |
| T6c | Elia operational forecast comparison (mostrecent, dayahead, weekahead) | `onlinev2/outputs/elia_forecast_baseline.json` | 60_results_real_data | LOCKED |
| T7 | Elia wind: per-forecaster CRPS and $\sigma$ | same comparison.json, `per_agent_crps` | 60_results_real_data | LOCKED |
| T8 | Elia wind: per-$\tau$ coverage (mechanism) | `onlinev2/outputs/audit_per_quantile/coverage.json` | 60_results_real_data | LOCKED |
| T9 | Elia wind: recalibration headline | `onlinev2/outputs/audit_per_quantile/RECALIBRATION_SUMMARY.md` | 70_recalibration_layer | LOCKED |
| T10 | Elia wind: recalibration spec assertions | same source | 70_recalibration_layer | LOCKED |
| T11 | Elia electricity: aggregate comparison (post-fix, expanding-mode) | `dashboard/public/data/real_data/elia_electricity/data/comparison.json` | 60_results_real_data | LOCKED |
| T12 | Day-ahead horizon comparison (h = 1 on daily series, warmup ≥ 70) | `dashboard/public/data/real_data/elia_wind/data/day_ahead.json` | 60_results_real_data | LOCKED (static) |
| T13 | 4h-ahead horizon comparison (h = 16 on 15-minute series) | `dashboard/public/data/real_data/elia_wind/data/4h_ahead.json` | 60_results_real_data | LOCKED (static) |
| T13a | Within-run seasonal slice + per-season table | `dashboard/public/data/real_data/elia_wind/data/regime_shift.json` | 60_results_real_data | LOCKED (static) |
| T13b | Elia electricity baselines head-to-head (static-mode) | `dashboard/public/data/real_data/elia_electricity/data/baselines.json` | 60_results_real_data | LOCKED (static) |
| T14 | Attacker profit vs $\lambda$ (multi-seed Chen-Devanur arbitrage) | `onlinev2/outputs/behaviour/experiments/arbitrage_scan/data/arbitrage_scan_by_lam.csv` | 80_robustness | LOCKED |
| T15 | Attacker profit vs crowd size ($\lambda$ × n_benign) | `onlinev2/outputs/behaviour/experiments/arbitrage_crowd_size/data/arbitrage_crowd_size_summary.csv` | 80_robustness | LOCKED |
| T16 | Sybil regimes (identical vs diversified) | `experiments.py --exp sybil` output | 80_robustness | LOCKED |
| T16a | Sybil-arbitrage profit invariance (k ∈ {1,3,5}) | `onlinev2/outputs/behaviour/experiments/sybil_arbitrage/data/sybil_arbitrage_summary.csv` | 80_robustness | LOCKED |
| T17 | Detection-adaptation (fixed vs adaptive manipulator) | `onlinev2/outputs/behaviour/experiments/detection_adaptation/data/detection_adaptation_summary.csv` | 80_robustness | LOCKED |
| T17a | Chun-Shachter coalition profit (weighted_mean vs weighted_median) | `onlinev2/outputs/behaviour/experiments/collusion_stress/data/collusion_stress_summary.csv` | 80_robustness | LOCKED |
| T17b | Informed collusion (coalition × privileged information) | `onlinev2/outputs/behaviour/experiments/informed_collusion/data/informed_collusion_summary.csv` | 80_robustness | LOCKED |
| T17c | Insider advantage (lagged vs leaked, AR(1) DGP) | `onlinev2/outputs/behaviour/experiments/insider_advantage/data/insider_advantage_summary.csv` | 80_robustness | LOCKED |
| T17d | Wash / activity gaming (inflation vs profit cost) | `onlinev2/outputs/behaviour/experiments/wash_activity_gaming/data/wash_activity_gaming_summary.csv` | 80_robustness | LOCKED |
| T17e | Strategic reporter (pull sweep, shift vs profit) | `onlinev2/outputs/behaviour/experiments/strategic_reporting/data/strategic_reporting_summary.csv` | 80_robustness | LOCKED |
| T18 | Hyperparameter table ($\gamma$, $\rho$, $\lambda$, $\eta$ per dataset) | tuning notes | 30_mechanism_design | PARTIAL |

## Figures

| ID | Title | Source | Chapter | Status |
|---|---|---|---|:---:|
| F1 | Five-step round diagram (pre-event / event / post-event) | tikz, inline in `30_mechanism_design.md` | 30_mechanism_design | LOCKED |
| F2 | Three-layer architecture diagram | tikz | 40_methodology | to draw |
| F3 | Skill layer — loss-to-skill mapping | `dashboard/public/presentation-plots/skill_signal_clean.png` | 30_mechanism_design | LOCKED |
| F4 | $\sigma$ trajectory on known-noise panel | `dashboard/public/presentation-plots/skill_wager.png` | 50_results_synthetic | LOCKED |
| F5 | Forecast aggregation four-panel (primary, calibration, concentration, failure mode) | `dashboard/public/presentation-plots/forecast_aggregation_four_panel.png` | 50_results_synthetic | LOCKED |
| F6 | Master comparison (9 methods on Elia wind) | `dashboard/public/presentation-plots/master_comparison.png` | 60_results_real_data | LOCKED |
| F7 | Master comparison four-panel | `dashboard/public/presentation-plots/master_comparison_four_panel.png` | 60_results_real_data | LOCKED |
| F8 | Per-forecaster $\sigma$ trajectory (wind) | to render | 60_results_real_data | PARTIAL |
| F9 | PIT histogram (mechanism vs uniform) | `dashboard/public/presentation-plots/calibration_reliability.png` | 60_results_real_data | LOCKED |
| F10 | Reliability diagram before/after recalibration | to render from `coverage.json` + `coverage_recal.json` | 70_recalibration_layer | PARTIAL |
| F11 | CRPS calibration panel | `dashboard/public/presentation-plots/crps_calibration.png` | 70_recalibration_layer | LOCKED |
| F12 | Bankroll ablation four-panel | `dashboard/public/presentation-plots/bankroll_ablation_four_panel.png` | 50_results_synthetic | LOCKED (pre-audit) |
| F13 | Arbitrage profit vs $\lambda$ (multi-seed, 95% CI bars) | `onlinev2/outputs/behaviour/experiments/arbitrage_scan/plots/arbitrage_profit_by_lam.png` | 80_robustness | LOCKED |
| F13a | Arbitrageur wealth trajectory (seed 0, six $\lambda$ values) | `onlinev2/outputs/behaviour/experiments/arbitrage_scan/plots/arbitrage_wealth_trajectories.png` | 80_robustness | LOCKED |
| F13b | Attack scaling ($\lambda$ × n_benign heatmap-style bars) | `onlinev2/outputs/behaviour/experiments/arbitrage_crowd_size/plots/arbitrage_crowd_size.png` | 80_robustness | LOCKED |
| F13c | Arbitrage margin heatmap (legacy, pre-theory) | `dashboard/public/presentation-plots/arbitrage_heatmap.png` | 80_robustness | LOCKED (reference) |
| F14 | Sybil profit ratio (identical vs diversified, legacy) | `dashboard/public/presentation-plots/sybil.png` | 80_robustness | LOCKED |
| F14a | Sybil-arbitrage profit invariance across k | `onlinev2/outputs/behaviour/experiments/sybil_arbitrage/plots/sybil_arbitrage_profit.png` | 80_robustness | LOCKED |
| F14b | Chun-Shachter coalition profit (weighted_mean vs weighted_median) | `onlinev2/outputs/behaviour/experiments/collusion_stress/plots/coalition_profit.png` | 80_robustness | LOCKED |
| F14c | Informed-coalition profit (baseline / collusion / informed) | `onlinev2/outputs/behaviour/experiments/informed_collusion/plots/informed_collusion.png` | 80_robustness | LOCKED |
| F14d | Insider advantage (no insider / lagged / leaked audit) | `onlinev2/outputs/behaviour/experiments/insider_advantage/plots/insider_profit.png` | 80_robustness | LOCKED |
| F14e | Wash / activity gaming (inflation vs profit dual-axis) | `onlinev2/outputs/behaviour/experiments/wash_activity_gaming/plots/wash_activity.png` | 80_robustness | LOCKED |
| F14f | Strategic reporter frontier (profit vs r̂ shift) | `onlinev2/outputs/behaviour/experiments/strategic_reporting/plots/strategic_reporting_frontier.png` | 80_robustness | LOCKED |
| F15 | Behaviour concentration | `dashboard/public/presentation-plots/behaviour_concentration.png` | 80_robustness | LOCKED |
| F16 | Behaviour wealth distribution | `dashboard/public/presentation-plots/behaviour_wealth.png` | 80_robustness | LOCKED |
| F17 | Baseline comparison vs equal weights | `dashboard/public/presentation-plots/baseline_comparison.png` | 60_results_real_data | LOCKED |
| F18 | Weight-rule comparison under two deposit policies | `dashboard/public/presentation-plots/weight_rule_comparison.png` | 50_results_synthetic | LOCKED |
| F19 | Selective participation vs $\sigma$ | `dashboard/public/presentation-plots/selective_participation.png` | 80_robustness | LOCKED |
| F20 | Real-data validation summary | `dashboard/public/presentation-plots/real_data_validation.png` | 60_results_real_data | LOCKED |
| F21 | Settlement sanity (budget balance histogram) | `dashboard/public/presentation-plots/settlement_sanity.png` | 50_results_synthetic | LOCKED |
| F22 | Scoring validation (pinball, CRPS) | `dashboard/public/presentation-plots/scoring_validation.png` | 50_results_synthetic | LOCKED |

## Notes

- Every `LOCKED` plot is a committed PNG that the presentation already
  uses; do not regenerate. Re-use verbatim and tweak captions in the
  thesis.
- `PARTIAL` means the data is there but the print-quality figure has
  not been rendered yet. Render from the JSON at thesis-assembly time.
- `PENDING` means the experiment itself has not finished. Slot the
  number or figure in after the run completes.
- When adding a new figure or table, add a row here *and* reference
  the ID in the relevant chapter file. This index is the single
  source of truth for figure numbering in the final thesis.
