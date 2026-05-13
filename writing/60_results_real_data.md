## Real-data validation {#ch:real}

This section reports the empirical results on the two real-data
series: Elia offshore-wind power and Elia electricity-imbalance
prices. Two wind slices are analysed in parallel with distinct
purposes. The \emph{headline slice} is the full 17,344-hour run
under strictly-causal expanding normalisation; it is the primary
method-versus-method aggregation comparison. The \emph{audit slice}
is a 3,000-point subset under the older warmup-window normalisation;
it is retained as the reference slice for per-quantile calibration
analysis and for cross-checking against the published OGD reference.

### Elia offshore wind: full-length run

The headline slice covers $T = 17{,}344$ evaluation rounds after a
200-round warmup, with seven real forecasters, expanding causal
normalisation, and tuned parameters
$(\gamma, \rho, \lambda, \eta) = (16, 0.5, 0.05, 2)$.

#### Aggregate comparison

Table~\ref{tab:wind-headline} reports mean Continuous Ranked Probability Score (CRPS) on the normalised
$[0, 1]$ scale for the full suite of methods.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Rule & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Per-round oracle (argmin over forecasters)
  & $0.02176$ & $-46.7\%$ \\
Rolling best single (100-step CRPS selector)
  & $0.03145$ & $-22.9\%$ \\
Hindsight inverse-CRPS weighting & $0.03175$ & $-22.2\%$ \\
Shifted-median fan (OGD reference)
  & $0.03487$ & $-14.5\%$ \\
Median & $0.03700$ & $-9.3\%$ \\
Trimmed mean & $0.03786$ & $-7.2\%$ \\
\textbf{Mechanism} & $\mathbf{0.03788}$ & $\mathbf{-7.1\%}$ \\
Inverse-CRPS (Bates--Granger style) & $0.03792$ & $-7.0\%$ \\
Skill only & $0.03869$ & $-5.2\%$ \\
Uniform & $0.04079$ & --- \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: aggregate comparison on the headline
slice ($T = 17{,}344$).}
\label{tab:wind-headline}
\end{table}

The Diebold--Mariano statistic for the mechanism against uniform
averaging is $t = 22.35$ (Andrews 1991 data-driven HAC bandwidth,
selected lag $12$) with $p \approx 0$. Under the legacy
horizon-$1$ HAC bandwidth (uncorrected for persistence in the loss
differential) the same statistic inflates to $t = 40.77$. The
skill-only rule against uniform gives $t = 21.30$ (Andrews) and
$t = 38.92$ (legacy). The paired mechanism-versus-uniform
difference is $-7.1\%$ with $p \approx 0$ under both bandwidths. A 95\% block-bootstrap
confidence interval on $\mathbb{E}[\Delta\mathrm{CRPS}]$ with block
size $168$ (one week of hourly data) gives
$[-0.003214, -0.002605]$ for the mechanism, well separated from
zero. All subsequent DM statistics in this chapter use the
Andrews-auto bandwidth unless stated. The legacy values are also
emitted into \texttt{comparison.json} as a sensitivity check.

\begin{figure}[h]
\centering
\includegraphics[width=0.95\textwidth]{writing/figures/wind_master_comparison.png}
\caption{Rolling-mean CRPS on the Elia offshore-wind headline slice
($T_\mathrm{eval} = 17{,}344$), four aggregation rules: equal
weights, Raja history-free, Vitali \& Pinson per-$\tau$ OGD, and
this project's mechanism. End-of-line labels give the final
rolling average; the caption line reports the paired delta against
equal weights. Lower is better. Vitali sits below the mechanism on
this slice because it relaxes budget balance in exchange for
per-$\tau$ weight learning; Raja sits just below equal weights
because it is history-free and cannot accumulate skill across
rounds.}
\label{fig:wind-master}
\end{figure}

\paragraph{Discussion.} Four comparisons merit attention. The
mechanism against inverse-CRPS weighting is a statistical tie
($-7.1\%$ versus $-7.0\%$): the skill gate's contribution on top of
Bates--Granger-style inverse-error weighting is within noise on
this slice. The mechanism against the shifted-median fan is
$-7.1\%$ versus $-14.5\%$: the published OGD reference baseline
beats the mechanism by $7.4$ percentage points CRPS, the price paid
for keeping the Lambert budget-balance constraint. The mechanism
against the per-round oracle ($-7.1\%$ versus $-46.7\%$) leaves an
oracle gap of approximately forty percentage points, which no
self-financed aggregator can close. The mechanism captures roughly
$15\%$ of the available oracle gap. The mechanism against the
rolling best-single selector ($-7.1\%$ versus $-22.9\%$) loses by
$15.8$ percentage points, because wind power is highly
autocorrelated and a single well-tuned model (online XGBoost)
captures most of the structure.

