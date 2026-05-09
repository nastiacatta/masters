# Strategic robustness {#ch:robustness}

This chapter evaluates the mechanism against a catalogue of
strategic adversaries. Each adversary is grounded in published
theoretical work, evaluated across at least ten seeds, and reported
with paired summary statistics and $95\%$ confidence intervals. The
catalogue is organised around named threat models from the
wagering-mechanism literature rather than around ad-hoc behavioural
presets.

## Adversary catalogue

Table~\ref{tab:adversary-catalogue} lists the nine archetypes
together with their theoretical bases.

\begin{table}[h]
\centering
\small
\begin{tabular}{lp{7cm}}
\toprule
Archetype & Theoretical basis \\
\midrule
Arbitrage seeker & \citet{chen2014arbitrage} Theorem 3.3 (MAE
  analogue); \citet{chun2011cooperating} \\
Coordinated coalition & \citet{chun2011cooperating} coalition;
  \citet{chen2014arbitrage} Section 3 \\
Strategic-influence attacker & Corner solution of the manipulation
  utility \\
Strategic reporter & Soft manipulator mixing an anchor with a
  target report \\
Privileged-information insider & \citet{lambert2008selffinanced};
  \citet{johnstone2007economic} \\
Detector-aware evader & Adaptive evader tracking detector scores \\
Wash trader & Parimutuel wash and multi-account activity
  inflation \\
Sybil arbitrageur & Audit combining sybil splitting with
  arbitrage \\
Reputation-reset attacker & \citet{feldman2004freeriding}
  whitewashing \\
\bottomrule
\end{tabular}
\caption{Strategic adversaries evaluated in this chapter and their
theoretical bases.}
\label{tab:adversary-catalogue}
\end{table}

All $\mathcal{F}_{t-1}$-compliant adversaries use only the public
round state available before the outcome is realised. The only
boundary-violating variant is the \emph{leaked-future} setting of
the privileged-information insider, which is retained as an audit
check rather than a realistic attack.

## Arbitrage scan

The \citet{chen2014arbitrage} arbitrage interval predicts a monotone
relationship between the skill-gate floor $\lambda$ and arbitrage
profit. Table~\ref{tab:arbitrage-scan} reports the empirical scan
over twenty seeds, $T = 1\,000$ rounds.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrrr}
\toprule
$\lambda$ & Mean profit $\pm$ SE & $95\%$ CI & Mean found-rounds \\
\midrule
$0.0$ & $+11.68 \pm 1.14$ & $[+9.46,\, +13.91]$ & $774$ \\
$0.1$ & $+13.40 \pm 1.24$ & $[+10.97,\, +15.82]$ & $773$ \\
$0.3$ & $+16.22 \pm 1.40$ & $[+13.49,\, +18.96]$ & $770$ \\
$0.5$ & $+19.07 \pm 1.50$ & $[+16.13,\, +22.00]$ & $765$ \\
$0.8$ & $+22.46 \pm 1.77$ & $[+18.99,\, +25.93]$ & $758$ \\
$1.0$ & $+24.22 \pm 1.97$ & $[+20.36,\, +28.08]$ & $753$ \\
\bottomrule
\end{tabular}
\caption{Arbitrage profit as a function of the skill-gate floor.}
\label{tab:arbitrage-scan}
\end{table}

Arbitrage profit increases monotonically with $\lambda$, as
\citet{chen2014arbitrage} predict for the mean-absolute-error analogue. The
effect fires on approximately $77\%$ of rounds.

\begin{figure}[h]
\centering
\includegraphics[width=0.85\textwidth]{writing/figures/arbitrage.png}
\caption{Arbitrage profit as a function of the skill-gate floor
$\lambda$ and the benign crowd size. Profit rises monotonically
with both axes, consistent with the \citet{chen2014arbitrage}
prediction. The skill gate constrains but does not eliminate the
arbitrage vulnerability.}
\label{fig:arbitrage}
\end{figure}

A companion experiment varies the benign crowd size at fixed
$\lambda$. A lone arbitrageur embedded in $32$ benign participants
extracts approximately four times the profit of one embedded in
$4$ benign participants at the same $\lambda$. Larger crowds carry
more within-crowd disagreement and therefore offer more wager pool
to access.

## Collusion

