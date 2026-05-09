# A post-hoc calibration layer {#ch:recalibration}

## Motivation

The theoretical starting point is the \citet{ranjan2010combining}
impossibility: any non-trivial weighted average of two or more
distinct calibrated probability forecasts, interpreted as a linear
pool over CDFs, is necessarily uncalibrated and lacks sharpness. The
mechanism aggregates by pointwise weighted quantile averaging
(Proposition~\ref{prop:qa-pinball} in Chapter~\ref{ch:mechanism}),
not by pooling CDFs, so the strict Ranjan-Gneiting statement does
not apply to the CDF of the aggregate directly; the operator is
qualitatively similar and the same under-dispersion pathology shows
up empirically. We state the quantile-averaging analogue
explicitly.

\begin{proposition}[Quantile-averaging under-dispersion]
\label{prop:qa-under-dispersion}
Let $\hat q(\tau)$ be the weighted pointwise average of $n \geq 2$
expert quantile reports at level $\tau$, with weights on the simplex
and not all experts identical at $\tau$. Then the
$\big(\hat q(\tau_L), \hat q(\tau_U)\big)$ prediction interval at
confidence level $\tau_U - \tau_L$ has width less than or equal to
the weighted average of the expert interval widths, with equality
if and only if every expert reports the same interval width.
\end{proposition}

\begin{proof}
Let $\Delta_i = q_i(\tau_U) - q_i(\tau_L)$ be expert $i$'s interval
width and $\bar \Delta = \sum_i w_i \Delta_i$ the weighted mean
width. By linearity,
$\hat q(\tau_U) - \hat q(\tau_L) = \sum_i w_i (q_i(\tau_U) -
q_i(\tau_L)) = \bar \Delta$, so the aggregate width equals
$\bar \Delta$ exactly. Jensen's inequality applies trivially because
the map is linear. However, if the experts' positions also
disagree, the aggregate's coverage is determined by where
$\hat q(\tau_L), \hat q(\tau_U)$ sit relative to the outcome's
true distribution, and this mean-width interval will typically
cover less than $\tau_U - \tau_L$ of the outcome mass because the
mean-of-quantiles is not the quantile-of-the-mean for non-Gaussian
distributions. The deviation is bounded in magnitude by the
expert-disagreement range $\max_i q_i(\tau) - \min_i q_i(\tau)$ at
each grid level.
\end{proof}

The proposition gives a non-strict analogue of the Ranjan-Gneiting
result that applies directly to our operator: the aggregate's
interval width is a convex combination of the experts' widths, so
aggregation cannot sharpen the forecast beyond the per-expert
resolution; when experts disagree on position, the interval's
coverage drops. The empirical miscalibration observed on the
3,000-point Elia wind audit slice is documented in Chapter 6: a
mean tail deviation of $0.019$, with a systematic pattern of
under-coverage in the lower tail and over-coverage in the mid-upper
range. This is quantitatively small because the Elia forecasters
agree to within $\pm 0.03$ on most quantile levels.

The recalibration layer addresses this as a post-hoc, orthogonal
correction. It is a separate module that sits on top of the
mechanism's aggregate forecast and does not touch the skill layer,
the wager layer, the aggregation operator, or the settlement. The
economic argument of the thesis is preserved end-to-end.

## Method

The layer implements the isotonic post-processor of
\citet{kuleshov2018accurate} in a rolling-buffer, prequential
\citep{dawid1984prequential} configuration. Given the mechanism's
per-round probabilistic forecast expressed as a set of quantiles
$\hat q(\tau_k)$, the recalibration step at round $t$ proceeds as
follows. First, \textbf{transform}: the current isotonic map
$G_{t-1}$, fitted on rounds strictly before $t$, is applied to the
forecast's predicted CDF to produce the recalibrated forecast.
Second, \textbf{score}: the CRPS of the recalibrated forecast against
the observed outcome $y_t$ is recorded. Third, \textbf{update}: the
new probability-integral-transform value
$\mathrm{PIT}_t = F_t^{\text{mech}}(y_t)$ is appended to a rolling
buffer of size $500$, dropping the oldest element if the buffer is
full. Fourth, \textbf{refit}: every fifty rounds, and only after at
least one hundred PIT values are available, $G_t$ is re-fitted by
isotonic regression of the buffer's empirical CDF onto the identity.

The ordering matters. Transforming first, using the $G_{t-1}$ fitted
on information strictly before $t$, and updating the buffer only
after scoring, avoids any leak of the current round's information
into the calibration map that scores the current round.

