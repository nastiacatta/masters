# Synthetic validation {#ch:synthetic}

This chapter reports the synthetic experiments that underwrite the
mechanism's correctness, its ability to recover the true skill
ordering, and the effects of the deposit and weighting rules in
isolation. Each result is derived from a committed experiment and is
paired with its source artefact; the figures referenced in the text
are compiled plots from the presentation pipeline.

## Mechanism correctness

All thirteen active Lambert combinatorial payoff invariants pass on
the reference simulator. The remaining clause, which covers an
externally supplied split-based mechanism, is skipped pending the
external fixtures required to test it.

Table~\ref{tab:correctness} summarises the headline numerical
invariants over $1\,000$ rounds and $20$ seeds.

\begin{table}[h]
\centering
\small
\begin{tabular}{lr}
\toprule
Invariant & Result \\
\midrule
Maximum absolute budget gap & $2.84 \times 10^{-14}$ \\
Mean profit & $3.01 \times 10^{-17}$ \\
Equal-score zero profit & holds \\
Sybil profit ratio (identical reports, conserved wager)
  & $1.000000$ \\
Sybil maximum $|\Delta|$ & $2.07 \times 10^{-17}$ \\
Pinball $\geq 0$, CRPS $\geq 0$, CRPS bounded & holds \\
Perfect forecast beats shifted forecast & holds \\
\bottomrule
\end{tabular}
\caption{Correctness invariants.}
\label{tab:correctness}
\end{table}

The mechanism is self-financed to machine precision: the mean profit
at the seventeenth decimal confirms redistribution rather than
creation of value. The narrow Lambert sybil invariance holds with
residuals at floating-point noise.

## Skill recovery on the known-noise panel

On the known-$\sigma$ synthetic panel ($T = 2\,000$, learning rate
$\rho$ retuned to $0.05$ so that the EWMA saturates on the short
horizon), the Spearman rank correlation between the learned skill
$\sigma$ and the ground-truth CRPS is exactly $1$ on all five
canonical seeds. The learned $\sigma$ remains in
$[\sigma_{\min}, 1]$ and is strictly monotone in the loss; the timing
invariant $\sigma_t = f(L_{t-1})$ is satisfied pointwise; absent
participants' skill does not drift under $\kappa = 0$; and the
$\gamma$ round-trip (loss-to-skill-to-loss) is idempotent.

On the extended six-forecaster run ($T = 20{,}000$, twenty seeds,
quantile mode), Table~\ref{tab:skill-recovery} reports the
tail-average loss and tail-average learned $\sigma$ by forecaster.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrr}
\toprule
Forecaster & True noise $\tau$ & Mean loss (tail) & Learned $\sigma$ (tail) \\
\midrule
$f_0$ & $0.15$ & $0.0232$ & $0.959$ \\
$f_1$ & $0.22$ & $0.0334$ & $0.942$ \\
$f_2$ & $0.32$ & $0.0474$ & $0.919$ \\
$f_3$ & $0.46$ & $0.0656$ & $0.890$ \\
$f_4$ & $0.68$ & $0.0888$ & $0.854$ \\
$f_5$ & $1.00$ & $0.1121$ & $0.820$ \\
\bottomrule
\end{tabular}
\caption{Skill recovery on the known-noise panel.}
\label{tab:skill-recovery}
\end{table}

The Spearman rank correlation between true noise and learned $\sigma$
is exactly $1$ in both point-forecast and quantile modes. With
$n = 6$ forecasters, the probability of a chance Spearman of one is
$1/6! \approx 0.14\%$.

\begin{figure}[h]
\centering
\includegraphics[width=0.92\textwidth]{writing/figures/skill_trajectory.png}
\caption{Learned skill $\sigma_i$ over time on the six-forecaster
known-noise panel. After an adaptation phase of roughly 100 to 500
rounds the trajectories separate cleanly and retain the ordering
implied by the ground-truth noise scale $\tau$. The dashed regions
show one-standard-deviation bands across twenty seeds.}
\label{fig:skill-trajectory}
\end{figure}

The qualitative picture of the $\sigma$ trajectory is a fast
initial-adaptation phase lasting approximately 100--500 rounds,
followed by a slow refinement that tightens the ordering between
forecasters of similar quality. The EWMA-plus-exponential map is not
regret-minimising; it is an estimator of reliability. On a stationary
panel with known signal, it converges to the correct ranking, and
this is the experiment that establishes that convergence.

## Forecaster panel integrity

The seven real-data forecasters are subject to three standing checks
before any headline comparison is used: no future-data leakage, no
degenerate constant output, and no silent substitution of a
persistence fallback for the model's own output. On the post-audit
$3{,}000$-point Elia wind audit slice all three checks pass for all
seven forecasters; the detailed protocols and diagnostics are in
Appendix~\ref{app:training-details}.

## Deposit-policy ablation

A four-way deposit-policy ablation under a fixed weighting rule and
twenty seeds ($T = 1\,000$, six forecasters, quantile-CRPS scoring)
quantifies the contribution of the deposit policy in isolation.
Table~\ref{tab:deposit-ablation} reports the results.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrr}
\toprule
Deposit policy & Mean CRPS & SE & $\Delta\%$ vs fixed unit \\
\midrule
iid-exponential (random) & $0.04549$ & $0.00023$ & $+7.37\%$ \\
Fixed unit ($b = 1$) & $0.04237$ & $0.00011$ & baseline \\
Bankroll-confidence & $0.03796$ & $0.00012$ & $-10.40\%$ \\
Oracle precision & $0.02271$ & $0.00007$ & $-46.39\%$ \\
\bottomrule
\end{tabular}
\caption{Deposit-policy ablation.}
\label{tab:deposit-ablation}
\end{table}