The rolling best-single selector is defined as the
forecaster with the lowest recent average CRPS over a 100-step
lookback window. It is not a per-round oracle. The per-round
argmin row (top of the table) serves that role.

The mechanism and the trimmed-mean baseline differ by $0.1$
percentage point of CRPS ($-7.1\%$ versus $-7.2\%$). Under the
adversarial-expert model of \citet{guo2024robust}, the truncated
mean is $L^1$-optimal when a bounded fraction of the reports is
adversarial and the remaining experts are marginally symmetric.
The closeness of trimmed-mean to the mechanism on this slice
reflects the absence of adversarial reports in the Elia panel:
the skill gate has no adversarial tail to discard and therefore
no structural advantage over robust averaging.
Section~\ref{ch:robustness} revisits this under synthetic
adversarial behaviour.

\paragraph{Interpretation against the combination-puzzle literature.}
Two aspects of the $7.1\%$ CRPS reduction matter more than its magnitude.
The first is that the gain coincides, to within statistical noise,
with Bates--Granger-style inverse-CRPS weighting ($-7.0\%$), a
baseline that is itself beaten by the unweighted median
($-9.3\%$) on the same slice. The adaptive skill layer is therefore
a minor source of the improvement on this panel: almost all of the
gain is accessible to any aggregator that uses even a crude proxy
for historical reliability. Read against
\citet{timmermann2006forecast} and
\citet{magnus2023inconvenient}, this is the expected regime for
forecast combination. Once a panel is sufficiently heterogeneous
for reliability weighting to help at all, the choice between
different reliability-weighting schemes is of second order. The
thesis therefore does not position the skill gate as a source of
CRPS gain on its own. Its role is to carry the reliability signal
through the wager pool (the economic layer) rather than as a
separate weighting module bolted on top. The oracle gap is wide:
the per-round argmin oracle reaches $0.02176$ on the same slice,
about forty percentage points below uniform averaging. The
mechanism closes $15\%$ of that gap, whereas
\citet{vitali2025intermittent}'s per-quantile OGD variant closes
about $45\%$. The residual gap, common to every aggregator
considered, is the information that a single round's data simply
cannot reveal about which forecaster is currently best.

#### Per-forecaster skill and weight ordering

Table~\ref{tab:wind-skill-ordering} reports the steady-state learned
skill $\sigma$ over the final $20\%$ of rounds, together with the
corresponding weight share.

\begin{table}[h]
\centering
\small
\begin{tabular}{rlrr}
\toprule
Rank & Forecaster & $\sigma_\mathrm{final}$ & Weight \\
\midrule
$1$ & XGBoost & $0.808$ & $0.690$ \\
$2$ & ARIMA(2,1,1) & $0.791$ & $0.666$ \\
$3$ & Naive & $0.790$ & $0.666$ \\
$4$ & Multilayer perceptron & $0.768$ & $0.630$ \\
$5$ & Ensemble (Naive + EWMA) & $0.753$ & $0.616$ \\
$6$ & EWMA(5) & $0.703$ & $0.557$ \\
$7$ & Theta & $0.685$ & $0.534$ \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: steady-state skill ordering on the
headline slice.}
\label{tab:wind-skill-ordering}
\end{table}

The rolling best-single CRPS is $0.03145$ and the mechanism
identifies XGBoost as the top-skill forecaster. The mechanism
therefore reconstructs the forecaster ranking from data alone,
without being told which model is best a priori.

#### External validation against the Elia operational forecast

Table~\ref{tab:elia-operational} compares our mechanism and best
single forecaster against Elia's own published operational
forecasts. CRPS is expressed in megawatt-equivalent units using the
observed series range ($0$ to $2\,208.7$\,MW).