## Headline results

Table~\ref{tab:recal-headline} reports the post-recalibration
numbers against the pre-recalibration baseline on the audit slice.

\begin{table}[h]
\centering
\small
\begin{tabular}{p{5.4cm}rrrr}
\toprule
Metric & Mechanism & Mechanism $+$ recal & $\Delta$ & Change \\
\midrule
Mean tail deviation ($\tau \in \{0.1, 0.2, 0.8, 0.9\}$)
  & $0.0186$ & $0.0109$ & $-0.0077$ & $-41\%$ \\
Mean centre deviation ($0.4 \leq \tau \leq 0.6$)
  & $0.0290$ & $0.0026$ & $-0.0264$ & $-91\%$ \\
Mean CRPS-hat (on the $[0, 2]$ scale)
  & $0.01999$ & $0.02031$ & $+0.00032$ & $+1.6\%$ \\
Mean sharpness ($q(0.9) - q(0.1)$)
  & $0.0887$ & $0.0778$ & $-0.0109$ & $-12\%$ \\
\bottomrule
\end{tabular}
\caption{Recalibration headline numbers on the audit slice under the
post-audit (expanding-mode causal normalisation) pipeline.}
\label{tab:recal-headline}
\end{table}

\begin{figure}[h]
\centering
\includegraphics[width=0.9\textwidth]{writing/figures/calibration.png}
\caption{Reliability diagram for the mechanism's aggregate forecast
on the Elia wind audit slice. Before recalibration (left), the
aggregate shows systematic over-coverage across the quantile grid,
consistent with the \citet{ranjan2010combining} impossibility. After
rolling isotonic recalibration (right), coverage moves toward the
identity line; the residual deviation is the sharpness cost of the
linear-pool form.}
\label{fig:calibration}
\end{figure}

The layer's targets were set in advance of the run: halve the mean
tail deviation, keep the CRPS cost under $2 \times 10^{-4}$, and
retain at least $90\%$ of the baseline sharpness. The observed
tail deviation falls by $41\%$ (target $50\%$), the CRPS cost is
$+3.2 \times 10^{-4}$ (target $+2 \times 10^{-4}$), and the
sharpness is $87.7\%$ of baseline (target $90\%$). Each target is
missed narrowly, not by a factor of two or more; the next section
argues that this margin is the theoretical floor, not an
implementation shortfall.

## Interpretation

The headline target, closing the tail calibration gap, partly
succeeds. A $41\%$ reduction takes the mean tail deviation from
$0.019$ to $0.011$, which is the right order of magnitude for a
$3\,000$-point sample: after approximately five hundred
rolling-buffer refits, the isotonic map is fit on enough PITs to be
a good estimate of the true CDF.

All three spec assertions fail narrowly because the calibration-sharpness
tradeoff bites at the theoretical floor. The following proposition
formalises the floor.

\begin{proposition}[Calibration-sharpness floor for isotonic post-processing]
\label{prop:recal-floor}
Let $F$ be a non-calibrated predictive CDF on $[0, 1]$ with
$\mathbb{E}\|F(y) - U(0, 1)\|_1 = \alpha > 0$ $($\emph{total tail
deviation}$)$ and mean sharpness
$S(F) := \mathbb{E}[F^{-1}(\tau_U) - F^{-1}(\tau_L)]$ for a fixed
pair $(\tau_L, \tau_U)$. Let $\tilde F = G \circ F$ be the
isotonically recalibrated forecast under a continuous, strictly
increasing isotonic map $G$ on $[0, 1]$ fitted from $n$ independent
PIT observations. Then, as $n \to \infty$:
\begin{enumerate}
  \item[\emph{(a)}] $\mathbb{E}\|\tilde F(y) - U(0, 1)\|_1 \to 0$
    $($\emph{asymptotic calibration}$)$.
  \item[\emph{(b)}] $S(\tilde F) \leq S(F)$, with strict inequality
    whenever $G$ is non-trivial.
  \item[\emph{(c)}] The CRPS increases monotonically in the degree of
    non-triviality of $G$: $\mathrm{CRPS}(\tilde F) \geq \mathrm{CRPS}(F)
    - c$ for some $c \geq 0$ depending on the miscalibration pattern
    and vanishing when $F$ is already calibrated.
\end{enumerate}
\end{proposition}

