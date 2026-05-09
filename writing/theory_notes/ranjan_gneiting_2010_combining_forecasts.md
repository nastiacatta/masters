# Ranjan, Gneiting 2010 — Combining probability forecasts

## Citation

Ranjan, R., Gneiting, T. (2010). *Combining probability forecasts*.
Journal of the Royal Statistical Society: Series B 72(1), 71–91.
[doi:10.1111/j.1467-9868.2009.00726.x](https://doi.org/10.1111/j.1467-9868.2009.00726.x).

Tech report version at [UW Stats](http://stat.uw.edu/research/tech-reports/combining-probability-forecasts).

## One-line take

The impossibility theorem our recalibration chapter depends on: any
non-trivial weighted average of distinct calibrated probability
forecasts is necessarily uncalibrated and lacks sharpness. Linear
pooling is the canonical aggregation rule, so this result is what
forces post-hoc recalibration.

## Relevant results

### Main theorem

Let F_1, ..., F_n be calibrated predictive CDFs that are not all equal.
Then any non-trivial linear combination F = Σ w_i F_i with w_i ≥ 0,
Σ w_i = 1 is uncalibrated and lacks sharpness.

### Direction of the miscalibration

Linear pools are typically under-dispersed in the tails and over-
dispersed in the centre, consistent with the Elia wind empirical
pattern (Chapter 5.2.4): under-coverage at τ ∈ {0.1, 0.2} and
over-coverage around τ ∈ {0.5, 0.7}.

## What we take

- The theoretical reason our mechanism's aggregate is miscalibrated
  even when the individual forecasters are well-calibrated.
- The direction of the expected miscalibration, which matches our
  empirical measurement.
- The justification for a post-hoc recalibration step in Chapter 5.3.

## Where we use it

- Chapter 2 (literature review §C3), Chapter 5.2 (calibration
  measurement), Chapter 5.3 (recalibration motivation and why the
  cost is unavoidable), Chapter 7 (discussion of inherent
  limitations).

## Open questions

- None blocking. The recalibration layer closes 41% of the tail
  deviation; the remaining 59% is partly the theoretical floor and
  partly finite-sample buffer noise. A longer series would close more.
