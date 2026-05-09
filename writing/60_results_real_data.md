# Real-data results {#ch:real}

This chapter reports the empirical results on the two real-data
series: Elia offshore-wind power and Elia electricity-imbalance
prices. Two wind slices are analysed in parallel with distinct
purposes. The \emph{headline slice} is the full 17,344-hour run
under strictly-causal expanding normalisation; it is the primary
method-versus-method aggregation comparison. The \emph{audit slice}
is a 3,000-point subset under the older warmup-window normalisation;
it is retained as the reference slice for per-quantile calibration
analysis and for cross-checking against the published OGD reference.

## Elia offshore wind: full-length run

The headline slice covers $T = 17{,}344$ evaluation rounds after a
200-round warmup, with seven real forecasters, expanding causal
normalisation, and tuned parameters
$(\gamma, \rho, \lambda, \eta) = (16, 0.5, 0.05, 2)$.

### Aggregate comparison

Table~\ref{tab:wind-headline} reports mean CRPS on the normalised
$[0, 1]$ scale for the full suite of methods.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Rule & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Per-round inverse-variance oracle (hindsight)
  & $0.02176$ & $-46.7\%$ \\
Rolling best single (100-step CRPS selector)
  & $0.03145$ & $-22.9\%$ \\
Inverse-variance hindsight & $0.03175$ & $-22.2\%$ \\
Shifted-median fan (OGD reference)
  & $0.03487$ & $-14.5\%$ \\
Median & $0.03700$ & $-9.3\%$ \\
Trimmed mean & $0.03786$ & $-7.2\%$ \\
\textbf{Mechanism} & $\mathbf{0.03788}$ & $\mathbf{-7.1\%}$ \\
Inverse variance & $0.03792$ & $-7.0\%$ \\
Skill only & $0.03869$ & $-5.2\%$ \\
Uniform & $0.04079$ & --- \\
\bottomrule
\end{tabular}
\caption{Elia offshore wind: aggregate comparison on the headline
slice ($T = 17{,}344$).}
\label{tab:wind-headline}
\end{table}

The Diebold--Mariano statistic for the mechanism against uniform
averaging is $t = 40.77$ with $p \approx 0$. The skill-only rule
against uniform gives $t = 38.92$ and $p \approx 0$. The paired
mechanism-versus-uniform improvement is large and statistically
significant at any reasonable threshold.

\begin{figure}[h]
\centering
\includegraphics[width=0.95\textwidth]{writing/figures/wind_master_comparison.png}
\caption{Mean CRPS for ten aggregation rules on the full-length
Elia offshore-wind headline slice ($T = 17{,}344$). The mechanism
reduces CRPS by $7.1\%$ against uniform averaging; the
inverse-variance hindsight, rolling best-single, and shifted-median
fan baselines delimit the region accessible to self-financed
aggregators.}
\label{fig:wind-master}
\end{figure}

\paragraph{Discussion.} Four comparisons merit attention. The
mechanism against inverse-variance weighting is a statistical tie
($-7.1\%$ versus $-7.0\%$): the skill gate's contribution on top of
Bates--Granger-style inverse-variance weighting is within noise on
this slice. The mechanism against the shifted-median fan is
$-7.1\%$ versus $-14.5\%$: the published OGD reference baseline
beats the mechanism by $7.4$ percentage points CRPS, the price paid
for keeping the Lambert budget-balance constraint. The mechanism
against the oracle ($-7.1\%$ versus $-46.7\%$) leaves an oracle gap
of approximately forty percentage points, which no self-financed
aggregator can close; the mechanism captures roughly $15\%$ of the
available oracle gap. The mechanism against the rolling best-single
selector ($-7.1\%$ versus $-22.9\%$) loses by $15.8$ percentage
points, because wind power is highly autocorrelated and a single
well-tuned model (online XGBoost) captures most of the structure.

Note that the rolling best-single selector is defined as the
forecaster with the lowest recent average CRPS over a 100-step
lookback window. It is not a per-round oracle; the per-round
hindsight row (top of the table) serves that role.

