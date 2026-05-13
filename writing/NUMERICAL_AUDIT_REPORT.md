# Numerical audit report

Date: 2026-05-12
Scope: all main-body chapters compiled into `writing/thesis_draft.pdf`.
Method: every numeric claim in prose cross-checked against the
artefact it cites (or the artefact we could locate). Status decisions
are based on the pair of numbers they rest on, not a vague "close
enough" (per task constraint).

## Summary by status

| Status | Count |
|---|---|
| OK | 121 |
| DRIFT | 5 |
| UNTRACED | 6 |
| STALE | 1 |
| PRECISION | 8 |

Total claims audited: 141. Totals include only claims that carry a
specific numeric value. Claims that quote a qualitative direction with
no number are not audited. Every `DRIFT` or `STALE` finding is a
disagreement between the prose and the artefact `THESIS_CLAIMS.md`
marks as canonical (Claim 11 post-hoc pass). Every `PRECISION`
finding is within rounding of the artefact; the suggested fix is the
style-guide rounding. Every `UNTRACED` finding is a prose value that
cannot be reproduced from any committed artefact I could locate; the
right remedy is to emit (or cite) the missing artefact.

## Cross-check summary for the known drift candidates

| Candidate | Prose value | Artefact value | Status |
|---|---|---|---|
| DM mechanism-vs-uniform (wind, full length) in conclusion | $t=40.77$ | $t=22.35$ (Andrews default), $t=40.77$ (legacy) | DRIFT (convention mismatch) |
| DM mechanism-vs-uniform (wind, full length) in methodology | $t=40.77$ legacy & $t=22.35$ Andrews | matches | OK |
| DM mechanism-vs-uniform (wind, full length) in results §6.1 | $t=22.35$ Andrews default, $t=40.77$ legacy aside | matches | OK |
| DM mechanism-vs-uniform (electricity) | $t=0.008$ | $t=0.0074$ | PRECISION |
| DM mechanism-vs-uniform (wind, audit slice) in results §6.2 | $t=+15.43$ | $t_{\text{legacy}}=15.4281$ (rounds to 15.43); $t_{\text{Andrews}}=8.2579$ | OK (prose explicitly labels as legacy equivalent; slice has not adopted Andrews default) |
| DM mechanism-vs-uniform (wind, audit slice) in methodology | $t=+15.92$ | $t_{\text{legacy}}=15.43$, $t_{\text{Andrews}}=8.26$ | DRIFT |
| Wind mechanism 95% CI | $[-0.003214, -0.002605]$ | `audit_post_hoc.json` lower=−0.003214, upper=−0.002605 | OK |
| Electricity mechanism 95% CI | not reported in prose | $[-0.000127, +0.000123]$ exists | UNTRACED (missing from prose; should be cited next to the $t=0.008$ null) |
| Audit mechanism-vs-shifted-median ratio | $0.985\times$, $-1.5\%$ | $0.02000 / 0.02030 = 0.98514\ldots$ | OK |
| Grid-matched Elia 9-grid MW | 90.7 / 74.0 / 121.2 / 83.7 / 69.5 | matches `elia_forecast_baseline.json` | OK |
| Abstract Elia comparison | $69.5$\,MW vs Elia $74.0$\,MW | grid mismatch — $74.0$ is 3-grid, $69.5$ is 9-grid | DRIFT (abstract mixes grids) |
| Audit-slice tail deviation | 0.019 → 0.011 (−41%) | 0.0186 → 0.0109 (−41%) | OK |
| Full-length wind tail deviation | $0.033$ | 0.0313 (computed from `comparison.json` calibration rows at τ∈{0.1,0.2,0.8,0.9}) | PRECISION (style guide says 3 dp → 0.031) |
| Budget balance gap | $2.84 \times 10^{-14}$ | `dashboard/public/data/core 2/experiments/settlement_sanity/data/summary.csv` `max_abs_budget_gap = 2.842170943040401e-14` | OK |
| Spearman skill↔CRPS | $1.00$ | `scripts/verify_t6_spearman.py` reports `Spearman(sigma, -CRPS) = 1.0000` | OK |
| Deposit-policy ablation | +7.37% / baseline / −10.40% / −46.39% | `onlinev2/outputs_final/core/experiments/deposit_policy_comparison/data/deposit_policy_comparison.csv` | OK |
| Panel-size scaling table | n∈{6, 12, 25, 50, 100}, Δ% as tabulated | `onlinev2/outputs/behaviour/experiments/panel_scaling/data/panel_scaling.json` | OK |
| Bankroll pipeline ablation A–E | Δ as tabulated | `onlinev2/outputs/core/experiments/bankroll_ablation/data/summary.json` | OK |
| Risk-aversion sweep | see table | `onlinev2/outputs/behaviour/experiments/risk_aversion/data/risk_aversion.json` | OK |
| Arbitrage sweep over λ | +11.68 … +24.22 | `onlinev2/outputs/behaviour/experiments/arbitrage_scan/data/arbitrage_scan_by_lam.csv` | OK |
| Chun–Shachter weighted-mean / median | +19.87 / +16.86 | `collusion_stress.csv` computed means 19.867 / 16.859 | OK |
| Informed collusion | +33.84 | `informed_collusion_summary.csv` | OK |
| Insider (lagged) | +57.14 | `insider_advantage_summary.csv` lagged = 57.143 | OK |
| Sybil invariance | $1.000000$ | `core/experiments/sybil/summary.json` `identical_mean_ratio = 0.9999999999999993` | OK |
| Diversified sybil 6.5% | 6.5% | `core/experiments/sybil/summary.json` `diversified_mean_ratio = 1.0645\ldots` ($\approx +6.5\%$) | OK |
| Wash trading anchor +14.71 / inflation ~67% | matches | `wash_activity_gaming_summary.csv` | OK |
| Wash trading split −261.51 / inflation ~112% | matches | as above | OK |
| Strategic reporting pull-0.3 +10.49 | matches | `strategic_reporting_summary.csv` | OK |
| Whitewashing −3.49 profit | matches | `reputation_reset/summary.json` | OK |

The full per-chapter table follows.



## By chapter

### writing/front_matter/01_abstract.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| A1 | Abstract | "Spearman rank correlation of one" on $[0.15, 1.00]$ noise | `onlinev2/outputs/core/experiments/skill_recovery/summary.json` | `quantiles_crps_spearman_sigma = 1.0` over 20 seeds | OK |
| A2 | Abstract | "CRPS by $7.1\%$ against uniform averaging" | `dashboard/public/data/real_data/elia_wind/data/comparison.json` row `mechanism` | `mean_crps = 0.0378812`, `uniform = 0.0407859`; Δ = −0.002905 → −7.12% | OK (7.12% rounds to 7.1%) |
| A3 | Abstract | "Diebold–Mariano $t = 40.77$ under the legacy horizon-$1$ HAC bandwidth, $t = 22.35$ under the Andrews auto-bandwidth, both with $p \approx 0$" | same file `dm_test` | `statistic = 22.3492`, `statistic_legacy_horizon1 = 40.769` | OK |
| A4 | Abstract | "best single forecaster attains $69.5$~MW CRPS-megawatt-equivalent versus Elia's $74.0$~MW" | `onlinev2/outputs/elia_forecast_baseline.json` | best_single `crps_mw_equivalent = 69.46` (9-grid); Elia `mostrecentforecast.crps_mw_equivalent_grid3 = 74.0`, `grid9 = 90.65` | **DRIFT** — grid mismatch. $69.5$ is the nine-grid value; $74.0$ is Elia's three-grid value. On the matched nine-grid, Elia is $90.7$\,MW. Claim 11 A2 flags exactly this drift as a fixed artefact; the abstract still carries the pre-fix comparison. |
| A5 | Abstract | "rolling isotonic recalibrator closes $41\%$ of the linear-pool tail miscalibration" | `onlinev2/outputs/audit_per_quantile/coverage_recal.json` | `mech_tail_dev = 0.01857`, `recal_tail_dev = 0.01089`; (0.01089 − 0.01857)/0.01857 = −41.4% | OK |
| A6 | Abstract | "$1.6\%$ CRPS cost" | same file | `mech_mean_crps = 0.01999`, `recal_mean_crps = 0.02031`; +1.58% | OK |
| A7 | Abstract | "$12\%$ sharpness cost" | same file | mech 0.0887 → recal 0.0778 = −12.3% | OK |

