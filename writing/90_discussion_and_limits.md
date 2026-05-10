# Discussion {#ch:discussion}

This chapter interprets the results of Sections~\ref{ch:synthetic}
through~\ref{ch:robustness}, places them against the wider forecast
combination and mechanism design literature, and states the scope
conditions under which the headline claims hold.

## Interpreting the forecasting result

On Elia offshore wind the mechanism reduces mean CRPS by $7.1\%$
relative to uniform averaging over $17{,}344$ evaluation rounds
(Diebold--Mariano $t = 40.77$, $p \approx 0$). Two aspects of this
number matter more than its magnitude.

The first is that the gain coincides, to within statistical noise,
with Bates--Granger-style inverse-CRPS weighting ($-7.0\%$), a
baseline that is itself dominated by the unweighted median
($-9.3\%$) on the same slice. The adaptive skill layer is therefore
a minor source of the improvement on this panel; almost all of the
gain is accessible to any aggregator that uses even a crude proxy
for historical reliability. Read against \citet{timmermann2006forecast}
and \citet{magnus2023inconvenient}, this is the expected regime for
forecast combination: once a panel is sufficiently heterogeneous
for reliability weighting to help at all, the choice between
different reliability-weighting schemes is of second order. The
thesis therefore does not position the skill gate as a source of
CRPS gain on its own. Its role is to carry the reliability signal
through the wager pool --- the economic layer --- rather than as a
separate weighting module bolted on top.

The second is the width of the oracle gap. The per-round argmin
oracle reaches $0.02176$ on the same slice, about forty percentage
points below uniform averaging. The mechanism closes $15\%$ of that
gap, whereas \citet{vitali2025intermittent}'s per-quantile OGD
variant closes about $33\%$ of it; the residual gap, common to
every aggregator considered, is the information that a single
round's data simply cannot reveal about which forecaster is
currently best. The CRPS cost of the skill gate relative to OGD is
the price of keeping the mechanism self-financed; this is discussed
further below.

On Elia electricity imbalance prices the mechanism is statistically
indistinguishable from uniform averaging ($t = 0.008$,
$p = 0.994$). The seven forecasters agree within $0.8\%$ of each
other, so no amount of adaptive reweighting can recover a signal
that does not exist in the panel. This is the
forecast-combination-puzzle regime of
\citet{timmermann2006forecast}. Reporting this null result is a
deliberate choice: suppressing it would misrepresent the scope of
the headline claim.

### Comparison against the operational forecast

Two findings from the comparison against Elia's own published
wind-power forecasts deserve a brief interpretation. First, a
plain online XGBoost trained on the observed series alone, with no
weather inputs, reaches $69.5$~MW in CRPS-megawatt-equivalent
units against Elia's real-time forecast at $74.0$~MW: an online
point-forecast model with lag features and rolling statistics beats
a weather-driven operational forecast by about $6\%$ on the hours
tested. The gap is neither surprising nor a critique of the Elia
pipeline --- Elia's forecast is designed for multi-step-ahead use
--- but it does establish that the forecaster panel contains a
member capable of outperforming the weather baseline at zero-step
horizon.

Second, the mechanism aggregates seven forecasters and lands at
$83.7$~MW, i.e.\ approximately $13\%$ worse than the Elia baseline.
The aggregate is dominated by its weakest members: a panel in
which one forecaster does most of the work is, by construction, a
panel on which an aggregator that cannot concentrate weight enough
cannot match the best single model. This confirms the
best-single-ceiling observation of
\citet{timmermann2006forecast} directly, and motivates the
conditional reading of the $-7.1\%$ headline: the thesis does not
claim to beat operational NWP-driven forecasting; it claims a
conditional improvement over uniform averaging within the
budget-balanced design space.

## Interpreting the economic result

Budget balance holds to machine precision, with the maximum
absolute gap across $1{,}000$ synthetic rounds of order
$10^{-14}$. This is a correctness statement, not a discovery; the
algebra used in Chapter~\ref{ch:mechanism} guarantees it. The
value of the empirical verification is that it rules out
floating-point drift as a path by which balance could be broken
over long runs.

Narrow Lambert sybil invariance holds with a profit ratio of
$1.000000$. Diversified-report sybils, in which clones submit
slightly different reports, break the invariance by approximately
$6.5\%$ empirically. \citet{pan2024sybilproof} show that in the
single-parameter mechanism-design environment, the only
non-wasteful, symmetric, incentive-compatible, sybil-proof direct
mechanism is a second-price auction with symmetric tie-breaking.
Any richer mechanism therefore has a scope qualification somewhere;
the task of the robustness chapter is to state the scope precisely
and measure the empirical gap under small deviations, not to claim
that the scope is wide.

