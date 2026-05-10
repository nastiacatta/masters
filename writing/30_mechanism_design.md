# Mechanism design {#ch:mechanism}

This chapter specifies the mechanism in full. Throughout, subscript
$i \in \{1, \dots, n\}$ ranges over participants and subscript $t$
over rounds. Vectors over participants are written in bold. The
notation follows \citet{lambert2008selffinanced} where compatible
and departs from it only where the online skill layer requires
additional structure.

## Round structure

Each round consists of five steps. Every step is a pure function of
the mechanism's persistent state and the current round's inputs, with
no forward references to the outcome. The steps are, in order,
submission, the skill gate, aggregation, scoring and settlement, and
the state update.

### Step 1: submission

Each participant $i$ submits a probabilistic forecast as a vector of
quantiles $q_i(\tau_k)$ for $k = 1, \dots, K$, together with a deposit
$b_i$ drawn from her wealth $W_i$. The quantile grid is fixed to
$K = 9$ equidistant levels $\{0.1, 0.2, \dots, 0.9\}$.

The deposit policy determines how much information is encoded in the
stake. Three regimes are studied:
\begin{itemize}
  \item \textbf{Fixed} ($b_i = 1$), which isolates the skill signal
  from any wealth feedback.
  \item \textbf{Bankroll-fraction}
  $b_i = \min\big(W_i,\, b_{\max},\, f \cdot W_i \cdot c_i\big)$,
  where $c_i = \mathrm{clip}\!\big(\exp(-\beta_c \cdot \Delta_i),
  c_{\min}, c_{\max}\big)$ and $\Delta_i = q_i(0.9) - q_i(0.1)$ is the
  $80\%$-interval width of the forecast. Narrower forecasts produce
  larger $c_i$. For the per-round truthfulness argument,
  $c_i$ is always computed from lagged reports. This is a heuristic
  design choice: the deterministic analogue of fractional-Kelly
  betting \citep{kelly1956new}, replacing the log-optimal growth rate
  with a bounded monotone function of forecast spread as a proxy for
  precision. It is not itself induced by a proper scoring rule.
  \item \textbf{Oracle-precision} ($b_i \propto$ true signal
  precision), which is not implementable in practice and serves as
  the theoretical ceiling.
\end{itemize}

### Step 2: skill gate

The deposit is modulated by a bounded, absolute skill estimate
$\sigma_i \in [\sigma_{\min}, 1]$ to give the effective wager:
\begin{align}
  m_i &= b_i \cdot g(\sigma_i), \\
  g(\sigma) &= \lambda + (1 - \lambda)\, \sigma^{\eta}, \\
  \mathrm{refund}_i &= b_i - m_i.
\end{align}
The floor parameter $\lambda \in [0, 1]$ controls the minimum
effective wager: $\lambda = 0$ freezes out fully-unskilled
participants, while $\lambda = 1$ ignores skill. The exponent
$\eta \geq 1$ controls the nonlinearity of the gate. The critical
invariant is that $\sigma_{i,t}$ uses only information from rounds
strictly earlier than $t$: the gate is fixed before the participant's
current-round report is observed, and therefore cannot be gamed by
the current report. This measurability property is what carries the
Lambert truthfulness argument through to our setting.

### Step 3: aggregation

Effective wagers are normalised to aggregation weights, and the
collective forecast is formed by pointwise weighted quantile
averaging:
\begin{align}
  w_i &= \frac{m_i}{\sum_j m_j}, \\
  \hat q(\tau_k) &= \sum_i w_i \cdot q_i(\tau_k).