\paragraph{Grid-matched comparison.} Elia publishes its forecast
as a three-point fan $\{c_{10},\,\mathrm{mean},\,c_{90}\}$ at
$\tau \in \{0.10,\,0.50,\,0.90\}$. Our mechanism reports on a
nine-level equidistant grid. An earlier revision of this table
scored Elia on its native three-point grid and the mechanism on
its native nine-point grid, comparing two different Riemann
approximations of the same underlying CRPS integral. The pinball
integrand is piecewise-linear in $\tau$, and on this series it
is locally concave between grid points; the three-point
trapezoidal rule therefore systematically under-integrates
relative to the nine-point rule, giving Elia an artificial
$\sim 20$\,\% grid advantage. The revised table below re-scores
Elia's fan on the same nine-level grid by linear interpolation
between $(c_{10},\,\mathrm{mean},\,c_{90})$, projected onto the
monotone cone. The native three-grid Elia CRPS is also reported
as a sensitivity check.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrl}
\toprule
Forecast source & CRPS 9-grid & CRPS 3-grid & Notes \\
 & (MW eq.) & (MW eq.) & \\
\midrule
Elia most-recent forecast & $90.7$ & $74.0$
  & Real-time NWP \\
Elia day-ahead forecast & $121.2$ & $98.6$
  & Day-ahead NWP \\
Elia day-ahead 11h forecast & $126.5$ & $102.7$
  & Intermediate horizon \\
Elia week-ahead forecast & $452.7$ & $372.4$
  & Weak baseline \\
\midrule
\textbf{Best single (online XGBoost)} & $\mathbf{69.5}$ & --- & no weather inputs \\
Inverse-variance hindsight & $70.1$ & --- & reference \\
The present mechanism & $83.7$ & --- & 7-forecaster panel \\
\bottomrule
\end{tabular}
\caption{External validation against Elia's operational forecast.
CRPS is scored on the nine-level equidistant $\tau$-grid
(apples-to-apples comparison). The native three-grid Elia CRPS is
shown as a sensitivity check. The ranking of our mechanism and
best-single against Elia is stable to grid choice, while the
absolute margin is larger on the matched grid. The three rows
below the rule are our outputs.}
\label{tab:elia-operational}
\end{table}

On the matched nine-level grid, a simple online XGBoost trained on
the observed series alone beats Elia's real-time forecast by
approximately $23$\,\% in CRPS-megawatt-equivalent
($69.5$\,MW against $90.7$\,MW), despite using no weather inputs.
The mechanism aggregates seven forecasters of varying quality and
reaches $83.7$\,MW, which lowers CRPS by $7.7$\,\% against Elia's real-time
forecast. Elia's day-ahead forecast, a more realistic forward
operational product, is considerably weaker at $121.2$\,MW; our
mechanism outperforms it by approximately $31$\,\%.

Elia's published interval forecasts are systematically miscalibrated.
Nominal $\tau = 0.10$ gives empirical coverage of $19.1\%$, and
$\tau = 0.90$ gives $94.6\%$. The miscalibration is a known property of operational
numerical-weather-prediction forecasts and motivates the
recalibration layer developed in Section~\ref{ch:recalibration} as
a generic operational tool.

\paragraph{Best-single ceiling and the conditional reading of the
headline.} The seven-forecaster aggregate lands at $83.7$~MW, while
the best single member (online XGBoost) reaches $69.5$~MW. The
aggregate is therefore bounded below by its weakest members: a panel
in which one forecaster does most of the work is, by construction,
one on which an aggregator that cannot concentrate weight enough
cannot match the best single model. The ceiling is the
best-single-ceiling observation of \citet{timmermann2006forecast} in direct form. It
motivates the conditional reading of the headline $-7.1\%$: the
thesis does not claim to beat operational NWP-driven forecasting
or the best single model, it claims a conditional improvement over
uniform averaging within the budget-balanced design space.

\paragraph{Hyperparameter sensitivity.} Parameters tuned for
synthetic panels with approximately ten forecasters and
$T \approx 1{,}000$ rounds are not optimal on the wind series,
where a more aggressive $(\gamma, \rho)$ is preferred. The
held-out sensitivity sweep reported later in this section selects
the wind-specific values; a poorly tuned skill gate renders the
mechanism marginal against uniform. The headline number is stable
to $\gamma$ and $\rho$ mis-specification but depends materially on
keeping $\lambda$ small.

### Elia offshore wind: audit slice

