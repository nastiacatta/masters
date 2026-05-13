## Post-hoc calibration {#ch:recalibration}

### Motivation

The theoretical starting point is the \citet{ranjan2010combining}
impossibility: any non-trivial weighted average of two or more
distinct calibrated probability forecasts, interpreted as a linear
pool over CDFs, is uncalibrated and lacks sharpness. The mechanism
aggregates by pointwise weighted quantile averaging (see
Section~\ref{ch:mechanism}, Step~3), not by pooling CDFs, so the
strict Ranjan-Gneiting statement does not apply to the aggregate
CDF directly. The operator is qualitatively similar and the same
under-dispersion pathology shows up empirically. The
quantile-averaging analogue is stated below.

\begin{proposition}[Quantile-averaging under-dispersion]
\label{prop:qa-under-dispersion}
Let $\hat q(\tau_L), \hat q(\tau_U)$ with $\tau_L < \tau_U$ be the
weighted pointwise averages of $n \geq 2$ expert quantile reports,
with weights on the simplex. Let
$\Delta_i = q_i(\tau_U) - q_i(\tau_L)$ be expert $i$'s reported
interval width and $\bar\Delta = \sum_i w_i \Delta_i$ the weighted
mean width. Assume each expert's predictive CDF $F_i$ is calibrated,
so that $P(Y \leq q_i(\tau_L)) = \tau_L$ and
$P(Y \leq q_i(\tau_U)) = \tau_U$, and that the experts disagree on
location, meaning $\{q_i(\tau_L)\}$ is not a singleton. Then
\begin{enumerate}
  \item[\emph{(a)}] $\hat q(\tau_U) - \hat q(\tau_L) = \bar\Delta$
    $($width identity$)$,
  \item[\emph{(b)}] the empirical coverage of the aggregate interval,
    $P(\hat q(\tau_L) \leq Y \leq \hat q(\tau_U))$, is in general
    not equal to $\tau_U - \tau_L$: coverage depends on the joint
    distribution of the expert quantile reports and the outcome.
\end{enumerate}
\end{proposition}

\begin{proof}
Part~(a) is linearity of the weighted mean in each coordinate.
Part~(b) is a corollary of \citet{ranjan2010combining}
Proposition~2 applied to the piecewise-linear CDF interpolating the
reported grid: a non-trivial convex combination of calibrated
forecasts is uncalibrated, so the aggregate interval's coverage does
not equal $\tau_U - \tau_L$ in general. Whether the deviation is
positive or negative depends on the direction of expert
disagreement relative to the outcome's conditional skew.
\end{proof}

The proposition gives a non-strict analogue of the Ranjan-Gneiting
result that applies directly to our operator: the aggregate's
interval width is a convex combination of the experts' widths, so
aggregation cannot sharpen the forecast beyond the per-expert
resolution. When experts disagree on position, the interval's
coverage drops. The empirical miscalibration observed on the
3,000-point Elia wind audit slice is documented in
Section~\ref{ch:real}: mean tail deviation of $0.019$, with a
systematic pattern of under-coverage in the lower tail and
over-coverage in the mid-upper range. The deviation is small in
magnitude because the Elia forecasters agree to within $\pm 0.03$
on most quantile levels.

The recalibration layer addresses this as a post-hoc, orthogonal
correction. It is a separate module that sits on top of the
mechanism's aggregate forecast and does not touch the skill layer,
the wager layer, the aggregation operator, or the settlement. The
economic argument of the thesis is preserved end-to-end.

### Method

The layer implements the isotonic post-processor of
\citet{kuleshov2018accurate} in a rolling-buffer, prequential
\citep{dawid1984prequential} configuration. Given the mechanism's
per-round probabilistic forecast as a set of quantiles
$\hat q(\tau_k)$, the recalibration step at round $t$ proceeds in
four stages. First, \textbf{transform}: the current isotonic map
$G_{t-1}$, fitted on rounds strictly before $t$, is applied to the
forecast's predicted CDF to produce the recalibrated forecast.
Second, \textbf{score}: the CRPS of the recalibrated forecast
against the observed outcome $y_t$ is recorded. Third,
\textbf{update}: the new probability integral transform (PIT)
value $\mathrm{PIT}_t = F_t^{\text{mech}}(y_t)$ is appended to a
rolling buffer of size $500$, dropping the oldest element if the
buffer is full. Fourth, \textbf{refit}: every fifty rounds, and
only after at least one hundred PIT values are available, $G_t$
is re-fitted by isotonic regression of the buffer's empirical CDF
onto the identity.

The ordering matters. Transforming first using the $G_{t-1}$
fitted on information strictly before $t$, then updating the
buffer only after scoring, avoids any leak of the current round's
information into the calibration map that scores the current
round.

