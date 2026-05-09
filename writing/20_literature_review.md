# Related work {#ch:related}

This chapter reviews the three research strands on which the thesis
builds: self-financed wagering mechanisms, online learning for
forecast combination, and probabilistic forecast evaluation and
calibration. The structure follows the logical dependencies of the
mechanism developed in Chapter 3 rather than a strict chronology.

## Self-financed wagering mechanisms

The foundational result is due to \citet{lambert2008selffinanced},
who defined a wagering mechanism as a triple of report vector,
outcome space, and payoff function, and identified seven axiomatic
properties: budget balance, anonymity, truthfulness, sybil-proofness,
normality, individual rationality, and monotonicity. They showed
that the single-parameter weighted-score mechanism with payoff
$$
  \Pi_i(r, m, \omega) = m_i \left( 1 + s(r_i, \omega)
    - \frac{\sum_j s(r_j, \omega)\, m_j}{\sum_j m_j} \right)
$$
satisfies all seven, and that it is the unique mechanism satisfying
the first five. Sybil-proofness is proved for the case in which
clones report identically and the total wager is conserved, a scope
qualification that recurs throughout the later literature. Our
mechanism preserves this payoff form exactly, substituting the
effective wager $m_i$ for the raw deposit, so that the Lambert
truthfulness and sybil proofs apply unchanged on a per-round basis.

\citet{raja2024wagering} extended the framework from binary or
discrete outcomes to continuous outcomes and probabilistic quantile
forecasts, in the setting of an energy-sector prediction market with
an explicit buyer. They showed that the payoff mechanism retains
budget balance, truthfulness, sybil-proofness, and individual
rationality in the quantile setting. Each market instance remains
history-free: no inter-round state is accumulated. The online skill
layer developed in Chapter 3 is precisely the component that
accumulates such state across rounds while keeping the per-round
payoff algebra intact.

The arbitrage properties of weighted-score mechanisms were
characterised by \citet{chen2014arbitrage}. They showed that, for
any differentiable strictly proper scoring rule, participant $i$ can
choose a report in an \emph{arbitrage interval} that yields a
non-negative payoff under every outcome, strictly positive whenever
other participants disagree (their Theorem 3.3). The arbitrage-seeking
adversary studied in Chapter 8 implements the mean-absolute-error
analogue of this arbitrage point, namely the wager-weighted median
of other reports, and participates only when the expected profit
under a uniform outcome is strictly positive. Empirically this
extracts $+12$ to $+24$ cumulative profit per 1000 rounds across our
$\lambda$ grid, confirming the theorem. \citet{chen2014arbitrage}
also constructed a family of no-arbitrage wagering mechanisms that
preserve anonymity, individual rationality, incentive compatibility,
weak budget balance, and sybil-proofness for the $f$-NAWM subclass.
Moving to that family is out of scope here; the contribution of the
present thesis is the composition of budget balance with an online
skill layer and a post-hoc calibration layer, not the removal of
arbitrage.

\citet{chun2011cooperating} studied coalitions in strictly-proper
elicitation. They showed that a coalition $C$ of participants with
immutable beliefs who all report the common value
$$p_C = \sum_{i \in C} \frac{w_i}{W_C}\, p_i, \qquad
  W_C = \sum_{i \in C} w_i,$$
earns a strictly higher total payoff than reporting truthfully,
whenever coalition members disagree. This formula provides the
specification for the coordinated-group adversary evaluated in
Chapter 8; combined with a privileged lagged signal under an AR(1)
outcome process, the attack attains cumulative profit of $+33.84$
per 1000 rounds.

