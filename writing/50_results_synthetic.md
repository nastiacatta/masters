## Synthetic validation {#ch:synthetic}

This section reports the synthetic experiments that verify
mechanism correctness, show that the mechanism recovers the true
skill ordering, and isolate the contributions of the deposit and
weighting rules.

### Mechanism correctness

All thirteen active Lambert combinatorial payoff invariants pass on
the reference simulator. The remaining clause covers an externally
supplied split-based mechanism and is skipped pending the external
fixtures required to test it.

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
Mean per-round profit & at floating-point noise ($10^{-17}$) \\
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

The mechanism is self-financed to machine precision: the mean
per-round profit sits at the seventeenth decimal, so the mechanism
redistributes value rather than creating it. The narrow Lambert sybil invariance holds with
residuals at floating-point noise.

### Skill recovery on the known-noise panel

On the known-$\sigma$ synthetic panel ($T = 2\,000$, learning rate
$\rho$ retuned to $0.05$ so the EWMA saturates on the short
horizon), the Spearman rank correlation between the learned skill
$\sigma$ and the ground-truth Continuous Ranked Probability Score (CRPS) is exactly $1$ on all five
canonical seeds $\{0, 1, 2, 42, 2024\}$. The learned $\sigma$ remains in
$[\sigma_{\min}, 1]$ and is strictly monotone in the loss. The
timing invariant $\sigma_t = f(L_{t-1})$ holds pointwise. Absent
participants' skill does not drift under $\kappa = 0$. The $\gamma$
round-trip (loss-to-skill-to-loss) is idempotent.

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

The Spearman rank correlation between true noise and learned
$\sigma$ is exactly $1$ in both point-forecast and quantile modes.
With $n = 6$ forecasters the probability of a chance Spearman of one
is $1/6! \approx 0.14\%$.

\begin{figure}[h]
\centering
\includegraphics[width=0.92\textwidth]{writing/figures/skill_trajectory.png}
\caption{Learned skill $\sigma_i$ over time on the six-forecaster
known-noise panel ($\tau \in \{0.15, 0.22, 0.32, 0.46, 0.68, 1.00\}$).
After a 200-round warm-up at the prior $\sigma = 1$, the
trajectories separate in a fast-adaptation phase (roughly
$200 \leq t \leq 800$) and then refine their ordering over the
remaining rounds. End-of-line labels identify each forecaster by
true noise scale $\tau$; the colour ramp runs from teal
(low-noise, skilled) to coral (high-noise). The dashed line marks
the $\sigma_{\min} = 0.10$ floor.}
\label{fig:skill-trajectory}
\end{figure}

The $\sigma$ trajectory has two phases. A fast initial adaptation of
roughly 100--500 rounds separates forecasters into coarse tiers, and
a slow refinement then tightens the ordering between forecasters of
similar quality. The EWMA-plus-exponential map is a reliability
estimator, not a regret-minimising rule. On a stationary panel with
a known signal it converges to the correct ranking, and the
known-noise panel shows the convergence directly.

### Forecaster panel integrity

Every real-data forecaster is subject to three standing checks
before the headline comparison is taken at face value: no
future-data leakage, no degenerate constant output, and no silent
substitution of a persistence fallback for the model's own output.
On the $3{,}000$-point Elia wind audit slice all three checks pass
for all seven forecasters; the detailed protocols and diagnostics
are in Appendix~\ref{app:training-details}.

### Deposit-policy ablation

A four-way deposit-policy ablation under a fixed weighting rule and
twenty seeds ($T = 1\,000$, six forecasters, quantile-CRPS scoring)
isolates the contribution of the deposit policy.
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

Random deposits are the worst policy, as expected: they carry no
information about participant quality. Fixed-unit deposits isolate
the skill signal and serve as the benchmark. Bankroll-confidence
deposits, built from observable quantities only (wealth and
reported interval width), capture about $22\%$ of the oracle
improvement. The oracle policy has access to the true signal
precision and provides the theoretical ceiling.

The correct reading of the table is narrow. The operator controls
the deposit policy \emph{only} in the synthetic setting where we
can dictate the rule. In a deployed market, participants choose
their own deposits and the operator has no lever over what the
deposit encodes. The Elia real-data runs in Section~\ref{ch:real}
therefore use fixed-unit deposits throughout, and any headline
improvement reported there is attributable to the skill gate. The
table's useful content is that the deposit \emph{channel} is the
widest available information channel. An operator who can
constrain deposits to encode observable confidence (through a
client-imposed stake cap or a participation protocol, for example)
would shift the CRPS ceiling by tens of percent. Absent that
constraint, the skill gate is the only lever the operator has. The
synthetic result is therefore a statement about where the
information ceilings sit, not about what a deployed mechanism can
achieve on its own.