The Chun--Shachter coalition \citep{chun2011cooperating} extracts
$+16.9$ to $+19.9$ profit per $1{,}000$ rounds under the
weighted-mean coordination rule, and $+33.8$ when combined with a
privileged lagged signal. Neither attack is contained by the skill
gate, which by design responds to the aggregate's score rather
than to between-participant correlation. A
collusion-resistant variant of the mechanism would need to score
participants on residual information content rather than on raw
CRPS, which in turn would break the per-round truthfulness
argument; the trade-off is noted in
Chapter~\ref{ch:conclusion}.

Arbitrage profit rises monotonically with the skill-gate floor
$\lambda$, from $+11.68$ at $\lambda = 0$ to $+24.22$ at
$\lambda = 1$ over $1{,}000$ rounds. This is the
\citet{chen2014arbitrage} arbitrage interval fired in the
mean-absolute-error analogue. It is a property of the
weighted-score mechanism family rather than of the skill layer:
the arbitrage surface is inherited from Lambert's mechanism and
would still be present if the skill gate were removed. Removing
the surface requires moving to the no-arbitrage wagering family
constructed by \citet{chen2014arbitrage}, which abandons budget
balance in exchange; that choice is outside the scope of this
thesis.

## What the deposit-policy result does and does not claim

The four-way deposit-policy ablation of Section~\ref{ch:synthetic}
moves CRPS by tens of percent on synthetic data: bankroll-confidence
deposits beat fixed-unit deposits by $10.4\%$ and capture roughly a
quarter of the gap to an oracle-precision policy. The ablation is
meaningful only in a setting in which the mechanism operator
dictates the deposit rule. In a deployed market participants decide
their own deposits and the operator has no instrument with which
to impose a confidence-encoded stake. The Elia real-data runs in
Section~\ref{ch:real} therefore leave deposits at unit and rely on
the skill gate alone; the $-7.1\%$ CRPS improvement reported there
is a skill-gate effect.

The correct reading of the synthetic ablation is a statement about
where the information ceilings sit in the design space: if deposits
could be made to encode observable confidence, the CRPS ceiling
would shift; absent that constraint, the skill gate is the only
lever the operator has. Framed this way, the synthetic result
motivates the mechanism's single-object design (effective wager
$m_i = b_i \cdot g(\sigma_i)$) as the way to carry the skill signal
through the wager pool without requiring the deposit policy to
encode anything.

## The recalibration trade-off

The rolling isotonic recalibrator closes $41\%$ of the tail
calibration gap on the audit slice, at a $1.6\%$ CRPS cost and a
$12\%$ sharpness cost. \citet{gneiting2007probabilistic}'s
calibration-sharpness principle states that calibration is to be
maximised subject to sharpness; our result sits squarely inside the
theoretical floor stated in Proposition~\ref{prop:recal-floor}
(Section~\ref{ch:recalibration}): isotonic post-processing of an
under-dispersed forecast can only re-spread probability mass. The
fact that three pre-registered calibration targets are each missed
by a narrow margin is therefore not a tuning problem --- the
floor was set below the observed values by construction --- but a
signal about how much calibration repair is available without
touching the forecast's sharpness budget.

A Beta-transformed linear pool \citep{gneiting2013combining} is the
natural parametric alternative, since it preserves sharpness more
gracefully at the cost of a functional assumption; implementing it
is listed as a follow-up in Chapter~\ref{ch:conclusion}.

## Limitations

\paragraph{No universal dominance over simple baselines.} On the
full-length wind run the mechanism ties inverse-CRPS weighting
($-7.0\%$ vs $-7.1\%$), loses to the median ($-9.3\%$) and the
trimmed mean ($-7.2\%$), and is beaten by larger margins by
\citet{vitali2025intermittent}'s per-quantile OGD baseline
($-18.0\%$) and the rolling best-single selector ($-22.9\%$). The
contribution is conditional forecast improvement together with a
preserved economic structure, not raw CRPS dominance across all
baselines.

\paragraph{Null result on electricity imbalance.} When the panel
members produce near-identical CRPS within a $1\%$ band, the skill
signal has no persistent structure to exploit and the mechanism
reduces to uniform averaging in expectation. This is consistent
with the combination-puzzle literature and is a property of the
panel, not a failure of the mechanism.