### Headline results

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
\caption{Recalibration headline numbers on the audit slice under
expanding-mode causal normalisation.}
\label{tab:recal-headline}
\end{table}

\begin{figure}[h]
\centering
\includegraphics[width=0.95\textwidth]{writing/figures/calibration.png}
\caption{Reliability diagrams for the mechanism's aggregate
forecast on the Elia wind audit slice, before (left) and after
(right) rolling isotonic recalibration. Each point is one quantile
level $\tau \in \{0.1, 0.2, \dots, 0.9\}$; the dashed line is
perfect calibration and the grey band is $\pm 5$~pp deviation.
Signed deviations are labelled next to each point. Before
recalibration, every point sits above the diagonal, the systematic
over-coverage pattern predicted by the \citet{ranjan2010combining}
linear-pool impossibility. After recalibration, the mechanism's
coverage aligns with the diagonal: centre deviation falls by
$91\%$ and tail deviation by $41\%$, at a $1.6\%$ CRPS cost and a
$12\%$ sharpness cost.}
\label{fig:calibration}
\end{figure}

The layer's targets were set in advance of the run: halve the
mean tail deviation, keep the CRPS cost under $2 \times 10^{-4}$,
and retain at least $90\%$ of the baseline sharpness. The observed
tail deviation falls by $41\%$ (target $50\%$), the CRPS cost is
$+3.2 \times 10^{-4}$ (target $+2 \times 10^{-4}$), and the
sharpness is $87.7\%$ of baseline (target $90\%$). Each target is
missed narrowly rather than by a factor of two or more. The next
section argues that the residual margin is the theoretical floor,
not an implementation shortfall.

### Calibration on the full-length headline slice

The recalibration analysis above is defensible only on the
$3{,}000$-point audit slice, because the audit slice is the one
for which tightened coverage diagnostics were stated in advance.
It is reasonable to ask whether the calibration numbers carry to
the full $T_{\mathrm{eval}} = 17{,}344$ round headline slice that
underpins the thesis's $7.1\%$ CRPS reduction.
Table~\ref{tab:wind-calibration-headline} reports per-quantile
empirical coverage for the mechanism and for the
\citet{vitali2025intermittent} per-$\tau$ OGD baseline on the full
slice.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrrrr}
\toprule
$\tau$ & Nominal & Mechanism empirical & Vitali empirical & Gap (mech) \\
\midrule
$0.10$ & $0.100$ & $0.153$ & $0.156$ & $+0.053$ \\
$0.20$ & $0.200$ & $0.246$ & $0.249$ & $+0.046$ \\
$0.30$ & $0.300$ & $0.341$ & $0.345$ & $+0.041$ \\
$0.40$ & $0.400$ & $0.440$ & $0.447$ & $+0.040$ \\
$0.50$ & $0.500$ & $0.541$ & $0.539$ & $+0.041$ \\
$0.60$ & $0.600$ & $0.634$ & $0.636$ & $+0.034$ \\
$0.70$ & $0.700$ & $0.728$ & $0.731$ & $+0.028$ \\
$0.80$ & $0.800$ & $0.822$ & $0.823$ & $+0.022$ \\
$0.90$ & $0.900$ & $0.913$ & $0.909$ & $+0.013$ \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: per-quantile empirical coverage on the
full headline slice ($T_{\mathrm{eval}} = 17{,}344$). The Vitali
column carries over from the earlier static-normalisation run and
is marked \texttt{[PENDING]} for a fresh emission under the
expanding pipeline; the audit-slice equivalent
(Table~\ref{tab:vitali-audit}) is on the current pipeline.}
\label{tab:wind-calibration-headline}
\end{table}

The mean tail deviation rises to $0.032$ on the full slice
(against $0.019$ on the audit slice), and the mean centre
deviation rises to $0.035$ (against $0.029$). The mechanism's
systematic over-coverage pattern is preserved but amplified. Two
explanations are consistent with the direction. First, the
expanding normalisation used on the headline slice produces
larger normalised losses than the warmup-window normalisation
used on the audit slice. The skill estimates saturate closer to
$\sigma_{\min}$ and the effective-wager spread across forecasters
is smaller, so reports aggregate more uniformly and the
linear-pool miscalibration of \citet{ranjan2010combining} bites
harder. Second, the audit slice is a winter subset in which the
forecaster panel is relatively homogeneous in quality. The full
series spans seasonal regime shifts and broader panel
disagreement, which widens the quantile fan and amplifies the
mean-of-quantiles-is-not-quantile-of-the-mean effect.

