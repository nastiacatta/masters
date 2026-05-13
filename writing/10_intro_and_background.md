# Introduction and background {#ch:intro}

## Motivation

Consider a European transmission system operator tasked with
scheduling reserve generation against short-term fluctuations in
wind-farm output. Every hour the operator commits to a reserve
level. Holding too much reserve wastes paid-for capacity.
Holding too little risks a grid-stability event. The schedule
depends on a single object: the conditional distribution of
next-hour wind generation, given the information currently
available across the system.

Several actors can each write down an informed version of that
distribution. The transmission operator runs a
numerical-weather-prediction (NWP) chain on a regional mesoscale
grid. A wind-farm owner holds telemetry from the turbines that
the NWP model does not see, together with knowledge of which
machines are currently offline for maintenance. An independent
group runs a locally-tuned statistical model on public
reanalysis data. Each forecast is informative, and none is
complete.

Aggregating several imperfect forecasts is a well-studied
problem. \citet{bates1969combination} introduced inverse-variance
weighting for two forecasts in 1969. The fifty-year review of
\citet{wang2023combinations} catalogues the sequence that
followed: time-varying weights, performance-conditioned pools,
feature-conditioned ensembles, and the empirical regularity that
equal weights are often hard to beat when the weight parameters
must be estimated from limited data \citep{timmermann2006forecast}.
What stops the operator from combining the three forecasts above
is not the aggregation algorithm but the raw inputs. Telemetry,
proprietary model code, and internal reanalysis pipelines are
commercially or legally costly to disclose
\citep{goncalves2025budget}. A *derived forecast* can be
communicated without exposing those inputs. This makes the
forecast, rather than the data, the object that is exchanged.

The natural mechanism for this exchange is a *prediction
market*. The literature uses the term for two distinct market
classes. The first is the open-entry event market, surveyed by
\citet{wolfers2004prediction} and formalised via market scoring
rules by \citet{hanson2003combinatorial}, in which retail
participants trade contracts on discrete outcomes such as
election results or sports results. The second is the
closed-panel forecast-elicitation mechanism: a small, screened
set of participants submit probabilistic forecasts of a
continuous outcome each round, a mechanism operator aggregates
them into a consensus forecast, the outcome is observed, and
each participant's wager is redistributed in proportion to the
quality of their report. The second class is the one relevant
to energy forecasting and the one this thesis studies. The two
classes share vocabulary but not design rules, and the
distinction is drawn explicitly below because the adversary
literature attached to the open-entry class migrates into the
robustness chapter (Chapter~\ref{ch:robustness}).

The closed-panel class has a natural budget constraint. If the
redistribution is arranged so that the sum of post-event payouts
equals the sum of pre-event wagers, the mechanism is
*self-financed* and can run indefinitely on its own accounting.
\citet{lambert2008selffinanced} proved that the *weighted-score
wagering mechanism* is the unique mechanism satisfying
self-financing together with anonymity, truthfulness, normality,
and sybil-proofness. Truthfulness here means that, for a
risk-neutral participant, reporting the true belief maximises
expected profit round by round. The proof rests on the scoring
rule being strictly proper \citep{gneiting2007strictly}.

Two properties of the Lambert construction block direct
deployment in an energy forecasting panel. First, each round
stands alone. The mechanism does not track that the wind-farm
owner has been producing better forecasts than the university
group for months. Second, the formulation assumes full
participation. A missing report carries no bookkeeping
consequence, which rules out a principled penalty for strategic
absence. Both properties fail in real panels, where skill is
persistent and participation is intermittent.
\citet{vitali2025intermittent} addressed the second property
with an online-gradient-descent aggregator that tracks
historical performance and tolerates missing submissions. The
cost was a separate payoff-allocation step and the loss of the
self-financing identity; Lambert's axiomatic guarantees no
longer hold in that construction.

The motivating question is whether the two desiderata can be
held together. Can a self-financed wagering mechanism track
participant skill across rounds, weight the aggregate forecast
by that skill, and preserve Lambert's axioms at the same time?

