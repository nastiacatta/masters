# Kuleshov, Fenner, Ermon 2018 — Accurate uncertainties for deep learning

## Citation

Kuleshov, V., Fenner, N., Ermon, S. (2018). *Accurate Uncertainties for
Deep Learning Using Calibrated Regression*. ICML.
[arXiv:1807.00263](https://arxiv.org/abs/1807.00263).

## One-line take

Provides the recipe our recalibration layer implements: fit an
isotonic map from predicted CDF values (PITs) to empirical quantiles
on a calibration set, then apply the map post-hoc to new forecasts.
Our implementation rolls the calibration set in a prequential buffer.

## Relevant results

### Method (§3.1)

Given a predictive CDF F_X(y) and a held-out calibration set
{(y_i, F_i)}, compute PITs p_i = F_i(y_i) and fit an isotonic
regression R mapping the empirical CDF of {p_i} onto the identity.
Apply R to any future forecast's PIT to recalibrate.

### Theorem 1 (convergence to calibration)

As |calibration set| → ∞, the recalibrated forecast's empirical PIT
distribution converges to uniform on [0, 1] under standard i.i.d.
assumptions.

### Variants (§3.2)

Discusses online / incremental variants. Our rolling-buffer version
follows the same logic but refits the isotonic map every `refit_every
= 50` rounds on a window of the last `window_size = 500` PITs.

## What we take

- The exact recalibration algorithm (isotonic fit → apply transformed
  CDF → score).
- The theoretical guarantee (convergence to calibration with enough
  data).
- The rolling-buffer adaptation makes the layer robust to non-
  stationarity (Dawid 1984 prequential framing).

## Where we use it

- Chapter 2 (literature review §C5), Chapter 5.3 (recalibration
  method), Chapter 5.3 interpretation (why convergence is clean on
  our slice).

## Open questions

- The paper's guarantees are i.i.d. We operate on time-series data
  with potential autocorrelation. The rolling buffer mitigates this
  but does not eliminate it. Empirically the calibration gain is
  large; theoretically the convergence rate may be slower than i.i.d.