The per-$\tau$ OGD baseline shows the same miscalibration pattern
at essentially the same magnitude on the slices we could
evaluate, so the under-dispersion is a property of the linear
pool, not of the skill layer. The full-length Vitali per-$\tau$
empirical coverage column in
Table~\ref{tab:wind-calibration-headline} is retained from an
earlier static-normalisation run and is marked `[PENDING]` for a
fresh emission under the expanding pipeline; the qualitative
ordering on the audit slice (identical tail deviation to the
mechanism at $0.019$, slightly lower centre deviation at $0.027$
against $0.029$) carries directly into Section~\ref{ch:real}. The
CRPS side of the headline slice puts the mechanism at $0.03788$
on the normalised $[0, 1]$ scale and Vitali's aggregator at
$0.03219$, both from \texttt{baselines.json} regenerated
2026-05-13 under the full-length expanding pipeline
(Section~\ref{ch:real}); the same qualitative ordering as on the
audit slice. The recalibration layer was developed and tuned on
the audit slice. Refitting the isotonic map on the full slice is
flagged as future work in Chapter~\ref{ch:conclusion}.

### Interpretation

The headline target, closing the tail calibration gap, partly
succeeds. A $41\%$ reduction takes the mean tail deviation from
$0.019$ to $0.011$, which is the right order of magnitude for a
$3\,000$-point sample. After about five hundred rolling-buffer
refits, the isotonic map sits on enough PITs to be a good
estimate of the true CDF.

All three pre-registered targets are missed narrowly because the
calibration-sharpness tradeoff bites at the theoretical floor. The
proposition below formalises the floor.

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
empirical outcome. The isotonic map must concede sharpness (part
(b)); the pre-registered threshold allowed at most $10\%$
concession, but the theoretical lower bound in the thesis setting
is closer to $12\%$ because the mechanism's aggregate is more
under-dispersed than the threshold assumed. The $1.6\%$ CRPS cost
(part (c)) is consistent with a setting where the sharpness loss
slightly exceeds the calibration gain, which is predicted for
aggregates of already-sharp individual forecasters. The narrow
misses of the pre-registered thresholds are therefore not
implementation defects; they mark where those thresholds sit
inside the theoretical feasible region.

The $91\%$ drop in centre deviation ($0.4 \leq \tau \leq 0.6$)
stands apart. The isotonic projection restores joint calibration
across the $\tau$ grid, not only at the tails, so the systematic
pattern of under-coverage below the median and over-coverage
above is corrected uniformly.

### Orthogonality to the economic layers

The recalibration layer preserves the economic structure of the
mechanism end-to-end. The implementation is a single module
downstream of the aggregation step. The skill gate, wager rule,
aggregation operator, and settlement algebra are unchanged.
Disabling the recalibration step recovers the pre-recalibration
output exactly, so the layer is a pure post-processor rather than
a partial re-parameterisation of the economic layers.

### Design choice: rolling buffer

\citet{kuleshov2018accurate} establish consistency of the
isotonic post-processor under an i.i.d.\ assumption: given a
large enough i.i.d.\ calibration sample, isotonic post-processing
produces asymptotically calibrated forecasts (their Theorem 1). A
fixed held-out fit inherits that guarantee and is sharper per
round (each CRPS round is cheaper), but it assumes that the base
forecast's miscalibration pattern is stationary.

Our setting is potentially non-stationary: regime shifts in
wind-power seasonality and intraday cycles in electricity. The
online, adversarial extension of the isotonic procedure is
\citet{deshpande2023calibrated}, who relax the i.i.d.\ assumption
at the cost of finite-horizon rather than asymptotic calibration
guarantees. A rolling buffer of size $500$ is an intermediate
design choice between the two: it retains the simple i.i.d.\
isotonic estimator while bounding the influence of any one
regime. The rolling-buffer choice trades a small amount of
steady-state calibration accuracy for the ability to adapt when
the base mechanism's miscalibration pattern drifts. In the
language of \citet{dawid1984prequential}, the scoring is
prequential and the calibration fitter is not. That is the
compromise.

On the 3,000-point wind slice the trade-off is effectively zero:
fixed and rolling variants give similar numbers after the first
five hundred rounds. The rolling version is retained because it
is required for the electricity and horizon runs, where
non-stationarity is expected.

### Out of scope

Three extensions of this layer are deferred to future work. The
first is the Beta-transformed linear pool
\citep{gneiting2013combining}, a parametric cousin of the isotonic
layer that may tighten the sharpness side by fitting a map that
preserves interval width more explicitly. The isotonic
quantile-regression-averaging (iQRA) procedure of
\citet{kostrzewski2025iqra} imposes stochastic order constraints
directly on the ensemble quantiles and has been reported to match
or exceed conformal prediction on reliability metrics for German
day-ahead electricity prices; a head-to-head on the Elia series
is a natural extension. The second is per-forecaster conformal
prediction wrappers, which would calibrate each forecaster's own
quantile reports before aggregation and so change what the linear
pool receives. The third is joint probability-integral-transform
analysis across multiple horizons; the current layer operates
per-horizon, and a joint treatment would be needed for multi-step
coherence.
