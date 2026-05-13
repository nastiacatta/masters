# Conclusion {#ch:conclusion}

## Findings

The research question asked whether a market can learn participant
reliability online, use that learning to weight the aggregate
forecast, and hold on to the economic guarantees that give the
underlying mechanism its credibility. The evidence from
Chapters~\ref{ch:mechanism}--\ref{ch:results} returns three
conditional affirmatives.

First, an exponentially weighted moving average of each
participant's past Continuous Ranked Probability Score (CRPS),
passed through a bounded loss-to-skill map, recovers the
ground-truth CRPS ordering exactly on a controlled known-noise
panel (Spearman rank correlation of one on all five canonical
seeds). The same ordering is reproduced on the seven real
forecasters of the Elia offshore-wind audit slice.

Second, the economic structure of \citet{lambert2008selffinanced}
survives the extension. Budget balance holds to floating-point
noise, the narrow sybil invariance holds with a profit ratio of
$1.000000$, and per-round truthfulness carries through because the
skill gate is $\mathcal{F}_{t-1}$-measurable.

Third, mean CRPS on the normalised $[0,1]$ scale falls by $7.1\%$
on the full-length Elia offshore-wind series (Diebold--Mariano
$t = 22.35$ Andrews auto HAC bandwidth, $t = 40.77$ legacy
horizon-$1$, both with $p \approx 0$), and is indistinguishable
from uniform averaging on Elia electricity imbalance ($t = 0.007$,
$p = 0.994$). The contrast tracks the combination puzzle of
\citet{timmermann2006forecast}: the mechanism helps when the panel
is heterogeneous and does not when it is not. The rolling isotonic
recalibration layer, applied as an orthogonal post-processor,
closes $41\%$ of the tail calibration gap at a $1.6\%$ CRPS cost
and a $12\%$ sharpness cost, consistent with the
calibration-sharpness floor of \citet{gneiting2007probabilistic}.

## Future work

Three follow-ups are immediate. The dense held-out sensitivity
sweep (Section~\ref{ch:real}) identifies a slightly better cell at
$(\gamma, \rho, \lambda) = (28, 0.8, 0.03)$, pushing the held-out
improvement from $-6.86\%$ to $-7.69\%$. Re-running the locked
headline block at this optimum under expanding normalisation would
bring the reported number in line with the sweep-selected
parameters. Per-participant conformal wrappers would calibrate each
participant's quantile reports before aggregation, reducing the
linear-pool miscalibration the recalibration layer has to absorb. A
true per-$\tau$ online gradient descent aggregator would replace
the shifted-median-fan reference used as the
\citet{vitali2025intermittent} baseline, giving a stronger
comparison point at each individual quantile.

Beyond the immediate follow-ups, the Beta-transformed linear pool
of \citet{gneiting2013combining} offers a parametric alternative to
isotonic recalibration that is expected to preserve sharpness more
gracefully. A formal best-response analysis of the
report-diversification trade-off would generalise the ad-hoc
$\varepsilon$-sweep reported in Section~\ref{ch:robustness} into a
bound that holds across attack families. Extending the
risk-aversion sensitivity test (Section~\ref{ch:synthetic}) from a
symmetric uniform outcome process to an asymmetric one would
separate the CRPS-alignment artefact from the per-round
truthfulness gap under risk aversion.

The remaining extensions are structural. A collusion-resistant
scoring rule penalising correlated reports would address the
\citet{chun2011cooperating} coalition vulnerability, but would
break per-round truthfulness. The trade-off space is unmapped.
Native density scoring beyond the finite-grid CRPS surrogate, such
as the logarithmic or energy score, raises non-trivial
compatibility questions with the Lambert settlement algebra.
Multi-horizon joint calibration would yield coherent multi-step
probabilistic forecasts. A decentralised implementation on a
smart-contract substrate would transfer the settlement algebra
on-chain and surface new latency and reporting constraints.

## Closing

The thesis does not propose a new scoring rule, a new forecasting
model, or a game-theoretic equilibrium analysis. CRPS and pinball
loss are used unchanged, the seven base forecasters are standard,
and strategic behaviour is studied by simulating named adversaries.
The skill layer is a scalar pre-round modulator of one existing
quantity, the effective wager. Lambert's economic guarantees carry
over because the modulator does not re-parameterise the existing
layers. The forecasting gain is regime-dependent and modest on the
Elia wind data; the economic structure it preserves is not. The
contribution is that the two can be held together.