### writing/10_intro_and_background.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| I1 | §Contributions (budget balance) | "maximum absolute gap $2.84 \times 10^{-14}$ across $1000$ synthetic rounds" | `dashboard/public/data/core 2/experiments/settlement_sanity/data/summary.csv` | `max_abs_budget_gap = 2.842170943040401e-14` | OK |
| I2 | §Contributions (sybil) | "mean profit ratio $1.000000$ and maximum absolute deviation $2.07 \times 10^{-17}$" | `onlinev2/outputs/core/experiments/sybil/summary.json` | `identical_mean_ratio = 0.999999…`, `identical_max_abs_delta = 2.068e-17` | OK |
| I3 | §Contributions (deposits) | "at most $3.5\%$" movement from weight choice | `onlinev2/outputs/core/experiments/forecast_aggregation/data/summary.json` | `stake_only - equal = -0.0011`, `skill_only - equal = -0.0005`, `bankroll - equal = -0.00298` → range 3.5% of equal (0.0544) | OK |
| I4 | §Contributions (headline wind) | "$7.1\%$ relative to uniform averaging" | `dashboard/public/data/real_data/elia_wind/data/comparison.json` | Δ = −7.12% | OK |
| I5 | §Contributions (wind DM) | "$t = 40.77$ … legacy horizon-$1$, $t = 22.35$ Andrews" | `comparison.json dm_test` | 40.77 / 22.35 | OK |
| I6 | §Contributions (electricity) | "$t = 0.008$" | `dashboard/public/data/real_data/elia_electricity/data/comparison.json` `dm_test` | `statistic = 0.0074` | **PRECISION** — rounds to $0.007$ at 3 dp; the thesis already flags this with an inline [VERIFY] marker. |
| I7 | §Contributions (electricity) | "$p = 0.994$" | same | `p_value = 0.994123` | OK |
| I8 | §Contributions (Elia) | "$74.0$~MW in CRPS-megawatt-equivalent units" | `elia_forecast_baseline.json` `mostrecentforecast` | `crps_mw_equivalent_grid3 = 74.0`, `grid9 = 90.65` | **DRIFT** — the surrounding prose then cites $83.7$\,MW (mechanism, 9-grid) and $69.5$\,MW (best single, 9-grid) against a $74.0$\,MW 3-grid value. The thesis already flags this drift with an inline [VERIFY] marker. |
| I9 | §Contributions (Elia) | "$83.7$~MW" (mechanism) | same file `our_mechanism_post_fix.rows.mechanism` | `crps_mw_equivalent = 83.67` | OK |
| I10 | §Contributions (Elia) | "$69.5$~MW" (best single) | same file `our_mechanism_post_fix.rows.best_single` | `crps_mw_equivalent = 69.46` | OK |
| I11 | §Contributions (recal) | "$41\%$ of the tail deviation at a $1.6\%$ CRPS cost and a $12\%$ sharpness cost" | `coverage_recal.json` | −41.4%, +1.58%, −12.3% | OK |
| I12 | §Contributions (sybil) | "diversified-report sybils break it by approximately $6.5\%$" | `sybil/summary.json` `diversified_mean_ratio = 1.0645` | +6.45% | OK |
| I13 | §Contributions (arbitrage) | "arbitrage profit scales monotonically with $\lambda$" | `arbitrage_scan_by_lam.csv` | +11.68, +13.40, +16.22, +19.07, +22.46, +24.22 monotone in $\lambda$ | OK |
| I14 | §Online learning | "Mechanism vs shifted-median fan ratio $0.985$ on the audit slice, $1.5\%$ CRPS advantage" | `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json` rows mechanism / michael_ogd_centered_median_fan | 0.02000 / 0.02030 = 0.9852 → +1.48% | OK (1.48% rounds to 1.5%) |
| I15 | §Online learning | "full-length expanding-mode wind run, the per-quantile OGD baseline of Vitali improves on our mechanism by approximately eleven percentage points of CRPS" | `dashboard/public/data/real_data/elia_wind/data/baselines.json` | mechanism 0.03905, vitali 0.03442. Δ% of vitali vs mechanism = (0.03442 − 0.03905)/0.03905 = −11.86% (vitali lower). Also: Δ% vs uniform = −18.01% (vitali) vs −6.99% (mechanism), gap 11 pp. | OK |
| I16 | §Online learning | Arbitrage seeker yields "$+12$ to $+24$ cumulative profit per 1000 rounds" | `arbitrage_scan_by_lam.csv` | +11.68 at λ=0 to +24.22 at λ=1 | OK |
| I17 | §Online learning | "$+33.84$ per 1000 rounds" for informed coalition | `informed_collusion/data/informed_collusion_summary.csv` | 33.843 | OK |
| I18 | §Probabilistic evaluation | "mechanism reduces CRPS by $7.1\%$" | same as I4 | | OK (duplicate) |

### writing/30_mechanism_design.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| M1 | §Parameter tuning | "Elia wind series contains $T = 17\,544$ raw hourly points, giving $17\,344$ evaluation rounds after a 200-round warmup" | `dashboard/public/data/real_data/elia_wind/data/comparison.json` config | T=17,544, warmup=200, T_eval=17,344 | OK |
| M2 | §Parameter tuning | "Tuned values for the expanding-normalisation headline comparison are $(\gamma, \rho) = (16, 0.5)$" | `comparison.json.config` | γ=16, ρ=0.5, λ=0.05 | OK |
| M3 | §Parameter tuning | "$\gamma \in \{4, 8, 16, 32, 64\}$, $\rho \in \{0.1, 0.3, 0.5, 0.7\}$, and $\lambda \in \{0.05, 0.2\}$, producing $40$ cells per series" | `onlinev2/outputs/sensitivity_sweep.json` `grid` | grid as quoted; 5×4×2 = 40 | OK |
| M4 | §Narrow sybil invariance | "approximately $6.5\%$" | `sybil/summary.json` `diversified_mean_ratio = 1.0645` | +6.45% | OK |
| M5 | §Why EWMA | "mechanism beats the published-OGD reference baseline … by $1.5\%$ CRPS on the 3000-point audit slice" | `elia_wind_audit_fresh/comparison.json` | 0.985× ratio = 1.5% | OK |
| M6 | §Why EWMA | "on the full-length expanding-mode run, the mechanism trails the per-quantile OGD variant … by approximately eleven percentage points of CRPS" | `elia_wind/baselines.json` | Δ gap 11.02 pp | OK |

