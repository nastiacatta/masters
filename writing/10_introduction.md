# Introduction {#ch:intro}

## Motivation

Decisions under uncertainty in modern energy systems depend on
accurate short-horizon forecasts. Balancing a power system,
scheduling reserves, clearing intraday markets, and settling
imbalance positions all rest on expectations of generation or load
that are updated continuously as new information arrives. The
relevant information is rarely concentrated in a single actor.
Independent operators, aggregators, and analysts each see part of
the signal: one may operate a superior numerical-weather-prediction
chain, another a locally tuned machine-learning model, a third hold
private telemetry from installed assets. Raw data are typically
commercially sensitive or expensive to share, yet a derived forecast
can be communicated without exposing the underlying inputs.

This observation motivates the study of \emph{prediction markets}
for forecasts. A market operator posts a prediction task;
participants submit a probabilistic forecast together with a wager;
the operator aggregates the reports into a single collective
forecast and, once the outcome is observed, redistributes the wager
pool according to a scoring rule. When the mechanism is
\emph{self-financed}, in the sense that the sum of post-event
payouts equals the sum of pre-event wagers, no external subsidy is
required and the market can run indefinitely on its own accounting.
\citet{lambert2008selffinanced} formalised this class as the
\emph{weighted-score wagering mechanism} and proved that, under five
axioms, budget balance, anonymity, truthfulness, normality, and
sybil-proofness, it is the unique mechanism satisfying all five
simultaneously.

Two limitations of the Lambert formulation are salient for practical
deployment. First, each round is treated in isolation: the mechanism
makes no use of the fact that, in most applications, the same
participants return round after round and differ systematically in
reliability. Second, the formulation assumes full participation: a
participant who misses a round simply does not play, with no
bookkeeping consequence for future rounds. Both assumptions are
violated in energy prediction markets, where skill is persistent
and participation is intermittent. \citet{vitali2025intermittent}
addressed the second limitation directly with an
online-gradient-descent aggregator that tracks historical
performance and tolerates missing submissions, but at the cost of
relaxing self-financing: a separate payoff-allocation step is
introduced, and Lambert's axiomatic guarantees no longer apply.

This thesis bridges the two strands. We introduce an online
skill-learning layer that sits on top of the weighted-score
wagering mechanism without disturbing its settlement algebra. Each
participant's deposit is modulated, before every round, by a bounded
scalar \emph{skill estimate} computed as an exponentially weighted
moving average of that participant's past probabilistic losses. The
resulting \emph{effective wager}
$$
  m_i = b_i \cdot \big(\lambda + (1-\lambda)\, \sigma_i^{\eta}\big)
$$
is the single object that governs both aggregation weight and
financial exposure. Because the modulation is a scalar multiplier
applied pre-round and derived exclusively from information strictly
earlier than the current report, the Lambert truthfulness proof
applies verbatim with the modulated wager $m_i$ in place of the
original deposit $b_i$.

## Research question

The thesis is organised around a single question in three parts:
when predictive information is distributed across many participants,
how should their forecasts be combined, and how should the market
decide whose forecast deserves more influence, while preserving the
budget balance, truthfulness, and sybil-proofness that make the
mechanism credible?

Three sub-questions follow:
\begin{enumerate}
  \item Can a market learn participant reliability from data alone,
    online, without an external subsidy, and can that learning be
    proved convergent on data with known latent skill?
  \item Does using the learned reliability to weight the aggregate
    forecast improve accuracy on real energy data, and if so under
    what conditions?
  \item Can the extension be carried out while preserving Lambert's
    axiomatic guarantees and without opening new strategic attack
    surfaces beyond those already present in any weighted-score
    wagering mechanism?
\end{enumerate}
The answer developed across the remainder of the thesis is a
conditional affirmative on all three sub-questions. The conditions
are stated explicitly and are tied to measurable properties of the
forecaster panel and the underlying data-generating process.

## Contributions

The thesis makes four primary contributions.

First, a self-financed wagering mechanism that couples
weighted-score settlement with an online, absolute, pre-round skill
signal. The effective wager
$m_i = b_i \cdot (\lambda + (1-\lambda)\,\sigma_i^{\eta})$ controls
both aggregation weight and settlement exposure. Lambert's
truthfulness proof \citep{lambert2008selffinanced} is preserved
under the substitution $m_i \leftarrow b_i$, and budget balance
holds by construction.

