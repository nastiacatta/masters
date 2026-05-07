# Results — real data

Status: **[LOCKED]** except where flagged. Last refreshed against
`onlinev2/outputs/post_fix_deltas/SUMMARY.md` dated 2026-05-07 and
`dashboard/public/data/real_data/{elia_wind,elia_electricity}/data/*.json`
dated 2026-05-07.

Two canonical wind slices with different purposes:

- **Full-length 17 344-hour run** (expanding causal normalisation,
  mechanism parameters γ = 16, ρ = 0.5, λ = 0.05, η = 2.0). Headline
  slice for method-vs-method aggregation comparisons. Source:
  `dashboard/public/data/real_data/elia_wind/data/comparison.json`.
  LOCKED.
- **3000-point audit slice** (`scripts/audit_fresh_run.py`, warmup-
  window causal normalisation). THESIS_CLAIMS.md §Claim 4 reference
  slice, and the slice every per-quantile calibration number uses.
  Source: `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/
  comparison.json` and `onlinev2/outputs/audit_per_quantile/
  coverage.json`. LOCKED on those uses.

Remaining [PENDING]: the horizon blocks (`day_ahead`, `4h_ahead`,
`regime_shift`) and the `baselines.json` head-to-head have not yet been
re-run under expanding normalisation (documented in
`onlinev2/outputs/post_fix_deltas/SUMMARY.md` §"Remaining documented
limitations"). The numbers quoted below for those blocks are under the
static warmup-window mode; direction of comparisons is stable, absolute
magnitudes may shift on refresh.

## Elia offshore wind — 17 344-hour full-length run (headline)

T = 17 344 evaluation rounds after a 200-round warmup, seven real
forecasters, expanding causal normalisation, tuned mechanism
parameters γ = 16, ρ = 0.5, λ = 0.05, η = 2.0.

### Aggregate comparison

Mean CRPS on the normalised [0, 1] scale [source:
`dashboard/public/data/real_data/elia_wind/data/comparison.json`].

| Rule | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| oracle (per-round inv-variance hindsight) | 0.02176 | **−46.7%** |
| best_single (rolling 100-step CRPS selector) | 0.03145 | −22.9% |
| per_round_inv_crps_hindsight | 0.03175 | −22.2% |
| michael_ogd_centered_median_fan | 0.03487 | −14.5% |
| median | 0.03700 | −9.3% |
| trimmed_mean | 0.03786 | −7.2% |
| **mechanism** | **0.03788** | **−7.1%** |
| inverse_variance | 0.03792 | −7.0% |
| skill | 0.03869 | −5.2% |
| uniform | 0.04079 | — |

Diebold–Mariano test, mechanism vs uniform:

- **t = 40.77, p ≈ 0.0** [source: `comparison.json` `dm_test` block].
  Mechanism Δ is strongly statistically significant.

DM test, skill vs uniform:

- t = 38.92, p ≈ 0.0 [source: same `dm_test_skill` block].

### Reading the table

- **Mechanism vs inverse_variance (−7.1% vs −7.0%).** Effectively a
  statistical tie. The skill gate's contribution on top of the
  Bates–Granger-style inverse-variance weighting is within noise on
  this slice — 0.04 pp separates them.
- **Mechanism vs michael_ogd_centered_median_fan (−7.1% vs −14.5%).**
  The centered-median fan baseline (a shifted-median aggregator ported
  from `michael/main_rewards.jl`) beats us by 7.4 pp CRPS. This is the
  gap I attribute to not having a per-τ OGD aggregator; we discuss the
  tradeoff in Chapter 7.
- **Mechanism vs oracle (−7.1% vs −46.7%).** The oracle gap is ~40 pp;
  no self-financed aggregator can close it in practice. The mechanism
  captures roughly 15% of the available oracle gap. This number is
  what the thesis's realistic "headroom left" statement is based on.
- **Mechanism vs best_single (−7.1% vs −22.9%).** The rolling 100-step
  CRPS selector — which picks the forecaster with the lowest recent
  average CRPS — beats us by 15.8 pp. On Elia wind with XGBoost as the
  persistent top forecaster, selecting one model locally is better
  than any aggregation that includes the weaker models.

**Definitional note on `best_single`.** It is a rolling 100-step CRPS
selector (`best_single_by_crps(agent_rolling_crps, lookback=100)` in
`onlinev2/src/onlinev2/real_data/runner.py`), not a per-round oracle.
The per-round hindsight row is `oracle`, which uses full-information
inverse-variance weights.

### Per-forecaster CRPS and skill ordering (Claim 5)

Steady-state σ (last 20% of rounds) [source:
`onlinev2/outputs/post_fix_deltas/SUMMARY.md`]:

| Rank | Forecaster | σ_final | Weight |
|---:|---|---:|---:|
| 1 | XGBoost | 0.808 | 0.690 |
| 2 | ARIMA(2,1,1) | 0.791 | 0.666 |
| 3 | Naive | 0.790 | 0.666 |
| 4 | Neural Net (MLP) | 0.768 | 0.630 |
| 5 | Ensemble (Naive+EWMA) | 0.753 | 0.616 |
| 6 | EWMA(5) | 0.703 | 0.557 |
| 7 | Theta | 0.685 | 0.534 |

Per-forecaster CRPS is indirectly visible through the weight ordering:
`best_single` CRPS is 0.03145 and the mechanism picks XGBoost as the
top-skill forecaster. The mechanism reconstructs the per-forecaster
ranking from data alone without being told which model is best.

### Elia operational forecast comparison (new)

[source: `onlinev2/outputs/elia_forecast_baseline.json` and
`onlinev2/outputs/post_fix_deltas/SUMMARY.md`, §"Elia operational
forecast baseline". MW-equivalent uses the full-series scale
`series_min_mw = 0`, `series_max_mw = 2208.7` per
`our_mechanism_post_fix` block.]

| Forecast source | CRPS (MW equiv) | Notes |
|---|---:|---|
| Elia `mostrecentforecast` | 74.0 | Elia's real-time NWP-driven forecast |
| Elia `dayaheadforecast` | 98.6 | Elia's day-ahead NWP-driven forecast |
| Elia `weekaheadforecast` | 372.4 | Elia's week-ahead forecast (weak) |
| **our best_single (XGBoost)** | **69.5** | Online-only, no weather input |
| our mechanism | 83.7 | 7-forecaster aggregate |
| our per_round_inv_crps_hindsight | 70.1 | Hindsight oracle |

**Reading.** A simple online XGBoost trained on the observed series
beats Elia's operational real-time forecast (which uses weather
inputs) by ~6% in CRPS-MW-equivalent (69.5 vs 74.0). The mechanism
aggregates seven forecasters, most of which are weaker than XGBoost,
and ends up ~13% worse than Elia's operational forecast (83.7 vs
74.0). Elia's day-ahead forecast is considerably weaker at 98.6.