The answer developed across this thesis is yes. The mechanism
keeps Lambert's settlement algebra unchanged. A single
pre-round scalar rescales each participant's deposit: a
bounded *skill estimate* $\sigma_i \in [\sigma_{\min}, 1]$
computed as an exponentially weighted moving average (EWMA) of
the participant's past probabilistic-scoring-rule losses. The
*effective wager*
$
  m_i = b_i \cdot g(\sigma_i),
  \qquad g(\sigma) = \lambda + (1 - \lambda)\, \sigma^{\eta},
$
is then used in two places. It is the weight attached to
participant $i$'s report when the aggregate is formed, and it
is the exposure that participant $i$ takes into settlement when
the outcome is scored. Because the skill estimate is a function
only of information strictly earlier than the current report,
the modulation is fixed before the round begins. Lambert's
truthfulness proof therefore applies verbatim under the
substitution $m_i \leftarrow b_i$, and the budget-balance
identity $\sum_i \pi_i = \sum_i m_i$ holds by construction. The
online skill layer sits on top of the weighted-score wagering
mechanism without disturbing its settlement algebra.
Figure~\ref{fig:timeline} traces one round through its
pre-event, event, and post-event stages.

### Scope: closed-panel elicitation, not event markets

The mechanism in this thesis is a closed-panel
forecast-elicitation mechanism with scoring-rule settlement. It
is not an open-entry event market. General-purpose event markets
such as Polymarket, Kalshi, and PredictIt pool retail beliefs
about political events, sports, and macro-financial milestones
under continuous-double-auction or automated-market-maker
trading rules, not scoring-rule settlement. Polymarket alone
has been reported to suffer from network-attributable wash
trading at approximately sixty percent of weekly share volume
in December 2024 \citep{sirolly2025wash}, and from
price-inconsistent arbitrage exceeding $40$ million USD across
more than $7{,}000$ markets during 2024--2025
\citep{gervasini2025arbitrage}. Its political markets are
dominated by a small core of active traders rather than a broad
panel \citep{wu2025sociotechnical}. The robustness chapter
inherits the adversary families studied in that literature
(arbitrage, wash trading, sybils) as threats to the closed-panel
construction, but the mechanism is not proposed as a substitute
for open-entry event markets. It is a specialised tool for the
energy-forecasting setting described above.

## Research question

The motivation above asks whether a self-financed wagering
mechanism can track participant skill online while preserving
Lambert's axioms. This question splits into three sub-questions,
each testable against evidence.

1. *Learnability.* Can a market learn participant reliability
   from data alone, online, without an external subsidy, and can
   that learning be proved convergent on data with known latent
   skill?
2. *Usefulness.* Does weighting the aggregate forecast by the
   learned reliability improve accuracy on real energy data, and
   if so under what conditions?
3. *Preservation.* Can the extension preserve Lambert's
   axiomatic guarantees without opening strategic attack surfaces
   beyond those already present in any weighted-score wagering
   mechanism?

The answer developed across the remainder of the thesis is a
conditional *yes* on all three. The conditions are stated
explicitly and tied to measurable properties of the forecaster
panel and the underlying data-generating process.

## Contributions

The thesis makes four primary contributions.

First, a self-financed wagering mechanism that couples
weighted-score settlement with an online, absolute, pre-round
skill signal. The effective wager
$m_i = b_i \cdot (\lambda + (1-\lambda)\, \sigma_i^{\eta})$
controls both aggregation weight and settlement exposure.
Lambert's truthfulness proof \citep{lambert2008selffinanced} is
preserved under the substitution $m_i \leftarrow b_i$, and budget
balance holds by construction.

Second, skill recovery on controlled data. On a known-noise
synthetic panel (six forecasters, $T = 20{,}000$ rounds, twenty
seeds), the Spearman rank correlation between the true noise
scale and the learned skill estimate $\sigma$ equals one in both
point-forecast and quantile-forecast modes. Budget balance holds
to machine precision (maximum absolute gap
$2.84 \times 10^{-14}$ across $1000$ synthetic rounds) and the
narrow Lambert sybil invariance holds with mean profit ratio
$1.000000$ and maximum absolute deviation
$2.07 \times 10^{-17}$.

