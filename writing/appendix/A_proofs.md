# Proofs and formal statements

<!--
Referenced from:
- Chapter 3 (Mechanism design), §3.2 (aggregation) and §3.3
  (settlement algebra).
- Chapter 5 (Results — synthetic), §5.1 (Lambert invariants).
- Chapter 5 (Robustness), §5.4 (narrow sybil-proofness).
- Chapter 5 (Recalibration), §5.3 (quantile-averaging
  under-dispersion).

Handbook: appendices must be referenced from the main body and are
not guaranteed to be read. The load-bearing statements of these
results appear in the main body; the full proofs are collected here
for a reader who wants to check the derivations.
-->

This appendix collects the formal results invoked from the main
body: budget balance, skill-gate truthfulness, the narrow Lambert
sybil invariance, the quasi-arithmetic pooling correspondence for
the pinball-aggregation operator, and the EWMA consistency
statements. Where a result is a direct restatement of a published
theorem, the citation is given and the derivation is limited to
checking that the substitution $m_i \leftarrow b_i$ preserves the
argument.

## Budget balance

The budget-balance theorem (Theorem~\ref{thm:budget-balance}) is
proved in the main body. We record here only that the proof is
algebraic and does not depend on propriety, monotonicity, or the
functional form of the scoring rule: the identity
$\sum_i \pi_i = M$ holds for any score vector and any outcome.
Numerical verification over $1000$ synthetic rounds reports a
maximum absolute gap of $2.84 \times 10^{-14}$, consistent with
floating-point noise.

## Skill-gate truthfulness

\begin{lemma}[Skill-gate truthfulness]
Fix round $t$. Suppose the skill estimate
$\sigma_{i,t} = \mathrm{EWMA}_{\rho}(\ell_{i,1}, \dots, \ell_{i,t-1})$
is computed from losses strictly earlier than round $t$, and the
effective wager is $m_{i,t} = b_{i,t} \cdot g(\sigma_{i,t})$ with
$b_{i,t}$ also $\mathcal{F}_{t-1}$-measurable. Then under the
weighted-score settlement of §A.1, reporting the true belief
maximises participant $i$'s expected round-$t$ profit, in the same
sense as the \citet{lambert2008selffinanced} truthfulness theorem.
\end{lemma}

\begin{proof}[Proof sketch]
The Lambert 2008 truthfulness theorem (their \S 4.2) assumes the
participant's wager is fixed at the moment the report is chosen.
Our construction makes $m_{i,t}$ an $\mathcal{F}_{t-1}$-measurable
quantity: the skill estimate depends only on historical losses,
and the deposit rule $b_{i,t}$ depends only on historical bankroll
and historical forecast width. With $m_{i,t}$ fixed before the
round-$t$ report, the Lambert argument applies verbatim with
$m_{i,t}$ in place of the original deposit, because the payout
formula $\Pi_i$ is linear in $m_i$ and the score $s_i$ is strictly
proper on the pinball loss
\citep{gneiting2007strictly, steinwart2011estimating}.

The argument is per-round; a multi-round extension requires bounding
the cross-round shaping incentive on the EWMA trajectory. That bound
is informal in this thesis (Proposition~\ref{prop:shaping} in
Section~\ref{ch:mechanism}) and remains an open theoretical
question.
\end{proof}

## Narrow Lambert sybil invariance

The narrow Lambert sybil invariance (Proposition~\ref{prop:sybil})
is proved in the main body. For completeness we record here that
the invariance extends component-wise to the aggregated forecast
itself: because the aggregate is a per-quantile weighted mean
$\hat q(\tau) = \sum_i w_i q_i(\tau)$, replacing one participant by
$k$ identical clones with conserved total wager leaves $\hat q$
pointwise unchanged. The numerical audit over $10{,}000$ synthetic
rounds reports mean absolute deviation $2.07 \times 10^{-17}$,
consistent with floating-point noise.

Remark. The proposition assumes identical reports and conserved
total wager. Diversified-report sybils with the same total wager
measurably break the invariance; the main body reports the
empirical leakage pattern in Section~\ref{ch:robustness}.

## Quasi-arithmetic pooling for the pinball score {#app:qa-pool}

The aggregation operator used throughout the thesis is the
per-quantile weighted arithmetic mean,
$\hat q(\tau_k) = \sum_i w_i q_i(\tau_k)$, applied level-by-level
on a fixed $\tau$-grid. This appendix records its relation to the
quasi-arithmetic (QA) pooling correspondence of
\citet{neyman2021quasiarithmetic}.

For a strictly proper scoring rule $s$ on a real-valued forecast
space, Neyman and Roughgarden associate a canonical aggregation
operator
$
  \mathrm{QA}_s(q_1, \dots, q_n; w)
    = \arg\max_{\hat q}\, \min_y\,
      \Big[s(\hat q, y) - \sum_i w_i s(q_i, y)\Big],
$
and show (their Theorem~1) that $\mathrm{QA}_s$ maximises the
worst-case expected score of a forecaster who sub-contracts $n$
experts under $s$ and pays them in proportion to $w$. Their
Theorem~3 extends the correspondence to continuous-outcome
forecast spaces.

For the quadratic score, $\mathrm{QA}_s$ reduces to the linear
pool: the aggregate is the weighted arithmetic mean of the
experts' point forecasts. For the logarithmic score, $\mathrm{QA}_s$
reduces to the logarithmic pool on probability densities.

For the pinball score
$s(\hat q, y) = -L^\tau(\hat q, y)
 = -(y - \hat q)\bigl(\tau - \mathbb{1}[y < \hat q]\bigr)$