Elia's published interval forecasts are **systematically miscalibrated**:
τ = 0.10 nominal gives 19.1% empirical coverage (should be 10%), and
τ = 0.90 gives 94.6% (should be 90%). This is a known property of
operational NWP forecasts and motivates the recalibration layer in
Chapter 5.3.

## Elia offshore wind — 3000-point audit slice (calibration anchor)

Used only for calibration and per-quantile diagnostics. Mechanism
parameters γ = 16, ρ = 0.5, λ = 0.05, η = 2.0; strictly-causal
`normalize_mode="expanding"`, post-fix pipeline (negative raw wind
values clipped to 0 before normalisation). Expanding rather than
static because the 3000-point audit slice's warmup (Jan winter wind)
has a systematically higher range than the eval window, which would
cause static normalisation to clip ~46% of eval values to 0 and
render per-quantile coverage uninterpretable.
[source: `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/
comparison.json`, regenerated 2026-05-07].

### Aggregate comparison on the audit slice (Claim 4 reference)

| Rule | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| oracle (per-round argmin) | 0.01166 | −44.9% |
| best_single (rolling 100-step CRPS selector) | 0.01665 | −21.3% |
| per_round_inv_crps_hindsight | 0.01670 | −21.0% |
| median | 0.01919 | −9.3% |
| inverse_variance | 0.01963 | −7.2% |
| trimmed_mean | 0.01973 | −6.7% |
| **our mechanism** | **0.02000** | **−5.4%** |
| **michael_ogd_centered_median_fan** (rename of legacy `michael_ogd`) | **0.02030** | **−4.0%** |
| skill | 0.02043 | −3.4% |
| uniform | 0.02115 | — |