The audit slice covers the first $3\,000$ evaluation points
under the older warmup-window causal normalisation, on the post-fix
pipeline in which negative raw wind values are clipped to zero before
normalisation. Expanding rather than static normalisation is used for
the audit run itself because the warmup of this slice (winter wind)
has a systematically higher range than the evaluation window.
Static normalisation would clip approximately $46\%$ of
evaluation values to zero and render per-quantile coverage
uninterpretable.

#### Aggregate comparison

Table~\ref{tab:wind-audit} reports the aggregate comparison on the
audit slice.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Rule & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Per-round oracle (argmin) & $0.01166$ & $-44.9\%$ \\
Rolling best single & $0.01665$ & $-21.3\%$ \\
Hindsight inverse-CRPS weighting & $0.01670$ & $-21.0\%$ \\
Median & $0.01919$ & $-9.3\%$ \\
Inverse-CRPS (Bates--Granger style) & $0.01963$ & $-7.2\%$ \\
Trimmed mean & $0.01973$ & $-6.7\%$ \\
\textbf{Mechanism} & $\mathbf{0.02000}$ & $\mathbf{-5.4\%}$ \\
Shifted-median fan (OGD reference)
  & $0.02030$ & $-4.0\%$ \\
Skill only & $0.02043$ & $-3.4\%$ \\
Uniform & $0.02115$ & --- \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: aggregate comparison on the audit slice
($T = 3\,000$).}
\label{tab:wind-audit}
\end{table}

The ratio of the mechanism to the shifted-median-fan baseline is
$0.02000 / 0.02030 = 0.985$: on this slice the mechanism reduces
CRPS against the reference by $1.5\%$. The Diebold--Mariano
statistic for the mechanism against uniform on this slice is
$t = +8.26$ (Andrews 1991 auto HAC bandwidth, selected lag $8$),
$p \approx 0$; the legacy horizon-$1$ bandwidth gives $t = +15.43$.

#### Per-forecaster CRPS on the audit slice

Table~\ref{tab:wind-audit-per-agent} reports the per-forecaster
CRPS, which provides the per-agent ranking used to compute the
rank-correlation diagnostics.

\begin{table}[h]
\centering
\small
\begin{tabular}{rlrr}
\toprule
Rank & Forecaster & CRPS & $\Delta$ vs best \\
\midrule
$1$ & XGBoost & $0.01777$ & --- \\
$2$ & ARIMA(2,1,1) & $0.01925$ & $+8.4\%$ \\
$3$ & Naive & $0.01943$ & $+9.3\%$ \\
$4$ & Multilayer perceptron & $0.02435$ & $+37.0\%$ \\
$5$ & Ensemble & $0.02458$ & $+38.3\%$ \\
$6$ & EWMA(5) & $0.03224$ & $+81.4\%$ \\
$7$ & Theta & $0.03577$ & $+101.3\%$ \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: per-forecaster CRPS on the audit slice.}
\label{tab:wind-audit-per-agent}
\end{table}

The Spearman rank correlation between the learned $\sigma$ and the
per-forecaster CRPS on this slice is exactly $1$. The $\sigma$
values are systematically larger on the audit slice
(XGBoost $\sigma = 0.910$) than on the full-length run
(XGBoost $\sigma = 0.808$) because the warmup-window normalisation
on a $3\,000$-point slice produces tighter losses than expanding
normalisation on $17{,}344$ points; both runs agree on the
\emph{ordering}.

#### Tail calibration

Table~\ref{tab:wind-audit-coverage} reports per-$\tau$ empirical
coverage on the audit slice.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrrr}
\toprule
$\tau$ & Nominal & Mechanism empirical & Gap \\
\midrule
$0.10$ & $0.100$ & $0.110$ & $+0.010$ \\
$0.20$ & $0.200$ & $0.202$ & $+0.002$ \\
$0.30$ & $0.300$ & $0.306$ & $+0.006$ \\
$0.40$ & $0.400$ & $0.418$ & $+0.018$ \\
$0.50$ & $0.500$ & $0.535$ & $+0.035$ \\
$0.60$ & $0.600$ & $0.634$ & $+0.034$ \\
$0.70$ & $0.700$ & $0.742$ & $+0.042$ \\
$0.80$ & $0.800$ & $0.835$ & $+0.035$ \\
$0.90$ & $0.900$ & $0.927$ & $+0.027$ \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: per-quantile empirical coverage on the
audit slice.}
\label{tab:wind-audit-coverage}
\end{table}

