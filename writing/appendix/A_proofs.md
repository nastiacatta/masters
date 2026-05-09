# Proofs and formal statements

<!--
Referenced from:
- Chapter 3 (Mechanism design), §3.3 (Skill-gate truthfulness lemma).
- Chapter 5 (Results — synthetic), §5.1 (Lambert invariants).
- Chapter 6 (Robustness), §6.4 (narrow sybil-proofness).

Handbook: appendices must be referenced from the main body and are
not guaranteed to be read. The load-bearing statements of these
results appear in the main body; the full proofs are collected here
for a reader who wants to check the derivations.
-->

This appendix collects the three formal results invoked from the
main body: budget balance, skill-gate truthfulness, and the narrow
Lambert sybil invariance. Where a result is a direct restatement of
a published theorem, the citation is given and the derivation is
limited to checking that the substitution $m_i \leftarrow b_i$
preserves the argument.

## Budget balance (referenced from §3.4)

\begin{proposition}[Budget balance]
Let $N$ participants submit effective wagers $m_1, \dots, m_N$ and
quantile-forecast scores $s_1, \dots, s_N$ in round $t$. Under the
weighted-score settlement rule
$$
  \Pi_i \;=\; m_i \Bigl(1 + s_i - \tfrac{\sum_j s_j m_j}{\sum_j m_j}\Bigr),
$$
the sum of payouts equals the sum of wagers:
$\sum_i \Pi_i = \sum_i m_i$.
\end{proposition}

\begin{proof}
Expand and factor:
$$
  \sum_i \Pi_i
  = \sum_i m_i + \sum_i m_i s_i
     - \frac{\sum_j s_j m_j}{\sum_j m_j} \sum_i m_i
  = \sum_i m_i + \sum_i m_i s_i - \sum_j s_j m_j
  = \sum_i m_i.
$$
The last equality relabels the dummy index. Budget balance therefore
holds for any choice of effective wagers $m_i$, including the
skill-gated wager $m_i = b_i \cdot g(\sigma_i)$ used throughout this
thesis. Numerical verification over $1000$ synthetic rounds reports a
maximum absolute gap of $2.84 \times 10^{-14}$, consistent with
floating-point noise.
\end{proof}

## Skill-gate truthfulness (referenced from §3.3)

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
is informal in this thesis (\S\ref{ch:mechanism}, ``EWMA-shaping
incentive'') and remains an open theoretical question.
\end{proof}

## Narrow Lambert sybil invariance (referenced from §6.4)

\begin{proposition}[Narrow sybil invariance]
Suppose a participant with effective wager $m$ and report $r$ is
replaced by $k$ identical clones, each with effective wager $m/k$
and report $r$. Then the aggregated forecast, the aggregated score,
and the original participant's total profit are unchanged, up to
floating-point noise.
\end{proposition}

\begin{proof}
The aggregate used in this thesis is a per-quantile weighted mean,
$\hat q(\tau) = \sum_i w_i q_i(\tau)$ with
$w_i = m_i / \sum_j m_j$. Replacing participant $i$ by $k$ clones
with identical reports and conserved total wager leaves
$\sum_j m_j$ invariant and contributes identical summands to every
quantile, so $\hat q(\tau)$ is unchanged. The weighted score
$\sum_j s_j m_j$ and the denominator $\sum_j m_j$ are likewise
invariant, so the per-participant payout
$\Pi_i = m_i(1 + s_i - \bar s)$ aggregates to the same total over
the clones as the original participant received. The invariance is
numerically verified over $10{,}000$ synthetic rounds with mean
absolute deviation $2.07 \times 10^{-17}$.
\end{proof}

Remark. The proposition assumes identical reports and conserved
total wager. Diversified-report sybils with the same total wager
measurably break the invariance; the main body reports an
empirical leakage of approximately $6.5\%$ under the current
implementation (§6.4).