A three-member coalition is evaluated over twenty seeds using two
coalition-report rules, reported in Table~\ref{tab:collusion}.

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Scenario & Mean coalition profit $\pm$ SE & $95\%$ CI \\
\midrule
No collusion & $0.00 \pm 0.00$ & $[0,\, 0]$ \\
\citet{chun2011cooperating} weighted-mean
  & $+19.87 \pm 2.32$ & $[+15.32,\, +24.41]$ \\
Weighted-median variant
  & $+16.86 \pm 2.37$ & $[+12.22,\, +21.50]$ \\
\bottomrule
\end{tabular}
\caption{Collusion stress test (three-member coalition).}
\label{tab:collusion}
\end{table}

Both coalition variants extract strictly positive profit, with the
weighted-mean variant marginally better in expectation.

### Informed collusion

The combined-attack variant has three insiders acting as a coalition
under an AR(1) data-generating process ($\varphi = 0.7$,
$\sigma_\epsilon = 0.18$). Table~\ref{tab:informed-collusion} reports
the profit.

\begin{table}[h]
\centering
\small
\begin{tabular}{p{4.2cm}rr}
\toprule
Scenario & Mean coalition profit $\pm$ SE & $95\%$ CI \\
\midrule
Baseline & $0.00 \pm 0.00$ & $[0,\, 0]$ \\
Collusion only (truthful beliefs)
  & $+24.12 \pm 3.01$ & $[+18.21,\, +30.02]$ \\
Informed collusion (coalition + insider precision)
  & $+33.84 \pm 2.41$ & $[+29.12,\, +38.56]$ \\
\bottomrule
\end{tabular}
\caption{Informed collusion combines two attack channels.}
\label{tab:informed-collusion}
\end{table}

The two channels compound: the informed coalition extracts
approximately $40\%$ more profit than pure collusion
(\,$+33.84$ against $+24.12$).

## Insider advantage

Under the same AR(1) data-generating process, a single insider with
a low-variance lagged signal (lag $1$, observation noise $0.015$) is
evaluated over twenty seeds. The lagged-signal variant captures
approximately $89\%$ of the profit of an outright-leakage variant
($+57.14$ against $+63.98$): the price of making the information
boundary honest. Under an i.i.d.\ outcome process the lagged insider
degenerates to a truthful baseline, so the effect requires
autocorrelation in the outcome.

## Sybil-proofness

Two separate sybil audits are run. The first tests the narrow Lambert
invariance directly: clones reporting identical values with conserved
total wager. Under this regime the profit ratio is $1.000000$ with
maximum deviation at floating-point noise. Under small
$\varepsilon$-perturbations to the clones' reports, the ratio
increases to approximately $1.065$, a $6.5\%$ empirical leakage. The
Lambert proof requires $r_i = r_j$, so the diversified-report case is
an scope limitation rather than a defect. That the scope is narrow
is structural: \citet{pan2024sybilproof} prove that the only
non-wasteful, symmetric, incentive-compatible, sybil-proof direct
mechanism in the single-parameter environment is a second-price
auction with symmetric tie-breaking. Any richer mechanism --- the
wagering-mechanism family included --- will therefore have regimes
under which sybil invariance holds and regimes under which it does
not, and the task of the empirical audit is to state the scope
precisely.

The second audit combines sybil splitting with the
\citet{chen2014arbitrage} arbitrage attack: $k$ clones fan the arbitrage
behaviour with equal total stake. Table~\ref{tab:sybil-arbitrage}
reports the result.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrrr}
\toprule
$k$ & Mean profit $\pm$ SE & $95\%$ CI & Mean $N_\mathrm{eff}$ \\
\midrule
$1$ & $+13.01 \pm 1.05$ & $[+10.96,\, +15.06]$ & $3.21$ \\
$3$ & $+13.01 \pm 1.05$ & $[+10.96,\, +15.06]$ & $5.05$ \\
$5$ & $+13.01 \pm 1.05$ & $[+10.96,\, +15.06]$ & $5.97$ \\
\bottomrule
\end{tabular}
\caption{Sybil-arbitrage: profit is invariant to the number of
clones.}
\label{tab:sybil-arbitrage}
\end{table}

Profit is invariant to $k$ within Monte-Carlo error: the Lambert
invariance carries over to the arbitrage attack. The effective
participant count $N_\mathrm{eff}$ inflates as $k$ grows, but this is
an artefact of counting identities rather than influence and has no
payoff consequence.