Third, a mechanism-design lesson about deposits on controlled
data. On the six-forecaster synthetic panel, a four-way
deposit-policy ablation (iid-random, fixed-unit,
bankroll-confidence computed from observable forecast width, and
oracle-precision) moves CRPS by tens of percent. The choice of
weighting rule, holding the deposit policy fixed, moves it by at
most $3.5\%$. The result is scoped to the synthetic setting: the
mechanism operator cannot dictate the deposit rule in a deployed
market, so the finding is a ceiling statement on what an
enforceable confidence-encoded stake could contribute, not a
lever the operator can pull. The real-data runs in
Section~\ref{ch:real} therefore use unit deposits throughout and
rely on the skill gate alone. The ablation motivates the
mechanism's single-object design, the effective wager
$m_i = b_i \cdot g(\sigma_i)$, as the way to carry the skill
signal through the wager pool without requiring the deposit
policy to encode anything.

Fourth, real-data validation on two Elia series. On the full
$17{,}344$-hour offshore-wind series under strictly-causal
expanding normalisation, mean Continuous Ranked Probability Score (CRPS) on the normalised $[0,1]$ scale falls by $7.1\%$
relative to uniform averaging (Diebold--Mariano $t = 40.77$ under
the legacy horizon-$1$ HAC bandwidth, $t = 22.35$ under the Andrews
auto-bandwidth; $p \approx 0$ in both cases). On electricity-imbalance prices
($T = 10{,}000$), the mechanism is statistically
indistinguishable from uniform ($t = 0.007$ Andrews auto HAC,
$p = 0.994$) because the seven forecasters produce CRPS values
within $1\%$ of each other; this null result is reported rather
than suppressed. Against Elia's published real-time operational
forecast, which attains $90.7$~MW in CRPS-megawatt-equivalent units
on the $[0, 2\,208.7]$~MW range (matched nine-level $\tau$-grid),
the mechanism reaches $83.7$~MW, while the best single forecaster
(an online gradient-boosted tree trained on the observed series
with no weather inputs) reaches $69.5$~MW.

Two secondary contributions support the core result. The
aggregate is miscalibrated in the manner analogous to the
\citet{ranjan2010combining} linear-pool impossibility. A rolling
isotonic recalibration following \citet{kuleshov2018accurate}
closes $41\%$ of the tail deviation at a $1.6\%$ CRPS cost and a
$12\%$ sharpness cost, without modifying the skill, wager,
aggregation, or settlement layers. Eight theory-grounded
adversary classes (arbitrage \citep{chen2014arbitrage}, Chun--Shachter
coalitions \citep{chun2011cooperating}, informed collusion, a
lagged insider \citep{johnstone2007economic}, wash trading,
strategic reporting, detector-aware evasion, and sybil
arbitrage) are evaluated across ten to twenty paired seeds. The
narrow Lambert sybil invariance holds to floating-point noise,
diversified-report sybils break it by approximately $6.5\%$, and
arbitrage profit scales monotonically with $\lambda$.

The remainder of this chapter develops the background for these
contributions. The three strands follow the logical dependencies
of the mechanism, not a strict chronology: self-financed wagering
mechanisms supply the settlement algebra and the axiomatic
guarantees; online forecast-combination theory supplies the
learning layer; probabilistic evaluation and calibration supply
the scoring rule and the post-hoc correction.

## Self-financed wagering mechanisms

The foundational result is due to \citet{lambert2008selffinanced},
who defined a wagering mechanism as a triple of report vector,
outcome space, and payoff function, and identified seven
axiomatic properties: budget balance, anonymity, truthfulness,
sybil-proofness, normality, individual rationality, and
monotonicity. The single-parameter weighted-score mechanism with
payoff
$
  \Pi_i(r, m, \omega) = m_i \left( 1 + s(r_i, \omega)
    - \frac{\sum_j s(r_j, \omega)\, m_j}{\sum_j m_j} \right)
$
satisfies all seven, and it is the unique mechanism satisfying
the first five. Sybil-proofness is proved for the case in which
clones report identically and the total wager is conserved, a
scope qualification that recurs throughout the later literature.
Our mechanism preserves this payoff form exactly, substituting
the effective wager $m_i$ for the raw deposit, so the Lambert
truthfulness and sybil proofs apply unchanged on a per-round
basis.