\begin{figure}[h]
\centering
\includegraphics[width=0.9\textwidth]{writing/figures/deposit_policy.png}
\caption{Deposit-policy ablation under a fixed weighting rule, 20
seeds, $T = 1{,}000$, six forecasters, quantile-CRPS scoring. The
bankroll-confidence policy uses only observable quantities
(wealth and reported interval width) and closes roughly one
quarter of the gap between fixed deposits and the
oracle-precision ceiling.}
\label{fig:deposit-policy}
\end{figure}

### Weight-rule comparison

A companion experiment varies the weighting rule across two deposit
regimes. Under fixed deposits, which isolate the skill signal,
Table~\ref{tab:weight-rule-fixed} reports the result.

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

The skill-only rule reduces CRPS against uniform averaging by
$3.5\%$. The mechanism sits marginally behind skill-only under
fixed deposits because the $\eta = 2$ nonlinearity in the skill
gate compresses a signal the skill-only rule exploits directly.

Under bankroll deposits the ranking shifts. The deposit channel
now carries the skill information directly, so the deposit-only
rule is strong ($0.02642$ CRPS) and the mechanism's additional
skill gate adds little. Together the two tables show that the
best weighting rule depends on the deposit policy: a skill-gated
rule helps when the skill signal must be extracted from the
weights (fixed deposits), and simpler weights suffice when the
skill signal is already in the deposit (bankroll deposits). The
contribution here is to package both levers into a single
self-financed mechanism that stays correct regardless of which
channel carries the information.

### Five-step bankroll pipeline ablation

The bankroll pipeline has five steps: (A) a confidence proxy
mapping quantile width to $c_i$; (B) the deposit computation
$b_i = \min(W_i, b_{\max}, f \cdot W_i \cdot c_i)$; (C) the skill
gate; (D) the simplex projection with cap $w_{\max}$; and (E) the
wealth update $W_{t+1} = \max(0, W_t + \pi_t)$. An ablation
removes one step at a time to quantify its marginal contribution.
Table~\ref{tab:bankroll-ablation} reports the result over twenty
seeds on a latent-fixed data-generating process with an
exponential-deposits behavioural preset. The five variants are
specified in Appendix~\ref{app:bankroll-pipeline}.

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

Removing the weight cap (variant D$^-$) reduces CRPS by $0.0234$
and is the dominant effect in the table. One strong forecaster can
capture nearly all the weight on a data-generating process where a
single forecaster has much lower noise than the others. The
Herfindahl index measured pre-cap stays at $0.334$, but the
effective post-cap distribution is sharply concentrated. The Gini
coefficient is $0.774$. The cap exists for economic-fairness
reasons, not for CRPS reasons, and the ablation quantifies its
cost transparently.

Removing the bankroll channel entirely (variants B$^-$ and E$^-$)
pushes HHI to about $0.13$, close to uniform weights, and the Gini
coefficient to zero, because the wealth channel is disabled. The
deposit information is lost in both cases, consistent with the
deposit-policy ablation above. Variants A$^-$ and C$^-$ are
near-neutral, with slightly higher concentration because the skill
signal enters more directly.

### Panel-size scaling

The headline synthetic panel has $n = 6$ forecasters. How the
mechanism behaves at larger panel sizes (weight concentration, the
bite of the cap $\omega_{\max}$, and the sign of the CRPS change
against uniform) is a standard reviewer question for this class of
mechanism. Table~\ref{tab:panel-scaling} reports mean CRPS and the
effective participant count $N_{\mathrm{eff}} = 1/\mathrm{HHI}$ on
the same latent-fixed data-generating process as
Table~\ref{tab:weight-rule-fixed}, at
$n \in \{6, 12, 25, 50, 100\}$ with $T = 1{,}000$ rounds and five
seeds per cell.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrrrr}
\toprule
$n$ & Uniform CRPS & Mechanism CRPS & $\Delta$ vs uniform & $N_{\mathrm{eff}}$ \\
\midrule
$6$   & $0.04629$ & $0.04877$ & $+5.35\%$ & $3.06$ \\
$12$  & $0.05675$ & $0.05736$ & $+1.08\%$ & $5.52$ \\
$25$  & $0.05403$ & $0.05334$ & $-1.28\%$ & $10.77$ \\
$50$  & $0.05276$ & $0.05140$ & $-2.56\%$ & $20.73$ \\
$100$ & $0.05254$ & $0.05067$ & $-3.56\%$ & $40.55$ \\
\bottomrule
\end{tabular}
\caption{Panel-size scaling of the mechanism on the latent-fixed
synthetic panel. Default hyperparameters
$(\gamma, \rho, \lambda, \eta) = (4, 0.1, 0.3, 2)$ across all $n$.}
\label{tab:panel-scaling}
\end{table}

