# Hyperparameter tuning table

<!--
Referenced from:
- Chapter 3 (Mechanism design), §3.5 (sensitivity sweep).
- Chapter 4 (Methodology), §4.3 (held-out tuning protocol).
- Chapter 5 (Results — real data), §5.2 (Elia wind and electricity).

Source artefact: onlinev2/outputs/sensitivity_sweep.json
(reproduced by scripts/run_sensitivity_sweep_cached.py).
-->

All hyperparameters reported in the main body are selected on
held-out data via the sensitivity sweep rather than set by hand.
The sweep grid, held-out evaluation protocol, and best-CRPS
optima are given below.

## Skill-gate hyperparameters

The skill layer has four free parameters: the EWMA learning rate
$\rho$, the loss-to-skill scale $\gamma$, the skill-gate floor
$\lambda$, and the skill-exponent $\eta$. The $\eta$ default is
fixed at the runner level at $\eta = 2.0$ and is not tuned per
dataset; the other three are swept on a held-out prefix.

### Sweep grid

| Parameter | Values |
|---|---|
| $\gamma$ | $\{8, 16, 32, 64\}$ |
| $\rho$ | $\{0.1, 0.3, 0.5, 0.7\}$ |
| $\lambda$ | $\{0.0, 0.05, 0.10, 0.20\}$ |
| $\eta$ | $2.0$ (fixed) |

The grid is intentionally coarse; local refinement gave marginal
improvements (CRPS changes of order $10^{-4}$).

### Held-out optima

Optima minimise mean CRPS on a held-out prefix of each dataset.
The selected parameters are then used for the full-length run
reported in the main body.

| Dataset | $\gamma$ | $\rho$ | $\lambda$ | Held-out CRPS |
|---|---:|---:|---:|---:|
| Synthetic (known-noise panel) | $16$ | $0.5$ | $0.05$ | — (grid centre) |
| Elia offshore wind | $32$ | $0.7$ | $0.05$ | $0.0371$ |
| Elia electricity imbalance | $16$ | $0.1$ | $0.05$ | $0.0903$ |

Static-mode optima at held-out prefixes produce the same ordering;
the absolute CRPS differs because the expanding-normalisation
pipeline emits larger normalised losses.

## Deposit-policy hyperparameters

The bankroll-confidence deposit uses the confidence proxy
$c_i = \mathrm{clip}(\exp(-\beta_c \Delta_i), c_{\min}, c_{\max})$
with $\Delta_i$ the 80 % quantile-interval width. Defaults:
$\beta_c = 1.0$, $c_{\min} = 0.8$, $c_{\max} = 1.0$, stake fraction
$f_{\mathrm{stake}} = 0.05$. Not swept in this thesis; sensitivity
to $\beta_c$ is reported in §5.1 (deposit-policy ablation).

## Recalibration-layer hyperparameters

The rolling isotonic recalibrator uses a buffer of the last
$K = 500$ rounds, per-quantile isotonic fits, and refits every
$n_{\mathrm{refit}} = 50$ rounds. These defaults follow
\citet{kuleshov2018accurate} adapted for an online buffer per
\citet{deshpande2023calibrated}; values are not re-tuned per
dataset.

| Parameter | Value |
|---|---:|
| Buffer length $K$ | $500$ |
| Refit period | $50$ |
| Quantile grid | $\tau \in \{0.1, 0.25, 0.5, 0.75, 0.9\}$ |
