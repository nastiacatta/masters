# Discussion {#ch:discussion}

## Contributions in review

\paragraph{Preserved economic structure.} Budget balance holds to
machine precision, with maximum absolute gap of order $10^{-13}$
across all reported runs. The narrow Lambert sybil invariance holds
with profit ratio $1.000000$. The Lambert truthfulness proof carries
over under the skill-gate substitution because the gate is
$\mathcal{F}_{t-1}$-measurable: it is fixed before the participant's
current-round report is observed.

\paragraph{Skill recovery.} On the known-noise synthetic panel the
mechanism's learned $\sigma$ ordering matches the ground-truth CRPS
ordering exactly, with Spearman rank correlation of one across all
five canonical seeds. On the 3{,}000-point audit slice of Elia
offshore-wind power the same relation holds for the seven real
forecasters. On the full 17{,}344-hour run the ordering is
unchanged, though the absolute $\sigma$ values are lower because
expanding normalisation produces larger normalised losses.

\paragraph{Deposit design as the primary lever.} The deposit policy
carries most of the information about participant quality.
Bankroll-confidence deposits improve CRPS by $11\%$ over fixed-unit
deposits on the synthetic panel; the effect compounds with the
skill gate on real data.

\paragraph{Orthogonal calibration fix.} The rolling isotonic
recalibration layer closes $41\%$ of the tail calibration gap at a
$1.6\%$ CRPS cost and a $12\%$ sharpness cost, without modifying
any of the economic layers.

\paragraph{Statistical evidence on wind.} The Diebold--Mariano
statistic for the mechanism-versus-uniform comparison is
$t = 40.77$ on the full-length wind run, well inside any
Bonferroni-adjusted threshold.

\paragraph{External benchmark.} The best single forecaster, an
online gradient-boosted tree model trained on the observed series
alone, reaches $69.5$~MW CRPS-megawatt-equivalent against Elia's
published real-time forecast of $74.0$~MW, without using weather
inputs. The mechanism, aggregating a panel that mixes the best
forecaster with weaker models, reaches $83.7$~MW, approximately
$13\%$ above Elia's operational forecast.

## Limitations

\paragraph{No universal dominance over simple baselines.} On the
full-length wind run, inverse-CRPS weighting (\,$-7.0\%$ vs uniform)
is statistically tied with the mechanism (\,$-7.1\%$), and the
median (\,$-9.3\%$) and trimmed mean (\,$-7.2\%$) both improve on
it. The per-quantile OGD baseline of \citet{vitali2025intermittent}
(\,$-18.0\%$) and the rolling best-single selector (\,$-22.9\%$)
beat it by larger margins. The contribution is conditional
improvement together with preserved economic structure, not raw
CRPS dominance.

\paragraph{Null result on electricity imbalance.} The mechanism is
statistically indistinguishable from uniform averaging on the
electricity series ($t = 0.008$, $p = 0.994$). The seven forecasters
produce CRPS values within $0.8\%$ of each other, leaving no
persistent skill signal to exploit. This is the forecast-combination
puzzle regime documented by \citet{bates1969combination} and
\citet{timmermann2006forecast}.

\paragraph{Sensitivity to hyperparameters.} Default parameters are
tuned for synthetic panels with approximately ten forecasters and
$T \approx 1\,000$. The wind-data tuned values are more aggressive;
a poorly tuned $(\gamma, \rho)$ can render the mechanism marginal
against uniform. Chapter 3 and Chapter 6 report the held-out
sensitivity sweep that selects these parameters; an expanding-mode
headline at the sweep-selected parameters is identified as
follow-up work in Chapter 10.

\paragraph{Best-single ceiling.} Online XGBoost alone beats the
mechanism by $16.9\%$ CRPS on the full-length wind run, because wind
power is highly autocorrelated and a single well-tuned model
captures most of the structure. This is a ceiling on any aggregator
that mixes in weaker models.

\paragraph{Linear-pool tail miscalibration.} The
\citet{ranjan2010combining} impossibility implies that any
non-trivial weighted average of distinct calibrated forecasts is
necessarily uncalibrated. The aggregate shows approximately two
percentage points of systematic tail deviation. The recalibration
layer closes $41\%$; the remaining $59\%$ is the calibration-sharpness
floor discussed in Chapter~\ref{ch:recalibration}.

\paragraph{Narrow sybil-proofness only.} Diversified-report sybils
break the Lambert invariance by approximately $6.5\%$ empirically.
This is a scope limitation of the Lambert framework rather than a
property of the skill layer.

\paragraph{Truthfulness under risk-neutrality only.} The linear
utility assumption is inherited from \citet{lambert2008selffinanced}.
For risk-averse participants or large stakes relative to wealth, the
truthfulness argument does not go through.