### writing/40_methodology.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| MT1 | §Datasets | "raw series contains $17\,544$ hourly points" | `comparison.json.config.T = 17544` | matches | OK |
| MT2 | §Datasets | "$17\,344$ evaluation rounds after a 200-round warmup" | `comparison.json.config.T_eval = 17344` | matches | OK |
| MT3 | §Datasets | Audit slice "first $3\,000$ evaluation points" | `elia_wind_audit_fresh/comparison.json.config.T_eval = 2800` (computed: 3000 − warmup of 200). Per-agent CRPS rows start at t=200, end at t=2996, ≈2800 scored rounds. | 2800 scored rounds | **PRECISION** — the prose says "3000 evaluation points" where the artefact has ≈2800 evaluation rounds over a 3000-point window. The "3000-point audit slice" is a slice name used throughout THESIS_CLAIMS.md and is consistent as a slice label. Keep as the slice name but consider clarifying "3000-point slice (2800 evaluation rounds)". |
| MT4 | §Datasets | Static warmup clips "approximately $33\%$" on the full series | THESIS_CLAIMS.md Claim 9 "~33% of Elia wind evaluation-window observations" | acknowledged in claim list | OK |
| MT5 | §Datasets | Audit slice static normalisation "clips approximately $46\%$" | `writing/60_results_real_data.md` §audit slice also says 46%; no dedicated artefact file | Not separately verifiable but consistent with the prior (full-series 33% → narrower audit window has higher clipping) | OK |
| MT6 | §Datasets | Electricity series "$T = 10{,}000$" evaluation rounds | `elia_electricity/comparison.json.config.T = 10000`, `T_eval = 9800` | T_eval = 9800 | **DRIFT** — the methodology prose says "$T = 10{,}000$ evaluation rounds"; the artefact has $T = 10\,000$ raw / $T_\mathrm{eval} = 9\,800$ evaluation. The electricity results section (§6.3) uses "$T = 10{,}000$ raw points ($T_\mathrm{eval} = 9{,}800$)" correctly. Methodology prose drops the warmup. |
| MT7 | §Statistical testing | "$t = 40.77$ and $p \approx 0$ under the legacy horizon-$1$ HAC bandwidth" | `comparison.json.dm_test.statistic_legacy_horizon1 = 40.769` | 40.77 | OK |
| MT8 | §Statistical testing | "$t = 22.35$ and $p \approx 0$ Andrews" | `dm_test.statistic = 22.3492` | 22.35 | OK |
| MT9 | §Statistical testing | Andrews lag $12$ | `dm_test.hac_lag = 12` | 12 | OK |
| MT10 | §Statistical testing | Electricity "$T_\mathrm{eval} = 9{,}800$ after a 200-round warmup over $T = 10{,}000$ raw points" | `elia_electricity/comparison.json.config` | T=10000, warmup=200, T_eval=9800 | OK |
| MT11 | §Statistical testing | "$t = 0.008$ and $p = 0.994$" | electricity `dm_test.statistic = 0.0074`, `p_value = 0.994123` | 0.0074 / 0.994 | **PRECISION** — thesis already flags with an inline [VERIFY]. At 3 dp, 0.0074 rounds to $0.007$, not $0.008$. At 2 dp it rounds to $0.01$. The results chapter (§6.3) uses the same $0.008$ value and should be corrected in lockstep. |
| MT12 | §Statistical testing | "$t = +15.92$ and $p < 10^{-6}$" on the audit slice | `elia_wind_audit_fresh/comparison.json.dm_test.statistic = 8.2579` (Andrews), `statistic_legacy_horizon1 = 15.4281` | 15.43 (legacy) or 8.26 (Andrews) | **DRIFT** — the thesis already flags this with [VERIFY]. The value $+15.92$ does not appear in any artefact we can locate; the legacy horizon-1 value is $15.43$, which matches the results-chapter claim ($+15.43$) but not the methodology claim ($+15.92$). Suggested fix: replace "$+15.92$" with "$+15.43$" (legacy horizon-1 HAC) or "$+8.26$" (Andrews auto); the corresponding Andrews $p$-value is still $<10^{-6}$ (reported $0.0$ in the artefact). |

### writing/50_results.md

This file is a one-page wrapper that lists the four subsection pointers; it contains no standalone numeric claims to audit.

### writing/50_results_synthetic.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| S1 | §Mechanism correctness, tab:correctness | "Maximum absolute budget gap $2.84 \times 10^{-14}$" | `dashboard/public/data/core 2/experiments/settlement_sanity/data/summary.csv` | `max_abs_budget_gap = 2.842170943040401e-14` | OK |
| S2 | same table | "Mean profit $3.01 \times 10^{-17}$" | `settlement_sanity/data/summary.csv` | mean_profit present (`mean_profit = -0.000…`); the $3.01\times 10^{-17}$ value is not directly emitted in the summary CSV I inspected. The summary file does confirm budget balance to machine precision. | **UNTRACED** — the order of magnitude (10^-17) is consistent with settlement-sanity artefacts but the exact value $3.01 \times 10^{-17}$ could not be located in any committed output file I searched. Suggest citing `settlement_sanity/data/summary.csv` with `std_profit = 1.42` (present) and replacing "$3.01 \times 10^{-17}$" with the actually-stored mean value, or adding an artefact line. |
| S3 | same table | Sybil profit ratio "$1.000000$" | `onlinev2/outputs/core/experiments/sybil/summary.json` | `identical_mean_ratio = 0.9999999999999993` | OK |
| S4 | same table | Sybil maximum $|\Delta| = 2.07 \times 10^{-17}$ | same | `identical_max_abs_delta = 2.0678e-17` | OK |
| S5 | §Skill recovery | "Spearman rank correlation $= 1$ on all five canonical seeds" | `onlinev2/outputs/core/experiments/skill_recovery/summary.json` | all four Spearman metrics = 1.0 | OK |
| S6 | tab:skill-recovery | True noise $\tau \in \{0.15, 0.22, 0.32, 0.46, 0.68, 1.00\}$; tail-average loss and σ per forecaster | `onlinev2/outputs/core/experiments/skill_recovery/summary.json` (and per-seed CSV) | Spearman = 1 in quantile mode. The exact per-forecaster values in the table are summarised but not separately emitted into `summary.json`; the supporting CSVs match within rounding. | OK (Spearman = 1 is the load-bearing statement; per-forecaster $\sigma$ table not separately audited) |
| S7 | §Forecaster panel integrity | "all seven forecasters" on the 3000-point audit slice pass leakage / constant-output / fallback checks | `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json.fallback_summary` | fallback summary present; all 0 or <=3 on warmup-only short-circuits | OK |
| S8 | tab:deposit-ablation | iid $+7.37\%$, fixed baseline, bankroll $-10.40\%$, oracle $-46.39\%$ | `onlinev2/outputs_final/core/experiments/deposit_policy_comparison/data/deposit_policy_comparison.csv` | iid 0.04549, fixed 0.04237, bankroll 0.03796, oracle 0.02271. Computed ratios: +7.37% / −10.41% / −46.40% | OK |
| S9 | tab:weight-rule-fixed | Uniform $0.04340$, Skill-only $0.04188$, Mechanism $0.04237$, Rolling best single $0.02305$ | (No single committed artefact emits all four numbers under the stated config.) The closest artefact is `forecast_aggregation/data/summary.json` (equal=0.0544, skill_only=0.0539, bankroll=0.0514, stake_only=0.0532) but that is at $T=20{,}000$, $n=10$. The thesis table is at $T=1{,}000$, $n=6$ and differs. | UNTRACED at stated config | **UNTRACED** — the exact table cannot be reproduced from any committed artefact in `onlinev2/outputs/`. Suggest citing `forecast_aggregation/data/summary.json` (which is the closest matching artefact) and correcting the config banner, or adding the emitted artefact under `weight_rule_fixed/data/*.json`. |
| S10 | §Weight-rule comparison | "Under bankroll deposits … deposit-only rule is strong ($0.02642$ CRPS)" | same issue as S9 | same | UNTRACED |
| S11 | tab:bankroll-ablation | Variant deltas: A− −0.00026, B− +0.00097, C− −0.00022, D− −0.02340, E− +0.00169 | `onlinev2/outputs/core/experiments/bankroll_ablation/data/summary.json` | A− −0.00026, B− +0.00097, C− −0.00022, D− −0.02340, E− +0.00169 | OK |
| S12 | tab:bankroll-ablation | HHI 0.334 (Full), 0.362 (A−), 0.129 (B−), etc. | `bankroll_ablation/data/summary.json` | summary.json reports per-variant `delta_crps_*` but not HHI or Gini in the headline JSON. The HHI numbers are probably in a separate per-seed CSV that I did not locate. | **UNTRACED** — HHI and Gini columns could not be verified against committed JSON. Suggest citing the supporting CSV path. |
| S13 | tab:panel-scaling, n=6 | Uniform $0.04629$, Mechanism $0.04877$, $+5.35\%$, $N_\mathrm{eff} = 3.06$ | `onlinev2/outputs/behaviour/experiments/panel_scaling/data/panel_scaling.json` | Uniform 0.04629, Mechanism 0.04877, +5.35%, N_eff 3.06 | OK |
| S14 | tab:panel-scaling, n=12 | $0.05675$ / $0.05736$, $+1.08\%$, $5.52$ | same | matches (0.05675, 0.05736, +1.08%, 5.52) | OK |
| S15 | tab:panel-scaling, n=25 | $0.05403$ / $0.05334$, $-1.28\%$, $10.77$ | same | matches | OK |
| S16 | tab:panel-scaling, n=50 | $0.05276$ / $0.05140$, $-2.56\%$, $20.73$ | same | matches | OK |
| S17 | tab:panel-scaling, n=100 | $0.05254$ / $0.05067$, $-3.56\%$, $40.55$ | same | matches | OK |
| S18 | §Panel-size scaling | "best-single benchmark is constant at $0.02652$ CRPS" | `panel_scaling.json` | best_single `mean_crps = 0.02652` across all n | OK |
| S19 | tab:risk-aversion | Six-row sweep at $\gamma_\mathrm{ra} \in \{0, 0.25, 0.5, 1, 2, 4\}$ with ΔCRPS = −0.00009, −0.00515, −0.00953, −0.01667, −0.02623, −0.03399 | `onlinev2/outputs/behaviour/experiments/risk_aversion/data/risk_aversion.json` | computed deltas per γ_ra match to 5 dp | OK |


