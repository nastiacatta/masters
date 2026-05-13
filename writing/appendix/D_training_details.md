# Forecaster training details {#app:training-details}

<!--
Referenced from:
- Chapter 4 (Methodology), §4.2 (forecaster panel) and §4.3
  (training protocol).
- Chapter 5 (Results — real data), §5.2 (Elia wind and
  electricity).
- Chapter 5 (Synthetic validation), §5.3 (forecaster panel
  integrity).
-->

This appendix records the training configuration for the two
parametric members of the forecaster panel (XGBoost and a
multi-layer perceptron) and the three structural checks applied to
the panel as a whole. The other panel members are either
parameter-free (Naive, Theta, the Naive+EWMA ensemble) or have
well-specified defaults (EWMA with half-life $24$; ARIMA with
AIC-selected order).

## XGBoost quantile regression

- Objective: pinball loss on the five-level grid
  $\tau \in \{0.1, 0.25, 0.5, 0.75, 0.9\}$.
- Features: lagged target values $y_{t-1}, \dots, y_{t-24}$,
  hour-of-day, day-of-week, and the rolling $24$-hour mean and
  variance. No exogenous weather inputs.
- Training protocol: expanding-window online retraining every
  $50$ rounds; strict causal embargo of one round between the
  training tail and the forecast target, following
  \citet{bergmeir2018note}.
- Fixed hyperparameters selected by held-out sweep: maximum depth
  $6$, learning rate $0.05$, $200$ boosting rounds, minimum child
  weight $8$, $L_2$ regularisation coefficient $1.0$. Not re-tuned
  per dataset.

## Multi-layer perceptron

- Architecture: two hidden layers of width $64$ with ReLU
  activation; output layer of size $5$ with a monotonic
  cumulative-softplus parameterisation to guarantee non-crossing
  quantiles.
- Features: same as XGBoost.
- Training protocol: online mini-batch gradient descent with
  batch size $32$; Adam optimiser with learning rate $10^{-3}$
  and weight decay $10^{-5}$; refit every $50$ rounds on the
  expanding window.
- Early stopping: held-out CRPS on a $10\%$ rolling validation
  tail; patience $5$ refits.

## Structural checks

Every forecaster in the real-data panel is screened before use
against three properties.

- \emph{No future-data leakage.} A sentinel-injection check replays
  the series with a flag set at time $t$ and confirms that the
  forecaster's output at time $t'\!<\!t$ is unchanged. All seven
  forecasters pass on the Elia wind audit slice.
- \emph{No degenerate constant output.} After the $200$-round
  warmup, the point-forecast standard deviation and the
  quantile-interval width exceed $10^{-4}$ for every forecaster
  on every non-constant data-generating process.
- \emph{No silent persistence fallback.} Each forecaster exposes
  a fallback indicator that fires if the model's own output is
  unavailable and the runner substitutes the lagged observation;
  on the post-audit $3{,}000$-point Elia wind slice the fallback
  counter is zero for all seven forecasters.

## Reproducibility

Every training run is driven by a deterministic random seed
propagated from the runner. Forecaster outputs are cached per
dataset, forecaster, seed, and pipeline version; a version bump
invalidates the cache. The headline wind run under expanding
normalisation is reproducible end-to-end from the experiment
runner with the same dataset, pipeline, and seed set documented
in Chapter~\ref{ch:methodology}.