### Report-diversification $\varepsilon$-sweep

The Lambert invariance holds for identical clone reports. An
empirically natural next question is how the invariance degrades
when clone reports differ by a small perturbation, which is the
most common diversified-sybil attack in practice. Holding the total
stake constant across $k = 3$ clones, we add an i.i.d.\ Gaussian
perturbation with standard deviation $\varepsilon$ to each clone's
report, leaving the parent attack unchanged otherwise, and record the
arbitrageur's mean profit over $1{,}000$ rounds across ten seeds.
Table~\ref{tab:sybil-epsilon} reports the sweep.

\begin{table}[h]
\centering
\small
\begin{tabular}{rrrr}
\toprule
$\varepsilon$ & Mean profit $\pm$ SE & Leakage vs $\varepsilon = 0$ & $N_\mathrm{eff}$ \\
\midrule
$0.000$ & $+12.02 \pm 1.28$ & $+0.00\%$ & $3.21$ \\
$0.005$ & $+11.98 \pm 1.25$ & $-0.27\%$ & $3.21$ \\
$0.010$ & $+11.97 \pm 1.24$ & $-0.36\%$ & $3.21$ \\
$0.020$ & $+11.76 \pm 1.26$ & $-2.14\%$ & $3.22$ \\
$0.050$ & $+10.40 \pm 1.26$ & $-13.40\%$ & $3.25$ \\
$0.100$ & $+5.35  \pm 1.29$ & $-55.50\%$ & $3.33$ \\
\bottomrule
\end{tabular}
\caption{Sybil-arbitrage with diversified clone reports. The
$\varepsilon = 0$ row reproduces the narrow Lambert scope. The
``leakage'' column is signed against the narrow-Lambert benchmark;
positive would mean diversified reports help the attacker.}
\label{tab:sybil-epsilon}
\end{table}

The sign of the leakage is negative and grows in magnitude
monotonically with $\varepsilon$: diversifying clone reports
\emph{reduces} the attacker's profit on this attack, rather than
creating additional leakage above the narrow Lambert invariance.
At the largest perturbation tested ($\varepsilon = 0.10$, a
substantial fraction of the $[0, 1]$ outcome range) profit falls to
less than half of the identical-clone value.

Two implications follow. First, the previously quoted ``$+6.5\%$
diversified-sybil leakage'' is not a general property of the
mechanism: it holds for a different attack (report-diversified
clones acting as independent forecasters rather than as a
co-ordinated arbitrage seeker) and does not transfer to the
arbitrage case. Second, the skill gate penalises clones whose
reports miss the arbitrage point, so the decision to diversify
trades mean arbitrage precision against $N_{\mathrm{eff}}$-based
detection evasion; empirically the arbitrage-precision term
dominates. A sharper formal statement of this trade-off would
require a best-response analysis over $\varepsilon$ and the
attacker's total stake, which is flagged as follow-up work in
Chapter~\ref{ch:conclusion}.

## Wash trading

A parimutuel wash experiment over ten seeds evaluates two activity-
gaming styles. Anchor-style wash inflates activity by approximately
$67\%$ at a modest positive profit of $+14.71$; split-bet wash
inflates by $112\%$ but pays a large score-rule cost, leaving the
attacker deeply in the red ($-261.51$). Attackers using the
split-bet style are typically bankrupt by round $1\,000$.

## Strategic reporting

A pull sweep towards target $= 0.9$ characterises the
strategic-reporting frontier. Gentle nudges (pull $= 0.3$) are the
only profitable attack in the family: they shift the aggregate
report by $+0.056$ and yield profit $+10.49$. Aggressive pulls are
self-defeating: at pull $= 1.0$ the shift is smaller ($+0.011$) and
the profit is strongly negative ($-10.00$). The skill gate collapses
$\sigma$ in response to the extreme reports, driving the effective
wager towards zero before the attacker can move $\hat r$.

## Detection adaptation

An online $z$-score detector with target $\mu = 0.2$ is run against a
uniform-outcome data-generating process over twenty seeds. Both the
fixed manipulator and the adaptive evader are bankrupted: the fixed
manipulator loses $-50.02 \pm 0.003$ and the adaptive evader loses
$-49.78 \pm 0.129$. The adaptive evader's quiet-mode hedging
marginally reduces the loss but cannot flip the sign. On a
uniform-outcome process, where the manipulator has no information
edge, manipulation is not economically viable.

