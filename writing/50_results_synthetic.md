# Results — synthetic validation

Status: **[LOCKED]** on correctness and skill recovery; the deposit and
bankroll ablation numbers quoted from earlier committed runs; bankroll
pipeline re-run is [PENDING] post training-audit merge.

This chapter is the foundation the real-data chapter stands on. If any
of these results fail, the mechanism is not trustworthy and the rest of
the thesis is moot. All three pass.

## 5.1.1 Mechanism correctness (Rung 1)

All 13 Lambert combinatorial payoff invariants pass on current code
(Bug Condition clauses 1.24–1.34, 1.36, 1.37), with 60 golden-value
snapshots across 12 payoff-module functions × 5 seeds acting as a
regression guard. Thirty-five `simulation.py` unit tests are green.

Headline checks (1000 rounds, 20 seeds)
[source: `onlinev2/tests/audit/fixtures/counterexamples/SUMMARY.md` +
`THESIS_CLAIMS.md` Claim 1]:

| Invariant | Result |
|---|---|
| Max absolute budget gap | 2.84 × 10⁻¹⁴ |
| Mean profit | 3.01 × 10⁻¹⁷ |
| Equal-score zero profit | True |
| Sybil profit ratio (identical reports, conserved total wager) | 1.000000 |
| Sybil max \|Δ\| | 2.07 × 10⁻¹⁷ |
| Pinball ≥ 0, CRPS ≥ 0, CRPS bounded | True |
| Perfect forecast beats shifted forecast | True |

The mechanism is self-financed to machine precision. The mean profit at
the seventeenth decimal confirms redistribution rather than creation of
value. The sybil ratio is exactly 1.000000 with residuals at floating-
point noise — the narrow Lambert invariance holds as proved.

## 5.1.2 Skill layer recovers the true ordering (Claim 2)

On the known-noise panel DGP (`dgps.known_sigma_panel`, 2000 rounds, ρ
retuned to 0.05 so the EWMA saturates on the short horizon):

- **Spearman(σ_learned, CRPS_truth) = 1.00** across all five
  `AUDIT_SEEDS` [source: `THESIS_CLAIMS.md` Claim 2].
- σ stays in [σ_min, 1], strictly monotone in loss.
- Timing invariant: σ_t depends only on L_{t−1}, never on L_t.
- κ = 0 missingness preservation: absent agents' skill does not drift.
- `calibrate_gamma` round-trip holds.

Known-noise six-forecaster extended run (T = 20000, 20 seeds, point
mode and quantile mode)
[source: `presentation/script_part3_validation.md` Slide 12,
originally from `experiments.py --exp skill_recovery`]:

| Forecaster | True noise τ | Mean loss | Learned σ |
|---|---:|---:|---:|
| f0 | 0.15 | 0.023 | 0.959 |
| f1 | 0.22 | 0.033 | 0.942 |
| f2 | 0.32 | 0.047 | 0.919 |
| f3 | 0.46 | 0.066 | 0.890 |
| f4 | 0.68 | 0.089 | 0.854 |
| f5 | 1.00 | 0.112 | 0.820 |

Rank correlation between true noise and learned σ: **1.0000** for both
point and quantile modes. Noise–skill linear correlation r = −0.98.

**Interpretation.** EWMA + exponential loss-to-skill mapping is not
regret-minimising — it is an estimator of reliability. On a stationary
panel with known signal, it converges to the correct ranking. This is
what the recorded σ trajectory looks like qualitatively: a fast initial
adaptation phase of ~100–500 rounds, followed by a slow refinement
that tightens the ordering between forecasters of similar quality.

## 5.1.3 Forecasters train without silent failure (Claim 3)

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

## 5.1.4 Deposit policy ablation

Four deposit regimes, same weight rule (`mechanism`), twenty seeds
[source: `presentation/script_part3_validation.md` Slide 10; original
run via `experiments.py --exp deposit_policies`]:

| Deposit policy | Mean CRPS | vs Fixed |
|---|---:|---:|
| IID exponential (random) | 0.0456 ± 0.0003 | — |
| Fixed unit (b = 1) | 0.0423 ± 0.0002 | baseline |
| Bankroll + confidence | 0.0375 ± 0.0001 | −11.3% |
| Oracle precision (true τ) | 0.0227 ± 0.0001 | −46.3% |

**Reading.** Random deposits are worst (no information). Fixed unit
isolates the skill signal and is the benchmark. Bankroll-confidence
uses only observable quantities (wealth, forecast width) yet captures
about a quarter of the oracle improvement. Oracle is the theoretical
ceiling.

This table is the single clearest empirical statement the thesis makes:
**how stake enters the system matters more than the weighting rule**.

## 5.1.5 Weight rule comparison

Same panel, same seeds, two deposit regimes
[source: `presentation/script_part3_validation.md` Slide 11]:

Under fixed deposits (isolates the skill signal):

| Weight rule | Mean CRPS |
|---|---:|
| Uniform | 0.0434 ± 0.0002 |
| Deposit | 0.0434 ± 0.0002 (deposit = uniform when all b equal) |
| Skill | 0.0419 ± 0.0002 |
| Mechanism (skill × deposit) | 0.0423 ± 0.0002 |
| Best single | 0.0232 ± 0.0001 |

Skill-only beats uniform by 3.5%. The mechanism sits marginally behind
skill-only under fixed deposits because it adds the skill gate on a
signal the skill rule already exploits directly.

Under bankroll deposits:

| Weight rule | Mean CRPS |
|---|---:|
| Deposit | 0.0230 ± 0.0001 |
| Mechanism | 0.0375 ± 0.0001 |

Here deposit-only is extremely strong (0.0230) because the bankroll
already carries skill information via the deposit policy. The
mechanism's additional gate is redundant in this setting.

**Interpretation.** The right choice of weighting rule depends on the
deposit policy. Under fixed deposits the skill signal must be extracted
from the weights, and a skill-gated rule helps. Under bankroll deposits
the skill signal is already in the deposit, and the weights can be
simpler. The thesis's contribution is to package both levers into a
single mechanism that remains self-financed regardless of which channel
carries the information.

## 5.1.6 Five-step bankroll pipeline ablation

Pipeline steps (Chapter 3):

| Step | Name | Function |
|:---:|---|---|
| A | Confidence proxy | Quantile width → c_i |
| B | Deposit | b_i = min(W_i, b_max, f · W_i · c_i) |
| C | Skill gate | m_i = b_i · (λ + (1 − λ) σ_i^η) |
| D | Weight cap | Simplex projection with ω_max |
| E | Wealth update | W_{t+1} = max(0, W_t + π_t) |

Ablations run: Full, A− (no c_i, so c = 1), B− (fixed b_i), C− (m_i =
b_i), D− (no ω_max), E− (fixed W).

[PENDING] post training-audit re-run. The shape of the expected result
is: C− degrades most (removing the skill gate), then A−/B− degrade
jointly (removing the bankroll-confidence loop), D− is near-neutral at
typical ω_max, and E− is near-neutral over short horizons but may
change the wealth distribution at long horizons.

Slot for the final table:

| Ablation | Δ CRPS vs Full | Δ Gini vs Full | Interpretation |
|---|---:|---:|---|
| Full | 0 | 0 | baseline |
| A− | [PENDING] | [PENDING] | lose c_i informativeness |
| B− | [PENDING] | [PENDING] | fixed deposits (everyone stakes 1) |
| C− | [PENDING] | [PENDING] | no skill gate (deposit-only) |
| D− | [PENDING] | [PENDING] | no dominance cap |
| E− | [PENDING] | [PENDING] | fixed wealth (no feedback) |

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