An adjacent line concerns replication-style attacks on machine-learning
markets. \citet{falconer2025replication} study analytics markets in
which agents can replicate their features under synthetic identities
to inflate their Shapley-style allocation; their causally-refined
reward uses observational versus interventional conditional
probabilities to neutralise the attack. The wagering-mechanism sybil
invariance of \citet{lambert2008selffinanced} solves a different
problem: identical-report clones with conserved total deposit retain
identical total profit. The diversified-report sybil evaluated in
Chapter 8, which departs from the Lambert scope qualification, is
the analogue of the strategic-replication attack Falconer et al.\
target. The breadth of that scope qualification is not an accident:
\citet{pan2024sybilproof} show that in the single-parameter
mechanism-design environment, the only non-wasteful, symmetric,
incentive-compatible, and sybil-proof direct mechanism is a
second-price auction with symmetric tie-breaking. Any mechanism
richer than that will therefore have a scope under which sybil
invariance holds and a scope under which it does not; our task is
to state the scope precisely and measure deviations empirically
(Chapter 8), not to claim something stronger than the impossibility
allows.

For aggregation in the presence of adversarial participants,
\citet{guo2024robust} characterise the regret-optimal aggregator in
a binary-state setting with a bounded fraction of adversarial
experts: under $L^1$ loss the truncated mean, which discards the
$k$ lowest and $k$ highest reports and averages the remainder, is
optimal; for $L^2$ loss the optimal aggregators are piecewise
linear. We include a \texttt{trimmed\_mean} baseline throughout the
empirical chapters for exactly this reason; Chapter 6 reports its
CRPS head-to-head against the mechanism and its dependence on the
number of forecasters. See also \citet{berta2023spatialmarket} for
an adversarially robust data-market analogue in a crowd-sourced
spatial-data setting.

Two further works are relevant as framing.
\citet{dimitrov2008nonmyopic} observed that rational non-myopic
forecasters in repeated prediction markets may report off-belief
values to mislead competitors before correcting, and that a discount
factor can blunt the incentive. \citet{johnstone2007economic}
provided the informational framing adopted for our insider-advantage
experiment: in a repeated wagering setting, a forecaster with
superior information accumulates wealth at a rate determined by the
Kullback--Leibler divergence between her belief and the market's
belief. The insider adversary in Chapter 8 replaces the hard leak
of the outcome with a low-variance lagged signal, aligning the
attack with this informational model.

Reputation attacks on participant-identity systems form a distinct
literature. The relevant precedent is \citet{feldman2004freeriding},
who catalogued the \emph{whitewashing} attack, in which a
participant abandons a degraded reputation and re-enters as a
newcomer, and showed that a penalty on every newcomer partly offsets
the incentive. The reputation-reset adversary in Chapter 8 tests
this attack against the skill layer; the staleness decay $\kappa$
together with the non-unit prior $\sigma_{\mathrm{init}}$ realises
the newcomer-penalty recommendation.

Finally, \citet{witkowski2018forecasting} distinguish self-financed
wagering from incentive-compatible \emph{forecasting competitions}.
In a winner-take-all tournament, forecasters have an incentive to
report extreme beliefs so as to maximise the probability of winning,
and truthful reporting requires a different mechanism design. The
present mechanism is a self-financed market, not a tournament;
budget balance, not a fixed prize pool, underwrites per-round
truthfulness.

## Online learning for forecast combination

The closest direct antecedent is \citet{vitali2025intermittent}, who
proposed a prediction market that tracks historical performance,
adapts to time-varying conditions, and allows agents to join and
leave. They use robust regression with online gradient descent on
the simplex to learn relative combination weights, and introduce an
in-sample plus out-of-sample payoff allocation. The two approaches
differ in four respects. First, the weights in the present mechanism
are absolute rather than relative: we learn a scalar skill $\sigma_i$
per participant, rather than a simplex-constrained weight vector.
Second, the present mechanism is self-financed by construction,
inheriting the Lambert payoff formula, whereas
\citet{vitali2025intermittent} relax self-financing to enable the
online-gradient-descent update. Third, a single object, the
effective wager $m_i$---governs both aggregation weight and financial
exposure in our design, whereas theirs separates the two. Fourth,
intermittency is handled through a staleness decay toward a neutral
prior, not through robust regression. Table~\ref{tab:vitali-diff}
summarises these differences.

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
appears as a shifted-median fan baseline (Chapter 6). The ratio of
our mechanism to this baseline is $0.985$ on the 3000-point audit
slice, a $1.5\%$ CRPS advantage for the self-financed design on that
slice. On the full 17{,}344-hour expanding-mode wind run, the
per-quantile OGD baseline of \citet{vitali2025intermittent} improves
on our mechanism by approximately eleven percentage points of CRPS;
this gap quantifies the CRPS cost of preserving the Lambert
budget-balance guarantee rather than relaxing to a per-quantile
simplex aggregator.