\citet{raja2024wagering} extended the formulation from binary or
discrete outcomes to continuous outcomes and probabilistic
quantile forecasts, in the setting of an energy-sector prediction
market with an explicit buyer. The payoff mechanism retains
budget balance, truthfulness, sybil-proofness, and individual
rationality in the quantile setting. Each market instance remains
history-free: no inter-round state is accumulated. The online
skill layer developed in Chapter~\ref{ch:mechanism} accumulates
state across rounds while keeping the per-round payoff algebra
intact.

The arbitrage properties of weighted-score mechanisms were
characterised by \citet{chen2014arbitrage}. For any differentiable
strictly proper scoring rule, participant $i$ can choose a report
in an *arbitrage interval* that yields a non-negative payoff
under every outcome, strictly positive whenever other
participants disagree (their Theorem 3.3). The arbitrage-seeking
adversary studied in Section~\ref{ch:robustness} implements the
mean-absolute-error analogue of this arbitrage point, the
wager-weighted median of other reports, and participates only
when the expected profit under a uniform outcome is strictly
positive. The attack extracts $+12$ to $+24$ cumulative profit per
1000 rounds across our $\lambda$ grid, confirming the theorem.
\citet{chen2014arbitrage} also constructed a family of
no-arbitrage wagering mechanisms that preserve anonymity,
individual rationality, incentive compatibility, weak budget
balance, and sybil-proofness for the $f$-NAWM subclass. Moving to
that family is out of scope here. The contribution of this
thesis is the composition of budget balance with an online skill
layer and a post-hoc calibration layer, not the removal of
arbitrage.

\citet{chun2011cooperating} studied coalitions in strictly-proper
elicitation. A coalition $C$ of participants with immutable
beliefs who all report the common value
$p_C = \sum_{i \in C} (w_i / W_C)\, p_i$
with $W_C = \sum_{i \in C} w_i$
earns a strictly higher total payoff than reporting truthfully,
whenever coalition members disagree. This formula specifies the
coordinated-group adversary evaluated in
Section~\ref{ch:robustness}. Combined with a privileged lagged
signal under an AR(1) outcome process, the attack attains
cumulative profit of $+33.84$ per 1000 rounds.

An adjacent line concerns replication-style attacks on
machine-learning markets. \citet{falconer2025replication} study
analytics markets in which agents can replicate their features
under synthetic identities to inflate their Shapley-style
allocation. Their causally-refined reward uses observational
versus interventional conditional probabilities to neutralise the
attack. The wagering-mechanism sybil invariance of
\citet{lambert2008selffinanced} solves a different problem:
identical-report clones with conserved total deposit retain
identical total profit. The diversified-report sybil evaluated in
Section~\ref{ch:robustness} departs from the Lambert scope
qualification and is the analogue of the strategic-replication
attack of \citet{falconer2025replication}. The scope
qualification is not accidental. \citet{pan2024sybilproof} show
that in the single-parameter mechanism-design environment, the
only non-wasteful, symmetric, incentive-compatible, and
sybil-proof direct mechanism is a second-price auction with
symmetric tie-breaking. Any mechanism richer than that has a
scope under which sybil invariance holds and a scope under which
it does not. Our task is to state the scope precisely and measure
deviations empirically (Section~\ref{ch:robustness}), not to
claim more than the impossibility allows.

For aggregation in the presence of adversarial participants,
\citet{guo2024robust} characterise the regret-optimal aggregator
in a binary-state setting with a bounded fraction of adversarial
experts. Under $L^1$ loss the truncated mean, which discards the
$k$ lowest and $k$ highest reports and averages the remainder, is
optimal. For $L^2$ loss the optimal aggregators are piecewise
linear. We include a \texttt{trimmed\_mean} baseline throughout
the empirical chapters for this reason. Section~\ref{ch:real}
reports its CRPS head-to-head against the mechanism and its
dependence on the number of forecasters. See also
\citet{berta2023spatialmarket} for an adversarially robust
data-market analogue in a crowd-sourced spatial-data setting.