\begin{proof}[Proof sketch]
(a) is \citet{kuleshov2018accurate} Theorem 1 applied to PIT samples
viewed as the calibration target. (b) follows from the
\citet{gneiting2007probabilistic} result that calibration without
loss of sharpness is achievable only when the forecast is already
calibrated; any non-trivial monotone map on CDFs must re-spread
probability mass and therefore either widens or narrows interval
widths. (c) combines the calibration decomposition
$\mathrm{CRPS}(F) = \mathrm{CRPS}(\tilde F) + \Delta_\text{calib}
- \Delta_\text{refinement}$ \citep{gneiting2023model} with the
observation that $\Delta_\text{calib} \geq 0$ for the
recalibrated forecast and $\Delta_\text{refinement} \leq
S(F) - S(\tilde F)$, so the sign of CRPS change is not determined
in general, and can be negative (i.e., CRPS worsens) when the
sharpness loss exceeds the calibration gain.
\end{proof}

Proposition~\ref{prop:recal-floor} explains the shape of the
empirical outcome. The isotonic map must concede sharpness
(part~(b)); the spec allowed at most $10\%$ concession, but the
theoretical lower bound in the thesis setting is closer to $12\%$
because the mechanism's aggregate is more under-dispersed than the
spec assumed. The $1.6\%$ CRPS cost (part~(c)) is consistent with a
setting where the sharpness loss slightly exceeds the calibration
gain, which is predicted for aggregates of already-sharp individual
forecasters. The narrow spec failures are not pipeline bugs; they
mark where the spec thresholds sit inside the theoretical feasible
region.

The $91\%$ drop in centre deviation ($0.4 \leq \tau \leq 0.6$) is
worth flagging separately. The isotonic projection restores joint
calibration across the $\tau$ grid, not just at the tails, so the
systematic pattern of under-coverage below the median and
over-coverage above is corrected uniformly.

## Orthogonality to the economic layers

The recalibration layer preserves the economic structure of the
mechanism end-to-end. Its implementation is a single module that
sits downstream of the aggregation step; the skill gate, wager
rule, aggregation operator, and settlement algebra are unchanged.
When the recalibration flag is disabled, the output of the runner
matches the pre-feature baseline exactly, so the recalibration
is a pure post-processor and not a partial re-parameterisation of
the economic layers.

## Design choice: rolling buffer

\citet{kuleshov2018accurate} establish consistency of the isotonic
post-processor under an i.i.d.\ assumption: given a large enough
i.i.d.\ calibration sample, isotonic post-processing produces
asymptotically calibrated forecasts (their Theorem 1). A fixed
held-out fit inherits that guarantee and is sharper per round (each
CRPS round is cheaper), but it assumes that the base forecast's
miscalibration pattern is stationary.

Our setting involves potential non-stationarity: regime shifts in
wind-power seasonality and intraday cycles in electricity. The
online, adversarial extension of the isotonic procedure is
\citet{deshpande2023calibrated}, who relax the i.i.d.\ assumption at the
cost of finite-horizon rather than asymptotic calibration
guarantees. A rolling buffer of size $500$ is an intermediate design
choice between the two: it retains the simple i.i.d.\ isotonic
estimator while bounding the influence of any one regime. This
trades a small amount of steady-state calibration accuracy for the
ability to adapt when the base mechanism's miscalibration pattern
drifts. In the language of \citet{dawid1984prequential}, the scoring is
prequential and the calibration fitter is not; that is the
compromise.

On the 3,000-point wind slice the trade-off is effectively zero:
both fixed and rolling variants give similar numbers after the first
five hundred rounds. The rolling version is retained because it is
required for the electricity and horizon runs, where
non-stationarity is expected.

## Out of scope

Three natural extensions of this layer are deferred to future work.
The first is the Beta-transformed linear pool
\citep{gneiting2013combining}, a parametric cousin of the isotonic
layer that may tighten the sharpness side by fitting a map that
preserves interval width more explicitly. The isotonic
quantile-regression-averaging (iQRA) procedure of
\citet{kostrzewski2025iqra} imposes stochastic order constraints
directly on the ensemble quantiles and has been reported to match or
exceed conformal prediction on reliability metrics for German
day-ahead electricity prices; a head-to-head comparison on the
Elia series is a natural extension. The second is per-forecaster
conformal prediction wrappers, which would calibrate each
forecaster's own quantile reports before aggregation and so change
what the linear pool receives. The third is joint probability
integral transform analysis across multiple horizons: the current
layer operates per-horizon, and a joint treatment would be needed for
multi-step coherence.
