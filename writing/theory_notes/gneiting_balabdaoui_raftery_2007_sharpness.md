# Gneiting, Balabdaoui, Raftery 2007 — Probabilistic forecasts, calibration and sharpness

## Citation

Gneiting, T., Balabdaoui, F., Raftery, A.E. (2007). *Probabilistic
forecasts, calibration and sharpness*. Journal of the Royal Statistical
Society: Series B 69(2), 243–268.
[doi:10.1111/j.1467-9868.2007.00587.x](https://doi.org/10.1111/j.1467-9868.2007.00587.x).

## One-line take

Establishes the operating paradigm for probabilistic forecasting:
maximise sharpness subject to calibration. Defines both terms precisely
and shows they are the currencies of the inevitable tradeoff.

## Relevant results

### Calibration

Joint property of forecasts and observations. A forecast is
probabilistically calibrated if the empirical CDF of PITs is uniform
on [0, 1].

### Sharpness

Property of the forecasts alone. Measured by the concentration of the
predictive distribution (e.g., interval width). Sharper distributions
are more informative.

### The tradeoff principle

Forecasts should be as sharp as possible subject to calibration. A
forecast cannot improve both simultaneously indefinitely; calibration
fixes generally cost sharpness and vice versa.

## What we take

The calibration-sharpness tradeoff is the *shape* of our recalibration
layer's cost. Tail deviation drops 59%, sharpness drops 11%, CRPS rises
1.3%. The 11% sharpness concession is the price of the 59%
calibration gain; both sit on the tradeoff frontier.

## Where we use it

- Chapter 2 (literature review §C2), Chapter 5.3 (recalibration
  interpretation), Chapter 7 (discussion of spec near-misses).

## Open questions

- The tradeoff is qualitative in this paper; Ranjan–Gneiting 2010 is
  the sharper quantitative statement for our case. Use both.