\paragraph{Sensitivity to hyperparameters.} Parameters tuned for
synthetic panels with approximately ten forecasters and
$T \approx 1{,}000$ rounds are not optimal on the wind series,
where a more aggressive $(\gamma, \rho)$ is preferred. The
held-out sensitivity sweep reported in Section~\ref{ch:real}
selects the wind-specific parameters; a poorly tuned skill gate
renders the mechanism marginal against uniform.

\paragraph{Best-single ceiling.} Online XGBoost alone beats the
mechanism by approximately $17\%$ CRPS on the full-length wind
run, because wind power is strongly autocorrelated and a
well-tuned single model captures most of the structure. This is a
ceiling on any aggregator that pools a best model with weaker
panel members.

\paragraph{Linear-pool tail miscalibration.} Any non-trivial
weighted average of distinct calibrated forecasts is uncalibrated
by the \citet{ranjan2010combining} argument. The aggregate shows
approximately two percentage points of systematic tail deviation;
recalibration closes $41\%$ of it.

\paragraph{Narrow sybil-proofness only.} The Lambert invariance
holds for identical reports with conserved total wager. Under small
report-diversification perturbations the sign of the deviation
depends on the attack: an unrelated report-diversified sybil
accrues roughly a $6.5\%$ advantage, while the diversified-report
variant of the Chen--Devanur--Pennock--Vaughan arbitrage attack
\emph{loses} monotonically in the perturbation scale
(Section~\ref{ch:robustness}). Both results lie outside the
narrow Lambert scope.

\paragraph{Truthfulness under risk-neutrality only.} The linear
utility assumption is inherited from
\citet{lambert2008selffinanced}; risk aversion or stakes that are
large relative to wealth break the per-round truthfulness
argument.

\paragraph{Residual arbitrage.} The arbitrage interval of
\citet{chen2014arbitrage} applies to every weighted-score wagering
mechanism, including this one. Budget balance is preserved; the
attacker's profit is redistributed from other participants.

\paragraph{Profitable coalitions.} Three-member coalitions extract
positive profit under both weighted-mean and weighted-median
coordination; informed coalitions under an AR(1) outcome process
compound the two channels.

\paragraph{No equilibrium analysis.} The robustness evaluation
reports attacker profit for named strategies, not Nash or
correlated equilibria. The full best-response space is not
characterised.

## Threats to validity

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
approximation bias; pointwise quantile coverage
(Section~\ref{ch:real}) is not subject to the same bias.

\paragraph{External validity.} The evaluation draws on two series
from a single European transmission system operator. Transfer to
solar, load, or non-European systems cannot be claimed without
further experiments. The audit slice spans a few months and is
roughly stationary; full-year drift is not tested in the headline.
The panel has seven members; results at $n = 50$ or $n = 500$ are
not directly extrapolable.

\paragraph{Construct validity.} CRPS is strictly proper
\citep{gneiting2007strictly} but aggregates calibration and
sharpness in a specific way; a mechanism optimised for CRPS may
be sub-optimal for a decision that weights tail coverage or point
accuracy differently. Headline comparisons are reported against
multiple baselines (uniform, inverse-CRPS, median, trimmed mean,
rolling best-single, the \citet{vitali2025intermittent} reference)
so the claim is not anchored to a single reference point.

\paragraph{Statistical validity.} The Diebold--Mariano test
assumes covariance stationarity of the loss differential;
heteroscedasticity- and autocorrelation-consistent standard errors
are used but residual non-stationarity is not ruled out. No
family-wise error correction is applied across the ten-method,
two-dataset, two-horizon design; the headline
mechanism-versus-uniform comparison has $p < 10^{-6}$, which
survives any reasonable Bonferroni adjustment, but finer
method-to-method comparisons should be read with this caveat.

## Scope

The thesis does not propose a new scoring rule, a new forecasting
model, or a game-theoretic equilibrium analysis. CRPS and pinball
loss are used unchanged, the seven base forecasters are standard
implementations, and strategic behaviour is studied through
simulation of named adversaries rather than through equilibrium
computation. The recalibration layer is the post-hoc isotonic
method of \citet{kuleshov2018accurate} in a rolling-buffer
configuration, not a conformal wrapper. The contribution is a
methodology and a real-data validation on two Elia series, not a
full-scale empirical study of operational grid-scale prediction
markets.