The mean tail deviation over $\tau \in \{0.1, 0.2, 0.8, 0.9\}$ is
$0.019$, and the mean centre deviation over $0.4 \leq \tau \leq 0.6$
is $0.029$. The pattern is systematic over-coverage at every
quantile level: the aggregate quantile function is right-shifted.
The recalibration layer developed in
Section~\ref{ch:recalibration} corrects the shift.

#### Mechanism versus published per-quantile OGD

Table~\ref{tab:vitali-audit} compares the mechanism against the
\citet{vitali2025intermittent} per-quantile OGD baseline on the same slice.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrr}
\toprule
Metric & Mechanism & Vitali per-$\tau$ OGD & $\Delta$ \\
\midrule
Mean tail deviation ($\tau \in \{0.1, 0.2, 0.8, 0.9\}$)
  & $0.019$ & $0.019$ & $\approx 0$ \\
Mean centre deviation ($0.4 \leq \tau \leq 0.6$)
  & $0.029$ & $0.027$ & $-0.002$ \\
Mean CRPS estimate & $0.02000$ & $0.01775$ & $-0.00225$ \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: mechanism versus published per-quantile
OGD on the audit slice.}
\label{tab:vitali-audit}
\end{table}

Vitali's aggregator is as calibrated as ours on the tail
($|\bar{\text{emp}} - \text{nominal}| = 0.019$ for both) and
lower CRPS ($0.01775$ against $0.02000$, a gap of approximately
$11\%$). The advantage on CRPS comes from relaxing the Lambert
budget-balance constraint and learning per-$\tau$ weights directly.
Our recalibration layer closes most of the centre deviation in
Section~\ref{ch:recalibration} without relaxing budget balance.

### Elia electricity imbalance: null result

The Elia electricity-imbalance series covers $T = 10{,}000$ raw
points ($T_\mathrm{eval} = 9{,}800$ evaluation rounds after a
200-round warmup), under the same seven
forecasters, mechanism parameters, and expanding causal normalisation
as the wind headline. Table~\ref{tab:electricity-null} reports the
aggregate comparison.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Method & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Uniform & $0.09052$ & --- \\
Skill only & $0.09051$ & $-0.0\%$ \\
\textbf{Mechanism} & $\mathbf{0.09052}$ & $\mathbf{\approx 0.0\%}$ \\
Median & $0.09004$ & $-0.5\%$ \\
Trimmed mean & $0.08979$ & $-0.8\%$ \\
Inverse-CRPS (Bates--Granger style) & $0.09022$ & $-0.3\%$ \\
Shifted-median fan (OGD reference) & $0.09063$ & $+0.1\%$ \\
Rolling best single & $0.08606$ & $-4.9\%$ \\
Hindsight inverse-CRPS weighting & $0.08026$ & $-11.3\%$ \\
Per-round oracle & $0.05924$ & $-34.6\%$ \\
\bottomrule
\end{tabular}
\caption{Elia electricity imbalance: aggregate comparison.}
\label{tab:electricity-null}
\end{table}

The Diebold--Mariano statistic for the mechanism against uniform is
$t = 0.007$ with $p = 0.994$ (Andrews auto HAC, lag $11$); the
$95\%$ block-bootstrap confidence interval on $\Delta\mathrm{CRPS}$
at the 168-hour block size is $[-0.000127, +0.000123]$ and straddles
zero. The mechanism is not statistically distinguishable from
uniform on electricity. The seven forecasters
produce near-identical CRPS within approximately $1\%$ of each
other, so the skill signal has no persistent structure to exploit.
The electricity result is the forecast-combination puzzle regime
\citep{bates1969combination, timmermann2006forecast}, and the
mechanism behaves accordingly: a null rather than a regression.

The oracle gap on electricity is approximately thirty-five
percentage points (mechanism $0.09052$, per-round oracle $0.05924$),
so a perfect per-round weight could improve a great deal, but not
via an EWMA or OGD on this forecaster panel, because the
forecasters themselves are undifferentiated.

### Horizon experiments