\end{align}
This operator has a theoretical grounding beyond being the
obvious averaging rule for quantile reports. It is the
quasi-arithmetic (QA) pool of
\citet{neyman2021quasiarithmetic} with respect to the pinball
score at each level, applied independently on the $\tau$-grid:
the principal who sub-contracts $n$ experts under the pinball
score and pays them in proportion to their weights maximises
worst-case expected profit by reporting the weighted arithmetic
mean of the experts' level-$\tau$ quantile reports. For the
quadratic score the same operator coincides with the linear
opinion pool over means; for the pinball score it extends the
same principle to the quantile coordinate. The same operator is
used by \citet{raja2024wagering} in their quantile extension of
the Lambert mechanism. The
\citet{ranjan2010combining} impossibility applies literally to
linear pools of CDFs, not to the QA pool for pinball; an analogous
under-dispersion pathology nonetheless arises whenever experts
disagree on location
(Proposition~\ref{prop:qa-under-dispersion} in
Section~\ref{ch:recalibration}), and the recalibration layer
addresses it post-hoc. The precise statement of the QA
correspondence and the finite-grid implementation are in
Appendix~\ref{app:qa-pool}.

### Step 4: scoring and settlement

After the outcome $y_t$ is observed, each participant is scored using
a finite-grid CRPS approximation based on the pinball loss:
\begin{align}
  \hat{C}_i &= \frac{2}{K} \sum_k L^{\tau_k}\!\big(y,\, q_i(\tau_k)\big), \\
  L^{\tau}(y, q) &=
  \begin{cases}
    \tau\, (y - q), & y \geq q, \\
    (1 - \tau)\, (q - y), & y < q.
  \end{cases}
\end{align}
Pinball loss $L^{\tau}$ is strictly consistent for the $\tau$-quantile
functional \citep{gneiting2007strictly, steinwart2011estimating}: under
a unique conditional quantile, the expected pinball loss is minimised
only when the reported quantile equals the true one. Summing pinball
losses over a fixed $\tau$-grid yields a scoring rule that is strictly
proper regarding the discretised quantile representation of the
predictive distribution. The bounded per-participant score is
$s_i = 1 - \hat{C}_i / 2 \in [0, 1]$.

Settlement follows \citet{lambert2008selffinanced} verbatim, using the
effective wager $m_i$ in place of the original deposit:
\begin{align}
  \pi_i &= m_i \cdot \big(1 + s_i - \bar s\big), \\
  \bar s &= \frac{\sum_j m_j s_j}{\sum_j m_j}, \\
  \mathrm{profit}_i &= \pi_i - m_i = m_i \cdot (s_i - \bar s).
\end{align}
Budget balance is a construction property: $\sum_i \pi_i = M$
identically in the reports and the outcome. The statement and a
short algebraic proof are given as Theorem~\ref{thm:budget-balance}
in the next section.

### Step 5: update

The skill estimate updates via an exponentially weighted moving
average of the normalised loss:
\begin{align}
  \ell_i &= \hat C_i / 2 \in [0, 1], \\
  L_{i, t} &=
  \begin{cases}
    (1 - \rho) L_{i, t - 1} + \rho\, \ell_{i, t}
      & \text{if $i$ is present at $t$}, \\
    (1 - \kappa) L_{i, t - 1} + \kappa\, L_0
      & \text{if $i$ is absent at $t$},
  \end{cases} \\
  \sigma_{i, t+1} &= \sigma_{\min}
    + (1 - \sigma_{\min}) \exp\!\big(-\gamma\, L_{i, t}\big).
\end{align}
The parameter $\rho$ is the EWMA learning rate, with half-life
approximately $\log 2 / \rho$; $\gamma$ controls the sensitivity of
the loss-to-skill map; $\lambda$ and $\eta$ control the skill gate;
$\sigma_{\min}$ is a lower bound that keeps every participant in the
market; and $\kappa$ is the staleness decay that pulls the skill of
absent participants back toward a neutral prior $L_0$. Default values
for synthetic panels ($n \approx 10$, $T \approx 1000$) are
$(\rho, \gamma, \lambda, \eta) = (0.1, 4, 0.3, 1)$; tuned values for
the Elia wind series at $T = 17\,344$ are
$(\rho, \gamma, \lambda, \eta) = (0.5, 16, 0.05, 2)$, selected through
the held-out sweep reported below.