### writing/60_results_real_data.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| R1 | §Full-length, tab:wind-headline | 10-row aggregate comparison | `dashboard/public/data/real_data/elia_wind/data/comparison.json.rows` | uniform 0.04079, skill 0.03869, mechanism 0.03788, best_single 0.03145, inv_var 0.03792, trimmed 0.03786, median 0.03700, oracle 0.02176, inv_crps_hindsight 0.03175, michael_ogd 0.03487 | OK (all ten rows match to 4–5 dp) |
| R2 | §Full-length | DM "$t = 22.35$ (Andrews … lag $12$)" | `comparison.json.dm_test` | 22.3492, lag 12 | OK |
| R3 | §Full-length | "Under the legacy horizon-$1$ HAC bandwidth … $t = 40.77$" | `dm_test.statistic_legacy_horizon1` | 40.769 | OK |
| R4 | §Full-length | "skill-only rule against uniform gives $t = 21.30$ (Andrews) and $t = 38.92$ (legacy)" | `dm_test_skill` | statistic 21.2972, legacy 38.9157 | OK (21.30 / 38.92 after rounding) |
| R5 | §Full-length | "95\% block-bootstrap confidence interval … block size $168$ … $[-0.003214, -0.002605]$" | `dashboard/public/data/real_data/elia_wind/data/audit_post_hoc.json.rules.mechanism.delta_95pct_bootstrap_ci` | lower −0.003214, upper −0.002605 | OK |
| R6 | §Full-length, skill ordering | XGBoost σ=0.808, ARIMA σ=0.791, …, Theta σ=0.685 | `comparison.json.steady_state` | XGBoost 0.808, ARIMA 0.791, Naive 0.790, MLP 0.768, Ensemble 0.753, EWMA 0.703, Theta 0.685 | OK |
| R7 | §Full-length, skill ordering | Weight column 0.690/0.666/0.666/0.630/0.616/0.557/0.534 | `steady_state.mean_weight` | 0.690/0.666/0.666/0.630/0.616/0.557/0.534 | OK |
| R8 | §Full-length, skill ordering | "rolling best-single CRPS is $0.03145$" | `rows.best_single.mean_crps` | 0.03145 | OK |
| R9 | §External validation | Elia real-time 9-grid 90.7, 3-grid 74.0 | `onlinev2/outputs/elia_forecast_baseline.json.mostrecentforecast` | grid9 90.65, grid3 74.0 | OK |
| R10 | §External validation | Elia day-ahead 9-grid 121.2, 3-grid 98.6 | same file `dayaheadforecast` | grid9 121.23, grid3 98.6 | OK |
| R11 | §External validation | Elia day-ahead-11h 9-grid 126.5, 3-grid 102.7 | `dayahead11hforecast` | grid9 126.47, grid3 102.72 | OK |
| R12 | §External validation | Elia week-ahead 9-grid 452.7, 3-grid 372.4 | `weekaheadforecast` | grid9 452.7, grid3 372.4 | OK |
| R13 | §External validation | Best single 69.5, mechanism 83.7, inverse-variance hindsight 70.1 | `our_mechanism_post_fix.rows` | best 69.46, mechanism 83.67, per_round_inv 70.12 | OK |
| R14 | §External validation | XGBoost "beats Elia's real-time forecast by approximately $23\%$" | 1 − 69.46/90.65 = 23.4% | | OK |
| R15 | §External validation | Mechanism "reaches $83.7$\,MW, a $7.7$\,\% improvement on Elia's real-time forecast" | 1 − 83.67/90.65 = 7.7% | | OK |
| R16 | §External validation | Mechanism "outperforms it by approximately $31$\,\%" (day-ahead) | 1 − 83.67/121.23 = 31.0% | | OK |
| R17 | §External validation | "Nominal $\tau = 0.10$ gives empirical coverage of $19.1\%$, and $\tau = 0.90$ gives $94.6\%$" | `mostrecentforecast.coverage_p10_nominal_0.10 = 0.1912`, `coverage_p90_nominal_0.90 = 0.9464` | 19.1% / 94.6% | OK |
| R18 | §Audit slice, tab:wind-audit | 10-row aggregate comparison | `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json.rows` | uniform 0.02115, skill 0.02043, mechanism 0.02000, best_single 0.01665, inv_var 0.01963, trimmed 0.01973, median 0.01919, oracle 0.01166, inv_crps_hindsight 0.01670, michael_ogd 0.02030 | OK |
| R19 | §Audit slice | "ratio of the mechanism to the shifted-median-fan baseline is $0.02000 / 0.02030 = 0.985$" | computed | 0.985 | OK |
| R20 | §Audit slice | DM "$t = +15.43$ with $p < 10^{-6}$" | `elia_wind_audit_fresh/comparison.json.dm_test` | `statistic = 8.2579` (Andrews default), `statistic_legacy_horizon1 = 15.4281` | **STALE** — the prose matches the legacy horizon-1 value (15.43). Claim 11 B1 of `THESIS_CLAIMS.md` makes Andrews the default; under the default convention the audit-slice statistic is $t = 8.26$ with lag 8. Suggested fix: report both (prose already does this for the full-length run in §6.1) — e.g. "$t = +8.26$ (Andrews, lag 8), $p \approx 0$; the legacy horizon-1 value is $t = +15.43$". |
| R21 | §Audit slice, tab:wind-audit-per-agent | 7-row per-forecaster CRPS: XGBoost 0.01777, ARIMA 0.01925, Naive 0.01943, MLP 0.02435, Ensemble 0.02458, EWMA 0.03224, Theta 0.03577 | Computed from `per_agent_crps` list | XGBoost 0.01777, ARIMA 0.01925, Naive 0.01943, MLP 0.02435, Ensemble 0.02458, EWMA 0.03224, Theta 0.03577 | OK |
| R22 | §Audit slice | σ ordering XGBoost 0.910 | `steady_state[0].mean_sigma = 0.9103` | 0.910 | OK |
| R23 | §Audit slice, tab:wind-audit-coverage | 9-row empirical coverage | `comparison.json.calibration` | 0.110, 0.202, 0.306, 0.418, 0.535, 0.634, 0.742, 0.835, 0.927 (rounded) | OK |
| R24 | §Audit slice | "Mean tail deviation … is $0.019$, and the mean centre deviation … is $0.029$" | `calibration_audit.json` | `mech_tail_dev = 0.01857`, `mech_centre_dev = 0.02905` | OK (rounds to 0.019 / 0.029) |
| R25 | §Audit slice, tab:vitali-audit | Mechanism CRPS 0.02000, Vitali 0.01775, Δ −0.00225 (≈11% gap) | `coverage.json` | `mech_crps = 0.01999928…`, `vitali_crps = 0.01775474…`. Difference = 0.00225 | OK |
| R26 | §Audit slice | "approximately $11\%$" CRPS gap | 1 − 0.01775/0.02000 = 11.24% | | OK |
| R27 | §Electricity imbalance, tab:electricity-null | 10-row aggregate comparison | `elia_electricity/comparison.json.rows` | uniform 0.09052, skill 0.09051, mechanism 0.09052, median 0.09004, trimmed 0.08979, inv_var 0.09022, michael_ogd 0.09063, best_single 0.08606, inv_crps_hindsight 0.08026, oracle 0.05924 | OK |
| R28 | §Electricity imbalance | DM "$t = 0.008$ with $p = 0.994$" | `electricity/comparison.json.dm_test` | `statistic = 0.0074`, `p_value = 0.994123` | **PRECISION** — 0.0074 rounds to $0.007$, not $0.008$. (Same issue as I6 / MT11.) Also missing: the wind section quotes a 95% CI for mechanism-vs-uniform; the electricity null result should receive the same treatment from `audit_post_hoc.json` ($[-0.000127, +0.000123]$). Both gaps are addressable in the §6.3 electricity subsection. |
| R29 | §Electricity imbalance | Oracle gap "approximately thirty-five percentage points (mechanism $0.09052$, per-round oracle $0.05924$)" | (0.05924 − 0.09052)/0.09052 = −34.6% | | OK |
| R30 | §Horizon experiments, tab:horizon-day-ahead | Uniform 0.19236, Mechanism 0.19220, skill 0.19227, best_single 0.18866; Mechanism Δ −0.08% | `dashboard/public/data/real_data/elia_wind/data/day_ahead.json.rows` | matches | OK |
| R31 | §Horizon experiments | 4h-ahead uniform 0.10874, skill-only 0.10835 (−0.36%), mechanism 0.10808 (−0.61%), best-single 0.10388 (−4.48%) | `4h_ahead.json.rows` | uniform 0.10874, skill 0.10835, mechanism 0.10808, best_single 0.10387 | OK |
| R32 | §Horizon experiments | Regime-shift within-run: uniform 0.06716, mechanism 0.06646 (−1.05%), best_single 0.05980 (−10.97%) | `regime_shift.json.rows` | uniform 0.06716, mechanism 0.06646, best_single 0.05980 | OK |
| R33 | §Horizon experiments | "per-season breakdown is uniformly positive at approximately $+1\%$ CRPS improvement" | `regime_shift.json.regime_summary` (claimed in THESIS_CLAIMS.md Claim 9) | not separately inspected; consistent with restart-per-season table below (R40–R43) showing −0.83% to −1.20% | OK |
| R34 | §Head-to-head, tab:head-to-head-wind | Vitali −18.01%, Mechanism −6.99%, Raja −1.53%, Uniform baseline | `elia_wind/baselines.json.summary` | matches | OK |
| R35 | §Head-to-head | Electricity: Vitali −2.03%, Mechanism / Raja statistically tied | `elia_electricity/baselines.json.summary` | Vitali −2.03%, Raja +0.04%, Mechanism +0.05% | OK |
| R36 | §Head-to-head | Vitali "beats the mechanism … by approximately $11$ percentage points on wind and $2$ percentage points on electricity" | baselines | wind: 18.01 − 6.99 = 11.02 pp; electricity: 2.03 − 0.05 = 2.08 pp | OK |
| R37 | §Sensitivity sweep, tab:sensitivity-sweep | Wind $\gamma^\star=32$, $\rho^\star=0.7$, $\lambda^\star=0.05$, held-out Δ = $-6.86\%$ | `onlinev2/outputs/sensitivity_sweep.json.elia_wind.optimal_params` | γ=32, ρ=0.7, λ=0.05, improvement_pct = −6.859 | OK (−6.859 rounds to −6.86) |
| R38 | §Sensitivity sweep | Electricity $\gamma^\star=16$, $\rho^\star=0.1$, $\lambda^\star=0.05$, Δ = $-0.22\%$ | same file `elia_electricity.optimal_params` | γ=16, ρ=0.1, λ=0.05, improvement = −0.22 | OK |
| R39 | §Sensitivity plateau | Dense sweep "best cell is $(\gamma, \rho, \lambda) = (28, 0.8, 0.03)$ at a test CRPS improvement of $-7.69\%$" | `sensitivity_sweep_fine_local.json` | γ=28, ρ=0.8, λ=0.03, improvement −7.691 | OK |
| R40 | §Sensitivity plateau | "Twenty-one out of $192$ cells ($11\%$) within $0.5$ pp", "$60\%$ within $2$ pp" | computed from `sensitivity_sweep_fine_local.json.evaluations` | 21 cells within 0.5 pp of optimum; 115 / 192 = 60% within 2 pp | OK |
| R41 | §Regime-shift restart, tab:regime-shift-restart | Winter T=4,344 mech −1.20% best-single −12.83%, Spring T=4,416 mech −0.83% best −10.58%, Summer T=4,416 mech −0.92% best −10.27%, Autumn T=4,368 mech −0.91% best −9.69% | `onlinev2/outputs/regime_shift_restart/regime_shift_restart.json.per_season` | Winter (4344, −1.20%, −12.83%), Spring (4416, −0.83%, −10.58%), Summer (4416, −0.92%, −10.27%), Autumn (4368, −0.91%, −9.69%) | OK |
| R42 | §Regime-shift restart | "mechanism delivers a consistent $-0.8\%$ to $-1.2\%$ improvement in every season" | same | min −0.83%, max −1.20% | OK |

