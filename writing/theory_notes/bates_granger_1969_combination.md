# Bates, Granger 1969 — The combination of forecasts

## Citation

Bates, J.M., Granger, C.W.J. (1969). *The Combination of Forecasts*.
Journal of the Operational Research Society 20(4), 451–468.

## One-line take

Seminal forecast-combination paper. Introduced inverse-variance
weighting: weights proportional to the inverse of past forecast-error
variance. Is our `inverse_variance` baseline.

## Relevant results

### Inverse-variance weights

For forecasters with past squared errors ε_1^2, ..., ε_n^2:

> w_i ∝ 1 / ε_i^2, normalised.

For zero-covariance errors this is the MLE for the Gaussian case.

### Empirical finding

Combination of imperfect forecasts typically improves accuracy over
the best individual forecaster.

## What we take

The inverse-variance rule as one of our mandatory baselines
(`NEXT_STEPS.md`). On the 3000-point Elia wind audit slice, inverse-
variance beats our mechanism on CRPS (−8.1% vs −5.3%). On the
17 344-hour full-length expanding-mode run the two are effectively
tied (mechanism −7.1%, inverse-variance −7.0%). We are honest about
both in Chapter 7.

## Where we use it

- Chapter 2 (literature review §B3), Chapter 5.2 (results table,
  mechanism vs inverse_variance), Chapter 7 (discussion — conditional
  vs universal improvement).

## Open questions

- None.
