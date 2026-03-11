# Next Steps: Experiment Reorganisation

This document reorganises the experiment suite around a single research question: **Does adaptive weighting that combines skill and stake improve forecast accuracy and market outcomes?** Experiments are reframed as decision tests with standardised comparison contracts and a strict execution ladder.

---

## Guiding Principles

1. **One question per experiment** — Reframe capability checks as decision tests.
2. **Standardised comparison contract** — Same seeds, DGPs, horizon, participation pattern, and agent panel for all methods in a batch. Report paired deltas relative to a baseline.
3. **Strict ladder** — Validity → Pure forecasting → Dynamic robustness → Strategic robustness. Do not skip rungs.
4. **Unified output format** — Every experiment produces the same four panels (see below).

---

## Standardised Output Format

Every experiment should produce the same four panels:

| Panel | Content |
|-------|---------|
| **Primary outcome** | Relative CRPS or Brier improvement (Δ vs baseline) |
| **Calibration** | PIT or reliability diagram |
| **Market structure** | Wealth / influence concentration (HHI, N_eff, Gini) |
| **Failure mode** | One plot showing where the method breaks |

---

## Paired Delta Reporting

For each seed, report **paired deltas** relative to equal weights:

- **Δ CRPS** = CRPS_method − CRPS_equal (negative = better)
- **Δ Gini** = Gini_method − Gini_equal
- **Δ HHI** = HHI_method − HHI_equal
- **Δ N_eff** = N_eff_method − N_eff_equal

This makes results directly comparable across methods and experiments.

---

## Mandatory Baselines

Every core comparison must include:

| Method | Description |
|--------|-------------|
| **Equal weights** | Uniform w_i = 1/n |
| **Stake-only** | w_i ∝ m_i, no skill gate |
| **Skill-only** | w_i ∝ σ_i (or learned skill), no stake |
| **Blended skill+stake** | Full mechanism: m_i = b_i · g(σ_i) |
| **Bankroll pipeline** | Full five-step pipeline (A→B→C→D→E) |
| **Quantile averaging vs linear pooling** | Where relevant (Raja et al. argue QA is sharper) |

---

## The Strict Ladder

### Rung 1: Validity

**Goal:** Establish that the mechanism works before any forecasting claim.

**Experiments:** `settlement`, `scoring`, existing unit tests.

**Output:** One-page invariant summary:

- Budget balance
- Non-negativity of payouts
- Equal-score zero profit
- Truthfulness proxy
- No-arbitrage sanity

**Question:** Does the mechanism satisfy its stated invariants?

| Experiment | Question | Baselines | Fixed Controls | Output Metrics | Expected Insight |
|------------|----------|-----------|----------------|----------------|------------------|
| `settlement` | Are payouts budget-balanced and non-negative? | N/A | Fixed seed, n_rounds, n_agents | Budget gap, profit histograms | Zero budget gap, non-negative payouts |
| `scoring` | Do point/MAE and quantiles/CRPS paths satisfy score bounds? | point_mae, quantiles_crps | Same seed, T, n_forecasters | Invariant table, σ evolution | Both modes valid; quantiles elicit full distribution |

---

### Rung 2: Pure Forecasting Gain

**Goal:** Isolate whether the online layer improves aggregation before wealth dynamics and strategic behaviour muddy the picture.

**Experiments:** `aggregation`, `fixed_deposit`, `weight_comparison`, `weight_rules`, `calibration`.

**Question:** Does blended skill+stake beat equal, stake-only, and skill-only? When does it beat them? What does it cost in concentration?

| Experiment | Question | Baselines | Fixed Controls | Output Metrics | Expected Insight |
|------------|----------|-----------|----------------|-----------------|------------------|
| `aggregation` | Does blended skill+stake beat equal, stake-only, skill-only? | equal, stake-only, skill-only, blended, bankroll | Same seed, DGP, T, n_forecasters, participation | Δ CRPS, Δ Gini, Δ HHI, Δ N_eff | Blended wins on CRPS; cost in concentration quantified |
| `fixed_deposit` | With fixed deposits, does skill-only improve over equal? | equal, skill-only | Same seed, T, n_forecasters, fixed b_i | Δ CRPS, skill ranking recovery | Skill gate adds value when deposits are equal |
| `weight_comparison` | Does weight learning converge on exogenous vs endogenous DGPs? | equal, learned (exogenous), learned (endogenous) | Same seeds, T, DGP family | Convergence curves, target vs learned | Learning works; endogenous harder |
| `weight_rules` | Which weight rule wins under which deposit policy? | uniform, deposit, skill, mechanism, best-single | Same seed, T, n_forecasters, two deposit policies | Δ CRPS by (rule, policy) | Mechanism best under bankroll; skill-only competitive under fixed |
| `calibration` | Is the aggregate forecast well-calibrated? | N/A | Same seed, T, n_forecasters | PIT, reliability diagram, sharpness | Calibration preserved under QA |

---

### Rung 3: Dynamic Robustness

**Goal:** Test adaptation under drift, missingness, and selective participation.

**Experiments:** `skill_recovery`, `selective_participation`, `intermittency_stress`.

**Question:** How does the mechanism adapt to regime shifts, missing forecasts, and strategic absence?

