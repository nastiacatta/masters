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
  c_i = clip(exp(−β_c · Δ_i), c_min, c_max) and Δ_i = q_i(0.9) −
  q_i(0.1) is the 80%-interval width of the forecast on the observed
  [0, 1] scale (Masters notes §Step 1; implementation
  `confidence_from_quantiles` in `onlinev2/src/onlinev2/core/
  staking.py`). Narrower forecast → smaller Δ_i → larger c_i. For
  theorem-safe use, c_i is computed from lagged reports (`staking.py`
  documents this as a prerequisite for the Lambert-style truthfulness
  argument). *This is a heuristic design choice — it is the
  deterministic analogue of fractional-Kelly betting (Kelly 1956;
  Thorp 2006), replacing the log-optimal growth rate with a bounded
  monotone function of the forecast spread as a proxy for precision.
  It is not itself induced by a proper scoring rule; the real-data
  runner uses `deposit_mode="fixed"` as the theorem-safe baseline and
  `deposit_mode="bankroll"` only with lagged confidence.*
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

Pinball loss L^{τ} is strictly consistent for the τ-quantile functional
(Gneiting and Raftery 2007, §3.2; Steinwart and Christmann 2011): under
a unique conditional quantile, the expected pinball loss is minimised
only when the reported quantile equals the true one. Summing pinball
losses over a fixed τ-grid gives a scoring rule that is strictly proper
with respect to the discretised quantile representation of the
predictive distribution — this is the finite-grid CRPS approximation
we use for settlement. The bounded score is:

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
| λ | 0.3 | 0.05 | Skill-gate floor |
| η | 1 | 2 | Skill-gate nonlinearity (hardcoded `eta=2.0` in `runner.py`) |
| σ_min | 0.1 | 0.1 | Skill floor (keeps market access) |
| κ | 0.0 | 0.0 | Staleness decay toward L_0 (unused in wind run) |

Source: defaults in `onlinev2/src/onlinev2/core/types.py` §`MechanismParams`;
tuned values in `scripts/audit_fresh_run.py` and
`dashboard/public/data/real_data/elia_wind/data/comparison.json` config
block.

The staleness decay addresses intermittency: an absent participant's
skill reverts toward a neutral prior rather than freezing, so strategic
absence is not rewarded. This is a Bayesian shrinkage on `L_i` toward
the prior `L_0`, analogous to empirical-Bayes hierarchical regularisation
(James-Stein estimation, Robbins 1956). *It is not the robust-regression
treatment used by Vitali and Pinson (2025) for the same problem — the
two approaches solve the same symptom (stale-stake rewards absent
agents) via different mechanisms: shrinkage vs robust weight projection.*

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
| Truthfulness (per-round, under risk neutrality) | ✓ | σ_i is fixed pre-round; proof in Lambert 2008 §4.2 applies with m_i in place of the original wager (see Appendix A: skill-gate truthfulness lemma) |
| Sybil-proofness (narrow: identical reports, conserved total wager) | ✓ | m_i' + m_i'' = m_i → π_i' + π_i'' = π_i; empirically 1.000000. *Lambert's sybil-proofness is a narrow claim that does not extend to clones submitting diversified reports; see §3.3 final paragraph and Chen et al. 2014 for the broader impossibility.* |
| Normality | ✓ | Payout is additively separable in scores; proof identical |
| Individual rationality | ✓ | E_P[Π_i] ≥ m_i at r_i = Γ(P); proof identical with m_i gated |
| Monotonicity | ✓ | d profit / d m_i has constant sign; proof identical |

What the skill layer adds:

- **Online learning of reliability.** σ_i converges to the right
  ranking on the known-noise panel (Spearman 1.0 after 2000 rounds),
  and the same perfect ranking holds on Elia wind at the full-length
  horizon (Spearman(σ̄, CRPS_i) = 1.0 in steady state, 17 344 rounds,
  expanding normalisation; source:
  `dashboard/public/data/real_data/elia_wind/data/comparison.json`
  `steady_state` block + per-agent CRPS via
  `scripts/verify_t6_spearman.py`).
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

### 3.3.1 Skill-gate truthfulness lemma (sketch)

**Lemma.** *Let the effective wager at round t be m_{i,t} = b_{i,t} · g(σ_{i,t})
with both b_{i,t} and σ_{i,t} measurable with respect to the σ-algebra
generated by the history up to round t-1 (pre-round information).
Then the per-round Lambert truthfulness argument applies to m_{i,t} in
place of the original wager.*

**Proof sketch.** The Lambert 2008 truthfulness proof (§4.2 of their
paper) shows that the unique maximiser of E_P[Π_i(r_i, r_{-i}, m, ω) | F]
over reports r_i is r_i* = Γ(P) where Γ is the elicited statistic, under
two hypotheses: (i) the score s(r_i, ω) is strictly proper for Γ, and
(ii) the wager m_i is constant with respect to r_i.

Both hypotheses hold in our setting:

1. Strictly proper score: s_i = 1 − Ĉ_i / 2 where Ĉ_i is the finite-grid
   pinball-CRPS surrogate, which is strictly consistent for the
   quantile-grid representation (Gneiting and Raftery 2007, Thm 3).
2. Wager constant w.r.t. r_i: by construction of the round ordering
   (§3.1), σ_{i,t} = f(L_{i,t-1}) uses no round-t information, and
   b_{i,t} is either fixed (deposit mode = "fixed"), exogenous (deposit
   mode = "exponential"), or computed from lagged confidence (deposit
   mode = "bankroll" with `lag_confidence=True`). In all three cases
   ∂m_{i,t}/∂r_{i,t} = 0.

Therefore E_P[π_i | F, r_i] attains its unique maximum at r_i = Γ(P),
which is exactly the truthfulness condition. ∎

**Scope.** The lemma carries over the Lambert assumption of strict
risk neutrality (expected-utility maximisation with linear utility).
The same caveat applies to our mechanism as to Lambert 2008.

**Multi-round scope.** The lemma is per-round: conditional on the
history, the round-t best response is truthful. Over multiple rounds
a participant may in principle have an incentive to distort round t's
report in order to shape competitors' future σ values (those σ values
depend on this round's loss, and the competitors' future gating
depends on their σ). This "EWMA-shaping" incentive is second-order
under risk neutrality: round t's certain loss from distortion is
linear in the distortion magnitude, while the expected-future-profit
gain from a competitor's lower future σ is at most linear in
(1-σ_{other,t+1})·γ·ρ and only realises if (i) the competitor's σ
is still in the non-saturated region of the exp(-γ L) map and (ii)
the distorter remains in the market long enough. Under the tuned Elia
parameters (γ = 16, ρ = 0.5), σ saturates near 1 after ~20 losses
below ℓ ≈ 0.05, so the shaping incentive is effectively zero in
steady state. We note this as a scope limit; a formal multi-round
truthfulness proof under risk-neutral, discounted expected profit is
an open question.

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
Under stationary losses it is consistent — a standard stochastic-
approximation result (Robbins and Monro 1951; Benveniste, Métivier and
Priouret 1990) gives L_{i,t} → E[ℓ_i] as t → ∞, which makes σ_i
converge to the deterministic σ_min + (1-σ_min)·exp(-γ·E[ℓ_i]). Under
non-stationarity this becomes a tracking error that decays at rate
ρ · drift — the ρ = 0.5 tuned value for Elia wind trades off tracking
speed against variance.

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
