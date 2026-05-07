# Mechanism design

Status: **[LOCKED]**. All equations here are in the code at the listed
source paths. No number in this section should change unless the
underlying spec changes.

Throughout this section, subscript i ∈ {1,...,n} ranges over participants
and subscript t over rounds. Bold letters are vectors over participants.

## 3.1 Round structure

Each round has five steps. Every step is a pure function of the
mechanism's persistent state and the current round's inputs, with no
forward references to the outcome.

```
       ┌──────┐   ┌──────────┐   ┌──────────┐   ┌──────┐   ┌────────┐
t  →   │submit│ → │skill gate│ → │aggregate │ → │settle│ → │ update │   → t+1
       └──────┘   └──────────┘   └──────────┘   └──────┘   └────────┘
```

Step by step.

### Step 1 — Submit

Each participant i submits a probabilistic forecast as a vector of
quantiles q_i(τ_k) for k = 1,...,K, and a deposit b_i drawn from their
wealth W_i. The quantile grid is fixed: K = 9 equidistant levels
{0.1, 0.2, ..., 0.9} (`TAUS_FINE` in
`onlinev2/src/onlinev2/core/scoring.py`).

Deposits come from one of three policies that differ in how much
information they encode:

- **Fixed (b_i = 1):** isolates the skill signal; no wealth feedback.
- **Bankroll-fraction:** b_i = min(W_i, b_max, f · W_i · c_i) where
  c_i ∈ [c_min, c_max] is a confidence proxy derived from the
  forecast's own spread (narrower forecast → higher c_i). Uses only
  lagged information.
- **Oracle-precision:** b_i ∝ true signal precision. Not implementable
  in practice; used as the ceiling.

Source: `onlinev2/src/onlinev2/core/staking.py`.

### Step 2 — Skill gate

The deposit is modulated by a bounded, absolute skill estimate σ_i to
give the **effective wager**:

```
m_i = b_i · g(σ_i)
g(σ) = λ + (1 − λ) · σ^η
refund_i = b_i − m_i
```

- λ ∈ [0, 1]: floor parameter. λ = 0 freezes out fully-unskilled agents;
  λ = 1 ignores skill.
- η ≥ 1: exponent controlling nonlinearity. Default η = 1; the real-data
  runner hardcodes `eta=2.0`
  (`onlinev2/src/onlinev2/real_data/runner.py:353`).
- σ_i ∈ [σ_min, 1]: learned skill. Always strictly positive.

The critical invariant: **σ_i at round t uses only information from
rounds < t**. This preserves the truthfulness argument from Lambert: the
gate is fixed before the participant's current-round report is observed,
so it cannot be gamed by the current report.

Source: `onlinev2/src/onlinev2/core/weights.py`, §`skill_gate`.

### Step 3 — Aggregate

Effective wagers are normalised to aggregation weights:

```
w_i = m_i / Σ_j m_j
q̂(τ_k) = Σ_i w_i · q_i(τ_k)
```

This is a **linear pool** on each quantile level. It preserves calibration
for central quantiles but is provably under-dispersed in the tails
(Ranjan and Gneiting 2010). This is the miscalibration we quantify in
Chapter 5.3 and close with the recalibration layer in Chapter 5.4.

An optional dominance cap projects shares onto the simplex with
ω_i ≤ ω_max; unused by default (ω_max = 1) but documented in
`weights.py`.

Source: `onlinev2/src/onlinev2/core/aggregation.py`.

### Step 4 — Score and settle

After the outcome y_t is observed, each participant is scored using a
finite-grid CRPS approximation:

```
Ĉ_i = (2 / K) · Σ_k L^{τ_k}(y, q_i(τ_k))
L^{τ}(y, q) = τ · (y − q)      if y ≥ q
L^{τ}(y, q) = (1 − τ) · (q − y)  if y < q
```

Pinball loss L^{τ} is strictly proper (Gneiting and Raftery 2007). The
bounded score is:

```
s_i = 1 − Ĉ_i / 2         ∈ [0, 1]
```

Settlement follows the Lambert weighted-score formula verbatim, using
the effective wager m_i (not the deposit b_i):

```
π_i = m_i · (1 + s_i − s̄)
s̄  = Σ_j m_j s_j / Σ_j m_j
profit_i = π_i − m_i = m_i · (s_i − s̄)
```

Budget balance is **a construction property, not an empirical claim**:

```
Σ_i π_i = Σ_i m_i + Σ_i m_i s_i − s̄ · Σ_i m_i
        = M + M · s̄ − s̄ · M
        = M
```

We verify this numerically (gap < 1e-13 across 1000 synthetic rounds)
only because finite-precision arithmetic is not exactly arithmetic.

Source: `onlinev2/src/onlinev2/core/settlement.py`,
`onlinev2/src/onlinev2/core/scoring.py`.

### Step 5 — Update

The skill estimate updates via EWMA of the normalised loss:

```
ℓ_i = Ĉ_i / 2                     ∈ [0, 1]
L_{i,t} = (1 − ρ) · L_{i,t−1} + ρ · ℓ_{i,t}      (if i present at t)
L_{i,t} = (1 − κ) · L_{i,t−1} + κ · L_0           (if i absent at t)
σ_{i,t+1} = σ_min + (1 − σ_min) · exp(−γ · L_{i,t})
```

Parameters and what they do:

