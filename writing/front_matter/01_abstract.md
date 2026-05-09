# Abstract

Self-financed wagering mechanisms for forecasts settle on a closed
budget: post-event payouts sum to pre-event wagers. The seminal
formulation of \citet{lambert2008selffinanced} proved uniqueness of
the weighted-score mechanism under five axioms but treated each round
in isolation and assumed full participation. Real forecasting panels
differ persistently in reliability and miss rounds routinely. A prior
online extension \citep{vitali2025intermittent} tracked reliability
with a simplex online-gradient-descent aggregator but relaxed
self-financing in the process.

This thesis presents a mechanism that couples the two. An online skill
estimate, computed as an exponentially weighted moving average of each
participant's past probabilistic loss, modulates the participant's
deposit before every round. The effective wager $m_i = b_i \cdot
(\lambda + (1-\lambda)\,\sigma_i^{\eta})$ controls both aggregation
weight and settlement exposure. Because the skill estimate is
$\mathcal{F}_{t-1}$-measurable, Lambert's truthfulness proof applies
verbatim with $m_i$ in place of the original deposit.

Three bodies of evidence support the contribution. On synthetic data
with known latent skill, the learned $\sigma$ is monotone in the true
noise scale across $[0.15, 1.00]$ with Spearman rank correlation of
one. On the full 17{,}344-hour Elia offshore-wind series under
expanding causal normalisation, the mechanism reduces CRPS by
$7.1\%$ against uniform averaging (Diebold--Mariano $t = 40.77$,
$p \approx 0$); against Elia's published real-time forecast the best
single forecaster attains $69.5$~MW CRPS-megawatt-equivalent versus
Elia's $74.0$~MW. A deposit-policy ablation identifies deposit design,
not weighting rule, as the dominant empirical lever. A rolling
isotonic recalibrator closes $41\%$ of the linear-pool tail
miscalibration \citep{ranjan2010combining} at a $1.6\%$ CRPS cost,
without modifying the economic layers. Eight theory-grounded
adversaries are evaluated; the narrow Lambert sybil invariance holds
to floating-point noise, and arbitrage profit \citep{chen2014arbitrage}
scales monotonically with the skill-gate floor.

The contribution is conditional improvement with preserved economic
structure: self-financing, per-round truthfulness, and narrow
sybil-proofness are all retained; raw CRPS dominance over every simple
baseline is not claimed.
