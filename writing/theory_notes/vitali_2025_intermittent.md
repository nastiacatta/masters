# Vitali, Pinson 2025 — Prediction markets with intermittent contributions

## Citation

Vitali, M., Pinson, P. (2025). *Prediction Markets with Intermittent
Contributions*. arXiv:2510.13385.
[arXiv link](https://arxiv.org/abs/2510.13385).

Primary source: `theory/intermittentcontributions_michael.md`.

## One-line take

Closest direct antecedent to this thesis. Handles three things at once
— historical performance, time-varying conditions, and
enter/exit-at-will participation — using online gradient descent on the
simplex with robust regression for missing submissions. Our thesis
adds self-financing and replaces the simplex weights with an absolute
skill signal.

## Relevant results

### Online combination

Weights on the simplex, updated by OGD with projection:

> w_{t+1} = Π_Δ(w_t − η ∇_w L_t(w_t, submissions_t, y_t))

where Π_Δ projects onto the probability simplex and L is a pinball-
type loss.

### Robust regression for missingness

Handles agents who drop submissions by an imputation / robust-
regression scheme.

### In-sample + out-of-sample payoff

Payoff allocation considers both in-sample fit and out-of-sample
performance. Not budget-balanced in our sense; there is a separate
allocation step.

## What we take

The online-market framing and the *reference baseline* implementation.
Our `onlinev2/src/onlinev2/mechanism/michael_port.py` is a Python port
of their Julia `michael/main_rewards.jl`.

- On the 3000-point Elia wind **audit slice**, mechanism /
  `michael_ogd` CRPS ratio = 0.01874 / 0.01869 = **1.003**
  [source: `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/
  comparison.json`].
- On the 17 344-hour **full-length expanding-mode run**, the renamed
  `michael_ogd_centered_median_fan` row lands at 0.03487 vs our
  mechanism at 0.03788, a gap of ~7 pp CRPS [source:
  `dashboard/public/data/real_data/elia_wind/data/comparison.json`].
- In the `baselines.json` head-to-head (static-mode, pending
  expanding refresh), Vitali's true per-τ OGD reaches −18.3% vs
  uniform compared to our −7.6%, a ~11 pp gap [source:
  `dashboard/public/data/real_data/elia_wind/data/baselines.json`].

The audit-slice parity is real; the full-length gaps are the CRPS
cost of the Lambert budget-balance constraint.

## Difference summary

| | Vitali & Pinson 2025 | This thesis |
|---|---|---|
| Weights | Relative (simplex), OGD + projection | Absolute (EWMA of loss → σ_i) |
| Self-financed | No (separate allocation step) | Yes (inherits Lambert/Raja algebra) |
| Same object for influence and exposure | No | Yes (effective wager m_i) |
| Intermittency handling | Robust regression / imputation | Staleness decay toward prior L_0 |
| Sybil-proofness axiom | Not studied | Preserved (Lambert narrow) |

## Where we use it

- Chapter 1 (gap statement), Chapter 2 (literature review §B1),
  Chapter 5.2 (mechanism vs michael_ogd comparison), Chapter 10
  (future work — real per-τ OGD port).

## Open questions

- Is the claim that our self-financing "costs nothing in CRPS" specific
  to the wind slice, or does it transfer to other data? Electricity
  comparison will test this once the refresh lands.
- Their robust regression is more aggressive on missingness than our
  staleness decay. Worth running their imputation on our bursty
  preset to see how much of the +934% vulnerability it would cut.