The staleness decay addresses intermittency: an absent participant's
skill reverts toward the prior rather than freezing, so strategic
absence is not rewarded. It is a Bayesian-shrinkage operator on
$L_i$, analogous to empirical-Bayes hierarchical regularisation, and
differs from the robust-regression treatment of the same symptom used
by \citet{vitali2025intermittent}.

## The core design decision

The single most important design choice is that a \emph{single
object}---the effective wager $m_i$---governs both aggregation
weight and settlement exposure. Two alternatives were considered and
rejected.

The first alternative is to \emph{separate weight and wager}: assign
aggregation weights from one signal (say, past CRPS) and settlement
wagers from another (say, bankroll). This breaks Lambert's
budget-balance algebra: $\sum_i \Pi_i$ no longer equals $\sum_i m_i$
in general, and restoring balance requires either an external subsidy
or a re-normalisation step that changes the incentive geometry.

The second alternative is to \emph{modulate the payout, not the
wager}: leave $m_i = b_i$ and scale $\Pi_i$ by $\sigma_i$. Budget
balance is preserved only if the correction is mean zero across
participants, which in turn requires an ex-post re-normalisation that
breaks the Lambert truthfulness proof.

The chosen design, modulate the wager itself, before aggregation and
before settlement, using only pre-round information, preserves the
Lambert settlement algebra unchanged, uses a single object to control
both influence and exposure, and leaves the truthfulness proof intact
under strict risk-neutrality.

### Theoretical properties

The axioms established by \citet{lambert2008selffinanced} for the
weighted-score mechanism carry over to our mechanism under the
substitution $m_i \leftarrow b_i \cdot g(\sigma_i)$, because the skill
gate uses only information strictly earlier than round $t$.
Table~\ref{tab:axiom-preservation} summarises the status of each
axiom, and the remainder of this section states and proves the four
load-bearing results: budget balance, bounded profit, narrow
sybil-invariance, and per-round truthfulness. Two further results on
the aggregation operator and on the skill estimator are stated in
the subsections that follow.

\begin{table}[h]
\centering
\small
\begin{tabular}{p{5.5cm}cp{6cm}}
\toprule
Property & Preserved & Evidence \\
\midrule
Budget balance & yes
  & $\sum_i \pi_i = \sum_i m_i$ by construction
    (Theorem~\ref{thm:budget-balance}); empirical gap $< 10^{-13}$. \\
Anonymity & yes
  & Payoff depends on $(r, m, \omega)$ only, not on identity. \\
Truthfulness (per-round, risk-neutral) & yes
  & $\sigma_i$ is pre-round; the Lambert proof applies with $m_i$ in
    place of $b_i$ (Theorem~\ref{thm:truthfulness}). \\
Narrow sybil-proofness & yes
  & For identical reports with conserved total wager,
    $m'_i + m''_i = m_i \Rightarrow \pi'_i + \pi''_i = \pi_i$
    (Proposition~\ref{prop:sybil}); empirical profit ratio
    $1.000000$. \\
Normality & yes
  & Payoff is additively separable in scores. \\
Individual rationality & yes
  & $\mathbb{E}_P[\Pi_i] \geq m_i$ at the truthful report. \\
Monotonicity & yes
  & $\partial\,\mathrm{profit}/\partial m_i$ has constant sign. \\
\bottomrule
\end{tabular}
\caption{Lambert axioms preserved under the skill-gate substitution.}
\label{tab:axiom-preservation}
\end{table}

\begin{theorem}[Budget balance]
\label{thm:budget-balance}
For any report vector $\mathbf{r} = (r_1, \dots, r_n)$, any effective
wager vector $\mathbf{m}$ with $M := \sum_j m_j > 0$, and any
outcome $\omega$, the total payout equals the total effective
wager:
$$\sum_i \pi_i(\mathbf{r}, \mathbf{m}, \omega) = M.$$
\end{theorem}