\paragraph{Residual arbitrage.} The \citet{chen2014arbitrage}
arbitrage interval applies to every weighted-score wagering
mechanism, including the present one. Our multi-seed scan confirms
an arbitrageur extracts $+11$ to $+24$ profit over $1\,000$ rounds as
$\lambda$ rises from $0$ to $1$; the profit scales roughly linearly
with benign crowd size. The mechanism remains budget-balanced, the
attacker's gains come from other participants, not from a reserve.
Fully removing the arbitrage requires moving to the no-arbitrage
wagering family of \citet{chen2014arbitrage}, which is outside the
scope of this thesis.

\paragraph{Profitable coalitions.} A three-member coalition
broadcasting the wager-weighted mean of its members' beliefs
extracts $+16.9$ to $+19.9$ profit over $1\,000$ rounds. Combining
the coalition with a privileged lagged signal compounds the two
channels, yielding $+33.8$ profit. Neither is contained by the skill
gate.

\paragraph{No equilibrium analysis.} Only named adversary strategies
are evaluated. The full best-response space is not characterised,
and no Nash or correlated equilibria are computed.

## Threats to validity

\paragraph{Internal validity.} Pre-audit Elia numbers used a pipeline
with whole-series min-max normalisation, a non-reproducible
neural-network seed, tail-adjacent XGBoost validation, and a silent
persistence-fallback path. The post-audit runs use strictly-causal
expanding normalisation, a fixed neural-network seed, embargoed
cross-validation per \citet{bergmeir2018note}, and an explicit
fallback indicator; headline numbers may therefore differ from
pre-audit presentations by small but measurable amounts, and the
pre-audit snapshot is retained for comparison. Single-seed real-data
runs are the norm because the data themselves are fixed; variance
arises from stochastic forecaster components and is reported as a
range across five canonical seeds on synthetic data and three seeds
on real data. The finite-grid CRPS approximation uses a nine-level
grid, with small but non-zero approximation bias for smooth
distributions; pointwise quantile coverage is reported in
Chapter~\ref{ch:real} and is not subject to the same approximation.

\paragraph{External validity.} The evaluation uses two real-data
series, both from the same European transmission system operator.
Transfer to solar, load, or non-European systems cannot be claimed
without further experiments. The audit slice spans a few months and
is roughly stationary; full-year drift is not tested in the
headline. The forecaster panel has seven members; results at
$n = 50$ or $n = 500$ are not directly extrapolatable.

\paragraph{Construct validity.} CRPS is strictly proper
\citep{gneiting2007strictly} but weights calibration and sharpness in
a specific way. A mechanism optimised for CRPS may not be optimal
for a decision problem that weights tail coverage or point
accuracy differently. Uniform averaging is a strong baseline
\citep{timmermann2006forecast}; Chapter 6 also reports deltas against
the rolling best-single selector (regret) and against
\citet{vitali2025intermittent} so that the headline is not anchored
to a single baseline.

\paragraph{Statistical validity.} The Diebold--Mariano test assumes
covariance stationarity of the loss-differential series.
Heteroscedasticity- and autocorrelation-consistent standard errors
are used, but residual non-stationarity is not ruled out.
Family-wise error across approximately ten methods, two datasets,
and two horizons is not controlled. The headline
mechanism-versus-uniform $p$-value of $p < 10^{-6}$ is well inside
any reasonable Bonferroni-adjusted threshold, but finer comparisons
across methods should be read with this caveat.

## Scope

This thesis does not propose a new scoring rule. CRPS and pinball
loss are used unchanged. It does not propose a new forecasting
model: the seven base forecasters are standard implementations. It
does not present a game-theoretic analysis; strategic behaviours are
studied via simulation, not by computing equilibria. It is not a
conformal-prediction paper: the recalibration layer is the
post-hoc isotonic method of \citet{kuleshov2018accurate}, not a
conformal wrapper. It is a methodology paper with real-data
validation on two Elia series, not a full-scale empirical study of
grid-scale prediction markets.

## Summary

When predictive information is combined through a self-financed
wagering mechanism that learns participant reliability online, the
aggregate forecast improves against uniform averaging in the
regimes where forecast combination helps generally: sufficient
forecaster heterogeneity, enough rounds for the EWMA to converge,
and sufficient signal in the underlying series. These regimes are
realised on Elia offshore-wind power, where the mechanism delivers
a $7.1\%$ CRPS reduction ($t = 40.77$, $p \approx 0$) over $17{,}344$
evaluation rounds; they are not realised on Elia
electricity-imbalance prices, where the mechanism is
statistically indistinguishable from uniform. Under both regimes
the economic structure of the Lambert framework survives the
addition of online learning. The best single forecaster in the
panel outperforms Elia's published real-time forecast by
approximately $6\%$ CRPS-megawatt-equivalent without weather
inputs; the mechanism, averaging the panel, sits $13\%$ below that
baseline because it mixes in weaker models. The CRPS picture is
therefore regime-dependent; the contribution is the preservation of
economic structure under online adaptivity, demonstrated on
real grid data.