**Ratio mechanism / michael_ogd_centered_median_fan** =
0.02000 / 0.02030 = **0.985×** (mechanism beats the centered-median
fan by 1.5% on this slice).

DM test (mechanism vs uniform) on this slice: **+15.43, p < 1e-6**
[source: `dm_test.statistic` in the regenerated `comparison.json`].

_Earlier revisions of this table cited 0.01874 / 0.01869 with ratio
1.003×. Those numbers were produced before the audit script clipped
negative raw wind values and under static warmup-window normalisation
that clipped 46% of eval values to 0. See
`onlinev2/outputs/pre_fix_snapshot/elia_wind_audit_fresh/
comparison.json` for the archived pre-fix values._

### Per-forecaster CRPS on the audit slice (Claim 5)

[source: same `comparison.json`, `per_agent_crps` block,
post-fix 2026-05-07]:

| Rank | Forecaster | CRPS | vs best |
|---:|---|---:|---:|
| 1 | XGBoost | 0.01777 | — |
| 2 | ARIMA(2,1,1) | 0.01925 | +8.4% |
| 3 | Naive (last value) | 0.01943 | +9.3% |
| 4 | Neural Net (MLP) | 0.02435 | +37.0% |
| 5 | Ensemble (Naive+EWMA) | 0.02458 | +38.3% |
| 6 | EWMA(5) | 0.03224 | +81.4% |
| 7 | Theta | 0.03577 | +101.3% |

Steady-state σ (last 20% of rounds):

| Forecaster | σ_final |
|---|---:|
| XGBoost | 0.910 |
| ARIMA | 0.896 |
| Naive | 0.893 |
| Naive | 0.893 |
| Ensemble | 0.856 |
| EWMA | 0.814 |
| Theta | 0.796 |

**Spearman rank correlation between σ and CRPS = 1.0** on this slice.
The σ values are systematically larger than on the full-length run
(XGBoost 0.910 vs 0.808) because the warmup-window normalisation on a
3000-point slice produces tighter losses than the expanding
normalisation on 17 344 points; both runs agree on the *ordering*.

### Tail calibration (Claim 6)

Per-τ empirical coverage on the audit slice [source:
`onlinev2/outputs/audit_per_quantile/coverage.json`,
regenerated 2026-05-07 under `causal_normalize_expanding` + negative-
wind clipping; `coverage_recal.json` has the same table alongside
recalibrated coverage].

| τ | Nominal | Mechanism empirical | Gap |
|---:|---:|---:|---:|
| 0.10 | 0.100 | 0.110 | +0.010 |
| 0.20 | 0.200 | 0.202 | +0.002 |
| 0.30 | 0.300 | 0.306 | +0.006 |
| 0.40 | 0.400 | 0.418 | +0.018 |
| 0.50 | 0.500 | 0.535 | +0.035 |
| 0.60 | 0.600 | 0.634 | +0.034 |
| 0.70 | 0.700 | 0.742 | +0.042 |
| 0.80 | 0.800 | 0.835 | +0.035 |
| 0.90 | 0.900 | 0.927 | +0.027 |

