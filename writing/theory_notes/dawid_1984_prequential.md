# Dawid 1984 — Prequential approach

## Citation

Dawid, A.P. (1984). *Present position and potential developments: Some
personal views — statistical theory — the prequential approach*.
Journal of the Royal Statistical Society: Series A (General) 147(2),
278–290.

## One-line take

Foundational paper for online / sequential evaluation. Every
observation is first used for testing, then for training. Underpins
our rolling-buffer recalibration and all our evaluation protocols.

## Relevant results

### Prequential principle

A probabilistic forecasting system is evaluated on its predictions for
new data, assessed sequentially as the data arrives. Each forecast is
made using only past data, and each observation contributes first to
scoring then (optionally) to training.

### Consequence

Any quantity computed from the prequential trace is genuinely out-of-
sample for every forecast.

## What we take

- The rolling isotonic recalibrator is prequential by construction:
  at round t, the calibration map G_{t−1} was fit on PITs from rounds
  < t, and the PIT at round t is added to the buffer only after it
  has been used to score.
- All our evaluation (CRPS per round, DM tests, reliability diagrams)
  respects the prequential framework.

## Where we use it

- Chapter 4 (methodology — evaluation protocol), Chapter 5.3
  (recalibration).

## Open questions

- None.