A parallel line in the electricity-price forecasting community has
produced \emph{horizontal} (cross-quantile) online aggregators.
\citet{berrisch2024multivariate} generalise CRPS learning to
multivariate distributional forecasts using Bernstein Online
Aggregation (BOA), with smoothing via basis matrices or penalised
splines, and report significant CRPS gains over uniform weights on
day-ahead electricity prices. Their framework is more general on
the aggregator side and imposes no self-financing constraint; as
with \citet{vitali2025intermittent}, the cost is that identity,
deposit, and aggregation-weight are three independent quantities
rather than being unified through an effective wager.
\citet{guillot2023adaptive} apply residual-quantile online gradient
descent with multi-learning-rate expert aggregation to regional net-load
in Great Britain and city demand in the United States, and constitute
the closest methodological
predecessor to the per-quantile OGD baseline used throughout the
present empirical chapters. The isotonic-QRA post-processor of
\citet{kostrzewski2025iqra} goes the other way, imposing stochastic
order constraints on quantile ensembles without online weight
learning, and reports reliability gains over conformal prediction
on the German day-ahead market. The present work sits between the
two, retaining the Lambert algebra as a hard constraint and adding
scalar online skill estimation as the one free handle.

The real-world analogue of the mechanism studied here is the Predico
collaborative forecasting platform \citep{elia2024predico}, operated
by Elia and INESC TEC, which hosts renewable-power ensemble
forecasts from external contributors under an explicit
performance-weighted compensation scheme.
\citet{goncalves2025budget} propose a budget-constrained data/analytics
market for the same setting, using bidding for feature prices and
spline-LASSO regression for aggregation, showing over $10\%$
root-mean-squared-error gains for data sellers. Our contribution is
complementary: we hold the weighting and data-sharing questions
fixed in the Lambert-Raja wagering-mechanism form, and study the
skill-gate and calibration layers that sit on top.

The theoretical grounding of online aggregation is the
regret-minimisation framework of \citet{cesabianchi2006prediction},
in which the cumulative loss of the aggregator is compared with the
cumulative loss of the best expert in hindsight. \citet{chen2010new}
made the equivalence between market scoring rules and online
no-regret algorithms explicit, which motivates our EWMA skill layer
as a bounded-regret estimator on stationary panels; the
market-price convergence side of that correspondence is sharpened
by \citet{chen2022priceinterpretability}. The specific choice of
loss matters: \citet{thorey2019crpsmixable} prove that CRPS is a
mixable loss, from which a time-independent regret bound follows
for Vovk's aggregating algorithm; this is the theoretical
justification for using the mechanism's scoring rule also as the
skill-estimation loss. The EWMA update is consistent under
stationarity by the classical stochastic approximation result of
\citet{robbins1951stochastic}; under non-stationarity, the tracking
error is bounded by $O(\rho \cdot \mathrm{drift})$, with $\rho$ the
EWMA learning rate \citep{benveniste1990adaptive}. The
bankroll-confidence deposit policy is a deterministic analogue of
the log-optimal growth criterion of \citet{kelly1956new}, in which
the log-optimal rate is replaced by a bounded monotone function of
forecast spread as a proxy for precision.