on a level-by-level $\tau$-grid, $\mathrm{QA}_s$ is the
\emph{weighted arithmetic mean of the expert reports at each
level}. A direct check confirms this: for weights
$w = (w_1, \dots, w_n)$ on the simplex, the worst-case deviation
$\min_y \bigl[\sum_i w_i L^\tau(q_i, y) - L^\tau(\hat q, y)\bigr]$
is maximised, across $\hat q \in \mathbb{R}$, at
$\hat q = \sum_i w_i q_i$; moving $\hat q$ away from the weighted
mean introduces a sign-definite term in $y$ that the adversary
can exploit. The finite-grid aggregation operator of this thesis
is therefore the QA pool for the pinball score, applied
level-by-level.

Two caveats are worth recording. First, this aggregator is
\emph{not} the same as the linear opinion pool over CDFs, to which
the \citet{ranjan2010combining} calibration impossibility strictly
applies. The two coincide only for the quadratic score; the
under-dispersion pathology observed on the Elia wind data
(Section~\ref{ch:recalibration}) is a non-strict analogue that
nonetheless arises for pointwise quantile averaging whenever
experts disagree on location
(Proposition~\ref{prop:qa-under-dispersion}). Second, the QA pool
is a \emph{weights-fixed} max-min aggregator: it does not itself
learn the weights. In the present mechanism the weights are
derived from the effective wager
$w_i = m_i / \sum_j m_j$; in the
\citet{vitali2025intermittent} design the weights are learned per
level by simplex-projected online gradient descent, at the cost of
budget balance. The CRPS gap between the two approaches on the
Elia wind data (roughly eleven percentage points on the
full-length run, see Section~\ref{ch:real}) is the price of
preserving the Lambert settlement algebra.

## EWMA consistency under stationarity

The two EWMA-tracking propositions stated in
Section~\ref{ch:mechanism} (\textsc{Stationary consistency} and
\textsc{Tracking a drifting true loss}) are standard textbook
results on exponentially weighted moving averages
\citep{benveniste1990adaptive}. Their formal statements appear in
the main body; the short proofs given there are complete. We do
not repeat them here.

## Proof of the quantile-averaging under-dispersion proposition {#app:qa-under-dispersion}

The main-body statement
(Proposition~\ref{prop:qa-under-dispersion} in
Section~\ref{ch:recalibration}) establishes that the aggregate
interval width equals the weighted mean of the experts' widths and
that coverage is not equal to the nominal level $\tau_U - \tau_L$
in general. Here we note two refinements.

First, the direction of the deviation is determined by the
relative skew of the outcome's conditional distribution and the
sign of location disagreement. Let $F$ be the outcome CDF and
write $\mu = \mathbb{E}[Y]$. If the experts disagree symmetrically
around $\mu$ and $F$ is symmetric around $\mu$, the aggregate
interval covers \emph{more} than $\tau_U - \tau_L$ on the
low-tail endpoint and \emph{less} than $\tau_U - \tau_L$ on the
high-tail endpoint, or vice versa, with the deviations summing to
zero at leading order. Asymmetric outcome distributions break the
cancellation and can produce same-sign deviations at both
endpoints, which is the pattern reported on the Elia wind data
(Section~\ref{ch:recalibration}).

Second, the magnitude of the deviation is bounded by the
expert-disagreement range
$\delta(\tau) = \max_i q_i(\tau) - \min_i q_i(\tau)$ at each level
$\tau$: a larger fan translates to a larger calibration gap.
Bounding $\delta(\tau)$ is the content of the per-forecaster
conformal wrapper flagged as future work in
Chapter~\ref{ch:conclusion}.

## Proof of the EWMA-shaping bound {#app:ewma-shaping}

The main-body statement (Proposition~\ref{prop:shaping} in
Section~\ref{ch:mechanism}) bounds the multi-round profit gain
from a small round-$t$ distortion of participant $i$'s report.
The full expansion is

\begin{align*}
  \Pi_\Delta(\varepsilon)
  &= -\tfrac{1}{2}\, \alpha\, \|\mathrm{Hess}\, s_i\|\,
       \varepsilon^2
     + \gamma \rho \sum_{k=1}^{\infty} \delta^{k} c_k(\varepsilon)
     + O(\varepsilon^3),
\end{align*}
where $\alpha = m_{i,t}(1 - m_{i,t}/M_t)$ is the coefficient
introduced in the proof of Theorem~\ref{thm:truthfulness},
$\|\mathrm{Hess}\, s_i\|$ is the curvature of the proper score at
truth, and $c_k(\varepsilon)$ is the round-$(t+k)$ profit gain
from the induced change in competitors' skill.

\begin{proof}[Proof sketch]
The first term is the Taylor expansion of the per-round expected
profit around the truthful report, using that pinball loss has
positive curvature (subgradient jump of size $1$ at $y = q$). For
the second term, a distortion $\varepsilon$ at round $t$ changes
each competitor's observed loss by at most $|\varepsilon|$ through
the shared aggregate score $\bar s_t$; by the EWMA update, this
propagates to $L_{k,t+1}$ with multiplier $\rho$, and to
$\sigma_{k,t+1}$ with multiplier
$\gamma\,\sigma_{\min}'(1 - \sigma_{\min})$ where $\sigma_{\min}'$
denotes the local derivative of the loss-to-skill map. Summing
the discounted profit impact across future rounds gives the
$\gamma \rho \delta / (1 - \delta)$ envelope. The $O(\varepsilon^3)$
remainder collects higher-order Taylor corrections and
cross-interactions. In the saturated regime reached empirically
after roughly twenty rounds of losses below $\ell \approx 0.05$,
$\sigma_{\min}'$ is of order $10^{-5}$ and the shaping term is
effectively zero.
\end{proof}
