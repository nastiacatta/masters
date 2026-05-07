# Gneiting, Ranjan 2013 — Combining predictive distributions

## Citation

Gneiting, T., Ranjan, R. (2013). *Combining Predictive Distributions*.
arXiv:1106.1638. [arXiv link](https://arxiv.org/abs/1106.1638).

## One-line take

Parametric cousin of our isotonic recalibrator: fit a Beta CDF
transformation to linear-pooled forecasts. Listed as future work —
may preserve sharpness better than the non-parametric isotonic map.

## Relevant results

### Beta-transformed linear pool (BLP)

Let H(·) = Σ_i w_i F_i(·) be the linear pool. The BLP is
B_{α,β}(H(·)) where B_{α,β} is a Beta CDF with parameters (α, β)
fitted on the held-out PIT sample. Two parameters, differentiable,
preserves shape better than the step-function isotonic map.

### Convergence

Shown to converge to calibration under weaker assumptions than the
isotonic case, and to pay less in sharpness.

## What we take

- Flag for future work in Chapter 8. A clean next step to tighten
  the sharpness side of the Ranjan–Gneiting tradeoff.
- Not implemented in this thesis; isotonic was chosen for
  simplicity and non-parametric generality.

## Where we use it

- Chapter 5.3 (future work mention), Chapter 8 (future work detail),
  `writing/bibliography.md` §C.

## Open questions

- How much of the remaining 41% tail deviation (Chapter 5.3) would the
  BLP close? Probably most; the isotonic step-function leaves some
  bias at the bin boundaries that a smooth Beta CDF would handle.
  Experimental question left open.