\begin{proof}
By the settlement rule,
$\pi_i = m_i \big(1 + s_i - \bar s\big)$ where
$\bar s = M^{-1} \sum_j m_j s_j$. Summing over participants,
\begin{align*}
  \sum_i \pi_i
  &= \sum_i m_i + \sum_i m_i s_i - \bar s \sum_i m_i \\
  &= M + M \bar s - \bar s \cdot M
  = M,
\end{align*}
where the second line uses
$\sum_i m_i s_i = M \bar s$ by the definition of $\bar s$, and the
third line cancels the two $M \bar s$ terms exactly. The identity
holds point-wise for any reports and any outcome; it does not depend
on propriety, monotonicity, or the functional form of
$s$.
\end{proof}

\begin{proposition}[Bounded profit]
\label{prop:bounded-profit}
If every participant's score satisfies $s_i \in [0, 1]$, then for
every active participant $i$ the profit is bounded:
$-m_i \leq \mathrm{profit}_i \leq m_i$. Absent participants
$($with $m_i = 0$$)$ earn exactly zero profit.
\end{proposition}

\begin{proof}
$\mathrm{profit}_i = m_i (s_i - \bar s)$. By construction
$\bar s = M^{-1} \sum_j m_j s_j$ is a weighted average of
$s_j \in [0, 1]$ and hence lies in $[0, 1]$ itself. Therefore
$s_i - \bar s \in [-1, +1]$ and
$m_i (s_i - \bar s) \in [-m_i, +m_i]$. Absent participants
contribute zero to the weighted average and earn zero profit because
$m_i = 0$.
\end{proof}

Proposition~\ref{prop:bounded-profit} is the risk-containment
property of the mechanism: no participant can lose more than she
deposited (under the worst case $s_i = 0$, $\bar s = 1$), and no
participant can earn more than she deposited (under the best case
$s_i = 1$, $\bar s = 0$). In particular, participant wealth cannot
go negative, and the mechanism is self-financed round-by-round.

\begin{proposition}[Narrow sybil invariance]
\label{prop:sybil}
Consider splitting a single participant $i$ with effective wager
$m_i$ and report $r_i$ into $K$ clones, each submitting the same
report $r_i$, with effective wagers $m_{i,1}, \dots, m_{i,K}$
summing to $m_i$. Let $\pi_i$ denote the pre-split profit and
$\{\pi_{i,k}\}$ the post-split profits. Then
$\sum_{k=1}^{K} \pi_{i,k} = \pi_i$.
\end{proposition}

\begin{proof}
Because all clones submit the same report, they all receive the
same score $s_{i,k} = s_i$. The aggregate score $\bar s$ is a
function of the report vector and the effective-wager vector only
through the weighted mean $M^{-1} \sum_j m_j s_j$. Splitting
participant $i$ into clones leaves this sum unchanged: the
individual terms $m_{i,1} s_i, \dots, m_{i,K} s_i$ sum to
$m_i s_i$, and all other terms are untouched. Therefore $\bar s$ is
invariant under the split. Consequently,
\begin{align*}
  \sum_{k} \pi_{i,k}
  &= \sum_{k} m_{i,k} \big(1 + s_i - \bar s\big)
  = (1 + s_i - \bar s) \sum_k m_{i,k} \\
  &= m_i (1 + s_i - \bar s)
  = \pi_i.
\end{align*}
\end{proof}

The proposition is stated for identical reports and conserved total
effective wager; dropping either hypothesis allows an adversary to
extract a small arbitrage via diversified sybils, which is evaluated
empirically in Section~\ref{ch:robustness} at roughly $6.5\%$
leakage. The narrowness
of the scope is structural: \citet{pan2024sybilproof} prove that in
the single-parameter mechanism-design environment, the only
non-wasteful, symmetric, incentive-compatible, sybil-proof direct
mechanism is a second-price auction with symmetric tie-breaking. Any
richer mechanism, including the Lambert family, must therefore have
a scope qualification somewhere.