- **Mean tail deviation** (τ ∈ {0.1, 0.2, 0.8, 0.9}): 0.019.
- **Mean centre deviation** (0.4 ≤ τ ≤ 0.6): 0.029.
- **Pattern.** Systematic over-coverage at every quantile level. The
  aggregate quantile function is too aggressive (right-shifted). This
  differs from the pre-fix pipeline which showed mixed
  under/over-coverage; the new pattern reflects the shift from the
  buggy whole-series normalisation that had clipped low eval values.

Closed by the recalibration layer; see Chapter 5.3 /
`writing/70_recalibration_layer.md`.

### Mechanism vs Vitali per-τ OGD on the audit slice

The same per-τ coverage file stores a Vitali per-τ OGD baseline
[source: `onlinev2/outputs/audit_per_quantile/coverage.json`,
regenerated 2026-05-07 under `causal_normalize_expanding` + negative-
wind clipping]:

| Metric | Mechanism | Vitali per-τ OGD | Δ |
|---|---:|---:|---:|
| Mean tail deviation (τ ∈ {0.1, 0.2, 0.8, 0.9}) | 0.019 | 0.019 | ≈0 |
| Mean centre deviation (0.4 ≤ τ ≤ 0.6) | 0.029 | 0.027 | −0.002 |
| Mean CRPS-hat | 0.02000 | 0.01775 | −0.00225 |

Vitali's aggregator is about as calibrated as ours on this slice
(mean |emp − nominal| tail = 0.019 for both) and lower-CRPS
(0.01775 vs 0.02000, gap ≈ 11%). Vitali's advantage on CRPS comes
from relaxing the Lambert budget-balance constraint and learning
per-τ weights directly. The thesis's recalibration layer closes
most of the centre deviation (Chapter 5.3) without relaxing budget
balance.

### Skill trajectory figure

Rendered in `dashboard/public/presentation-plots/skill_wager.png` and
`skill_signal_clean.png`. Reuse; do not regenerate. Interpretation:
warmup (t < 200) all σ at prior; fast adaptation (t ∈ [200, 800])
XGBoost and MLP pull away and Theta and EWMA drop fast; steady state
(t > 1500) σ ordering stable and matches final CRPS.

## Elia electricity imbalance — null result

