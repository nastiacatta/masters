# Experimental methodology {#ch:methodology}

## Three-layer architecture

The simulation and analysis platform is organised into three layers
with a strict interface: an environment layer that produces outcomes
and contextual state, an agent layer that produces reports and
deposits, and a platform layer that implements the mechanism.
Separating the three lets us run the same mechanism against synthetic
data-generating processes, real grid data, honest forecasters, and
adversaries, without modifying any mechanism code. The environment
layer supplies the outcome sequence $y_t$; the agent layer supplies a
triple $(\text{participate}, r_i, b_i)$; the platform layer produces
aggregation weights, settlement payouts, and the updated skill state.
The cleanness of this separation supports the claim that the
mechanism is agnostic to the forecaster panel and to the underlying
data-generating process: every experiment in Chapters 5--8 reuses the
same platform-layer code.

## Datasets

\paragraph{Synthetic data-generating processes.} Three families of
synthetic processes are used in Chapter 5. The \emph{known-$\sigma$
panel} produces six forecasters with noise scales
$\tau \in \{0.15, 0.22, 0.32, 0.46, 0.68, 1.00\}$ and is used to
verify skill recovery (Spearman rank correlation between learned
skill and true CRPS). The \emph{latent-fixed} family has a latent
outcome with fixed forecaster biases and variances and is used for
aggregation and weight-rule comparisons. The \emph{exogenous versus
endogenous} family switches between an exogenous fixed process and an
endogenous one in which a participant's report influences the signal,
separating pure aggregation from feedback dynamics.

\paragraph{Elia offshore wind power.} The primary real-data series is
offshore wind power measured by Elia, the Belgian transmission system
operator, for 2024--2025. The raw series contains $17\,544$ hourly
points. The \emph{headline slice} is the full length, producing
$17\,344$ evaluation rounds after a 200-round warmup, under
strictly-causal expanding normalisation. The \emph{calibration anchor
slice} is the first $3\,000$ evaluation points after the warmup under
a warmup-window normalisation variant; it is retained because it is
the slice against which the per-quantile calibration numbers were
validated and against which the recalibration layer was developed.

Both normalisation variants satisfy the no-future-leakage property.
The expanding variant sets
$(\mathrm{lo}_t, \mathrm{hi}_t) = (\min \mathrm{series}[:t+1],\,
\max \mathrm{series}[:t+1])$, so that every evaluation observation
falls in $[0, 1]$ for $t \geq 1$ and no observation is clipped. The
older warmup-window variant uses $[\min, \max]$ from the
pre-evaluation window only and clips approximately $33\%$ of
evaluation observations on the full wind series; it is retained only
for the audit slice.

\paragraph{Elia electricity imbalance prices.} The secondary series
is Elia's published electricity-imbalance prices, truncated to
$T = 10{,}000$ evaluation rounds after a 200-round warmup, with the
same seven forecasters and the same expanding causal normalisation
as the wind headline. The mechanism's behaviour on this series is a
statistical null, reported without adjustment in Chapter 6.

\paragraph{Elia operational-forecast baseline.} For external
validation, we extract Elia's own published forecasts --- \emph{most
recent forecast}, \emph{day-ahead forecast}, \emph{day-ahead 11h
forecast}, and \emph{week-ahead forecast} --- and convert our own
normalised CRPS to a CRPS-megawatt-equivalent scale using the
observed $[\min, \max]$ range of the series. This provides a
head-to-head comparison against an operational, weather-driven
forecast rather than against internal baselines only.

## Forecaster panel

The real-data panel comprises seven models, all strictly causal: they
use only data up to time $t - 1$ to predict time $t$. Parameter
estimates are updated on rolling windows every fifty steps on the
wind series and every two hundred steps on the electricity series.
Table~\ref{tab:forecaster-panel} summarises the panel.

\begin{table}[h]
\centering
\small
\begin{tabular}{p{3.5cm}p{4.5cm}p{4.5cm}}
\toprule
Model & Description & Quantile path \\
\midrule
Naive & $\hat y = y_{t-1}$
  & Residual bootstrap with isotonic monotonicity \\
EWMA(5) & Exponential smoothing, span 5 & Residual bootstrap \\
ARIMA(2,1,1) & Classical linear time-series model
  & Residual bootstrap; an explicit flag
    signals when the model reduces to persistence \\
XGBoost & Gradient-boosted trees with lag features; expanding-window
  cross-validation with 24-step embargo
  \citep{bergmeir2018note, chen2016xgboost}
  & Residual bootstrap \\
