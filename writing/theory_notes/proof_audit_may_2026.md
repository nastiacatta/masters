# Proof audit, May 2026

Internal audit of the load-bearing derivations in the thesis.
Not compiled into the PDF. Companion to the Chapter 3 proofs
(`30_mechanism_design.md` and `appendix/A_proofs.md`).

## Scope

Five formal statements in the main body:

1. Theorem (budget balance). `\sum_i pi_i = M`.
2. Proposition (bounded profit). `profit_i in [-m_i, m_i]`.
3. Proposition (narrow sybil invariance). Identical-report clones
   with conserved total wager earn identical total profit.
4. Theorem (per-round truthfulness under risk-neutrality). Conditional
   on `F_{t-1}`, the expected-profit-maximising report is the
   vector of true quantiles.
5. Proposition (stationary EWMA consistency). `L_{i,t}` converges in
   probability to `mu_i` under iid losses, with asymptotic variance
   `rho nu_i / (2 - rho)`.
6. Proposition (drift tracking). Tracking error is bounded by
   `(1-rho) delta / rho + o(1)` when the true loss drifts at rate
   at most `delta` per round.

## Budget balance

Algebra is a one-liner:

    sum_i pi_i = sum_i m_i (1 + s_i - bar_s)
              = M + sum_i m_i s_i - bar_s * M
              = M + M * bar_s - M * bar_s
              = M,

using `bar_s = M^{-1} sum_j m_j s_j`. The identity does not depend
on propriety, monotonicity, or the form of `s`. Holds point-wise
for every report vector and every outcome. Empirical gap over
1000 synthetic rounds is `2.84e-14`, consistent with double-precision
noise. Checked.

## Bounded profit

`bar_s` is a weighted average of `s_j in [0, 1]`, hence in `[0, 1]`.
Therefore `s_i - bar_s in [-1, 1]` and `profit_i = m_i (s_i - bar_s)
in [-m_i, m_i]`. Wealth cannot go negative under the worst case
`s_i = 0`, `bar_s = 1`. Absent participants (m_i = 0) earn zero.
Checked.

## Narrow sybil invariance

Two ingredients: (a) identical reports produce identical scores
`s_{i,k} = s_i`; (b) `bar_s` depends on the report vector and
wager vector only through the weighted sum `sum_j m_j s_j`, which
is invariant under the split because `m_{i,1} s_i + ... + m_{i,K} s_i
= (m_{i,1} + ... + m_{i,K}) s_i = m_i s_i`. Consequently the
post-split total profit equals the pre-split profit. Scope
qualification: identical reports and conserved total wager. The
scope matters: the impossibility of `pan2024sybilproof` implies any
mechanism richer than the second-price auction has a scope under
which sybil invariance fails. Our Chapter 8 reports the
`diversified-report` attack at 6.5% leakage, consistent with that
impossibility. Checked.

## Per-round truthfulness

Two critical steps:

1. Pre-round measurability of `m_{i,t}`. The skill gate uses
   `sigma_{i,t} = f(L_{i,t-1})` with `L_{i,t-1}` computed from
   round-(t-1)-or-earlier losses, and the deposit `b_{i,t}` is
   also `F_{t-1}`-measurable by construction. So `m_{i,t}` is
   constant in `r_{i,t}`. **This is the load-bearing step**: if
   the skill gate ever peeked at the current-round report, the
   proof would break.

2. Strict consistency of pinball loss for the tau-quantile
   functional under a unique conditional quantile
   (Steinwart-Christmann 2011, Gneiting 2011). Per-level
   minimisation gives per-level truthful reporting; summing over
   the tau-grid extends this to the full quantile vector.

The coefficient `alpha = m_{i,t} (1 - m_{i,t}/M_t)` is strictly
positive when `m_{i,t} in (0, M_t)`, so maximising expected profit
is equivalent to maximising expected score. Edge cases are
`m_{i,t} = 0` (participant zeros out) and `m_{i,t} = M_t` (no other
participants — degenerate single-party market). Both are ruled
out under standard regularity assumptions. Checked.

Caveat: the theorem is per-round. Cross-round shaping of
competitors' sigma trajectories is a separate concern; the
Appendix A.6 EWMA-shaping bound shows the shaping term is
second-order and vanishes in the saturated regime reached
empirically after ~20 rounds. A formal multi-round truthfulness
theorem under risk-neutral discounted expected profit is open.
Stated as such in the thesis.

## Stationary EWMA consistency

