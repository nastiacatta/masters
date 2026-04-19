# Script Part II — SOLUTION (Slides 6–8, ~5 min)

**Format: ON SLIDE = what the audience sees (concise bullets, key formulas, key numbers). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 6 — The Mechanism: Round-by-Round

**ON SLIDE:**
- Flowchart — five steps per round:
  1. Submit: player submits quantile forecast + deposit from wealth and confidence
  2. Skill gate: effective wager = deposit × skill factor; remainder refunded immediately
  3. Aggregate: weighted combination using effective wagers as weights
  4. Settle: outcome revealed; payoff redistributes the wager pool based on relative scores; budget-balanced by construction
  5. Update: loss fed into EWMA; skill recomputed for next round; wealth updated with profit
- Key box: "Same effective wager controls BOTH influence and exposure → incentives aligned"
- Side note: "Skill fixed BEFORE round begins, from past losses only → truthfulness preserved"

**SCRIPT:**

Each round has five steps.

First, each participant submits a probabilistic forecast — a set of quantiles — and decides how much to deposit. The deposit comes from the forecaster's current wealth, scaled by a confidence measure derived from how narrow their forecast distribution is. A confident forecaster with a tight distribution deposits more; an uncertain one deposits less. There is a hard cap.

Second, the skill gate. The deposit is multiplied by a factor that depends on the forecaster's learned skill — a number between a minimum floor and one. If past performance has been poor, most of the deposit is refunded immediately and only a small fraction enters the market as the effective wager. If past performance has been strong, nearly all of the deposit counts. The floor ensures every forecaster retains some minimum exposure.

Third, aggregation. The effective wagers serve as weights. Each forecaster's influence on the collective prediction is proportional to their effective wager.

Fourth, settlement. After the outcome is observed, the payoff follows the Lambert weighted-score formula. Each participant receives their effective wager back, plus or minus an amount that depends on how their score compares to the wager-weighted average score. Total payouts always equal total wagers — budget balance holds by construction.

Fifth, the realised loss is fed back into the system. The skill estimate updates for the next round, and wealth adjusts with profit. Winners accumulate capital; losers see their capacity shrink.

The critical design choice: the same effective wager controls both influence and financial exposure. You cannot have influence without risk. And the skill signal is computed before the round begins, using only past information. This timing separation preserves the truthfulness argument from the original Lambert mechanism.

---

## SLIDE 7 — The Skill Signal

**ON SLIDE:**
- EWMA update (when present): loss state blends previous value with current round's loss
- Staleness decay (when absent): loss state reverts toward neutral baseline
- Skill mapping: exponential function from loss state to bounded skill score (1.0 down to minimum floor)
- Plot: skill vs accumulated loss — exponential decay curve
- Three properties:
  - Absolute: reliability independent of other participants
  - Pre-round: computed from past losses only
  - Handles intermittency: absent forecasters decay toward baseline
- Contrast: Vitali-Pinson uses relative weights on simplex (OGD + projection); this thesis uses absolute skill (EWMA + exponential mapping)

**SCRIPT:**

The skill signal is the core innovation. Each forecaster has a loss state that tracks performance over time using an exponentially weighted moving average. When a forecaster participates, their loss state blends the previous value with the current round's loss — measured by a strictly proper scoring rule, either mean absolute error or the CRPS. The learning rate controls how quickly old performance is forgotten.

When a forecaster is absent, their loss state decays toward a neutral baseline. This is deliberate. You cannot build a high reputation and then disappear to preserve it. With no new evidence, skill gradually reverts to a prior. This directly addresses the intermittent contributions problem.

The loss state maps to a bounded skill score through an exponential function. Lower accumulated loss means higher skill, approaching one. Higher loss pushes skill toward the minimum floor, which is always positive — every forecaster retains some market access.

The critical difference from Vitali and Pinson: their weights are relative. They live on a probability simplex and are updated by gradient descent with projection. If one person's weight rises, everyone else's mechanically falls, even if everyone improved. My skill signal is absolute. It represents a forecaster's reliability independently of who else is in the market. One forecaster's skill can improve without reducing another's. This matters for interpretability and for the settlement algebra.

---

## SLIDE 8 — Architecture and Implementation

**ON SLIDE:**
- Three-layer modular diagram:
  - Layer 1 — Environment: data-generating processes (exogenous truth, endogenous truth)
  - Layer 2 — Agents: behaviour block (honest, noisy, risk-averse, sybil, arbitrageur, colluder, wash trader, strategic influence, insider); each outputs (participate, report, deposit); core does not know motives
  - Layer 3 — Platform: core mechanism (scoring → aggregation → settlement → skill update); deterministic, side-effect-free
- Code: onlinev2 Python package
  - core/ (settlement, skill, staking, scoring, aggregation, weights, metrics)
  - behaviour/ (policies, adversaries)
  - dgps/, experiments/
- Test suite: 20+ invariant tests, both point and quantile modes; property-based testing with Hypothesis
- Experiment ladder: correctness → pure forecasting → dynamic robustness → strategic robustness

**SCRIPT:**

The implementation separates three layers cleanly. The environment layer defines the data-generating process — how outcomes and forecaster signals are produced. The agent layer generates per-round actions: participation decisions, reports, and deposits. It can produce honest forecasters or adversarial ones — sybils, arbitrageurs, colluders, wash traders — without touching the core. The platform layer applies the mechanism: scoring, aggregation, settlement, and skill updates. It is deterministic and consumes standardised inputs without knowing why they were chosen.

This separation makes clean experimentation possible. The same mechanism can be tested under different environments, participation patterns, and attack strategies, all without modifying the core.

The system is implemented as the onlinev2 Python package with over twenty invariant tests covering budget balance, zero-sum accounting, sybil invariance, scoring bounds, and timing constraints. Property-based testing with Hypothesis generates random inputs to stress the invariants.

Experiments follow a strict ladder: first establish correctness, then test pure forecasting performance, then dynamic robustness under drift and missingness, then strategic robustness under adversarial behaviour.