The mechanism and the trimmed-mean baseline differ by $0.1$
percentage point of CRPS ($-7.1\%$ versus $-7.2\%$). Under the
adversarial-expert model of \citet{guo2024robust}, the truncated
mean is $L^1$-optimal when a bounded fraction of the reports is
adversarial and the remaining experts are marginally symmetric;
the closeness of trimmed-mean to the mechanism on this slice
reflects the absence of adversarial reports in the Elia panel ---
the skill gate has no adversarial tail to discard and therefore
no structural advantage over robust averaging. Chapter 8 revisits
this under synthetic adversarial behaviour.

### Per-forecaster skill and weight ordering

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

### External validation against the Elia operational forecast

Table~\ref{tab:elia-operational} compares our mechanism and best
single forecaster against Elia's own published operational
forecasts. CRPS is expressed in megawatt-equivalent units using the
observed series range ($0$ to $2\,208.7$\,MW).

\begin{table}[h]
\centering
\small
\begin{tabular}{lrp{5cm}}
\toprule
Forecast source & CRPS (MW eq.) & Notes \\
\midrule
Elia most-recent forecast & $74.0$
  & Elia's real-time NWP-driven forecast \\
Elia day-ahead forecast & $98.6$
  & Elia's day-ahead NWP-driven forecast \\
Elia week-ahead forecast & $372.4$
  & Elia's week-ahead forecast (weak) \\
\textbf{Best single (online XGBoost)} & $\mathbf{69.5}$
  & Online-only, no weather input \\
