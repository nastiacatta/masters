# Gneiting, Raftery 2007 — Strictly proper scoring rules

## Citation

Gneiting, T., Raftery, A.E. (2007). *Strictly Proper Scoring Rules,
Prediction, and Estimation*. Journal of the American Statistical
Association 102(477), 359–378.
[doi:10.1198/016214506000001437](https://doi.org/10.1198/016214506000001437).

## One-line take

Defines strict propriety and catalogues the major strictly proper
rules, including CRPS for continuous variables and pinball loss for
quantiles. Our thesis uses both.

## Relevant results

### Strict propriety

> E_P[s(Q, Y)] ≤ E_P[s(P, Y)] with equality iff Q = P.

A forecaster's expected score is uniquely maximised by reporting the
true distribution. This is what makes the Lambert truthfulness
argument extend from discrete to continuous outcomes: if the
underlying scoring rule is strictly proper, truthfulness of the
wagering mechanism follows.

### CRPS

For a CDF F and observation y:

> CRPS(F, y) = ∫ (F(z) − 1{y ≤ z})^2 dz.

Strictly proper. We use the finite-grid pinball approximation
Ĉ = (2/K) · Σ_k L^{τ_k}(y, q(τ_k)) which converges to CRPS as K → ∞.

### Pinball loss

For a τ-quantile forecast q and outcome y:

> L^τ(y, q) = τ(y − q) if y ≥ q, (1 − τ)(q − y) if y < q.

Strictly proper for the τ-quantile.

## Where we use it

- Chapter 2 (literature review §C1), Chapter 3 (scoring),
  Chapter 4 (CRPS-hat definition), Chapter 5 (results), Chapter 7
  (discussion — CRPS as the metric).

## Open questions

- None blocking writing. The bias of CRPS-hat on a 9-level grid is
  small and characterised in the paper's discussion of finite-sample
  approximation.