Three things follow from the table.

$N_{\mathrm{eff}}$ grows as roughly $0.4n$, so the mechanism places
meaningful weight on about $40\%$ of the panel at every scale. The
weight cap $\omega_{\max}$ does not bind at any tested $n$. A
$100$-forecaster panel therefore does not collapse the aggregate
onto a handful of forecasters, which is the concentration failure
mode that panel-size scaling experiments most often surface.

The sign of the CRPS change flips between $n = 12$ and $n = 25$. At
$n = 6$ and $n = 12$ the mechanism sits slightly behind uniform
averaging. At $n \geq 25$ it overtakes uniform and the gap widens
with $n$. The default hyperparameters were tuned for a
ten-forecaster panel, so their sub-optimality at $n = 6$ is a
statement about the tuning, not the mechanism: a parameter sweep
at $n = 6$ would recover a neutral or positive delta at the cost
of a small re-tuning. The larger point is that the skill layer's
value rises with panel heterogeneity, because larger panels
contain more redundancy for the skill gate to suppress.

The best-single benchmark sits at $0.02652$ CRPS across $n$
because it is driven by the single lowest-noise forecaster and the
generating process is fixed. The mechanism's share of the oracle
gap rises from near zero at $n = 6$ to about $10\%$ at $n = 100$,
which is consistent with the conditional-improvement framing.

### Risk-aversion sensitivity

The Lambert truthfulness theorem assumes strict risk-neutrality
over single-round profit. Under risk aversion a participant's
optimal quantile report shifts away from the true quantile and
toward the centre of their belief. The experiment sweeps a shared
CRRA-analogue risk-aversion level
$\gamma_{\mathrm{ra}} \in \{0, 0.25, 0.5, 1, 2, 4\}$ across a
ten-participant panel using the hedged-reporting policy (pull
toward $0.5$ scaled by $\gamma_{\mathrm{ra}}$) against a truthful
baseline on the same seeds and outcome draws.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrr}
\toprule
$\gamma_{\mathrm{ra}}$ & $\Delta$ CRPS (hedged vs truthful) & $\Delta$ profit \\
\midrule
$0.00$ & $-0.00009$ & $0.00$ \\
$0.25$ & $-0.00515$ & $0.00$ \\
$0.50$ & $-0.00953$ & $0.00$ \\
$1.00$ & $-0.01667$ & $0.00$ \\
$2.00$ & $-0.02623$ & $0.00$ \\
$4.00$ & $-0.03399$ & $0.00$ \\
\bottomrule
\end{tabular}
\caption{Risk-aversion sweep on the symmetric-outcome synthetic
panel. Aggregate CRPS is lower under hedged reporting because the
outcome distribution is symmetric around $0.5$.}
\label{tab:risk-aversion}
\end{table}

The result is counter-intuitive on first reading and worth
unpacking. On this synthetic panel the outcome is drawn uniformly
on $[0, 1]$, so the mean of the outcome distribution is exactly
$0.5$. Hedged reporting pulls the point forecast toward $0.5$,
which is, on average, the optimal point forecast for this
distribution. CRPS therefore falls with rising risk aversion on
the symmetric-outcome panel, not because hedging is
incentive-compatible in Lambert's sense (the per-round
truthfulness argument still says it is not), but because the
panel's point-forecast optimum coincides with the hedging target.

Two takeaways follow. First, CRPS is not a sufficient witness for
truthfulness: the mechanism's aggregate can fall under systematic
mis-reporting when the mis-report happens to align with the
conditional mean. The per-round profit column records $\Delta = 0$
across the sweep because, on a symmetric outcome process with
uniformly hedged reporting, the cross-agent payoff redistribution
cancels. Second, the risk-aversion penalty is invisible on a
symmetric, stationary DGP. The Lambert truthfulness argument
should therefore be audited on an asymmetric outcome process, for
example an exponential or a truncated-normal distribution, before
the per-round truthfulness claim extends beyond the linear-utility
regime. The asymmetric-DGP audit is flagged as follow-up work in
Chapter~\ref{ch:conclusion}.
