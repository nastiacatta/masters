# Conclusion and future work {#ch:conclusion}

## Summary of contributions

This thesis has developed, analysed, and empirically validated a
self-financed wagering mechanism that learns participant reliability
online while preserving the axiomatic structure of
\citet{lambert2008selffinanced}. The contributions are summarised
below.

The mechanism satisfies all thirteen active Lambert combinatorial
payoff invariants on the reference implementation. Budget balance
holds to machine precision, and the narrow Lambert sybil invariance
holds with profit ratio $1.000000$ and maximum absolute deviation at
floating-point noise. Eighty golden-value snapshots act as a
regression guard.

The online skill layer is a per-participant, absolute estimator that
requires neither a simplex projection nor a learning-rate schedule.
On a controlled known-noise synthetic panel the Spearman rank
correlation between the learned skill and the ground-truth CRPS
equals one in both point-forecast and quantile-forecast modes. The
same rank correlation holds for the seven real forecasters on the
Elia offshore-wind audit slice.

On the full-length 17{,}344-hour Elia offshore-wind series under
strictly-causal expanding normalisation the mechanism reduces CRPS
by $7.1\%$ relative to uniform averaging, with Diebold--Mariano
$t = 40.77$ and $p \approx 0$. The per-quantile
online-gradient-descent baseline of \citet{vitali2025intermittent}
improves on the mechanism on the same series; the gap quantifies the
CRPS cost of preserving the Lambert budget-balance constraint.

On Elia electricity-imbalance prices, with $T = 10{,}000$ evaluation
rounds, the mechanism is statistically indistinguishable from
uniform averaging ($t = 0.008$, $p = 0.994$). The seven forecasters
produce CRPS values within $0.8\%$ of each other; the EWMA skill
layer has no persistent signal to exploit. This is a null result
and is reported as such.

Against Elia's published real-time operational forecast, the best
single forecaster in our panel, an online gradient-boosted-tree
model trained on the observed series with no weather inputs, reaches
$69.5$~MW in CRPS-megawatt-equivalent units, improving on Elia's
$74.0$~MW by approximately $6\%$. The mechanism aggregates the
seven-forecaster panel down to $83.7$~MW, approximately $13\%$
above the Elia baseline, because the aggregation mixes the best
forecaster with weaker models. Elia's published interval forecasts
are systematically miscalibrated ($\tau = 0.10$ coverage is
$19.1\%$; $\tau = 0.90$ coverage is $94.6\%$), which motivates the
recalibration layer as a generic operational tool.

The aggregate exhibits the tail miscalibration analogous to
\citet{ranjan2010combining}'s linear-pool impossibility: mean tail
deviation $0.019$ on the audit slice. A rolling isotonic
post-processing layer following \citet{kuleshov2018accurate} in a
prequential configuration \citep{dawid1984prequential} closes $41\%$
of the deviation at a $1.6\%$ CRPS cost and a $12\%$ sharpness cost.
The recalibration layer is orthogonal to the skill, wager,
aggregation, and settlement layers: with the recalibration flag
disabled, the runner's output is byte-identical to the pre-feature
baseline.

## Answer to the research question

The research question asked whether a market can learn participant
reliability online, use the learning to improve an aggregate
forecast, and do so while preserving the budget balance,
truthfulness, and sybil-proofness that make the mechanism credible.
The answer developed across Chapters 3 through 8 is a conditional
affirmative on all three sub-questions. The EWMA-based skill layer
recovers the true ordering on controlled synthetic data and on
Elia offshore wind. The mechanism reduces CRPS by $7.1\%$ against
uniform on wind, and is statistically indistinguishable from
uniform on electricity, under conditions consistent with the
forecast-combination puzzle. The economic structure, budget balance
as a construction property, truthfulness under the Lambert
risk-neutrality assumption, and narrow sybil-proofness, is
preserved because the skill layer modulates the wager pre-round
using only information from rounds strictly before $t$.

The skill layer delivers a modest forecasting improvement and adds
online adaptivity, while the economic structure is preserved at no
additional cost. The preservation of structure is the primary
contribution; the CRPS gain is a secondary, regime-dependent effect.

## Future work

The most immediate follow-ups are three. First, the runners should
be switched to expanding causal normalisation throughout. The older
warmup-window variant clips a non-trivial fraction of evaluation
observations on the wind series; the expanding variant is already
implemented and verified. Second, per-forecaster conformal wrappers
would calibrate each forecaster's quantile reports before
aggregation, reducing the magnitude of the linear-pool miscalibration
that the recalibration layer has to close. Third, the held-out
sensitivity sweep should be re-run at the expanding normalisation,
so that the locked headline numbers and the sweep-selected
parameters are directly comparable.

In the medium term, the Beta-transformed linear pool of
\citet{gneiting2013combining} is a parametric alternative to
isotonic recalibration that may preserve sharpness better. A true
per-$\tau$ online gradient-descent aggregator, replacing the
shifted-median-fan reference, would provide a stronger comparison
point against \citet{vitali2025intermittent}. Extending the narrow
sybil invariance to the diversified-report case, identifying
conditions under which sybil profit can be bounded even when
clones submit slightly different reports, is a well-defined open
problem.

In the longer term, collusion-resistant scoring rules that penalise
correlated reports would address the \citet{chun2011cooperating}
coalition vulnerability, but would break the per-round
truthfulness argument; the trade-off space is unmapped. Native
density scoring beyond the finite-grid CRPS surrogate, for
instance, the logarithmic score or the energy score, raises
compatibility questions with the Lambert settlement algebra.
Multi-horizon joint calibration, rather than the per-horizon
treatment developed here, would enable coherent multi-step
probabilistic forecasts. A decentralised implementation on a
smart-contract substrate would transfer the settlement algebra to
an on-chain setting, with new latency and reporting constraints.

## Closing

The skill layer is a single-function addition to a well-understood
mechanism. Its value lies not in its size but in what it preserves:
budget balance, truthfulness under the Lambert risk-neutrality
assumption, narrow sybil-proofness, and the settlement algebra all
survive the extension. The price is a sub-percent CRPS penalty
relative to the best unconstrained aggregator, a price paid for the
economic structure that the unconstrained aggregator discards.