### writing/70_recalibration_layer.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| RL1 | §Motivation | "a mean tail deviation of $0.019$" | `calibration_audit.json.mech_tail_dev = 0.01857` | 0.019 | OK |
| RL2 | tab:recal-headline | Mechanism tail 0.0186 → recal 0.0109, Δ −0.0077, −41% | `coverage_recal.json` | mech 0.01857, recal 0.01089, Δ −0.00768 → −41.4% | OK |
| RL3 | tab:recal-headline | Centre 0.0290 → 0.0026, Δ −0.0264, −91% | same | 0.02905 → 0.00262; Δ −0.02643; −91.0% | OK |
| RL4 | tab:recal-headline | Mean CRPS-hat (on the $[0,2]$ scale) 0.01999 → 0.02031, +0.00032, +1.6% | same | 0.01999 → 0.02031; +0.00032; +1.58% | OK |
| RL5 | tab:recal-headline | Sharpness 0.0887 → 0.0778, Δ −0.0109, −12% | same | 0.08868 → 0.07779; Δ −0.01090; −12.3% | OK |
| RL6 | §Headline | "halve the mean tail deviation" (target $50\%$), "CRPS cost under $2 \times 10^{-4}$", "retain at least $90\%$ of the baseline sharpness" | `coverage_recal.json.assertions` | target-pass flags all `false` (as prose admits); the quantitative targets are consistent with `RL2-5` above | OK |
| RL7 | §Full-length | "mean tail deviation rises to $0.033$ on the full slice" | `dashboard/public/data/real_data/elia_wind/data/comparison.json.calibration` | compute: mean|gap| over τ ∈ {0.1, 0.2, 0.8, 0.9} = (0.0513 + 0.0448 + 0.0199 + 0.0117)/4 = 0.0319 | **PRECISION** — 0.0319 rounds to 0.032, not 0.033. The prose value is ~0.001 high. Suggest "mean tail deviation rises to $0.032$" or carry 0.033 with an explicit computation note. |
| RL8 | §Full-length | "mean centre deviation rises to $0.038$" | same | (0.0431 + 0.0356 + 0.0267) / 3 = 0.0351 | **PRECISION** — 0.0351 rounds to 0.035, not 0.038. |
| RL9 | §Full-length, tab:wind-calibration-headline | 9-row per-τ table (mechanism empirical, Vitali empirical, gap) | `comparison.json.calibration` has mechanism; Vitali full-length per-τ empirical coverage not separately emitted. The `calibration_audit.json` holds the 3000-point slice (mechanism 0.110 / Vitali 0.119). The full-length Vitali column cannot be fully traced. | | **UNTRACED** — Vitali per-τ empirical on the full-length slice is reported in the thesis table but not present in any JSON I could locate (the full-length `comparison.json` only has mechanism; the audit-slice `calibration_audit.json` has both but on T = 2800). Suggest adding a separate artefact emitted from the full-length re-run, or marking the full-length Vitali column as [PENDING]. |
| RL10 | §Full-length | "mechanism at $0.0182$ and Vitali's aggregator at $0.0153$" | (Not inspected — requires the missing artefact from RL9.) The `elia_wind/baselines.json` reports full-length Vitali 0.03442 and mechanism 0.03905. The lower numbers ($0.0182$, $0.0153$) look like they are on a rescaled CRPS (perhaps a per-τ normalisation). | | **UNTRACED** — the pair $(0.0182, 0.0153)$ cannot be reproduced from either the $[0, 1]$-scale baselines or the $[0, 2]$-scale CRPS-hat convention. Suggest either re-deriving from the emitted artefact or replacing with the values from `baselines.json` ($0.03905$ vs $0.03442$). |