Second, skill recovery on controlled data. On a known-noise synthetic
panel (six forecasters, $T = 20{,}000$ rounds, twenty seeds), the
Spearman rank correlation between the true noise scale and the
learned skill estimate $\sigma$ equals one in both point-forecast
and quantile-forecast modes. Budget balance holds to machine
precision (maximum absolute gap $2.84 \times 10^{-14}$ across $1000$
synthetic rounds) and the narrow Lambert sybil invariance holds with
mean profit ratio $1.000000$ and maximum absolute deviation
$2.07 \times 10^{-17}$.

Third, identification of deposit design as the dominant empirical
lever. A four-way deposit-policy ablation shows that
bankroll-confidence deposits, computed from observable quantities
alone, reduce CRPS by $10.4\%$ against fixed-unit deposits,
capturing approximately one quarter of the improvement attained by
an oracle-precision deposit. Holding the deposit policy fixed, the
choice of weighting rule moves CRPS by at most a few percent, while
the deposit policy moves it by tens of percent.

Fourth, real-data validation on two Elia series. On the full
$17{,}344$-hour offshore-wind series under strictly-causal expanding
normalisation, the mechanism reduces CRPS by $7.1\%$ relative to
uniform averaging (Diebold--Mariano $t = 40.77$, $p \approx 0$). On
electricity-imbalance prices ($T = 10{,}000$), the mechanism is
statistically indistinguishable from uniform ($t = 0.008$,
$p = 0.994$) because the seven forecasters produce near-identical
CRPS; this null result is reported rather than suppressed. Against
Elia's published real-time operational forecast, which attains
$74.0$~MW in CRPS-megawatt-equivalent units, the mechanism reaches
$83.7$~MW, while the best single forecaster --- an online
gradient-boosted tree trained on the observed series with no weather
inputs --- reaches $69.5$~MW.

Two secondary contributions support the core result. The aggregate
is miscalibrated in the manner analogous to the
\citet{ranjan2010combining} linear-pool impossibility; a rolling
isotonic recalibration following \citet{kuleshov2018accurate} closes
$41\%$ of the tail deviation at a $1.6\%$ CRPS cost and a $12\%$
sharpness cost, without modifying the skill, wager, aggregation, or
settlement layers. Eight theory-grounded adversaries (arbitrage
\citep{chen2014arbitrage}, Chun--Shachter coalitions
\citep{chun2011cooperating}, informed collusion, a lagged insider
\citep{johnstone2007economic}, wash trading, strategic reporting,
detector-aware evasion, and sybil arbitrage) are evaluated across
ten to twenty paired seeds; the narrow Lambert sybil invariance
holds to floating-point noise, diversified-report sybils break it by
approximately $6.5\%$, and arbitrage profit scales monotonically
with $\lambda$.

## Structure of the thesis

The thesis follows the standard empirical-research structure:
introduction, background, methods, results, discussion, conclusion.
Chapter~\ref{ch:background} reviews the three research strands on
which the thesis builds: self-financed wagering mechanisms, online
forecast combination, and probabilistic forecast evaluation.
Chapter~\ref{ch:mechanism} specifies the mechanism itself --- round
structure, skill gate, and settlement algebra --- and argues why
making the effective wager the single object that governs both
influence and exposure preserves Lambert's axioms. This chapter
plays the role of the theoretical contribution; it sits between
background and methodology because it introduces the object that
the methodology then evaluates.
Chapter~\ref{ch:methodology} describes the datasets, the forecaster
panel, and the experimental protocol.
Chapter~\ref{ch:results} reports the empirical evidence in four
sections: synthetic validation (mechanism correctness, skill
recovery, deposit-policy ablation, weight-rule comparison,
bankroll-pipeline ablation, panel-size scaling, and risk-aversion
sensitivity); real-data validation on Elia offshore wind and
electricity-imbalance prices; a rolling isotonic recalibration
layer as a post-hoc remedy for the \citet{ranjan2010combining}
linear-pool miscalibration; and strategic robustness under a
theory-grounded adversary catalogue.
Chapter~\ref{ch:discussion} interprets the evidence, places it in
the context of prior work, and records limitations.
Chapter~\ref{ch:conclusion} summarises the findings and outlines
future work.
Chapter~\ref{ch:project-management} records the project plan and
risk management, and Chapter~\ref{ch:reflection} gives a short
personal reflection, as required by the Design Engineering
Master's Project assessment criteria.