Two further works frame the repeated and informational
extensions. \citet{dimitrov2008nonmyopic} showed that rational
non-myopic participants in repeated prediction markets may
report off-belief values to mislead competitors before correcting,
and that a discount factor blunts the incentive.
\citet{johnstone2007economic} provided the informational framing
adopted for our insider-advantage experiment: in a repeated
wagering setting, a participant with superior information
accumulates wealth at a rate determined by the
Kullback--Leibler divergence between her belief and the market's
belief. The insider adversary in Section~\ref{ch:robustness}
replaces the hard leak of the outcome with a low-variance lagged
signal, aligning the attack with this informational model.

Reputation attacks on participant-identity systems form a
distinct literature. The relevant precedent is
\citet{feldman2004freeriding}, who catalogued the *whitewashing*
attack, in which a participant abandons a degraded reputation
and re-enters as a newcomer. They showed that a penalty on
every newcomer partly offsets the incentive. The reputation-reset
adversary in Section~\ref{ch:robustness} tests this attack
against the skill layer. The staleness decay $\kappa$ together
with the non-unit prior $\sigma_{\mathrm{init}}$ implements the
newcomer-penalty recommendation.

\citet{witkowski2018forecasting} distinguish self-financed
wagering from incentive-compatible *forecasting competitions*. In
a winner-take-all tournament, participants have an incentive to
report extreme beliefs so as to maximise the probability of
winning, and truthful reporting requires a different mechanism
design. The present mechanism is a self-financed market, not a
tournament: budget balance, not a fixed prize pool, underwrites
per-round truthfulness.

## Online learning for forecast combination

The closest direct reference work is
\citet{vitali2025intermittent}, who proposed a prediction market
that tracks historical performance, adapts to time-varying
conditions, and allows agents to join and leave. They use robust
regression with online gradient descent on the simplex to learn
relative combination weights, and introduce an in-sample plus
out-of-sample payoff allocation. The two approaches differ in
four respects. Our weights are absolute rather than relative:
we learn a scalar skill $\sigma_i$ per participant, rather than
a simplex-constrained weight vector. The present mechanism is
self-financed by construction, inheriting the Lambert payoff
formula, whereas \citet{vitali2025intermittent} relax budget
balance to enable the online-gradient-descent update. A single
object, the effective wager $m_i$, governs both aggregation
weight and financial exposure in our design, whereas theirs
separates the two. Intermittency is handled through a staleness
decay toward a neutral prior, not through robust regression.
Table~\ref{tab:vitali-diff} summarises these differences.

\begin{table}[h]
\centering
\small
\begin{tabular}{p{4.8cm}p{4.2cm}p{5.2cm}}
\toprule
& Vitali \& Pinson (2025) & This thesis \\
\midrule
Weights & Relative (simplex), OGD & Absolute (EWMA of loss) \\
Self-financed & No (separate allocation) & Yes (Lambert/Raja inherited) \\
Single object for influence and exposure & No & Yes (effective wager $m_i$) \\
Intermittency & Robust regression & Staleness decay toward prior \\
\bottomrule
\end{tabular}
\caption{Positioning relative to \citet{vitali2025intermittent}.}
\label{tab:vitali-diff}
\end{table}

Their online-gradient-descent variant is retained as a published
reference aggregator throughout the empirical chapters, where it
appears as a shifted-median fan baseline (Section~\ref{ch:real}).
The ratio of our mechanism to this baseline is $0.985$ on the
3000-point audit slice, a $1.5\%$ CRPS advantage for the
self-financed design on that slice. On the full $17{,}344$-hour
expanding-mode wind run, the per-quantile OGD baseline of
\citet{vitali2025intermittent} reduces CRPS against our mechanism
by roughly fourteen percentage points. The gap quantifies the
CRPS cost of preserving the Lambert budget-balance guarantee
rather than relaxing to a per-quantile simplex aggregator.

A parallel line in the electricity-price forecasting community
has produced *horizontal* (cross-quantile) online aggregators.
\citet{berrisch2024multivariate} generalise CRPS learning to
multivariate distributional forecasts using Bernstein Online
Aggregation, with smoothing via basis matrices or penalised
splines, and report CRPS gains over uniform weights on day-ahead
electricity prices. Their formulation is more general on the
aggregator side and imposes no budget-balance constraint. As with
\citet{vitali2025intermittent}, the cost is that identity,
deposit, and aggregation-weight are three independent quantities
rather than unified through an effective wager.
\citet{guillot2023adaptive} apply residual-quantile online
gradient descent with multi-learning-rate expert aggregation to
regional net-load in Great Britain and city demand in the United
States. Their work is the closest methodological reference for
the per-quantile OGD baseline used throughout the empirical
chapters. The isotonic-QRA post-processor of
\citet{kostrzewski2025iqra} goes the other way, imposing
stochastic order constraints on quantile ensembles without
online weight learning, and reports reliability gains over
conformal prediction on the German day-ahead market. The
present work sits between the two: the Lambert algebra is kept
as a hard constraint and scalar online skill estimation is the
one free handle added on top.