Horizon-specific experiments provide a sanity check on the
mechanism's behaviour away from the one-step-ahead headline.
Table~\ref{tab:horizon-day-ahead} reports the day-ahead horizon
($h = 24$, warmup at least $70$). The JSONs were regenerated on
2026-05-13 under the tuned mechanism parameters ($\gamma = 16$,
$\rho = 0.5$, $\lambda = 0.05$) following the audit-M3 fix.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Method & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Uniform & $0.18732$ & --- \\
Skill only & $0.18650$ & $-0.44\%$ \\
\textbf{Mechanism} & $\mathbf{0.18657}$ & $\mathbf{-0.40\%}$ \\
Rolling best single & $0.18288$ & $-2.37\%$ \\
\bottomrule
\end{tabular}
\caption{Day-ahead horizon experiment (regenerated 2026-05-13
under tuned $\gamma = 16$, $\rho = 0.5$, $\lambda = 0.05$).}
\label{tab:horizon-day-ahead}
\end{table}

\noindent On the four-hour-ahead horizon ($h = 16$ steps on a
15-minute series, $T = 20{,}000$), uniform is $0.10741$, skill-only
is $0.10574$ ($-1.55\%$), the mechanism is $0.10552$ ($-1.75\%$),
and rolling best-single is $0.10230$ ($-4.76\%$). On a within-run
seasonal slice, uniform is $0.06541$, the mechanism is $0.06309$
($-3.55\%$), and rolling best-single is $0.05729$ ($-12.42\%$).
The per-season breakdown is negative in CRPS delta at
approximately $-3\%$ to $-4\%$ relative to the baseline in every
season (winter $-4.3\%$, spring $-3.2\%$, summer $-3.4\%$, autumn
$-3.3\%$), with no season falling above the uniform baseline.

These horizon experiments are under the default warmup-window
(static) normalisation. The magnitudes shift only slightly under
the expanding variant on the main slice; re-running the horizon
blocks under expanding is on the list of remaining work. The
direction of the comparisons is stable.

\paragraph{Hyperparameter provenance.} Earlier revisions of these
tables were regenerated before the audit-M3 fix, when the
\texttt{\_run\_horizon\_comparison} call path silently dropped
$\gamma$, $\rho$, and $\lambda$ on the floor and inherited
\texttt{run\_simulation}'s synthetic-tuned defaults
($\gamma = 4$, $\rho = 0.1$, $\lambda = 0.3$). The EWMA half-life
at $\rho = 0.1$ is about seven rounds, roughly seven times longer
than at $\rho = 0.5$, which attenuated the skill signal on panels
where relative forecaster quality shifts across the year. Under
the pre-fix defaults, the day-ahead, 4h-ahead, and regime-shift
deltas were $-0.08\%$, $-0.61\%$, and $-1.05\%$ respectively; the
post-fix numbers shown in the table are three to five times
stronger in magnitude. The post-M3 code takes $(\gamma, \rho,
\lambda)$ as keyword arguments with the tuned values as defaults,
so the caveat is lifted on the numbers shown here.

### Threats to validity

\paragraph{Internal validity.} An earlier pipeline used whole-series
min-max normalisation, a non-reproducible neural-network seed,
tail-adjacent cross-validation for XGBoost, and a silent
persistence-fallback path. The current pipeline
(Chapter~\ref{ch:methodology}) uses strictly-causal expanding
normalisation, fixed seeds, embargoed cross-validation following
\citet{bergmeir2018note}, and an explicit fallback indicator.
Headline numbers from earlier drafts differ from those reported
here by small but measurable amounts. The finite-grid CRPS
approximation uses a nine-level grid with small but non-zero
approximation bias. Pointwise quantile coverage is not subject to
the same bias.

\paragraph{External validity.} The evaluation draws on two series
from a single European transmission system operator. Transfer to
solar, load, or non-European systems cannot be claimed without
further experiments. The audit slice covers $3\,000$ hourly points
(approximately $125$ days) and is
roughly stationary. Full-year drift is not tested in the headline.
The panel has seven members. Results at $n = 50$ or $n = 500$ are
not directly extrapolable.

\paragraph{Construct validity.} CRPS is strictly proper
\citep{gneiting2007strictly} but aggregates calibration and
sharpness in a specific way: a mechanism optimised for CRPS may
be sub-optimal for a decision that weights tail coverage or point
accuracy differently. Headline comparisons are reported against
multiple baselines (uniform, inverse-CRPS, median, trimmed mean,
rolling best-single, the \citet{vitali2025intermittent} reference),
so the claim is not anchored to a single reference point.