Random deposits are worst, as expected: they encode no information
about participant quality. Fixed-unit deposits isolate the skill
signal and serve as the benchmark. Bankroll-confidence deposits,
using only observable quantities (wealth and forecast width), capture
approximately $22\%$ of the oracle improvement. The oracle
policy, which has access to the true signal precision, provides
the theoretical ceiling. This table is the single clearest empirical
statement the thesis makes: the deposit policy, not the weighting
rule, is the dominant lever.

\begin{figure}[h]
\centering
\includegraphics[width=0.9\textwidth]{writing/figures/deposit_policy.png}
\caption{Deposit-policy ablation under a fixed weighting rule.
Bankroll-confidence deposits close roughly one quarter of the gap
between fixed deposits and the oracle-precision ceiling, using only
quantities observable to the mechanism.}
\label{fig:deposit-policy}
\end{figure}

## Weight-rule comparison

A complementary experiment varies the weighting rule for two
deposit regimes. Under fixed deposits, which isolate the skill
signal, Table~\ref{tab:weight-rule-fixed} reports the result.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Weighting rule & Mean CRPS & SE \\
\midrule
Uniform & $0.04340$ & $0.00011$ \\
Deposit-only (= uniform under fixed deposits)
  & $0.04340$ & $0.00011$ \\
Skill-only & $0.04188$ & $0.00011$ \\
Mechanism (skill $\times$ deposit) & $0.04237$ & $0.00011$ \\
Rolling best single & $0.02305$ & $0.00012$ \\
\bottomrule
\end{tabular}
\caption{Weight-rule comparison under fixed deposits.}
\label{tab:weight-rule-fixed}
\end{table}

The skill-only rule improves on uniform averaging by $3.5\%$. The
mechanism sits marginally behind skill-only under fixed deposits
because the $\eta = 2$ nonlinearity in the skill gate compresses a
signal the skill-only rule exploits directly.

Under bankroll deposits, the ranking shifts. The deposit channel now
carries skill information directly, so the deposit-only rule is
strong ($0.02642$ CRPS), and the mechanism's additional skill gate
adds little. Together the two tables establish that the optimal
weighting rule depends on the deposit policy. When the skill signal
must be extracted from the weights (fixed deposits), a skill-gated
rule helps; when the skill signal is already in the deposit (bankroll
deposits), simpler weights suffice. The present contribution is to package
both levers into a single self-financed mechanism that remains
correct regardless of which channel carries the information.

## Five-step bankroll pipeline ablation

The bankroll pipeline comprises five steps: (A) a confidence proxy
mapping quantile width to $c_i$; (B) the deposit computation
$b_i = \min(W_i, b_{\max}, f \cdot W_i \cdot c_i)$; (C) the skill
gate; (D) the simplex projection with cap $w_{\max}$; and (E) the
wealth update $W_{t+1} = \max(0, W_t + \pi_t)$. An ablation removes
one step at a time to quantify its marginal contribution.
Table~\ref{tab:bankroll-ablation} reports the result over twenty
seeds on a latent-fixed data-generating process with an
exponential-deposits behavioural preset.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrrrr}
\toprule
Variant & Mean CRPS & $\Delta$ vs Full & Mean HHI & Final Gini \\
\midrule
Full (A $\to$ B $\to$ C $\to$ D $\to$ E)
  & $0.05326$ & $0$ & $0.334$ & $0.774$ \\
A$^-$ (no $c_i$; $c = 1$)
  & $0.05300$ & $-0.00026$ & $0.362$ & $0.800$ \\
B$^-$ (fixed $b_i$) & $0.05423$ & $+0.00097$ & $0.129$ & $0.000$ \\
C$^-$ (no skill gate, $m = b$)
  & $0.05304$ & $-0.00022$ & $0.354$ & $0.797$ \\
D$^-$ (no dominance cap, $w_{\max} = \infty$)
  & $0.02987$ & $-0.02340$ & $0.334$ & $0.774$ \\
E$^-$ (fixed wealth) & $0.05496$ & $+0.00169$ & $0.130$ & $0.000$ \\
\bottomrule
\end{tabular}
\caption{Five-step bankroll pipeline ablation.}
\label{tab:bankroll-ablation}
\end{table}

The dominant finding is that removing the weight cap (variant
D$^-$) improves CRPS by $0.0234$, because a single strong forecaster
can capture nearly all the weight on a data-generating process where
one forecaster has much lower noise than the others. The Herfindahl
index as measured pre-cap remains at $0.334$, but the effective
post-cap distribution is sharply concentrated; the Gini coefficient
remains high at $0.774$. The cap exists for economic-fairness
reasons, not for CRPS reasons; the ablation quantifies its cost
transparently.

Removing the bankroll channel entirely (variants B$^-$ and E$^-$)
pushes HHI to approximately $0.13$---near-uniform weights, and the
Gini coefficient to zero, because the wealth channel is disabled.
The deposit information is lost in both cases, consistent with the
deposit-policy ablation above. Variants A$^-$ and C$^-$ are
near-neutral, with slightly higher concentration because the skill
signal enters more directly.