The present mechanism & $83.7$ & Seven-forecaster aggregate \\
Inverse-variance hindsight & $70.1$ & Hindsight oracle \\
\bottomrule
\end{tabular}
\caption{External validation against Elia's operational forecast.}
\label{tab:elia-operational}
\end{table}

A simple online XGBoost trained on the observed series alone beats
Elia's real-time forecast by approximately $6\%$ in
CRPS-megawatt-equivalent ($69.5$ MW against $74.0$ MW), despite
using no weather inputs. The mechanism aggregates seven forecasters
of which most are weaker than XGBoost, and therefore ends up at
$83.7$ MW, approximately $13\%$ worse than Elia's operational
forecast. Elia's day-ahead forecast is considerably weaker at
$98.6$ MW.

Elia's published interval forecasts are systematically miscalibrated.
Nominal $\tau = 0.10$ gives empirical coverage of $19.1\%$, and
$\tau = 0.90$ gives $94.6\%$. This is a known property of operational
numerical-weather-prediction forecasts and motivates the
recalibration layer developed in Chapter 7 as a generic operational
tool.

## Elia offshore wind: calibration anchor slice

The calibration anchor covers the first $3\,000$ evaluation points
under the older warmup-window causal normalisation, on the post-fix
pipeline in which negative raw wind values are clipped to zero before
normalisation. Expanding rather than static normalisation is used for
the audit run itself because the warmup of this slice (winter wind)
has a systematically higher range than the evaluation window, which
would cause static normalisation to clip approximately $46\%$ of
evaluation values to zero and render per-quantile coverage
uninterpretable.

### Aggregate comparison

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
Inverse-variance hindsight & $0.01670$ & $-21.0\%$ \\
Median & $0.01919$ & $-9.3\%$ \\
Inverse variance & $0.01963$ & $-7.2\%$ \\
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
$0.02000 / 0.02030 = 0.985$: on this slice the mechanism beats the
reference by $1.5\%$ CRPS. The Diebold--Mariano statistic for the
mechanism against uniform on this slice is $t = +15.43$ with
$p < 10^{-6}$.

### Per-forecaster CRPS on the audit slice

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

### Tail calibration

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
This is corrected by the recalibration layer developed in Chapter 7.

### Mechanism versus published per-quantile OGD

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
budget-balance constraint and learning per-$\tau$ weights directly;
our recalibration layer closes most of the centre deviation in
Chapter 7 without relaxing budget balance.

## Elia electricity imbalance: null result

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
Inverse variance & $0.09022$ & $-0.3\%$ \\
Median & $0.09004$ & $-0.5\%$ \\
Trimmed mean & $0.08979$ & $-0.8\%$ \\
Shifted-median fan (OGD reference) & $0.09063$ & $+0.1\%$ \\
Rolling best single & $0.08606$ & $-4.9\%$ \\
Inverse-variance hindsight & $0.08026$ & $-11.3\%$ \\
Per-round oracle & $0.05924$ & $-34.6\%$ \\
\bottomrule
\end{tabular}
\caption{Elia electricity imbalance: aggregate comparison.}
\label{tab:electricity-null}
\end{table}

The Diebold--Mariano statistic for the mechanism against uniform is
$t = 0.008$ with $p = 0.994$: the mechanism is not statistically
distinguishable from uniform on electricity. The seven forecasters
produce near-identical CRPS within approximately $1\%$ of each
other, so the skill signal has no persistent structure to exploit.
This is the forecast-combination puzzle regime
\citep{bates1969combination, timmermann2006forecast}, and the
mechanism behaves accordingly: a null rather than a regression.

The oracle gap on electricity is approximately thirty-five
percentage points (mechanism $0.09052$, oracle $0.05924$), so a
perfect per-round weight could improve a great deal, but not via an
EWMA or OGD on this forecaster panel, because the forecasters
themselves are undifferentiated.

## Horizon experiments

Horizon-specific experiments under the older warmup-window
normalisation provide a sanity check on the mechanism's behaviour
away from the one-step-ahead headline.
Table~\ref{tab:horizon-day-ahead} reports the day-ahead horizon
($h = 24$, warmup at least $70$).

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Method & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Uniform & $0.19236$ & --- \\
Skill only & $0.19227$ & $-0.05\%$ \\
\textbf{Mechanism} & $\mathbf{0.19220}$ & $\mathbf{-0.08\%}$ \\
Rolling best single & $0.18866$ & $-1.92\%$ \\
\bottomrule
\end{tabular}
\caption{Day-ahead horizon experiment.}
\label{tab:horizon-day-ahead}
\end{table}

\noindent On the four-hour-ahead horizon ($h = 16$ steps on a
15-minute series, $T = 20{,}000$), uniform is $0.10874$, skill-only
is $0.10835$ ($-0.36\%$), the mechanism is $0.10808$ ($-0.61\%$),
and rolling best-single is $0.10388$ ($-4.48\%$). On a within-run
seasonal slice, uniform is $0.06716$, the mechanism is $0.06646$
($-1.05\%$), and rolling best-single is $0.05980$ ($-10.97\%$). The
per-season breakdown is uniformly positive at approximately
$+1\%$ CRPS improvement, with no season falling below the baseline.

These horizon experiments are under the older warmup-window
normalisation. Re-running them under the expanding variant is on the
list of remaining work; the direction of the comparisons is stable
and the magnitudes are expected to shift by under one percentage
point.

## Published-OGD head-to-head

Table~\ref{tab:head-to-head-wind} reports the wind head-to-head
against \citet{vitali2025intermittent} and \citet{raja2024wagering} on the
warmup-window normalisation.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Method & Mean CRPS & $\Delta$ vs uniform \\
\midrule
Vitali per-$\tau$ OGD & $0.03442$ & $-18.01\%$ \\
\textbf{Mechanism} & $\mathbf{0.03905}$ & $\mathbf{-6.99\%}$ \\
Raja history-free & $0.04134$ & $-1.53\%$ \\
Uniform & $0.04198$ & --- \\
\bottomrule
\end{tabular}
\caption{Wind head-to-head against published baselines.}
\label{tab:head-to-head-wind}
\end{table}

On electricity, the ranking is compressed: Vitali's per-$\tau$ OGD
reaches $-2.03\%$ against uniform, and the mechanism and the Raja
history-free variant are both statistically tied with uniform. Vitali's
per-$\tau$ OGD beats the mechanism on both series (by approximately
$11$ percentage points on wind and $2$ percentage points on
electricity). This is the CRPS cost of preserving the Lambert
budget-balance and per-round truthfulness guarantees: Vitali's
aggregator drops both in exchange for CRPS.

## Sensitivity sweep and parameter provenance

Tuned parameters are selected through the held-out sweep described
in Chapter 3, not by hand.
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

Re-running the headline block under expanding normalisation at
sweep-selected parameters is on the list of remaining work. The
expected shift is sub-percent CRPS in either direction; the
direction of the DM statistic and the method ranking are stable.