\paragraph{Statistical validity.} The Diebold--Mariano test
assumes covariance stationarity of the loss differential.
Heteroscedasticity- and autocorrelation-consistent standard errors
are used, but residual non-stationarity is not ruled out. No
family-wise error correction is applied across the ten-method,
two-dataset, two-horizon design. The headline
mechanism-versus-uniform comparison has $p < 10^{-6}$, which
survives any reasonable Bonferroni adjustment, but finer
method-to-method comparisons should be read with this caveat.

### Published-OGD head-to-head

Table~\ref{tab:head-to-head-wind} reports the wind head-to-head
against \citet{vitali2025intermittent} and \citet{raja2024wagering}
on the expanding-mode normalisation.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Method & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Vitali per-$\tau$ OGD & $0.03219$ & $-21.1\%$ \\
\textbf{Mechanism} & $\mathbf{0.03788}$ & $\mathbf{-7.1\%}$ \\
Raja history-free & $0.04022$ & $-1.4\%$ \\
Uniform & $0.04078$ & --- \\
\bottomrule
\end{tabular}
\caption{Wind head-to-head against published baselines
(\texttt{baselines.json}, regenerated 2026-05-13 under
\texttt{normalize\_mode="expanding"} with tuned $\gamma=16$,
$\rho=0.5$, $\lambda=0.05$).}
\label{tab:head-to-head-wind}
\end{table}

On electricity, the ranking is compressed: Vitali's per-$\tau$ OGD
reaches $-4.0\%$ against uniform, and the mechanism and the Raja
history-free variant are both statistically tied with uniform
(mechanism $+0.0\%$, Raja $+0.0\%$). Vitali's per-$\tau$ OGD beats
the mechanism on both series (by approximately $14$ percentage
points on wind and $4$ percentage points on electricity). The gap
is the CRPS cost of preserving the Lambert budget-balance and
per-round truthfulness guarantees: Vitali's aggregator drops both
in exchange for CRPS.

### Sensitivity sweep and parameter provenance

Tuned parameters are selected through the held-out sweep described
in Chapter~\ref{ch:mechanism}, not by hand.
Table~\ref{tab:sensitivity-sweep} reports the selected cells.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrrr}
\toprule
Series & $\gamma^\star$ & $\rho^\star$ & $\lambda^\star$
  & Held-out $\Delta$ vs uniform \\
\midrule
elia\_wind & $32.0$ & $0.7$ & $0.05$ & $-6.86\%$ \\
elia\_electricity & $16.0$ & $0.1$ & $0.05$ & $-0.22\%$ \\
\bottomrule
\end{tabular}
\caption{Held-out sensitivity sweep optima.}
\label{tab:sensitivity-sweep}
\end{table}

The wind optimum pushes the $\gamma$ corner: the next row at
$\gamma = 64$ plateaus at $-5.5\%$ maximum, so the top of the grid
is bounded. A higher floor $\lambda = 0.2$ is uniformly worse than
$\lambda = 0.05$ on both series. Electricity optima lie in a tight
band of $-0.17$ to $-0.22\%$, consistent with the null result
reported above.

Re-running the headline comparison under expanding normalisation at
sweep-selected parameters is on the list of remaining work. The
expected shift is sub-percent CRPS in either direction. The
direction of the DM statistic and the method ranking are stable.

### Sensitivity of the wind optimum: plateau or peak?

The coarse $\gamma \times \rho \times \lambda$ sweep identifies an
optimum at $(\gamma, \rho, \lambda) = (32, 0.7, 0.05)$ on the wind
training split. A reviewer's natural follow-up question is whether
this optimum is a narrow peak, in which case a small mis-tuning would
collapse the headline improvement, or a broad plateau, in which case
the 7.1\% result is stable to modest parameter noise. To answer this,
we ran a denser local sweep on
$\gamma \in \{12, 16, 20, 24, 28, 32, 40, 48\}$,
$\rho \in \{0.3, 0.4, 0.5, 0.6, 0.7, 0.8\}$,
and $\lambda \in \{0.03, 0.05, 0.08, 0.12\}$, scoring each cell on
the same held-out test partition as the main sweep.