[source: `dashboard/public/data/real_data/elia_electricity/data/
comparison.json`, dated 2026-05-07;
`onlinev2/outputs/post_fix_deltas/SUMMARY.md` §"Elia electricity
imbalance prices"].

T = 10 000 evaluation rounds after a 200-round warmup, seven
forecasters, same mechanism parameters, expanding causal
normalisation.

| Method | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| uniform | 0.09052 | — |
| skill | 0.09051 | −0.0% |
| **mechanism** | **0.09052** | **≈ 0.0%** |
| inverse_variance | 0.09022 | −0.3% |
| median | 0.09004 | −0.5% |
| trimmed_mean | 0.08979 | −0.8% |
| michael_ogd_centered_median_fan | 0.09063 | +0.1% |
| best_single | 0.08606 | −4.9% |
| per_round_inv_crps_hindsight | 0.08026 | −11.3% |
| oracle | 0.05924 | −34.6% |

Diebold–Mariano test, mechanism vs uniform:

- **t = 0.008, p = 0.994** [source: post-fix SUMMARY].
- The mechanism is **not statistically distinguishable from uniform**
  on electricity.

**Interpretation.** This is an honest null. Electricity imbalance
prices are volatile and the seven forecasters produce near-identical
CRPS within ~1% of each other, so skill-weighting has no persistent
signal to exploit. The pre-fix "mechanism −3.8%" claim in the earlier
dashboard narrative was an artefact of whole-series min/max
normalisation; under strictly-causal expanding normalisation the
effect disappears.

The oracle gap on electricity is ~35 pp (mechanism 0.09052, oracle
0.05924), meaning a perfect per-round weight *could* improve a lot —
but not via an EWMA or OGD on this forecaster panel, because the
forecasters themselves are undifferentiated.

## Horizon experiments (static-mode, pending expanding re-run)

[source: `onlinev2/outputs/post_fix_deltas/SUMMARY.md` + individual
`day_ahead.json`, `4h_ahead.json`, `regime_shift.json`. These still
reflect the static warmup-window pipeline; expanding-mode refresh
[PENDING] per SUMMARY §"Remaining documented limitations".]

### Day-ahead (h = 24, warmup ≥ 70)

| Method | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| uniform | 0.19236 | — |
| skill | 0.19227 | −0.05% |
| **mechanism** | **0.19220** | **−0.08%** |
| best_single | 0.18866 | −1.92% |

### 4h-ahead (h = 16 steps on 15-minute series, T = 20 000)

| Method | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| uniform | 0.10874 | — |
| skill | 0.10835 | −0.36% |
| **mechanism** | **0.10808** | **−0.61%** |
| best_single | 0.10388 | −4.48% |

### Within-run seasonal slice (B13 fix, flagged `within_run_seasonal_slice: true`)

| Method | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| uniform | 0.06716 | — |
| skill | 0.06677 | −0.58% |
| **mechanism** | **0.06646** | **−1.05%** |
| best_single | 0.05980 | −10.97% |

Per-season breakdown [source: `regime_shift.json` `regime_summary`]:

| Season | Rounds | Δ% mechanism vs uniform |
|---|---:|---:|
| winter | 4144 | +1.25% |
| spring | 4416 | +0.95% |
| summer | 4416 | +1.04% |
| autumn | 4368 | +0.97% |

Restart-per-season evaluation is listed as follow-up work (B13.8).

## Published-OGD head-to-head (static-mode baselines.json, pending expanding re-run)

[source: `dashboard/public/data/real_data/elia_wind/data/baselines.json`
and `elia_electricity/data/baselines.json`, dated 2026-05-07. The
baselines runner has not yet been re-run under
`normalize_mode=expanding`; numbers below are from the committed
static-mode output (matches the file currently on disk). Direction of
comparisons is stable; absolute magnitudes may shift on refresh.]

### Wind

| Method | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| vitali_ogd_per_quantile | 0.03442 | −18.01% |
| **mechanism** | **0.03905** | **−6.99%** |
| raja_history_free | 0.04134 | −1.53% |
| uniform | 0.04198 | — |

### Electricity

| Method | Mean CRPS | Δ vs uniform |
|---|---:|---:|
| vitali_ogd_per_quantile | 0.09119 | −2.03% |
| uniform | 0.09308 | — |
| raja_history_free | 0.09312 | +0.04% |
| **mechanism** | **0.09313** | **+0.05%** |

**Reading.** Vitali's per-τ OGD beats the mechanism on both series
(by ~11 pp on wind, ~2 pp on electricity). This is the CRPS cost of
keeping the Lambert budget-balance and per-round truthfulness
guarantees (the truthfulness argument carried over by the skill-gate
lemma in §3.3.1) — Vitali's aggregator drops both. Raja's
history-free variant is essentially tied with uniform on both series
because it ignores all inter-round state; on electricity the mechanism
lands in the same tied band (+0.05%), consistent with the electricity
null result in §6.3.

## Sensitivity sweep and parameter provenance

Tuned parameters now come from a cache-reusing held-out sweep
(`scripts/run_sensitivity_sweep_cached.py`, produced 2026-05-07),
not from hand selection. Protocol: each (γ, ρ, λ) cell replays the
shared forecast cache through `run_simulation` and scores the
mechanism on the last 40% of each series (`[split, T)`), disjoint
from the burn-in window `[warmup, split)` used by the train metric.
Grid = `wide` (γ ∈ {4, 8, 16, 32, 64}; ρ ∈ {0.1, 0.3, 0.5, 0.7};
λ ∈ {0.05, 0.2}), 40 cells × 2 series, ~5 minutes total wall clock.

Artefact: `onlinev2/outputs/sensitivity_sweep.json`.

| Series | γ★ | ρ★ | λ★ | Held-out Δ vs uniform |
|---|---:|---:|---:|---:|
| elia_wind | 32.0 | 0.7 | 0.05 | −6.86% |
| elia_electricity | 16.0 | 0.1 | 0.05 | −0.22% |

The wind optimum pushes the γ corner (the γ=64 row plateaus at
−5.5% max, so the top of the grid is bounded). λ=0.2 is uniformly
worse than λ=0.05 across both series. Electricity results land in a
tight band of −0.17 to −0.22% across the top cells — consistent with
the null finding in §6.3.

### Static-mode headline at sweep-selected parameters

Regenerated with `scripts/run_real_data_with_skill.py --tuned
--sweep-artefact onlinev2/outputs/sensitivity_sweep.json` on
2026-05-07, `normalize_mode=static`. These are the numbers the
runner currently emits into `comparison.json`:

| Rule | Wind CRPS | Δ vs uniform | Electricity CRPS | Δ vs uniform |
|---|---:|---:|---:|---:|
| uniform | 0.04248 | — | 0.09316 | — |
| skill | 0.03938 | −7.28% | 0.09304 | −0.13% |
| **mechanism** | **0.03911** | **−7.93%** | **0.09299** | **−0.18%** |
| best_single | 0.03226 | −24.04% | 0.08868 | −4.81% |
| inverse_variance | 0.03946 | −7.11% | 0.09285 | −0.32% |
| trimmed_mean | 0.03940 | −7.25% | 0.09243 | −0.78% |
| median | 0.03812 | −10.25% | 0.09271 | −0.48% |

DM tests (static-mode, sweep-selected):

- Wind, mechanism vs uniform: **t = +42.23, p ≈ 0**.
- Electricity, mechanism vs uniform: **t = +5.52, p ≈ 0** — statistically
  significant but Δ = −0.18% of uniform CRPS (economically negligible;
  the DM rejection is sample-size driven on T = 9 800 paired rounds).

The `comparison.json` `sensitivity` block now carries:

```
"sensitivity": {
  "source": "onlinev2/outputs/sensitivity_sweep.json",
  "optimal_params": {"gamma": 32.0, "rho": 0.7, "lam": 0.05},
  "optimal_improvement_pct": -6.859,
  "note": "Recomputed on a held-out split; see scripts/run_sensitivity_sweep.py."
}
```

[PENDING] Re-run the headline block under `normalize_mode=expanding`
at sweep-selected parameters so the full-length table above becomes
directly comparable to the locked expanding-mode table at the top of
this section. Expected shift: sub-percent CRPS in either direction;
direction of DM and method ranking are stable.

## Summary for the final write-up

The canonical real-data headline is:

- **Wind, full-length, post-fix:** mechanism −7.1% vs uniform, t = 40.77,
  p ≈ 0. Vitali per-τ OGD beats by ~11 pp.
- **Electricity, post-fix:** null result, t = 0.008, p = 0.994. Report
  honestly.
- **Elia operational forecast:** our best_single (online XGBoost on
  observed series only) beats Elia's `mostrecentforecast` by ~6%
  CRPS-MW-eq (69.5 vs 74.0); our mechanism runs ~13% worse at 83.7 MW,
  because aggregating the 7-forecaster panel mixes in weaker models.
  Elia interval forecasts are systematically miscalibrated.
- **Calibration anchor:** 3000-point audit slice. Mean tail deviation
  0.0171, recalibration layer closes 59% (Chapter 5.3).

Tables to include in the main text:
- §6.1.1 aggregate comparison (full-length) — headline.
- §6.1.3 steady-state σ + weight table — sells the skill layer.
- §6.1.4 operational-forecast comparison — external validation.
- §6.2.3 per-τ calibration — bridges to Chapter 5.3.
- §6.3 electricity null result — stated plainly.

Tables for Appendix B:
- §6.2.1 audit-slice comparison (pre-expanding, kept for Claim 4
  provenance).
- §6.4 horizon tables (static-mode).
- §6.5 published-OGD head-to-head (static-mode).
- Pre-fix vs post-fix Δ table from `consolidated_deltas.json`.