### Truthfulness

Truthfulness is the most delicate of the preserved properties because
the skill gate introduces a feedback loop between a participant's
current report and her future effective wager. The key is that the
gate depends only on information strictly earlier than round $t$, so
this feedback is a first-order consideration only across rounds, not
within a round.

\begin{theorem}[Per-round truthfulness under risk-neutrality]
\label{thm:truthfulness}
Suppose that, conditional on the $\sigma$-algebra $\mathcal{F}_{t-1}$
generated by the history up to round $t-1$, participant $i$ believes
the outcome $y_t$ follows the distribution $P$, and that $P$ has a
unique, well-defined quantile $\Gamma_\tau(P)$ at every grid level
$\tau_k$. Suppose further that participant $i$ is risk-neutral over
single-round profit. Then the unique maximiser of
$\mathbb{E}_P\!\left[\pi_{i,t} \mid \mathcal{F}_{t-1}, r_{i,t}\right]$
over the report $r_{i,t}$ is the vector of true quantiles
$r_{i,t}^\star = \big(\Gamma_{\tau_1}(P), \dots, \Gamma_{\tau_K}(P)\big)$.
\end{theorem}

\begin{proof}
Conditional on $\mathcal{F}_{t-1}$, both the deposit
$b_{i,t}$ and the skill $\sigma_{i,t} = f(L_{i,t-1})$ are
$\mathcal{F}_{t-1}$-measurable, and the effective wager
$m_{i,t} = b_{i,t} \cdot g(\sigma_{i,t})$ is therefore constant in
$r_{i,t}$. By the same argument, $\bar s_t = M_t^{-1} \sum_j m_{j,t}
s_{j,t}$ is linear in each $s_{j,t}$ and affine in $s_{i,t}$ for
fixed $(m_{j,t}, s_{j,t})_{j \neq i}$. Profit is therefore
\begin{align*}
  \pi_{i,t}
  &= m_{i,t} \big(1 + s_{i,t} - \bar s_t\big)
  = m_{i,t} \left(1 + s_{i,t} - \frac{m_{i,t} s_{i,t} +
    \sum_{j \neq i} m_{j,t} s_{j,t}}{M_t}\right) \\
  &= m_{i,t} \left(1 - \frac{\sum_{j \neq i} m_{j,t} s_{j,t}}{M_t}
  + \left(1 - \frac{m_{i,t}}{M_t}\right) s_{i,t}\right).
\end{align*}
The only term depending on $r_{i,t}$ is $s_{i,t}$, and its
coefficient $\alpha := m_{i,t} (1 - m_{i,t} / M_t)$ is strictly
positive whenever $m_{i,t} \in (0, M_t)$. Therefore maximising
$\mathbb{E}_P[\pi_{i,t} \mid \mathcal{F}_{t-1}, r_{i,t}]$ is
equivalent to maximising $\mathbb{E}_P[s_{i,t}]$.

The per-participant score is
$s_{i,t} = 1 - \hat C_{i,t} / 2 = 1 - K^{-1} \sum_k
L^{\tau_k}(y_t, r_{i,t,k})$, where $r_{i,t,k}$ is the report at
level $\tau_k$. Maximising $\mathbb{E}_P[s_{i,t}]$ is therefore
equivalent to minimising $\sum_k \mathbb{E}_P[L^{\tau_k}(y_t,
r_{i,t,k})]$. Each term in the sum is a function of a single
component $r_{i,t,k}$, so minimisation decomposes. For each $k$, the
pinball loss $L^{\tau_k}$ is strictly consistent for the
$\tau_k$-quantile of $P$ \citep{gneiting2007strictly}, which means
$\mathbb{E}_P[L^{\tau_k}(y_t, r)]$ is uniquely minimised at
$r = \Gamma_{\tau_k}(P)$ under the hypothesis that this quantile is
unique. Combining the per-level minimisers gives the theorem.
\end{proof}