## Whitewashing (reputation reset)

\citet{feldman2004freeriding} catalogue the whitewashing attack on
reputation systems: a participant whose reputation has collapsed
abandons the identity and re-enters as a newcomer. In our setting,
this maps to an adversary with a collapsed $\sigma$ creating a new
account identifier, which the mechanism initialises from the prior.
Table~\ref{tab:reputation-reset} reports the result over five seeds
($T = 1\,000$, $\kappa = 0.05$, warmup $20$, cooldown $50$).

\begin{table}[h]
\centering
\small
\begin{tabular}{lrr}
\toprule
Scenario & Mean attacker profit $\pm$ SE & Mean resets \\
\midrule
Baseline & $+0.00 \pm 0.00$ & $0.0$ \\
Fixed-identity manipulator & $-20.00 \pm 0.00$ & $0.0$ \\
Whitewashing (reputation reset) & $-3.49 \pm 0.14$ & $1.0$ \\
\bottomrule
\end{tabular}
\caption{Whitewashing attack reduces the attacker's loss but does
not yield positive profit.}
\label{tab:reputation-reset}
\end{table}

Whitewashing dramatically reduces the attacker's loss. A
fixed-identity manipulator bankrupts itself to approximately
$-20.00$ of wealth; a reset-capable attacker abandons the collapsed
identity after the first deep loss and restarts from the prior,
cutting the cumulative loss to $-3.49$. The staleness decay and the
non-unit prior partly discount newcomers, but they do not fully
offset the whitewash. This is a measurable vulnerability that the
current mechanism does not close. Feldman and Chuang's recommendation
a mandatory hold-out period for new accounts, or proof-of-identity
gating, is not currently implemented.

## Invariants holding under attack

The adversary suite is designed to test specific invariants. Each of
the following holds on the committed implementation. Arbitrage
profit is weakly increasing in $\lambda$ and in benign crowd size.
Coalition profit is zero at baseline and strictly positive under
both the Chun--Shachter weighted-mean and weighted-median variants.
Informed collusion exceeds pure collusion, which exceeds baseline,
under the AR(1) outcome process. Leaked insider information exceeds
lagged insider information, which exceeds baseline, under the same
process. Wash inflation exceeds $60\%$ for the anchor variant and
$100\%$ for the split-bet variant, with the anchor profit
approximately zero and the split-bet profit strongly negative.
Sybil-arbitrage profit is invariant across $k$ to within Monte-Carlo
error.

## Summary

The mechanism is strongest against four classes of attack. The
narrow Lambert sybil invariance holds to machine precision and
extends to the arbitrage attack, which is invariant in the number
of sybil clones. The strategic-reporting frontier is non-monotone:
aggressive reports collapse the attacker's $\sigma$ and drive the
effective wager to zero before the aggregate $\hat r$ can be shifted
materially. Fixed manipulators against a data-generating process
with no exploitable structure are bankrupted. The only
small-perturbation attack that extracts positive profit in the
suite is a narrow strategic nudge, which yields $+10.49$ over
$1\,000$ rounds.

The mechanism remains vulnerable in four identifiable respects.
First, arbitrage profit of $+11$ to $+24$ per $1\,000$ rounds is
extracted monotonically in $\lambda$; the skill gate constrains but
does not eliminate this vulnerability. Second, a three-member
coalition extracts $+19.9$ profit under weighted-mean coordination,
and informed collusion under an AR(1) outcome process extracts
$+33.8$; neither is contained by the skill gate. Third, a lagged
insider under AR(1) extracts $+57.1$ profit, approximately $89\%$
of what a full-leakage adversary obtains. Fourth, diversified-report
sybils break the narrow Lambert invariance by approximately $6.5\%$,
and anchor-style wash trading extracts small positive profit at
modest cost.

Several questions remain open. Full collusion equilibria are not
computed; only named strategies are tested. The detector used here
is a simple online $z$-score, and a richer multi-feature detector
would alter both attack and defence curves. Participation attacks
(bursty absence, strategic absence, edge-threshold) are not part of
the current adversary suite and should be re-evaluated before
numerical claims from that family are cited.