| Experiment | Question | Baselines | Fixed Controls | Output Metrics | Expected Insight |
|------------|----------|-----------|----------------|----------------|------------------|
| `skill_recovery` | Does skill ranking recover after perturbation? | equal, skill-only, blended | Same seeds, latent DGP, T, τ_i | Adaptation lag, skill ranking correlation | Blended recovers; lag quantified |
| `selective_participation` | How does strategic absence (κ=0 vs κ>0) affect skill and profit? | random absence, strategic absence | Same seed, T, n_forecasters | Δ CRPS, skill decay rate, profit | κ>0 (decay) punishes strategic absence |
| `intermittency_stress` | How does bursty vs IID vs edge-threshold participation affect outcomes? | IID, bursty, edge-threshold, avoid-skill-decay | Same seed, T, n_users | Δ CRPS, participation stability, N_eff | Degradation under missingness quantified |

---

### Rung 4: Strategic Robustness

**Goal:** Test resistance to sybils, collusion, manipulation, and arbitrage.

**Experiments:** `sybil`, `behaviour_matrix`, `arbitrage_scan`, `detection_adaptation`.

**Question:** Not just "does the attack work?" but: attack gain relative to benign baseline, and collateral damage from defence.

| Experiment | Question | Baselines | Fixed Controls | Output Metrics | Expected Insight |
|------------|----------|-----------|----------------|----------------|------------------|
| `sybil` | Does splitting identity gain advantage? | single identity, k-way split | Same seed, k_max, n_trials | Profit difference, profit ratio | Sybilproof: no gain from split |
| `behaviour_matrix` | How do benign vs adversarial behaviours affect CRPS and concentration? | benign, sybil, arbitrageur, collusion, manipulator, insider | Same seed, T, n_users | Δ CRPS, Δ Gini, attacker_weight_share | Attack gain vs benign; concentration cost |
| `arbitrage_scan` | When does arbitrage appear and dominate wealth? | no arbitrageur, arbitrageur (grid) | Same seed, parameter grid | Arbitrage heatmap, attacker profit | Regions of vulnerability |
| `detection_adaptation` | Does adaptive evader beat fixed manipulator? | fixed manipulator, adaptive evader | Same seed, T, n_users | Distortion vs baseline, evasion success | Defence collateral damage quantified |

---

## Five-Step Bankroll Ablation

The bankroll pipeline has five steps:

| Step | Name | Function |
|------|------|----------|
| **A** | Confidence proxy | Quantile width → c_i ∈ [c_min, c_max] |
| **B** | Deposit | b_i = min(W_i, b_max, f · W_i · c_i) |
| **C** | Skill gate | m_i = b_i · (λ + (1−λ) · σ_i^η) |
| **D** | Weight cap | Project shares onto simplex with ω_max |
| **E** | Wealth update | W_{t+1} = max(0, W_t + π_t) |

**Ablation design:** Run Full, then remove one step at a time:

- **Full** — All steps A→B→C→D→E
- **A-** — Remove confidence proxy (use c_i = 1)
- **B-** — Remove deposit step (use fixed b_i)
- **C-** — Remove skill gate (use m_i = b_i)
- **D-** — Remove weight cap (no ω_max)
- **E-** — Remove wealth update (fixed W; isolates payoff from bankroll dynamics)

**Question:** Which step creates the gain? Which adds complexity without benefit? Does skill help twice (payoff + efficient aggregation) or is one channel redundant?

**Output:** Δ CRPS and Δ concentration for each ablation vs Full.

---

## Master Comparison File

**Current state:** Plots and CSVs per experiment folder; `summary.md` / `summary.json` only for behaviour runs.

**Target:** Extend `summary.json` to all core runs. Add one **master comparison file** with one row per

```
(experiment, method, seed, DGP, preset)
```

containing all headline metrics: CRPS, Gini, HHI, N_eff, PIT, sharpness, attacker stats (if any).

The dashboard can then compare methods directly instead of browsing folders.

---

## Rewritten Next Steps (Prioritised)

1. **Build a canonical benchmark suite** on synthetic DGPs with fixed seeds and fixed baselines.
2. **Add a master comparison runner** that executes all weighting methods on the same panel (same seed, DGP, T, participation).
3. **Add the five-step bankroll ablation** to identify where the gain comes from.
4. **Run dynamic robustness** under drift, missingness, and selective participation.
5. **Run strategic robustness** under sybil, collusion, manipulation, and arbitrage presets.
6. **Repeat the best two or three methods on one real dataset** (multi-forecaster).
7. **Report results as paired deltas plus concentration costs**, not just raw plots.

---

## Implementation Checklist

- [x] Define canonical benchmark config: seeds, DGPs, T, n_forecasters, participation pattern (`onlinev2/experiments/benchmark_config.py`)
- [x] Implement `run_master_comparison` that runs all methods on same panel; writes `master_comparison.json` and CSV
- [x] Add paired-delta output (Δ CRPS vs equal) in master_comparison and bankroll_ablation
- [x] Implement bankroll ablation (Full, A-, B-, C-, D-, E-) via `run_bankroll_ablation` and simulation flags `use_constant_confidence`, `freeze_wealth`
- [ ] Extend `summary.json` to all core experiments (summarise.py extended; call from more runners)
- [ ] Add cross-experiment `master_comparison_combined.json` aggregator (optional)
- [ ] Standardise four-panel figure template across experiments
- [ ] Add quantile averaging vs linear pooling comparison where relevant

---

## References

- Project README: [onlinev2/README.md](onlinev2/README.md)
- Core mechanism: `onlinev2.core` (aggregation, settlement, skill, weights, staking)
- Behaviour: `onlinev2.behaviour` (policies, adversaries, factory)
- Dashboard: `dashboard/` (optional React frontend)
