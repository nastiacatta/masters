# Forecaster training details

<!--
Referenced from:
- Chapter 4 (Methodology), §4.2 (forecaster panel) and §4.3
  (training protocol).
- Chapter 5 (Results — real data), §5.2 (Elia wind and
  electricity).
-->

This appendix records the training configuration for the two
parametric members of the forecaster panel (XGBoost and MLP). The
other panel members are either parameter-free (Naive, Theta,
inverse-variance ensemble) or have well-specified defaults (EWMA
with half-life $= 24$ rounds; ARIMA with AIC-selected order).

## XGBoost quantile regression

- Library: `xgboost` 2.x, Python bindings.
- Objective: `reg:quantileerror` with the five-element quantile
  grid $\tau \in \{0.1, 0.25, 0.5, 0.75, 0.9\}$.
- Features: lagged target values $y_{t-1}, y_{t-2}, \dots, y_{t-24}$,
  hour-of-day, day-of-week, and the rolling $24$-hour mean and
  variance. No exogenous weather inputs.
- Training protocol: expanding-window online retraining every
  $n_{\mathrm{refit}} = 50$ rounds; strict causal embargo of one
  round between training tail and forecast target per
  \citet{bergmeir2018note}.
- Hyperparameters (held-out sweep): `max_depth = 6`,
  `learning_rate = 0.05`, `n_estimators = 200`,
  `min_child_weight = 8`, `reg_lambda = 1.0`. Not re-tuned per
  dataset.

## Multi-layer perceptron

- Library: `torch` 2.x, custom quantile-loss head.
- Architecture: two hidden layers of width $64$ with ReLU
  activation; output layer of size $|\tau| = 5$ with a monotonic
  cumulative softplus parameterisation to guarantee
  non-crossing quantiles.
- Features: same as XGBoost.
- Training protocol: online mini-batch gradient descent with
  batch size $32$; optimiser Adam with learning rate $10^{-3}$
  and weight decay $10^{-5}$; refit every $50$ rounds over the
  expanding window.
- Early stopping: held-out CRPS on a $10\%$ rolling validation
  tail; patience $5$ refits.

## Reproducibility

Every training run is seeded under `AUDIT_SEEDS` and versioned
under `PIPELINE_VERSION`. Forecaster outputs are cached per
`(dataset, forecaster, seed, PIPELINE_VERSION)` tuple. The
headline wind run under expanding normalisation is reproducible
end-to-end from:

```
python onlinev2/scripts/run_real_data.py \
    --dataset elia_wind \
    --pipeline expanding
```