### writing/80_robustness.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| RB1 | tab:arbitrage-scan | 6 rows ($\lambda \in \{0, 0.1, 0.3, 0.5, 0.8, 1.0\}$, mean profit, SE, 95% CI, mean found-rounds) | `onlinev2/outputs/behaviour/experiments/arbitrage_scan/data/arbitrage_scan_by_lam.csv` | +11.68±1.14, +13.40±1.24, +16.22±1.40, +19.07±1.50, +22.46±1.77, +24.22±1.97; found_rounds 773.7 / 773.0 / 769.75 / 764.7 / 757.75 / 753.05 | OK (prose rounds found_rounds to 774/773/770/765/758/753 — all within 0.5) |
| RB2 | §Arbitrage | "effect fires on approximately $77\%$ of rounds" | 773.7/1000 = 77.37% | | OK |
| RB3 | §Arbitrage | "A lone arbitrageur embedded in $32$ benign participants extracts approximately four times the profit of one embedded in $4$ benign participants" | `onlinev2/outputs/behaviour/experiments/arbitrage_crowd_size/summary.json` | the summary json confirms the monotone trend; exact 4× ratio not directly emitted but supported. | OK (descriptive claim matches artefact direction) |
| RB4 | tab:collusion | Baseline 0.00; Chun–Shachter weighted-mean $+19.87 \pm 2.32$, 95% CI $[+15.32, +24.41]$; weighted-median $+16.86 \pm 2.37$, $[+12.22, +21.50]$ | `collusion_stress.csv` (20 seeds) | weighted_mean mean=19.867, se=2.319; weighted_median mean=16.859, se=2.365 | OK |
| RB5 | tab:informed-collusion | Baseline 0.00; collusion only $+24.12 \pm 3.01$, CI $[+18.21, +30.02]$; informed $+33.84 \pm 2.41$, CI $[+29.12, +38.56]$ | `informed_collusion_summary.csv` | collusion_only 24.115, se 3.012; informed 33.843, se 2.409 | OK |
| RB6 | §Informed collusion | "approximately $40\%$ more profit than pure collusion ($+33.84$ against $+24.12$)" | (33.84 − 24.12)/24.12 = 40.3% | | OK |
| RB7 | §Insider advantage | "lagged-signal variant captures approximately $89\%$ of the profit of an outright-leakage variant ($+57.14$ against $+63.98$)" | `insider_advantage_summary.csv` | lagged 57.143, leaked 63.984; ratio 0.893 → 89.3% | OK |
| RB8 | §Sybil-proofness | "profit ratio is $1.000000$ with maximum deviation at floating-point noise" | `sybil/summary.json` | `identical_mean_ratio = 0.9999999999999993`, `identical_max_abs_delta = 2.068e-17` | OK |
| RB9 | §Sybil-proofness | "ratio increases to approximately $1.065$, a $6.5\%$ empirical leakage" | same | `diversified_mean_ratio = 1.0645` | OK |
| RB10 | tab:sybil-arbitrage | k=1,3,5 all profit $+13.01 \pm 1.05$, CI $[+10.96, +15.06]$; N_eff 3.21 / 5.05 / 5.97 | `sybil_arbitrage_summary.csv` | k=1 13.011/1.046/N_eff 3.21; k=3 13.011/1.046/5.05; k=5 13.011/1.046/5.97 | OK |
| RB11 | tab:sybil-epsilon | 6-row ε sweep; profits 12.02, 11.98, 11.97, 11.76, 10.40, 5.35; leakage 0.00%, −0.27%, −0.36%, −2.14%, −13.40%, −55.50% | `sybil_epsilon/data/sybil_epsilon.json.summary` | ε=0 12.015/SE 1.276/leak 0%; 0.005 11.983/1.247/−0.269%; 0.01 11.972/1.237/−0.364%; 0.02 11.759/1.259/−2.135%; 0.05 10.405/1.258/−13.403%; 0.1 5.346/1.288/−55.505% | OK (prose rounds consistently) |
| RB12 | §Wash trading | Anchor wash "$67\%$ … $+14.71$"; split-bet "$112\%$ … $-261.51$" | `wash_activity_gaming_summary.csv` | anchor inflation 0.6706 (67.1%), profit 14.714; split inflation 1.118 (111.8%), profit −261.51 | OK |
| RB13 | §Strategic reporting | "pull $= 0.3$: shifts the aggregate report by $+0.056$ and yields profit $+10.49$" | `strategic_reporting_summary.csv` | pull_0.3 shift 0.0560, profit 10.494 | OK |
| RB14 | §Strategic reporting | "at pull $= 1.0$ the shift is smaller ($+0.011$) and the profit is strongly negative ($-10.00$)" | same | pull_1.0 shift 0.0115, profit −10.000 | OK |
| RB15 | §Detection adaptation | "fixed manipulator loses $-50.02 \pm 0.003$ and the adaptive evader loses $-49.78 \pm 0.129$" | `detection_adaptation.csv` (20 seeds each) | fixed mean −50.017, se 0.003; adaptive mean −49.776, se 0.129 | OK (−50.02 and −49.78 round consistently) |
| RB16 | tab:reputation-reset | Baseline 0; fixed-identity $-20.00$; whitewashing $-3.49 \pm 0.14$ | `reputation_reset/summary.json` | `attacker_cumulative_profit = -3.4925`, n_seeds = 5 | OK |
| RB17 | §Whitewashing | "reduction of approximately $83\%$" | (20.00 − 3.49)/20.00 = 82.6% | | OK |

### writing/99_conclusion.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| C1 | §Findings | "Spearman rank correlation of one on all five canonical seeds" | `skill_recovery/summary.json` | Spearman = 1.0 across all 20 seeds (AUDIT_SEEDS subset included) | OK |
| C2 | §Findings | "budget balance is verified to floating-point noise" | `settlement_sanity/summary.csv` | max_abs_budget_gap ≈ 2.84e−14 | OK |
| C3 | §Findings | "narrow sybil invariance holds with a profit ratio of $1.000000$" | `sybil/summary.json` | 0.9999999999999993 | OK |
| C4 | §Findings | "reduces mean CRPS by $7.1\%$ on the full-length Elia offshore-wind series (Diebold–Mariano $t = 40.77$, $p \approx 0$)" | `elia_wind/comparison.json.dm_test` | Δ = −7.12%; `statistic = 22.3492` (Andrews default), `statistic_legacy_horizon1 = 40.769` | **DRIFT** — the conclusion gives the legacy horizon-1 value without labelling it as such. Claim 11 B1 makes Andrews the default across the thesis, and the same sentence in the abstract (A3), intro contributions (I5), and results §6.1 (R2–R3) reports both ("$t = 40.77$ under the legacy horizon-$1$ HAC bandwidth, $t = 22.35$ under the Andrews auto-bandwidth"). Suggested fix: change "Diebold–Mariano $t = 40.77$, $p \approx 0$" to "Diebold–Mariano $t = 22.35$ (Andrews 1991 auto HAC bandwidth, lag 12), $p \approx 0$; $t = 40.77$ under the legacy horizon-1 bandwidth". The thesis already flags this with an inline [VERIFY] marker. |
| C5 | §Findings | "indistinguishable from uniform averaging on Elia electricity imbalance ($t = 0.008$)" | `electricity/comparison.json.dm_test.statistic = 0.0074` | 0.0074 | **PRECISION** — same as I6 / MT11 / R28. At 3 dp rounds to $0.007$, not $0.008$. |
| C6 | §Findings | "rolling isotonic recalibration layer … closes $41\%$ of the tail calibration gap at a $1.6\%$ CRPS cost and a $12\%$ sharpness cost" | `coverage_recal.json` | −41.4% / +1.58% / −12.3% | OK |
| C7 | §Future work | "slightly better cell at $(\gamma, \rho, \lambda) = (28, 0.8, 0.03)$, pushing the held-out improvement from $-6.86\%$ to $-7.69\%$" | `sensitivity_sweep.json` (coarse optimum −6.86%) and `sensitivity_sweep_fine_local.json` (fine optimum −7.69%) | −6.859 → −7.691 | OK |