The real-world analogue of the mechanism studied here is the
Predico collaborative forecasting platform \citep{elia2024predico},
operated by Elia and INESC TEC, which hosts renewable-power
ensemble forecasts from external contributors under an explicit
performance-weighted compensation scheme.
\citet{goncalves2025budget} propose a budget-constrained
data/analytics market for the same setting, using bidding for
feature prices and spline-LASSO regression for aggregation, and
report over $10\%$ root-mean-squared-error gains for data
sellers. Our contribution is complementary: the weighting and
data-sharing questions are held fixed in the Lambert--Raja
wagering-mechanism form, and the skill-gate and calibration
layers on top are what we study.

The theoretical grounding of online aggregation is the
regret-minimisation framework of \citet{cesabianchi2006prediction},
in which the cumulative loss of the aggregator is compared with
the cumulative loss of the best expert in hindsight.
\citet{chen2010new} made the equivalence between market scoring
rules and online no-regret algorithms explicit, which motivates
our EWMA skill layer as a bounded-regret estimator on stationary
panels. The market-price convergence side of that correspondence
is sharpened by \citet{chen2022priceinterpretability}. The choice
of loss matters. \citet{thorey2019crpsmixable} prove that CRPS is
a mixable loss, from which a time-independent regret bound
follows for Vovk's aggregating algorithm. This result is the
theoretical justification for using the mechanism's scoring rule
also as the skill-estimation loss. The EWMA update is consistent
under stationarity by the classical stochastic approximation
result of \citet{robbins1951stochastic}. Under non-stationarity,
the tracking error is bounded by $O(\rho \cdot \mathrm{drift})$
with $\rho$ the EWMA learning rate
\citep{benveniste1990adaptive}. The bankroll-confidence deposit
policy is a deterministic analogue of the log-optimal growth
criterion of \citet{kelly1956new}, with the log-optimal rate
replaced by a bounded monotone function of forecast spread as a
proxy for precision.

\citet{neyman2021quasiarithmetic} provide the other theoretical
anchor for our aggregator. They associate to each strictly proper
scoring rule $s$ a quasi-arithmetic (QA) pooling operator
$\mathrm{QA}_s$ that maps expert forecasts and expert weights to
a consensus forecast, and show three things that transfer
directly to our setting. A principal who sub-contracts experts
under $s$ and pays them in proportion to their weights maximises
worst-case profit by aggregating via $\mathrm{QA}_s$: the QA pool
is the max-min-optimal aggregator for that scoring rule. QA
pooling under the quadratic and logarithmic scores recovers the
linear pool (over CDFs) and the logarithmic pool respectively.
Under the pinball scoring rule on a finite $\tau$-grid,
$\mathrm{QA}_s$ reduces to pointwise weighted quantile averaging,
which is what the mechanism implements. The aggregator's expected
score is concave in the weights, so online gradient descent
achieves sub-linear regret on the weight simplex. The pinball
specialisation and its relation to the weighted-quantile operator
used here are discussed in Chapter~\ref{ch:mechanism} and
Appendix~\ref{app:qa-pool}. The last point is the theoretical
regime that \citet{vitali2025intermittent} and
\citet{berrisch2024multivariate} exploit. The present mechanism
fixes the weights at effective wagers $m_i$ and uses the scalar
skill $\sigma_i$ as the single degree of freedom, so online
learning occurs on $\sigma_i$ rather than on the weight vector.