The theorem is stated per round and carries forward the Lambert
assumption of strict risk-neutrality. Two extensions are worth
noting. Over multiple rounds, a participant could in principle
distort round-$t$ reports to shape the future $\sigma$ values of
competitors, which in turn affects the aggregate weights applied
at rounds $t + 1, t + 2, \dots$. The proposition below bounds this
second-order \emph{EWMA-shaping} incentive.

\begin{proposition}[EWMA-shaping incentive is second-order]
\label{prop:shaping}
Fix a risk-neutral participant $i$ and suppose participant $i$
contemplates a round-$t$ distortion that changes her report by a
small amount $\varepsilon$ relative to the truthful report
$r_i^\star$, holding all other participants' reports fixed at
truthful values. Let $\Pi_\Delta(\varepsilon)$ denote the expected
multi-round profit gain from the distortion, discounted at rate
$\delta < 1$, relative to truth-telling. Then the leading-order
correction from distortion is negative and quadratic in
$\varepsilon$, and the EWMA-shaping correction from influencing
competitors' future weights is bounded by
$\gamma \rho \delta / (1 - \delta)$ per unit of competitor-profit
sensitivity and vanishes once competitors' $\sigma$ saturates.
\end{proposition}

The precise statement and proof sketch are given in
Appendix~\ref{app:ewma-shaping}. The proposition establishes that,
at the tuned Elia parameters ($\gamma = 16$, $\rho = 0.5$) and in
the saturated regime reached empirically after roughly twenty
rounds of losses below $\ell \approx 0.05$, the shaping term is
effectively zero. A formal multi-round truthfulness theorem under
risk-neutral discounted expected profit is an open question.
Under risk aversion --- specifically, when participants optimise a
concave utility of profit rather than expected profit --- the
reduction to pinball-loss minimisation no longer goes through;
this is inherited from the Lambert scope and applies equally to
the deposit-only mechanism.

### Summary of added features and scope limits

Relative to the \citet{lambert2008selffinanced} baseline, the skill
layer contributes three additional features. First,
\textbf{online learning of reliability}: the scalar $\sigma_i$
converges to the correct ordering on the known-noise panel
(Proposition~\ref{prop:ewma-consistency}) and reproduces the
per-forecaster CRPS ranking exactly on the Elia wind audit slice
(Section~\ref{ch:real}). Second, \textbf{staleness-aware intermittency}: absent
participants decay toward the prior $L_0$ rather than retaining a
stale skill estimate. Third, \textbf{absolute skill}: a given
participant's $\sigma_i$ can rise without any other participant's
skill changing, a property that no simplex-constrained weighting rule
possesses.

Three scope limitations are inherited from the Lambert framework and
are not removed by the skill layer. Narrow sybil-proofness assumes
identical reports with conserved total wager
(Proposition~\ref{prop:sybil}); diversified-report sybils break the
invariance by approximately $6.5\%$ empirically
(Section~\ref{ch:robustness}).
Truthfulness requires strict risk-neutrality
(Theorem~\ref{thm:truthfulness}); the argument does not go through
for risk-averse agents or for large stakes relative to wealth.
Finally, the aggregate is under-dispersed in the tails by the same
mechanism that drives the \citet{ranjan2010combining} impossibility
on linear CDF pools; the recalibration layer in
Section~\ref{ch:recalibration} closes part of the gap post-hoc
without removing the underlying obstruction.

## Why an exponentially weighted moving average

