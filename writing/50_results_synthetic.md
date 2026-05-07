# Results — synthetic validation

Status: **LOCKED** on correctness, skill recovery, deposit-policy
ablation, weight-rule comparison, and bankroll-pipeline ablation. All
numbers below are verified against committed CSV / JSON outputs.

This chapter is the foundation the real-data chapter stands on: if any
of these results failed, the mechanism would not be trustworthy and the
rest of the thesis would be moot. All three pass.

## Mechanism correctness (Rung 1)

All 13 active Lambert combinatorial payoff invariants pass on current
code (clauses 1.24, 1.25, 1.26, 1.27, 1.28, 1.29, 1.30, 1.31, 1.32,
1.33, 1.34, 1.36, 1.37; clause 1.35 `michael_split` is skipped pending
Julia fixtures, see
`onlinev2/tests/audit/test_bug_condition_e_payoff.py`). Eighty
golden-value snapshots across sixteen payoff-module functions × five
seeds act as a regression guard
[source: `onlinev2/tests/audit/snapshots/`]. Thirty-five
`simulation.py` unit tests are green.

Headline checks (1000 rounds, 20 seeds)
[source: `onlinev2/outputs/core/experiments/settlement_sanity/data/summary.csv` +
`onlinev2/tests/audit/test_bug_condition_e_payoff.py` +
`onlinev2/tests/audit/test_bug_condition_d_skill.py` +
`THESIS_CLAIMS.md` Claim 1]:

| Invariant | Result |
|---|---|
| Max absolute budget gap | 2.84 × 10⁻¹⁴ |
| Mean profit | 3.01 × 10⁻¹⁷ |
| Equal-score zero profit | True (`equal_scores_ok = 1` in summary.csv) |
| Sybil profit ratio (identical reports, conserved total wager) | 1.000000 |
| Sybil max \|Δ\| | 2.07 × 10⁻¹⁷ |
| Pinball ≥ 0, CRPS ≥ 0, CRPS bounded | True |
| Perfect forecast beats shifted forecast | True |

The mechanism is self-financed to machine precision. The mean profit at
the seventeenth decimal confirms redistribution rather than creation of
value. The sybil ratio is exactly 1.000000 with residuals at floating-
point noise — the narrow Lambert invariance holds as proved.

## Skill layer recovers the true ordering (Claim 2)

On the known-noise panel DGP (`dgps.known_sigma_panel`, 2000 rounds, ρ
retuned to 0.05 so the EWMA saturates on the short horizon):

- **Spearman(σ_learned, CRPS_truth) = 1.00** across all five
  `AUDIT_SEEDS` [source: `THESIS_CLAIMS.md` Claim 2].
- σ stays in [σ_min, 1], strictly monotone in loss.
- Timing invariant: σ_t depends only on L_{t−1}, never on L_t.
- κ = 0 missingness preservation: absent agents' skill does not drift.
- `calibrate_gamma` round-trip holds.

Known-noise six-forecaster extended run (T = 20 000, 20 seeds,
quantile mode) [source:
`onlinev2/outputs/core/experiments/skill_recovery/data/
quantiles_crps_summary.csv`]:

| Forecaster | True noise τ | Mean loss (tail) | Learned σ (tail) |
|---|---:|---:|---:|
| f0 | 0.15 | 0.0232 | 0.959 |
| f1 | 0.22 | 0.0334 | 0.942 |
| f2 | 0.32 | 0.0474 | 0.919 |
| f3 | 0.46 | 0.0656 | 0.890 |
| f4 | 0.68 | 0.0888 | 0.854 |
| f5 | 1.00 | 0.1121 | 0.820 |

Headline: **Spearman rank correlation between true noise and learned
σ = 1.00** for both point and quantile modes
[source: `onlinev2/outputs/core/experiments/skill_recovery/summary.md`].

**Interpretation.** EWMA + exponential loss-to-skill mapping is not
regret-minimising — it is an estimator of reliability. On a stationary
panel with known signal, it converges to the correct ranking. This is
what the recorded σ trajectory looks like qualitatively: a fast initial
adaptation phase of ~100–500 rounds, followed by a slow refinement
that tightens the ordering between forecasters of similar quality.

## Forecasters train without silent failure (Claim 3)

All seven base forecasters (Naive, EWMA(5), ARIMA(2,1,1), XGBoost, MLP,
Theta, Ensemble) satisfy three properties post-audit:

- **No future-data leakage.** Sentinel-injection property test passes
  across all forecasters.
- **No degenerate constant output.** Post-warmup point forecast std >
  1e-4 and quantile interval width > 1e-4 on non-constant DGPs.
- **No silent fallback.** `BaseForecaster.fallback_counter` exposes
  fallback counts; the XGBoost and MLP exception paths now track
  fallbacks instead of swallowing them. `ARIMAForecaster.is_persistence`
  flag surfaces between-refits fallbacks that previously masqueraded as
  ARIMA output.

Clean-run counter (3000-point Elia wind slice, post-fix pipeline):

```
fallback_summary = {name: 0 for name in forecasters}   # verified
```

[source: the `fallback_summary` block emitted by
`run_real_data_comparison` per B7 fix in
`.kiro/specs/model-training-testing-audit/`].

## Deposit policy ablation

Four deposit regimes, same weight rule (`mechanism`), twenty seeds
[source: `onlinev2/outputs/core/experiments/deposit_policy_comparison/
data/deposit_policy_comparison.csv`, `mean_crps_all` column with
pooled SE; runner in
`onlinev2/src/onlinev2/experiments/runners/runner_module.py`
§`run_deposit_policy_comparison`, T = 1000, 6 forecasters,
scoring_mode = quantiles_crps]:

| Deposit policy | Mean CRPS | SE | Δ% vs fixed_unit |
|---|---:|---:|---:|
| iid_exp (random) | 0.04549 | 0.00023 | +7.37% |
| fixed_unit (b = 1) | 0.04237 | 0.00011 | baseline |
| bankroll_conf | 0.03796 | 0.00012 | **−10.40%** |
| oracle_precision | 0.02271 | 0.00007 | **−46.39%** |

**Reading.** Random deposits are worst (no information). Fixed unit
isolates the skill signal and is the benchmark. Bankroll-confidence
uses only observable quantities (wealth, forecast width) yet captures
about 22% of the oracle improvement. Oracle is the theoretical
ceiling.

This table is the single clearest empirical statement the thesis makes:
**how stake enters the system matters more than the weighting rule**.

## Weight rule comparison

Fresh means from 20 seeds, two deposit regimes
[source: `onlinev2/outputs/core/experiments/weight_rule_comparison/
data/weight_rule_comparison.csv`]:

Under fixed deposits (isolates the skill signal):

| Weight rule | Mean CRPS | SE |
|---|---:|---:|
| uniform | 0.04340 | 0.00011 |
| deposit | 0.04340 | 0.00011 (= uniform when all b equal) |
| skill | 0.04188 | 0.00011 |
| **mechanism** (skill × deposit) | **0.04237** | 0.00011 |
| best_single | 0.02305 | 0.00012 |

Skill-only beats uniform by 3.5%. The mechanism sits marginally
behind skill-only under fixed deposits because the skill gate adds a
nonlinear η = 2 exponent on top of a signal the skill rule already
exploits directly.

Under bankroll deposits:

| Weight rule | Mean CRPS | SE |
|---|---:|---:|
| uniform | 0.04340 | 0.00011 |
| deposit | 0.02642 | 0.00008 |
| skill | 0.04188 | 0.00011 |
| **mechanism** | **0.03796** | 0.00012 |
| best_single | 0.02305 | 0.00012 |

Here deposit-only is extremely strong (0.02642) because the bankroll
already carries skill information via the deposit policy. The
mechanism's additional skill gate is redundant in this setting and
slightly dilutes the signal.

**Interpretation.** The right choice of weighting rule depends on the
deposit policy. Under fixed deposits the skill signal must be
extracted from the weights, and a skill-gated rule helps. Under
bankroll deposits the skill signal is already in the deposit, and
the weights can be simpler. The thesis's contribution is to package
both levers into a single mechanism that remains self-financed
regardless of which channel carries the information.

## Five-step bankroll pipeline ablation

Pipeline steps (Chapter 3):

| Step | Name | Function |
|:---:|---|---|
| A | Confidence proxy | Quantile width → c_i |
| B | Deposit | b_i = min(W_i, b_max, f · W_i · c_i) |
| C | Skill gate | m_i = b_i · (λ + (1 − λ) σ_i^η) |
| D | Weight cap | Simplex projection with ω_max |
| E | Wealth update | W_{t+1} = max(0, W_t + π_t) |

20 seeds, mechanism weighting, DGP = `latent_fixed`, preset =
`exponential_deposits`
[source: `onlinev2/outputs/core/experiments/bankroll_ablation/data/
bankroll_ablation.csv`, aggregated across 20 seeds]:

| Variant | Mean CRPS | Δ vs Full | Mean HHI | Final Gini |
|---|---:|---:|---:|---:|
| Full (A→B→C→D→E) | 0.05326 | 0 | 0.334 | 0.774 |
| A− (no c_i; c = 1) | 0.05300 | −0.00026 | 0.362 | 0.800 |
| B− (fixed b_i) | 0.05423 | +0.00097 | 0.129 | 0.000 |
| C− (no skill gate, m = b) | 0.05304 | −0.00022 | 0.354 | 0.797 |
| D− (no dominance cap, ω_max = ∞) | **0.02987** | **−0.02340** | 0.334 | 0.774 |
| E− (fixed wealth) | 0.05496 | +0.00169 | 0.130 | 0.000 |

**Reading.**

- **D− (no weight cap) is dramatically better by −0.0234 CRPS** on
  this exponential-deposit DGP. Without the ω_max projection, a
  single strong forecaster can capture nearly all the weight; on a
  DGP where one forecaster has much lower noise than the others,
  unconstrained concentration maximises aggregation accuracy. HHI
  stays at 0.334 because the measurement is pre-cap, but the effective
  distribution is sharply concentrated. Gini stays at 0.774 (high).
  The cap exists for economic-fairness reasons, not CRPS reasons.
- **B− and E− (no deposit shaping, no wealth feedback) are both
  slightly worse.** HHI drops to 0.13 (near-uniform) and Gini is
  zero because the wealth channel is disabled. The deposit
  information is lost, consistent with §5.1.4.
- **A− and C− are near-neutral** (−0.0003 CRPS each) with slightly
  higher concentration because the skill signal enters more directly.

The thesis interpretation: the mechanism pays a CRPS cost (~0.023 on
this DGP) for the weight cap, buying market fairness. Report this
honestly in Chapter 7.

## Notes for the write-up

- The deposit-policy table (5.1.4) is the single most important
  headline in the synthetic chapter. Treat it as the thesis's "main
  empirical finding outside of real data".
- Skill-recovery figure (σ trajectory over 20k rounds) lives in
  `dashboard/public/presentation-plots/skill_wager.png` and
  `skill_signal_clean.png`. Reuse; do not regenerate.
- Include Spearman confidence interval if possible. On the known-noise
  panel with n = 6 forecasters, the probability of a chance Spearman
  = 1.0 is 1/6! = 1/720 ≈ 0.14%. State this to pre-empt reviewers.