The forecast-combination literature provides the canonical
baselines against which any adaptive aggregator must be compared.
\citet{bates1969combination} introduced inverse-variance
weighting for point forecasts, and \citet{timmermann2006forecast}
documented the *combination puzzle*: simple equal weights often
outperform theoretically optimal combinations in practice,
because the weight parameters must be estimated. The fifty-year
review by \citet{wang2023combinations} catalogues the development
from fixed-weight averages to time-varying, feature- and
performance-conditioned combinations, and confirms the puzzle's
persistence across empirical comparisons: the balance shifts
toward adaptive schemes only when the forecaster panel is
sufficiently heterogeneous and the evaluation window sufficiently
long. \citet{magnus2023inconvenient} sharpen this further. For two
competing efficient forecasts, any convex combination can be
inefficient, even the optimal weighted average in the
minimum-MSPE sense, because averaging can introduce serial
correlation in the combined errors that the individual forecasts
did not carry. The caveat matters for reading any linear-pool
result, including ours: a well-performing combined CRPS does not
guarantee an efficient combined forecast. The empirical findings
of Section~\ref{ch:real} line up with this literature. On Elia
offshore wind, with sufficient forecaster heterogeneity and a
long evaluation window, the adaptive skill gate reduces CRPS
against uniform averaging by $7.1\%$. On Elia
electricity-imbalance prices, where the seven forecasters produce
CRPS values within $1\%$ of each other, the mechanism is
statistically indistinguishable from uniform. That is the regime
the combination puzzle predicts.

Recent work on *performative* prediction
\citep{hardt2023performative, oesterheld2023performative}
considers the case in which the forecast itself influences the
outcome, creating a fixed-point problem.
\citet{oesterheld2023performative} derive scoring-rule variants
that are incentive-compatible under performativity when the
participant can choose among several self-fulfilling equilibria.
We do not model performativity directly, but record that it
would amplify the strategic-reporting threat in
Section~\ref{ch:robustness}: shifting the aggregate report
$\hat r$ could also shift the outcome $y$ that scores the
attacker. Extending the skill layer to performative settings is
a natural direction for future work.

An empirical counterpart is the trade-based manipulation study
of \citet{shanaev2025manipulable}, who show in a pre-registered
experiment on a live prediction market that the price effects of
adversarial trades persist beyond sixty days. Even thinly-traded
markets can be moved by strategic participants with modest
budgets. \citet{gervasini2025arbitrage} complement this with a
large-scale on-chain study of Polymarket, documenting over
$40$ million USD of realised arbitrage profit from
probability-inconsistent pricing across more than $7{,}000$
markets during 2024--2025. In an adjacent accuracy problem,
\citet{liu2025weatherattack} show that adversarial perturbations
to fewer than $0.1\%$ of weather observations substantially
degrade numerical-weather forecasts. A mechanism sitting on top
of externally-supplied forecasts inherits the adversarial
surface of those forecasters' input data. Our robustness chapter
implements the wagering-mechanism analogues of these threat
models on synthetic latent-skill data-generating processes. It
finds that arbitrage profit scales monotonically with $\lambda$
while narrow Lambert sybil invariance holds to floating-point
noise.

## Probabilistic forecast evaluation and calibration

Scoring rules support both the mechanism's truthfulness argument
and its empirical evaluation. \citet{gneiting2007strictly} defined
strict propriety: a participant maximises expected score only by
reporting the true distribution. They showed that the continuous
ranked probability score (CRPS) and the pinball loss are strictly
proper. \citet{steinwart2011estimating} gave the formal statement
that pinball loss is strictly consistent for the $\tau$-quantile
functional under mild conditions. This is the elicitability
result underlying our per-round truthfulness argument when
participants report quantile grids.

The guiding principle for probabilistic forecast evaluation is
due to \citet{gneiting2007probabilistic}: maximise sharpness
subject to calibration. Sharpness is a property of the forecast
alone, whereas calibration is joint with the observations. A
modern overview of quantile-specific model diagnostics, including
conditional calibration, reliability diagrams for quantiles, and
Murphy diagrams, is given in \citet{gneiting2023model}. The
central impossibility is due to \citet{ranjan2010combining}: any
non-trivial weighted average of two or more distinct calibrated
probability forecasts, taken as a linear pool over CDFs, is
uncalibrated and lacks sharpness. Our aggregator takes a
pointwise weighted quantile average rather than a linear pool
over CDFs, but is qualitatively susceptible to the same
under-dispersion pattern. This motivates the post-hoc
recalibration layer developed in Section~\ref{ch:recalibration}.
\citet{gneiting2013combining} proposed the Beta-transformed
linear pool as a parametric alternative to isotonic recalibration
that preserves sharpness better. The extension is not implemented
here and is identified as future work in
Chapter~\ref{ch:conclusion}.