Three reasons motivate the choice of an EWMA update rather than
gradient descent on the simplex, as used by \citet{vitali2025intermittent}.
First, \textbf{absoluteness}: EWMA produces a per-participant loss
state that is a function of that participant's history alone, whereas
simplex-projected OGD couples all participants through the projection
step. Second, \textbf{closed-form update}: a single multiply-add per
participant per round, with no projection and no learning-rate
schedule. Third, \textbf{bounded output}: the exponential
loss-to-skill map gives $\sigma \in [\sigma_{\min}, 1]$ automatically,
with a single parameter $\gamma$ controlling sensitivity.

The price of this simplicity is that the EWMA is not a
regret-minimising aggregator. Our $\sigma_i$ is an estimator of
reliability, not a game-theoretically optimal weight. Two
propositions formalise what the EWMA does and does not deliver.

\begin{proposition}[Stationary consistency]
\label{prop:ewma-consistency}
Suppose that, for participant $i$, the per-round losses
$\ell_{i,1}, \ell_{i,2}, \dots$ are independent and identically
distributed with $\mathbb{E}[\ell_{i,t}] = \mu_i < \infty$ and
$\mathrm{Var}[\ell_{i,t}] = \nu_i < \infty$, and that participant
$i$ is present at every round $($so the EWMA does not enter the
staleness-decay branch$)$. Let $L_{i,t}$ be the EWMA loss with
learning rate $\rho \in (0, 1]$ and initial value $L_{i,0} = L_0$.
Then
\begin{enumerate}
  \item[\emph{(a)}] $\mathbb{E}[L_{i,t}] = (1 - \rho)^t L_0 +
    \big(1 - (1 - \rho)^t\big)\, \mu_i$, so
    $\mathbb{E}[L_{i,t}] \to \mu_i$ as $t \to \infty$.
  \item[\emph{(b)}] $\mathrm{Var}[L_{i,t}] \to \frac{\rho}{2 - \rho}\,
    \nu_i$ as $t \to \infty$.
  \item[\emph{(c)}] The mapped skill satisfies
    $\sigma_{i,t} \to \sigma_{\min} + (1 - \sigma_{\min})
    \exp(-\gamma\, \mu_i)$ in probability.
\end{enumerate}
\end{proposition}

\begin{proof}
(a) By linearity, for $t \geq 1$,
\begin{align*}
  \mathbb{E}[L_{i,t}]
  &= (1 - \rho) \mathbb{E}[L_{i,t-1}] + \rho\, \mu_i.
\end{align*}
Solving the recursion with initial condition $\mathbb{E}[L_{i,0}]
= L_0$ gives the stated closed form. The limit follows because
$|1 - \rho| < 1$.

(b) The variance satisfies the analogous recursion
$\mathrm{Var}[L_{i,t}] = (1 - \rho)^2 \mathrm{Var}[L_{i,t-1}] +
\rho^2 \nu_i$ by independence. Its limit is
$\rho^2 \nu_i / (1 - (1 - \rho)^2) = \rho^2 \nu_i /
(\rho (2 - \rho)) = \rho \nu_i / (2 - \rho)$.

(c) By (a) and (b), $L_{i,t}$ converges to $\mu_i$ in mean-square,
hence in probability. The loss-to-skill map
$\sigma \mapsto \sigma_{\min} + (1 - \sigma_{\min}) \exp(-\gamma \cdot)$
is continuous, so the continuous mapping theorem gives the stated
limit.
\end{proof}

Two consequences follow from this proposition. First, the EWMA
tracking variance $\rho \nu_i / (2 - \rho)$ grows monotonically in
$\rho$, so the learning rate traces out a bias-variance frontier:
smaller $\rho$ means slower adaptation to drift but lower
steady-state variance. Second, because the loss-to-skill map is
strictly monotone in $\mu_i$ on $[0, 1]$, the long-run skill
ordering reproduces the long-run CRPS ordering of the participants.
This is the theoretical foundation of the empirical
Spearman-rank-correlation $\sigma \leftrightarrow$ CRPS $= 1.000$
result on the known-noise synthetic panel (Section~\ref{ch:synthetic}).