| Symbol | Default | Tuned (Elia wind) | Role |
|---|---:|---:|---|
| ρ | 0.1 | 0.5 | Learning rate (EWMA half-life ≈ log 2 / ρ) |
| γ | 4 | 16 | Loss-to-skill sensitivity |
| λ | 0.05 | 0.05 | Skill-gate floor |
| η | 1 | 2 | Skill-gate nonlinearity (hardcoded `eta=2.0` in `runner.py`) |
| σ_min | 0.1 | 0.1 | Skill floor (keeps market access) |
| κ | 0 or 0.02 | 0.02 | Staleness decay toward L_0 |

The staleness decay addresses intermittency (Vitali and Pinson 2025):
an absent participant's skill reverts toward a neutral prior rather
than freezing, so strategic absence is not rewarded.

Source: `onlinev2/src/onlinev2/core/skill.py`.

## 3.2 The core design decision: same object for influence and exposure

The single most important design choice. Two alternatives that we
considered and rejected:

- **Separate weight and wager.** Assign aggregation weights w_i from one
  signal (say, past CRPS) and settlement wagers from another (say,
  bankroll). This breaks Lambert's budget-balance algebra: Σ_i Π_i
  would no longer equal Σ_i m_i in general, and we would need an
  external subsidy or a re-normalisation step that changes the
  incentive geometry.
- **Modulate the payout, not the wager.** Leave m_i = b_i and scale Π_i
  by σ_i. This preserves budget balance only if the correction is mean
  zero across participants, which requires an *ex post* re-normalisation
  that in turn breaks Lambert's truthfulness proof.

The chosen design — modulate the wager itself, before aggregation and
before settlement, using only pre-round information — is the only one
we have found that (i) preserves the Lambert settlement algebra
unchanged, (ii) uses a single object to control both influence and
exposure, and (iii) leaves the truthfulness proof intact up to strict
risk-neutrality.

## 3.3 Properties preserved, properties extended

What Lambert 2008 gives us, unchanged by the skill layer:

| Property | Preserved? | Evidence |
|---|:---:|---|
| Budget balance | ✓ | Σ_i π_i = Σ_i m_i by construction; empirical gap < 1e-13 |
| Anonymity | ✓ | Payout depends on (r, m, ω) only, never on i |
| Truthfulness (per-round, under risk neutrality) | ✓ | σ_i is fixed pre-round; proof in Lambert 2008 §4.2 applies with m_i in place of the original wager |
| Sybil-proofness (narrow: identical reports, conserved total wager) | ✓ | m_i' + m_i'' = m_i → π_i' + π_i'' = π_i; empirically 1.000000 |
| Normality | ✓ | Payout is additively separable in scores; proof identical |
| Individual rationality | ✓ | E_P[Π_i] ≥ m_i at r_i = Γ(P); proof identical with m_i gated |
| Monotonicity | ✓ | d profit / d m_i has constant sign; proof identical |

What the skill layer adds:

- **Online learning of reliability.** σ_i converges to the right
  ranking on the known-noise panel (Spearman 1.0 after 2000 rounds).
- **Staleness-aware intermittency.** Absent agents decay toward L_0.
- **Absolute skill.** One participant's σ_i can rise without any other
  participant's σ_j changing, which is not true of any
  simplex-constrained weight rule.

What the skill layer does *not* give us:

- **Sybil-proofness with diversified reports.** Clones that submit
  slightly different forecasts break the narrow invariance by ~6.5%
  [source: `THESIS_CLAIMS.md` Claim 1 scope + dashboard's sybil preset].
- **Truthfulness under risk aversion.** Inherits the Lambert
  assumption.
- **Calibration of the aggregate.** Inherits the Ranjan–Gneiting
  impossibility; addressed by the orthogonal recalibration layer.

## 3.4 Why EWMA, specifically

Three reasons we chose EWMA over OGD-on-simplex (Vitali and Pinson 2025)
for the skill update:

1. **Absoluteness.** EWMA gives a per-participant loss state that is a
   function of that participant's history alone. OGD on the simplex
   couples all participants through the projection step.
2. **Closed-form update.** A single multiply-add per participant per
   round, no projection, no learning-rate schedule.
3. **Bounded output.** The exponential loss-to-skill map σ = σ_min +
   (1 − σ_min) · exp(−γ L) gives σ ∈ [σ_min, 1] automatically, with
   one parameter γ controlling the sensitivity.

The price: EWMA is not a regret-minimising aggregator. Our σ_i is an
*estimator* of reliability, not a game-theoretically optimal weight.
The empirical consequence is that `michael_ogd` matches our mechanism
within 0.3% CRPS on the 3000-point audit slice; on the full-length
expanding-mode run the renamed `michael_ogd_centered_median_fan`
baseline beats our mechanism by ~7 pp (0.0349 vs 0.0379 CRPS). We
accept the CRPS cost in exchange for the economic structure.

## 3.5 Parameter tuning

Defaults (γ = 4, ρ = 0.1) are tuned for synthetic panels with ~10
participants and T ~ 1000. The Elia wind series has T = 17 544 raw
hourly points (17 344 evaluation rounds after a 200-round warmup) and
7 forecasters with stable relative quality, which rewards faster,
more decisive skill differentiation; hence the tuned values γ = 16,
ρ = 0.5.

The hyperparameter sweep protocol is the held-out-split design in
`scripts/run_sensitivity_sweep.py` [PENDING — once the post-B3-fix
sweep completes, add the chosen values and the sensitivity heatmap
reference here].

## Notes for the final write-up

- Mirror the five-step diagram from `dashboard/docs/MECHANISM_ANALYSIS.md`
  but in LaTeX; use tikz.
- The budget-balance derivation is short enough to put inline; the
  other proofs (sybil, normality) go in Appendix A.
- Keep the hyperparameter table as shown; add a column for the
  electricity tuned values once that run finishes.