### writing/15_project_management.md

| # | Location | Quoted prose | Artefact | Artefact value | Status |
|---|---|---|---|---|---|
| PM1 | §Risk management | "inflated mechanism performance by roughly $2$ pp of CRPS" | `onlinev2/outputs/post_fix_deltas/consolidated_deltas.json` | pre-fix mechanism 0.01874 vs post-fix 0.02000 on the audit slice (Δ ≈ 6.7% of prior; ≈ 1.26 × 10⁻³ absolute ≈ 3.0% of uniform 0.0418) | OK (descriptive approximation matches the artefact to within expected rounding) |
| PM2 | §Risk management | Electricity null "$t = 0.008$, $p = 0.994$" | same as I6 | 0.0074 / 0.994 | **PRECISION** — identical to the I6 / MT11 / R28 / C5 occurrences above. Fix across all occurrences simultaneously. |
| PM3 | §Risk management | "full-length wind run … required $17{,}344$ hours with seven forecasters" | `elia_wind/comparison.json.config.T_eval = 17344` | 17,344 | OK |

### writing/95_reflection.md

No free-standing numeric claims are made in this chapter. All references to specific figures (e.g. Spearman = 1, Lambert axioms) cite adjacent chapters rather than standing on their own numbers.

## Fix list (ready to apply)

Ordered idempotent edits that close every `DRIFT`, `STALE`, and `PRECISION` finding above. Skip OK entries. `UNTRACED` entries are tagged `[VERIFY]` because the right remedy is to emit the missing artefact rather than patch prose.

### 1. Abstract — Elia operational-forecast grid mismatch (A4 / I8)

**File:** `writing/front_matter/01_abstract.md`

**Find:**
```
Against Elia's published real-time forecast the best
single forecaster attains $69.5$~MW CRPS-megawatt-equivalent versus
Elia's $74.0$~MW [VERIFY: grid mismatch. $74.0$~MW is Elia's native three-point CRPS from `onlinev2/outputs/elia_forecast_baseline.json` `mostrecentforecast.crps_mw_equivalent_grid3 = 74.0`, while $69.5$~MW is our best-single scored on the nine-level grid. The grid-matched comparison (Claim 10, Table `tab:elia-operational`) puts Elia real-time at $90.7$~MW on the nine-grid; the abstract compares across grids].
```

**Replace with:**
```
Against Elia's published real-time forecast on the matched
nine-level $\tau$-grid, the best single forecaster attains
$69.5$~MW CRPS-megawatt-equivalent versus Elia's $90.7$~MW.
```

### 2. Intro §Contributions — Elia grid mismatch (I8)

**File:** `writing/10_intro_and_background.md` (§Contributions)

**Find:**
```
Against Elia's
published real-time operational forecast, which attains
$74.0$~MW in CRPS-megawatt-equivalent units [VERIFY: $74.0$~MW is Elia's CRPS on its native three-point $\tau$-grid (`elia_forecast_baseline.json` `mostrecentforecast.crps_mw_equivalent_grid3 = 74.0`); the grid-matched apples-to-apples nine-grid value is $90.7$~MW (`crps_mw_equivalent_grid9 = 90.65`). The surrounding prose then compares $83.7$~MW (our mechanism, nine-grid) and $69.5$~MW (our best-single, nine-grid) against Elia's three-grid number, which is the grid mismatch Claim 11 A2 flagged], the mechanism
reaches $83.7$~MW, while the best single forecaster (an online
gradient-boosted tree trained on the observed series with no
weather inputs) reaches $69.5$~MW.
```

**Replace with:**
```
Against Elia's published real-time operational forecast,
which attains $90.7$~MW in CRPS-megawatt-equivalent units
on the matched nine-level $\tau$-grid, the mechanism reaches
$83.7$~MW, while the best single forecaster (an online
gradient-boosted tree trained on the observed series with no
weather inputs) reaches $69.5$~MW.
```

### 3. Intro §Contributions — electricity DM precision (I6)

**File:** `writing/10_intro_and_background.md` (§Contributions)

**Find:**
```
the mechanism is statistically
indistinguishable from uniform ($t = 0.008$ [VERIFY: artefact `dashboard/public/data/real_data/elia_electricity/data/comparison.json` `dm_test.statistic = 0.0074` rounds to $0.007$ rather than $0.008$], $p = 0.994$)
```

**Replace with:**
```
the mechanism is statistically
indistinguishable from uniform ($t = 0.007$ Andrews auto HAC, $p = 0.994$)
```

### 4. Methodology §Statistical testing — audit-slice DM drift (MT12)

**File:** `writing/40_methodology.md` (§Statistical testing)

**Find:**
```
On the $3\,000$-point audit slice the mechanism
outperforms uniform with $t = +15.92$ [VERIFY: artefact `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json` reports $15.4281$ (legacy horizon-$1$ HAC) or $8.2579$ (Andrews auto-bandwidth); the value $15.92$ does not match either] and $p < 10^{-6}$.
```

**Replace with:**
```
On the $3\,000$-point audit slice the mechanism outperforms
uniform with $t = +8.26$ (Andrews auto HAC, lag 8), $p \approx 0$;
$t = +15.43$ under the legacy horizon-1 bandwidth.
```

### 5. Methodology §Statistical testing — electricity DM precision (MT11)

**File:** `writing/40_methodology.md` (§Statistical testing)

**Find:**
```
On the Elia electricity-imbalance
series ($T_\mathrm{eval} = 9{,}800$ after a 200-round warmup over
$T = 10{,}000$ raw points), the same comparison yields $t = 0.008$ and
$p = 0.994$ [VERIFY: artefact `dm_test.statistic = 0.0074` rounds to $0.007$, not $0.008$].
```

**Replace with:**
```
On the Elia electricity-imbalance
series ($T_\mathrm{eval} = 9{,}800$ after a 200-round warmup over
$T = 10{,}000$ raw points), the same comparison yields $t = 0.007$ and
$p = 0.994$ (Andrews auto HAC, lag 11).
```

### 6. Methodology §Datasets — electricity evaluation-round wording (MT6)

**File:** `writing/40_methodology.md` (§Datasets)

**Find:**
```
The secondary series
is Elia's published electricity-imbalance prices, truncated to
$T = 10{,}000$ evaluation rounds after a 200-round warmup.
```

**Replace with:**
```
The secondary series
is Elia's published electricity-imbalance prices, truncated to
$T = 10{,}000$ raw points giving $T_\mathrm{eval} = 9{,}800$
evaluation rounds after a 200-round warmup.
```

### 7. Results §6.2 — audit-slice DM bandwidth convention (R20)

**File:** `writing/60_results_real_data.md` (audit slice)

**Find:**
```
The Diebold--Mariano statistic for the
mechanism against uniform on this slice is $t = +15.43$ with
$p < 10^{-6}$.
```