Our recalibration layer implements the isotonic post-processor of
\citet{kuleshov2018accurate} in a rolling-buffer, prequential
configuration \citep{dawid1984prequential}. Their Theorem~1 gives
asymptotic convergence to calibration under an independent,
identically distributed assumption that cannot be invoked
directly for wind and electricity data. The adversarial,
online-regret extension in \citet{deshpande2023calibrated}
relaxes the independence assumption at the cost of
finite-horizon rather than asymptotic calibration guarantees.
The rolling-buffer design is therefore safer than a fixed
held-out fit under potential non-stationarity.

The evaluation methodology is the prequential protocol of
\citet{dawid1984prequential}, in which each observation is first
used for testing and then for training. Practical protocols for
time-series forecasting derive from \citet{tashman2000outofsample},
who formalised rolling-origin evaluation;
\citet{gama2013stream}, who adapted prequential error estimation
to streaming settings; and \citet{cerqueira2020evaluating}, who
empirically compared performance-estimation methods for time
series. We use expanding-window cross-validation with a 24-step
embargo for the XGBoost and multilayer-perceptron forecasters,
following \citet{bergmeir2018note}, who showed this to be a safe
default when autocorrelation in residuals cannot be ruled out.
Paired forecast comparisons are reported using the test of
\citet{diebold1995comparing} with heteroscedasticity- and
autocorrelation-consistent standard errors.

## Gap and thesis roadmap

Existing work provides either strong axiomatic structure without
online adaptation \citep{lambert2008selffinanced, raja2024wagering}
or online adaptation without budget balance
\citep{vitali2025intermittent, berrisch2024multivariate}.
Data-sharing incentive markets with forecasting applications
\citep{goncalves2025budget, falconer2025replication, elia2024predico}
treat the skill and replication problems as allocation questions
on top of a fixed forecasting layer, and do not integrate an
online skill signal into the wagering algebra itself.
Conformal-style recalibration
\citep{kuleshov2018accurate, deshpande2023calibrated} and
isotonic quantile-ensemble post-processors
\citep{kostrzewski2025iqra} work at the distributional
post-processing layer. They are typically applied to a single
model or to a precomputed ensemble without payoff-level
incentive feedback. No published work combines a self-financed
wagering mechanism with an online skill signal on top of a
strictly proper quantile scoring rule, together with an explicit
calibration analysis. The present thesis closes that gap.

The remainder of the thesis follows the standard empirical
structure, with the mechanism specified before methods so the
object under test is on the table when the experiments are
introduced. Chapter~\ref{ch:mechanism} specifies the mechanism in
full: round structure, skill gate, settlement algebra, and the
argument that making the effective wager $m_i$ the single object
governing both influence and exposure preserves the Lambert
axioms. Chapter~\ref{ch:methodology} describes the datasets, the
forecaster panel, and the experimental protocol, with the four
rungs of the validity ladder that each empirical result is scored
against. Chapter~\ref{ch:results} reports the empirical evidence
in four sections: synthetic validation (mechanism correctness,
skill recovery, deposit-policy ablation, weight-rule comparison,
bankroll-pipeline ablation, panel-size scaling, and risk-aversion
sensitivity); real-data validation on Elia offshore wind and
electricity-imbalance prices, together with the external
comparison against Elia's own operational forecast; a rolling
isotonic recalibration layer as a post-hoc remedy for the
\citet{ranjan2010combining} linear-pool miscalibration; and
strategic robustness under the theory-grounded adversary
catalogue. Interpretation of each result sits next to the
numbers that produced it, and limitations are recorded in the
same section. Chapter~\ref{ch:conclusion} summarises the
findings and outlines future work.
Chapter~\ref{ch:project-management} records the project plan and
risk management. Chapter~\ref{ch:reflection} gives a short
personal reflection, as required by the Design Engineering
Master's Project assessment criteria.