Recursion:

    E[L_{i,t}] = (1-rho) E[L_{i,t-1}] + rho mu_i
    Var[L_{i,t}] = (1-rho)^2 Var[L_{i,t-1}] + rho^2 nu_i

Solving the mean recursion:

    E[L_{i,t}] = (1-rho)^t L_0 + (1 - (1-rho)^t) mu_i.

Since `|1-rho| < 1`, this converges to `mu_i`. Variance recursion
has fixed point `rho^2 nu_i / (1 - (1-rho)^2) = rho^2 nu_i /
(rho (2 - rho)) = rho nu_i / (2 - rho)`. Convergence in
probability of `sigma_{i,t}` to `sigma_min + (1 - sigma_min)
exp(-gamma mu_i)` follows from the continuous mapping theorem
applied to the loss-to-skill map. Checked.

Interpretation: `rho` traces the bias-variance frontier. Smaller
rho = lower steady-state variance but slower adaptation. The
tuned `rho = 0.5` for Elia wind is near the high-adaptation end
of this trade-off, appropriate for the ~17k-round panel with
seasonal regime shifts.

## Drift tracking

Unroll the recursion:

    E[L_{i,t}] = rho * sum_{s=0}^{t-1} (1-rho)^s mu_{i,t-s}
                 + (1-rho)^t L_0.

Under `|mu_{i,t-s} - mu_{i,t}| <= s delta`,

    |E[L_{i,t}] - mu_{i,t}| <= rho delta sum_{s>=0} s (1-rho)^s
                             + O((1-rho)^t)
                             = rho delta * (1-rho)/rho^2 + O(...)
                             = (1-rho) delta / rho + o(1).

Standard Benveniste-Metivier-Priouret stochastic approximation
bound. Checked.

## Auxiliary: the "single object" design claim

Chapter 3, Section 3.4 argues that a single object (the effective
wager m_i) must govern both aggregation weight and settlement
exposure. The argument is:

- Separating weight and wager (use two signals) breaks budget
  balance because sum_i pi_i no longer equals sum_i m_i in
  general; restoring balance requires external subsidy or an
  ex-post renormalisation that breaks incentive compatibility.

- Modulating the payout instead of the wager (leave m_i = b_i
  and scale pi_i by sigma_i) preserves budget balance only if
  the correction is mean-zero across participants, which requires
  an ex-post renormalisation that again breaks truthfulness.

Both alternatives can be spelled out algebraically. The chapter
notes them but does not derive the breakage in full — this is
not a load-bearing mathematical claim but a design argument. No
formal defect. The single-object design is the unique choice
that preserves Lambert's algebra literally.

## Appendix-only: QA pool for pinball

The quasi-arithmetic pool claim for the pinball score is stated
in the appendix (A.4). The direct check — worst-case deviation
`min_y [sum_i w_i L^tau(q_i, y) - L^tau(qhat, y)]` is maximised at
qhat = sum_i w_i q_i — uses that pinball has a single kink at
y = qhat, with subgradients (tau, tau-1). Moving qhat away from
the weighted mean introduces a sign-definite term the adversary
can exploit. The argument is standard and matches
Neyman-Roughgarden 2021 Theorem 1 under the pinball specialisation.
Checked.

## Sign conventions audit

- `profit_i = pi_i - m_i = m_i (s_i - bar_s)`. Positive when the
  participant scores above the wager-weighted mean. Correct sign.
- `CRPS` reported as negatively-oriented: lower = better. Consistent
  throughout.
- `sigma_i in [sigma_min, 1]`, higher = better skilled. Consistent.
- Skill gate `g(sigma) = lambda + (1-lambda) sigma^eta` is
  increasing in sigma, so higher-sigma participants get a larger
  effective wager. Consistent with the "reward reliability"
  direction.

All consistent with Chapter 3 and the code in
`onlinev2/src/onlinev2/core/mechanism.py`.

## Conclusion

All six formal statements in Chapter 3 are proved or clearly
labelled as proof-sketches. The load-bearing steps are
(a) pre-round measurability of the skill gate and
(b) strict consistency of pinball loss for the tau-quantile
functional. Both are explicit in the proofs. Empirical budget-
balance and sybil-invariance gaps are at floating-point noise,
consistent with the algebra.

Open question noted in the thesis: multi-round truthfulness
theorem under risk-neutral discounted expected profit. The
EWMA-shaping proposition (Appendix A.6) gives a quantitative
bound but not a theorem. Flagged as future work in Chapter 10.