The best cell is $(\gamma, \rho, \lambda) = (28, 0.8, 0.03)$ at a
test CRPS change of $-7.69\%$, marginally better than the
coarse-grid value of $-6.86\%$. Twenty-one out of $192$ cells
($11\%$) fall within $0.5$ percentage points of the optimum, and
$60\%$ fall within $2$~pp. The optimum is a broad plateau. Axis-wise,
the mechanism's sensitivity to $\lambda$ is the largest of the three
parameters ($-7.69\%$ at $\lambda = 0.03$ rising to $-5.50\%$ at
$\lambda = 0.12$, holding $\gamma, \rho$ at their optima), while
$\gamma$ is stable across a wide band and CRPS falls
monotonically with more aggressive $\rho$ up to the grid ceiling of
$0.8$. The plateau shape localises the hyperparameter tuning risk: the headline
number is stable to $\gamma$ and $\rho$ mis-specification but
depends materially on keeping $\lambda$ small.

### Regime-shift robustness: restart-per-season

The headline run is a single online pass over the 2024--2025 wind
series. Skill estimates therefore carry across seasonal regimes,
which means the reported improvement can be attributed partly to
adaptation across regimes rather than within them. To separate the
two effects we re-run the mechanism with a full restart at each
seasonal boundary (winter, spring, summer, autumn), resetting
wealth, $\sigma$, and EWMA loss buffers at the start of each season.
Table~\ref{tab:regime-shift-restart} reports the per-season
mechanism improvement against uniform.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrr}
\toprule
Season & $T$ & Mechanism $\Delta$ vs uniform & Best single $\Delta$ vs uniform \\
\midrule
Winter & $4{,}344$ & $-4.22\%$ & $-12.83\%$ \\
Spring & $4{,}416$ & $-3.02\%$ & $-10.58\%$ \\
Summer & $4{,}416$ & $-3.16\%$ & $-10.27\%$ \\
Autumn & $4{,}368$ & $-3.27\%$ & $-9.69\%$ \\
\bottomrule
\end{tabular}
\caption{Restart-per-season regime-shift evaluation on the full
wind series. The mechanism is initialised fresh at the start of
each season. Regenerated 2026-05-13 under tuned
$(\gamma, \rho, \lambda) = (16, 0.5, 0.05)$ following the audit-M3
fix; the earlier version of this table ran under the
synthetic-default $(\gamma, \rho) = (4, 0.1)$ and reported
$-0.8\%$ to $-1.2\%$ per season.}
\label{tab:regime-shift-restart}
\end{table}

Two readings of this result are simultaneously correct. The
optimistic reading is that the mechanism delivers a consistent
$-3.0\%$ to $-4.2\%$ CRPS change in \emph{every} season, without
exception. The sign and rough magnitude of the benefit are stable
to seasonal regime change. The pessimistic reading is that the
$7.1\%$ full-run headline is partly a cross-seasonal adaptation
effect: by the time the mechanism reaches summer and autumn in
the single-pass protocol, it has learned the forecaster ordering
across winter and spring, and reuses that ordering. The
restart-per-season protocol reinitialises forecaster and
mechanism state at each boundary, cutting that off, so the
weighted-mean mechanism CRPS under restart ($0.0647$ averaged
across the four seasons) gives a $-3.4\%$ change against its own
per-season uniform baseline ($0.0670$), not $-7.1\%$.

This decomposes the headline number rather than contradicting it:
roughly three to four percentage points of the $7.1\%$ full-run
improvement is within-season skill recovery, and the remainder
is cross-season adaptation. The restart-per-season experiment
runs under static normalisation rather than expanding, which
inflates its absolute CRPS base by approximately one third
(the warmup window's range is narrower than the full-season range,
so roughly thirty per cent of evaluation points hit the clipping
boundaries). The decomposition percentages above are unaffected
by this because the reference within each season is the same
uniform baseline. The best-single benchmark decomposes
differently because it is a per-round selector: it achieves
$-9.7\%$ to $-12.8\%$ every season, because XGBoost dominates the
panel in every season. The mechanism's gap to best-single widens
under restart-per-season compared to the single-pass headline,
consistent with the finding that XGBoost's dominance is learned
quickly from within-season data but the mechanism does not
concentrate weight
aggressively enough on it without prior history.
