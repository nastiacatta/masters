# Conclusion and future work {#ch:conclusion}

## Findings

The research question was whether a market can learn participant
reliability online, use that learning to weight the aggregate
forecast, and do so while preserving the economic guarantees that
give the underlying mechanism its credibility. The empirical and
theoretical material developed across
Chapters~\ref{ch:mechanism}--\ref{ch:robustness} answers the
question in three conditional affirmatives.

\paragraph{Online skill recovery is feasible without a subsidy or a
simplex projection.} An exponentially weighted moving average of
each participant's past CRPS, passed through a bounded
loss-to-skill map, recovers the ground-truth CRPS ordering exactly
on a controlled known-noise panel (Spearman rank correlation of one
on all five canonical seeds). The same ordering is reproduced on
the seven real forecasters of the Elia offshore-wind audit slice.

\paragraph{The economic structure of \citet{lambert2008selffinanced}
survives the extension.} Budget balance is preserved by
construction and verified to floating-point noise. The narrow
sybil invariance holds with a profit ratio of $1.000000$.
Per-round truthfulness carries through because the skill gate is
$\mathcal{F}_{t-1}$-measurable. The Lambert guarantees are
therefore maintained exactly at their original scope; the skill
layer does not widen or narrow them.

\paragraph{The headline CRPS gain is real but conditional.} On the
full-length Elia offshore-wind series the mechanism reduces mean
CRPS by $7.1\%$ against uniform averaging (Diebold--Mariano
$t = 40.77$, $p \approx 0$); on Elia electricity-imbalance prices
it is indistinguishable from uniform ($t = 0.008$). The difference
tracks the combination-puzzle regime of
\citet{timmermann2006forecast}: the mechanism helps when the
panel is heterogeneous, and does not when it is not.
Chapter~\ref{ch:discussion} situates this finding relative to
Bates--Granger-style inverse-CRPS weighting, to
\citet{vitali2025intermittent}'s per-quantile OGD baseline, and to
the rolling best-single selector.

The thesis also delivers a rolling isotonic recalibration layer as
an orthogonal post-processor. It closes $41\%$ of the tail
calibration gap at a $1.6\%$ CRPS cost and a $12\%$ sharpness cost,
consistent with the calibration-sharpness floor of
\citet{gneiting2007probabilistic}, and without modifying the
skill, wager, aggregation, or settlement layers.

## Future work

Three follow-ups are immediate. First, the held-out sensitivity
sweep (Chapter~\ref{ch:real}) has now been refined around the
coarse-grid wind optimum and identifies a slightly better cell at
$(\gamma, \rho, \lambda) = (28, 0.8, 0.03)$, pushing the held-out
improvement from $-6.86\%$ to $-7.69\%$; re-running the locked
headline block at this optimum under expanding normalisation would
bring the reported number in line with the sweep-selected
parameters. Second, per-forecaster conformal wrappers would
calibrate each forecaster's quantile reports before aggregation,
reducing the magnitude of the linear-pool miscalibration the
recalibration layer has to close --- an effect whose importance is
amplified on the full headline slice, where the tail deviation
($0.033$) is roughly double the value on the audit slice
(Chapter~\ref{ch:recalibration}). Third, a true per-$\tau$ online
gradient descent aggregator would replace the shifted-median-fan
reference used as the \citet{vitali2025intermittent} baseline,
giving a stronger comparison point on each individual quantile
rather than on the median alone.

In the medium term, the Beta-transformed linear pool of
\citet{gneiting2013combining} offers a parametric alternative to
isotonic recalibration and is expected to preserve sharpness more
gracefully. A formal best-response analysis of the
report-diversification trade-off --- quantifying the sign and
magnitude of sybil-arbitrage leakage as a function of the
per-clone perturbation $\varepsilon$ and the attacker's total
stake --- would generalise the ad-hoc $\varepsilon$-sweep reported
in Chapter~\ref{ch:robustness} into a bound that holds across
attack families. Extending the risk-aversion sensitivity test
(Chapter~\ref{ch:synthetic}) from a symmetric uniform outcome
process to an asymmetric process such as an exponential or a
truncated-normal would separate the CRPS-alignment artefact from
the per-round truthfulness gap under risk aversion that the
experiment as presented cannot resolve.

Longer-term extensions are structural rather than incremental. A
collusion-resistant scoring rule penalising correlated reports
would address the \citet{chun2011cooperating} coalition
vulnerability, but would break per-round truthfulness; the
resulting trade-off space is unmapped. Native density scoring
beyond the finite-grid CRPS surrogate, such as the logarithmic or
the energy score, raises non-trivial compatibility questions with
the Lambert settlement algebra. Multi-horizon joint calibration
would give coherent multi-step probabilistic forecasts,
complementing the per-horizon treatment used here. A decentralised
implementation on a smart-contract substrate would transfer the
settlement algebra to an on-chain setting and surface new latency
and reporting constraints.

## Closing

The skill layer is a scalar, pre-round modulator of a single
existing quantity --- the effective wager. Its conceptual
simplicity is intentional: the economic guarantees of the Lambert
framework carry over precisely because the modulator does not
re-parameterise any of the mechanism's existing layers. The
forecasting gain is regime-dependent and modest on the Elia wind
data; the economic structure it preserves is not. The thesis's
primary contribution is that the two can be held together.