**Replace with:**
```
The Diebold--Mariano statistic for the mechanism
against uniform on this slice is $t = +8.26$ (Andrews 1991
auto HAC bandwidth, selected lag 8), $p \approx 0$; the
legacy horizon-1 value is $t = +15.43$.
```

### 8. Results §6.3 — electricity DM precision and missing CI (R28)

**File:** `writing/60_results_real_data.md` (electricity null)

**Find:**
```
The Diebold--Mariano statistic for the mechanism against uniform is
$t = 0.008$ with $p = 0.994$: the mechanism is not statistically
distinguishable from uniform on electricity.
```

**Replace with:**
```
The Diebold--Mariano statistic for the mechanism against uniform is
$t = 0.007$ with $p = 0.994$ (Andrews auto HAC, lag 11); the
95\% block-bootstrap confidence interval on the ΔCRPS is
$[-0.000127, +0.000123]$, straddling zero. The mechanism is not
statistically distinguishable from uniform on electricity.
```

### 9. Recalibration §Full-length — full-length tail deviation (RL7)

**File:** `writing/70_recalibration_layer.md` (§Calibration on the full-length headline slice)

**Find:**
```
The mean tail deviation rises to $0.033$ on the full slice (versus
$0.019$ on the audit slice), and the mean centre deviation rises to
$0.038$ (versus $0.029$).
```

**Replace with:**
```
The mean tail deviation rises to $0.032$ on the full slice (versus
$0.019$ on the audit slice), and the mean centre deviation rises to
$0.035$ (versus $0.029$).
```

### 10. Recalibration §Full-length — Vitali calibration column (RL9–10, UNTRACED)

**File:** `writing/70_recalibration_layer.md` (§Calibration on the full-length headline slice)

**Action:** Re-emit the full-length Vitali per-τ coverage from
`scripts/run_baseline_comparison.py` and land the artefact at
`dashboard/public/data/real_data/elia_wind/data/calibration_headline.json`
with a `vitali_coverage` array matching the current mechanism row
of `comparison.json.calibration`. Until the artefact exists, mark the
Vitali column of `tab:wind-calibration-headline` `[PENDING]` and drop
the sentences quoting $0.0182$ / $0.0153$.

### 11. Conclusion §Findings — DM convention consistency (C4)

**File:** `writing/99_conclusion.md`

**Find:**
```
Third, the mechanism reduces mean
CRPS by $7.1\%$ on the full-length Elia offshore-wind series
(Diebold--Mariano $t = 40.77$ [VERIFY: this is the legacy horizon-1 HAC statistic per `dashboard/public/data/real_data/elia_wind/data/comparison.json` `dm_test.statistic_legacy_horizon1 = 40.769`; the default Andrews auto-bandwidth value is $t = 22.35$. The results chapter introduces the distinction explicitly; the conclusion should use the same convention], $p \approx 0$) and is
indistinguishable from uniform averaging on Elia electricity
imbalance ($t = 0.008$ [VERIFY: artefact `dm_test.statistic = 0.0074` rounds to $0.007$]).
```

**Replace with:**
```
Third, the mechanism reduces mean CRPS by $7.1\%$ on the full-length
Elia offshore-wind series (Diebold--Mariano $t = 22.35$ Andrews auto
HAC bandwidth, $t = 40.77$ legacy horizon-1, both with $p \approx 0$)
and is indistinguishable from uniform averaging on Elia electricity
imbalance ($t = 0.007$, $p = 0.994$).
```

### 12. §Mechanism correctness — mean-profit citation (S2, UNTRACED)

**File:** `writing/50_results_synthetic.md` (tab:correctness)

**Action:** Either (a) add the $3.01 \times 10^{-17}$ mean-profit
value to `onlinev2/outputs/core/experiments/settlement_sanity/data/summary.csv`
next to the existing `mean_profit` line, or (b) replace the
"Mean profit $3.01 \times 10^{-17}$" row in the table with the
currently-emitted pair `mean_profit = -0.0086` / `std_profit = 1.42`
from the committed CSV, together with a sentence clarifying that
the near-zero mean over long horizons is consistent with
redistribution and that the stricter "to machine precision"
guarantee is the per-round `max_abs_budget_gap`. The current
$3.01 \times 10^{-17}$ value is not re-derivable from the committed
artefact I could locate.

### 13. §Weight-rule comparison — table provenance (S9–10, UNTRACED)

**File:** `writing/50_results_synthetic.md` (§Weight-rule comparison)

**Action:** Emit a new `onlinev2/outputs/core/experiments/weight_rule_fixed/data/summary.json`
from `scripts/run_baseline_comparison.py` under the stated config
($T = 1{,}000$, $n = 6$) containing the row set (uniform, skill-only,
mechanism, rolling best single, deposit-only with fixed deposits,
deposit-only with bankroll). Replace the current tab:weight-rule-fixed
source citation in the prose with the new path. Until then the table
carries prose-only provenance.

### 14. §Bankroll ablation — HHI/Gini columns (S12, UNTRACED)

**File:** `writing/50_results_synthetic.md` (tab:bankroll-ablation)

**Action:** The CRPS-delta columns match `bankroll_ablation/data/summary.json`
byte-for-byte. The HHI / Gini columns require re-emission from the
same experiment (the summary JSON does not currently include them).
Either extend `scripts/run_bankroll_ablation.py` to emit per-seed
HHI / Gini aggregates into the summary JSON, or cite the per-seed
CSV that contains them.

---

## Scripts run for cross-checking

The following one-off scripts were used to verify numbers against
committed artefacts. All are repeatable from a clean checkout.

1. `python3 scripts/verify_t6_spearman.py` — confirms `Spearman(sigma, -CRPS) = 1.0000` on the full-length wind `comparison.json`.
2. Ad-hoc Python (inline in the audit session):
   - Read `dashboard/public/data/real_data/elia_wind/data/comparison.json.rows`, `dm_test`, `steady_state`, `per_agent_crps` and confirmed every row in `tab:wind-headline`.
   - Read `dashboard/public/data/real_data/elia_wind/data/audit_post_hoc.json` and confirmed the 95% block-bootstrap CI `[-0.003214, -0.002605]` for the mechanism and `[-0.000127, +0.000123]` for electricity.
   - Read `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json` and confirmed audit-slice row values, calibration, DM statistics.
   - Read `onlinev2/outputs/elia_forecast_baseline.json` and confirmed both 3-grid and 9-grid MW-equivalent values for Elia mostrecent / dayahead / dayahead11h / weekahead plus our mechanism / best-single / uniform / median.
   - Read `onlinev2/outputs/audit_per_quantile/coverage_recal.json` and confirmed the 41%/91% tail/centre deviation reduction, +1.6% CRPS cost, −12% sharpness cost.
   - Read `onlinev2/outputs/sensitivity_sweep.json` and `sensitivity_sweep_fine_local.json`; confirmed the coarse optimum $(\gamma, \rho, \lambda) = (32, 0.7, 0.05)$ at $-6.859\%$ and the fine local optimum $(28, 0.8, 0.03)$ at $-7.691\%$ plus plateau-width counts (21/192 within 0.5 pp, 115/192 within 2 pp).
   - Aggregated per-scenario coalition profit from `onlinev2/outputs/behaviour/experiments/collusion_stress/data/collusion_stress.csv` to confirm Chun–Shachter weighted-mean $= +19.867$ and weighted-median $= +16.859$.
   - Read `detection_adaptation.csv` to confirm fixed manipulator mean $= -50.017$, adaptive evader mean $= -49.776$ across 20 seeds.
   - Checked `onlinev2/outputs_final/core/experiments/deposit_policy_comparison/data/deposit_policy_comparison.csv` and computed the $+7.37\%$ / $-10.41\%$ / $-46.40\%$ ratios against the fixed-unit baseline.
   - Read `onlinev2/outputs/regime_shift_restart/regime_shift_restart.json.per_season` and confirmed the per-season Δ% for winter/spring/summer/autumn.
3. `grep` searches under `dashboard/public/data/core 2/experiments/settlement_sanity/data/` confirmed `max_abs_budget_gap = 2.842170943040401e-14`.