\citet{neyman2021quasiarithmetic} provide the other theoretical
anchor for our aggregator. They associate to each strictly proper
scoring rule $s$ a quasi-arithmetic (QA) pooling operator
$\mathrm{QA}_s$ that maps expert forecasts and expert weights to a
consensus forecast, and show three things that transfer directly to
our setting. First, a principal who sub-contracts experts under $s$
and pays them in proportion to their weights maximises worst-case
profit by aggregating via $\mathrm{QA}_s$: the QA pool is the
max-min-optimal aggregator for that scoring rule. Second, QA pooling
under the quadratic and logarithmic scores recovers the linear pool
(over CDFs) and the logarithmic pool respectively; under the
pinball scoring rule on a finite $\tau$-grid, $\mathrm{QA}_s$
reduces to pointwise weighted quantile averaging, which is what
the mechanism implements. Third, the aggregator's expected score is
concave in the weights, so online gradient descent achieves
sub-linear regret on the weight simplex. Chapter~\ref{ch:mechanism}
states the pinball specialisation as
Proposition~\ref{prop:qa-pinball}. The last point is exactly the
theoretical regime that \citet{vitali2025intermittent} and
\citet{berrisch2024multivariate} exploit; the present mechanism
instead fixes the weights at effective wagers $m_i$ and uses the
scalar skill $\sigma_i$ as the single degree of freedom, so online
learning occurs on $\sigma_i$ rather than on the weight vector.

The forecast-combination literature provides the canonical baselines
against which any adaptive aggregator must be compared.
\citet{bates1969combination} introduced inverse-variance weighting
for point forecasts, and \citet{timmermann2006forecast} documented
the \emph{combination puzzle}: simple equal weights often outperform
theoretically optimal combinations in practice, owing to estimation
error in the weight parameters. \citet{magnus2023inconvenient}
sharpen this further: for two competing efficient forecasts, any
convex combination can be inefficient --- even the \emph{optimal}
weighted average in the minimum-MSPE sense --- because averaging can
introduce serial correlation in the combined errors that the
individual forecasts did not carry. This is an important caveat on
reading any linear-pool result, including ours: a well-performing
combined CRPS does not guarantee an efficient combined forecast.
The empirical findings of Chapter 6 are consistent with this
literature. On Elia offshore wind, with sufficient forecaster
heterogeneity and a long evaluation window, the adaptive skill gate
improves on uniform averaging by $7.1\%$
CRPS; on Elia electricity-imbalance prices, where the seven
forecasters produce near-identical CRPS, the mechanism is
statistically indistinguishable from uniform, which is the regime
the combination puzzle predicts.

Recent work on \emph{performative} prediction
\citep{hardt2023performative, oesterheld2023performative} considers
the case in which the forecast itself influences the outcome,
creating a fixed-point problem. \citet{oesterheld2023performative}
derive scoring-rule variants that are incentive-compatible under
performativity when the forecaster can choose among several
self-fulfilling equilibria. We do not model performativity
directly, but record that it would amplify the strategic-reporting
threat in Chapter 8: shifting the aggregate report $\hat r$ could
also shift the outcome $y$ that scores the attacker. Extending the
skill layer to performative settings is a natural direction for
future work.

An empirical counterpart is the trade-based manipulation study of
\citet{shanaev2025manipulable}, who show in a pre-registered
experiment on a live prediction market that the price effects of
adversarial trades persist beyond sixty days, suggesting that even
thinly-traded markets can be moved by strategic participants with
modest budgets. \citet{gervasini2025arbitrage} complement this with
a large-scale on-chain study of Polymarket, documenting over
40 million USD of realised arbitrage profit from
probability-inconsistent pricing across more than 7{,}000 markets
during 2024--2025. In the
forecasting-accuracy adjacent domain, \citet{liu2025weatherattack}
show that adversarial perturbations to fewer than 0.1\% of weather
observations substantially degrade numerical-weather forecasts ---
a reminder that a mechanism sitting on top of externally-supplied
forecasts inherits the adversarial surface of those forecasters'
input data. Our robustness chapter implements the
wagering-mechanism analogues of these threat models on synthetic
latent-skill DGPs, and finds that arbitrage profit scales
monotonically with $\lambda$ while narrow Lambert sybil invariance
holds to floating-point noise.