\begin{proposition}[Tracking a drifting true loss]
\label{prop:ewma-tracking}
Suppose the true loss at round $t$ is time-varying,
$\mathbb{E}[\ell_{i,t}] = \mu_{i,t}$, with bounded per-round drift
$|\mu_{i,t} - \mu_{i,t-1}| \leq \delta$. Then the EWMA tracking
error is bounded by
\begin{align*}
  \big|\mathbb{E}[L_{i,t}] - \mu_{i,t}\big|
  &\leq \frac{1 - \rho}{\rho}\, \delta + o(1),
\end{align*}
so the leading term is $O(\rho^{-1} \delta)$ for small $\rho$.
\end{proposition}

\begin{proof}[Proof sketch]
Unrolling the EWMA recursion,
$\mathbb{E}[L_{i,t}] = \rho \sum_{s=0}^{t-1} (1 - \rho)^s
\mu_{i,t-s} + (1-\rho)^t L_0$, and using
$|\mu_{i,t-s} - \mu_{i,t}| \leq s \delta$ gives
$|\mathbb{E}[L_{i,t}] - \mu_{i,t}|$
$\leq \rho \delta \sum_{s=0}^{t-1} s (1-\rho)^s + O((1-\rho)^t)$.
The sum converges to $\rho \delta (1 - \rho)/\rho^2 =
(1 - \rho) \delta / \rho$ as $t \to \infty$, which is the stated
bound \citep{benveniste1990adaptive}.
\end{proof}

The two propositions jointly characterise the EWMA trade-off: a
smaller $\rho$ reduces steady-state variance (Proposition~\ref{prop:ewma-consistency}b)
but enlarges the tracking error under drift
(Proposition~\ref{prop:ewma-tracking}). The tuned $\rho = 0.5$ for
the Elia wind series sits near the high-variance end of this
trade-off, which is appropriate for the seven-forecaster panel where
relative quality shifts across seasons.

The empirical consequence is that our mechanism matches the
published-OGD reference baseline within $0.3\%$ CRPS on the
3000-point audit slice, but trails its per-quantile OGD variant by
approximately eleven percentage points of CRPS on the full-length
expanding-mode run. This gap is the CRPS cost of keeping the
Lambert budget-balance constraint rather than relaxing to a
simplex-projected OGD.

## Parameter tuning

Default values $(\gamma, \rho) = (4, 0.1)$ are tuned for synthetic
panels with approximately ten participants and $T \sim 1000$ rounds.
The Elia wind series contains $T = 17\,544$ raw hourly points
($17\,344$ evaluation rounds after a 200-round warmup) with seven
forecasters of stable relative quality, which rewards faster, more
decisive skill differentiation. Tuned values for the
expanding-normalisation headline comparison are
$(\gamma, \rho) = (16, 0.5)$ (Section~\ref{ch:real}).

Hyperparameter selection follows a held-out-split protocol. The
sweep scores the mechanism on the last $40\%$ of each series,
disjoint from the burn-in window used by the training metric. The
grid spans
$\gamma \in \{4, 8, 16, 32, 64\}$, $\rho \in \{0.1, 0.3, 0.5, 0.7\}$,
and $\lambda \in \{0.05, 0.2\}$, producing $40$ cells per series.
The held-out optima themselves are reported alongside the
real-data results in Section~\ref{ch:real}
(Table~\ref{tab:sensitivity-sweep}). A higher floor $\lambda = 0.2$
is uniformly worse than $\lambda = 0.05$ on both series, and the
$\gamma$ optimum on wind pushes the top of the grid. Electricity
optima lie in a tight band of $-0.17$ to $-0.22\%$, consistent with
the forecast-combination-puzzle regime discussed in
Section~\ref{ch:real}: when forecasters are undifferentiated, the
skill signal has nothing to extract.