MLP & Two-layer neural network with lag features; deterministic seed
  & Residual bootstrap \\
Theta & Theta decomposition \citep{assimakopoulos2000theta}
  & Residual bootstrap \\
Ensemble & Equal-weighted mean of Naive and EWMA(5)
  & Residual bootstrap \\
\bottomrule
\end{tabular}
\caption{Real-data forecaster panel.}
\label{tab:forecaster-panel}
\end{table}

All forecasters implement a common fit-predict interface and report
an explicit indicator whenever a model falls back to persistence,
so that a silent degradation cannot be mistaken for a legitimate
forecast. Cached forecaster outputs are tagged with a pipeline
version, so that an artefact produced under an earlier protocol
cannot be reused unchanged.

Hyperparameter tuning for XGBoost and the multilayer perceptron
uses expanding-window cross-validation with a 24-step embargo
between the training and validation windows, following
\citet{bergmeir2018note}. The multilayer perceptron uses $z$-score
feature standardisation on the training window, early stopping with
a patience of twenty rounds, and a weight-decay regulariser of
$10^{-4}$. Random seeds are propagated from the experiment runner
into every stochastic component. Full training details for both
parametric forecasters are in
Appendix~\ref{app:training-details}.

## Validity ladder

Experiments follow a four-rung validity ladder. Each rung must pass
before the next is treated as meaningful.

Rung~1, \emph{mechanism correctness}, checks the invariants of the
mechanism itself: budget balance, non-negative payouts, zero profit
under equal scores, score bounds, permutation invariance, and
score-shift invariance. The full set of thirteen active Lambert
combinatorial payoff invariants is exercised with a regression
guard of eighty reference values across the payoff-module functions
and five seeds.

Rung~2, \emph{pure forecasting gain}, holds seeds, data-generating
process, horizon, participation pattern, and agent panel fixed
across all methods in a batch. Each comparison reports paired deltas
against a set of mandatory baselines: uniform averaging, stake-only,
skill-only, the mechanism, inverse-CRPS weighting, trimmed mean,
median, the rolling best-single selector, the per-round oracle
(argmin), the hindsight inverse-CRPS combination, and the published
OGD reference.

Rung~3, \emph{dynamic robustness}, evaluates performance under
drift (non-stationary noise scales), missingness (i.i.d.\ and
bursty absence), and selective participation.

Rung~4, \emph{strategic robustness}, evaluates the mechanism
against the theory-grounded adversary catalogue developed in
Chapter~\ref{ch:robustness}. Attacker profit is reported with
standard errors and $95\%$ confidence intervals, scaled per
$1{,}000$ rounds, together with attacker weight share where
relevant. Multi-seed aggregation uses at least ten seeds per
experiment.

Every experiment emits a canonical four-panel report: a primary
outcome panel (paired $\Delta$ CRPS relative to uniform), a
calibration panel (PIT histogram or reliability diagram), a market
structure panel (Gini, Herfindahl--Hirschman index, effective
participant count $N_{\mathrm{eff}}$ of the wealth or influence
distribution), and a failure-mode panel isolating a plausible
weakness of the method under test. Master comparison rows are keyed
by experiment, method, seed, data-generating process, and
behavioural preset.

## Statistical testing

Method-versus-method comparisons use the Diebold--Mariano test
\citep{diebold1995comparing} on the per-round CRPS differential, with
heteroscedasticity- and autocorrelation-consistent (HAC) standard
errors. Bootstrap confidence intervals use the stationary bootstrap
where mean CRPS is the primary endpoint. A paired sign test is used
as a robustness check when the DM assumptions are marginal.

The three headline numbers from these tests are the following. On the
full-length Elia wind series ($T = 17{,}344$, expanding normalisation),
the mechanism versus uniform comparison yields $t = 40.77$ and
$p \approx 0$. On the Elia electricity-imbalance series
($T = 10{,}000$), the same comparison yields $t = 0.008$ and
$p = 0.994$. On the $3\,000$-point audit slice the mechanism
outperforms uniform with $t = +15.92$ and $p < 10^{-6}$.

## Reproducibility

All experiments are driven from deterministic random seeds, with
the canonical set $\{0, 1, 2, 42, 2024\}$. Forecaster training runs
under single-threaded BLAS to eliminate non-determinism in
floating-point reductions. The software stack is Python 3.12 with
NumPy, SciPy, XGBoost, and PyTorch. A snapshot of every headline
table from before the post-ESG pipeline audit is retained so that
post-audit numbers remain comparable against the pre-audit
counterparts.