## Probabilistic forecast evaluation and calibration

Scoring rules support both the mechanism's truthfulness argument and
its empirical evaluation. \citet{gneiting2007strictly} defined strict
propriety, a forecaster maximises expected score only by reporting
the true distribution, and showed that the continuous ranked
probability score (CRPS) and the pinball loss are strictly proper.
\citet{steinwart2011estimating} gave the formal statement that
pinball loss is strictly consistent for the $\tau$-quantile
functional under mild conditions, which is the elicitability result
underlying our per-round truthfulness argument when participants
report quantile grids.

The guiding principle for probabilistic forecast evaluation is due
to \citet{gneiting2007probabilistic}: maximise sharpness subject to
calibration. Sharpness is a property of the forecast alone, whereas
calibration is joint with the observations. A modern overview of
quantile-specific model diagnostics, including conditional
calibration, reliability diagrams for quantiles, and Murphy
diagrams, is given in \citet{gneiting2023model}. The key
impossibility is due to \citet{ranjan2010combining}: any non-trivial
weighted average of two or more distinct calibrated probability
forecasts, taken as a linear pool over CDFs, is necessarily
uncalibrated and lacks sharpness. Our aggregator takes a pointwise
weighted quantile average rather than a linear pool over CDFs, but
is qualitatively susceptible to the same under-dispersion pattern;
this motivates the post-hoc recalibration layer developed in
Chapter 7. \citet{gneiting2013combining} proposed the
Beta-transformed linear pool as a parametric alternative to
isotonic recalibration that preserves sharpness better; this
extension is not implemented here and is identified as future work
in Chapter 10.

Our recalibration layer implements the isotonic post-processor of
\citet{kuleshov2018accurate} in a rolling-buffer, prequential
configuration \citep{dawid1984prequential}. Their Theorem 1 gives
asymptotic convergence to calibration under an independent,
identically distributed assumption that cannot be invoked directly
for wind and electricity data. The adversarial, online-regret
extension in \citet{deshpande2023calibrated} relaxes the
independence assumption at the cost of finite-horizon rather than
asymptotic calibration guarantees, and motivates the rolling-buffer
design as safer than a fixed held-out fit under potential
non-stationarity.

The evaluation methodology is the prequential framework of
\citet{dawid1984prequential}, in which each observation is first
used for testing and then for training. Practical protocols for
time-series forecasting derive from \citet{tashman2000outofsample},
who formalised rolling-origin evaluation;
\citet{gama2013stream}, who adapted prequential error estimation to
streaming settings; and \citet{cerqueira2020evaluating}, who
empirically compared performance-estimation methods for time series.
We use expanding-window cross-validation with a 24-step embargo for
the XGBoost and multilayer-perceptron forecasters, following
\citet{bergmeir2018note}, who showed this to be a safe default when
autocorrelation in residuals cannot be ruled out. Paired forecast
comparisons are reported using the test of
\citet{diebold1995comparing} with heteroscedasticity- and
autocorrelation-consistent standard errors.

## Gap statement

Existing work provides either strong axiomatic structure without
online adaptation \citep{lambert2008selffinanced, raja2024wagering}
or online adaptation without self-financing
\citep{vitali2025intermittent, berrisch2024multivariate}. Data-sharing
incentive markets with forecasting applications
\citep{goncalves2025budget, falconer2025replication, elia2024predico}
treat the skill and replication problems as allocation
questions on top of a fixed forecasting layer, and do not
integrate an online skill signal into the wagering algebra
itself. Conformal-style recalibration
\citep{kuleshov2018accurate, deshpande2023calibrated} and isotonic
quantile-ensemble post-processors \citep{kostrzewski2025iqra} work
at the distributional post-processing layer and are typically
applied to a single model or to a precomputed ensemble without
payoff-level incentive feedback. No published work combines a
self-financed wagering mechanism with an online skill signal on top
of a strictly-proper quantile scoring rule together with an explicit
calibration analysis. The present thesis addresses this gap.
