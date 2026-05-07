# Introduction

## 1.1 Motivation

Decisions under uncertainty in modern energy systems depend on good
short-horizon forecasts. Balancing a power system, scheduling reserves,
clearing intraday markets, and settling imbalance positions all rest on
expectations of generation or load that are updated continuously as new
information arrives. The relevant information is rarely concentrated in
a single actor. Independent operators, aggregators, and analysts each
see part of the signal: one has a superior numerical weather prediction
chain, another has a locally tuned machine-learning model, a third has
private telemetry from installed assets. Raw data is typically
commercially sensitive or expensive to share, yet a derived forecast
can be shared without exposing the underlying inputs.

This observation motivates the study of *forecast-elicitation markets*.
A market operator posts a prediction task; participants submit their
best probabilistic forecast together with a wager; the operator
aggregates the reports into a single collective forecast and,
once the outcome is observed, redistributes the wager pool according
to a scoring rule. When the mechanism is **self-financed** — the sum
of post-event payouts equals the sum of pre-event wagers — no external
subsidy is required, so the market can run indefinitely on its own
accounting. Lambert, Langford, Wortman Vaughan, Chen, Reeves, Shoham
and Pennock [@lambert2008selffinanced] formalised this class as the
*weighted-score wagering mechanism* and showed that, under a set of
natural axioms, it is essentially unique: any mechanism that is
simultaneously budget-balanced, anonymous, truthful, normal and
sybil-proof belongs to this family.

A decade and a half later, two limitations of the Lambert formulation
remain salient for practical deployment. First, each round is treated
in isolation: the mechanism makes no use of the fact that, in most
real applications, the same participants return round after round and
differ systematically in reliability. Second, the mechanism assumes
full participation: an agent who misses a round simply does not play,
with no bookkeeping consequence for future rounds. Both assumptions
are violated by energy forecast markets, where skill is persistent and
participation is intermittent. Vitali and Pinson
[@vitali2025intermittent] addressed the latter directly with an
online-gradient-descent aggregator that tracks historical
performance and tolerates missing submissions, but their mechanism
relaxes self-financing: a separate payoff-allocation step is
introduced and Lambert's axiomatic guarantees no longer apply.

This thesis bridges the two streams. We introduce an online
skill-learning layer that sits on top of the weighted-score wagering
mechanism without disturbing its settlement algebra. Each
participant's deposit is modulated, before every round, by a bounded
scalar *skill estimate* that is itself an exponentially weighted
moving average of that participant's past probabilistic losses. The
resulting *effective wager* is the object that both determines
aggregation weight and carries financial exposure at settlement.
Because the modulation is a scalar multiplier applied pre-round and
derived exclusively from information strictly earlier than the current
report, Lambert's axiomatic proofs carry over verbatim with the
modulated wager in place of the original deposit.

## 1.2 Research question

The thesis is organised around a single question in three parts:

> *When predictive information is distributed across many actors, how
> should their forecasts be combined, and how should the market
> decide whose forecast deserves more influence — while preserving
> the budget balance, truthfulness and sybil-proofness that make the
> mechanism credible?*

The three sub-questions the empirical work must answer are:

1. Can a market learn participant reliability from data alone, online,
   without a patron or subsidy, and can that learning be proven
   convergent on data with known latent skill?
2. Does using that learned reliability to weight the aggregate forecast
   improve accuracy on real energy data, and if so under what
   conditions?
3. Can it happen while preserving Lambert's economic guarantees and
   without opening new strategic attack surfaces beyond those already
   present in any weighted-score wagering mechanism?

The answer developed across the rest of the thesis is *conditional yes*
on all three. The conditions are concrete and stated explicitly.

## 1.3 Contributions

1. **Mechanism design.** A self-financed wagering mechanism that
   couples weighted-score settlement with an online, absolute,
   pre-round skill signal. The same effective wager $m_i = b_i \cdot
   (\lambda + (1-\lambda)\,\sigma_i^\eta)$ controls both aggregation
   weight and settlement exposure, preserving Lambert's axioms under
   the substitution $m_i \leftarrow b_i$ in the original proofs
   (Chapter 3 and Appendix A).

2. **Empirical verification of correctness.** The mechanism satisfies
   all 13 active Lambert combinatorial payoff invariants on the
   committed implementation, with 80 golden-value regression snapshots
   across 16 payoff-module functions. Budget balance holds to machine
   precision (maximum absolute gap $2.84 \times 10^{-14}$ across 1000
   synthetic rounds); the narrow Lambert sybil invariance holds with
   mean profit ratio $1.000000$ and max $|\Delta| = 2.07 \times
   10^{-17}$ (Chapter 5).

3. **Skill recovery.** On a controlled known-noise synthetic panel
   (six forecasters, $T = 20\,000$, 20 seeds), the Spearman rank
   correlation between the true noise scale and the learned skill
   $\sigma$ is exactly 1 in both point-forecast and quantile-forecast
   modes. Learned $\sigma$ values are monotone in true noise across the
   whole range [0.15, 1.00] (Chapter 5).

4. **Deposit-design is the strongest lever.** A four-way deposit-policy
   ablation shows that bankroll-confidence deposits — computed from
   observable quantities (wealth, forecast width) alone — reduce CRPS
   by 10.4% against fixed-unit deposits, capturing roughly one quarter
   of the improvement an oracle-precision deposit attains. The choice
   of weighting rule, holding the deposit policy fixed, moves CRPS by
   at most a few per cent; deposit policy moves it by tens of per cent
   (Chapter 5).

5. **Real-data validation on Elia wind.** On the full 17\,344-hour
   Elia offshore-wind series under strictly-causal expanding
   normalisation, the mechanism reduces CRPS by 7.1% over uniform
   averaging (Diebold–Mariano $t = 40.77$, $p \approx 0$).
   Against Elia's own published real-time forecast (74.0 MW
   CRPS-equivalent), the mechanism reaches 83.7 MW and the best
   single forecaster (online XGBoost on the observed series, no
   weather inputs) reaches 69.5 MW, beating Elia's operational
   forecast by ~6% in CRPS-MW-equivalent (Chapter 6).

6. **Honest null on electricity.** On Elia electricity-imbalance
   prices ($T = 10\,000$, seven forecasters) the mechanism is
   statistically indistinguishable from uniform ($t = 0.008$,
   $p = 0.994$). The seven forecasters produce near-identical CRPS,
   so the skill signal has no persistent structure to exploit. This
   result is reported as a null, not papered over (Chapter 6).

7. **Calibration.** The mechanism's linear-pool aggregate is
   miscalibrated in the way Ranjan and Gneiting [@ranjan2010combining]
   predict: under-coverage in the lower tail, over-coverage in the
   mid-upper range, mean tail deviation 0.017 on the audit slice.
   A post-hoc rolling isotonic recalibration following Kuleshov,
   Fenner and Ermon [@kuleshov2018accurate] closes 59% of the tail
   deviation at 1.3% CRPS cost and 11% sharpness cost, without
   modifying the skill, wager, aggregation or settlement layers
   (Chapter 7).

8. **Strategic-robustness catalogue.** Eight theory-grounded
   adversaries — arbitrage, Chun-Shachter coalition, informed
   collusion, lagged insider, wash trading, strategic reporting,
   detector-aware evasion, sybil-arbitrage — are evaluated on 10–20
   paired seeds with 95% confidence intervals. Standard Lambert
   sybil-proofness (identical reports, conserved total wager)
   empirically holds to floating-point noise; diversified-report
   sybils break the invariance by $\approx$6.5%; Chen et al.
   [@chen2014arbitrage] arbitrage extracts $+12$ to $+24$ profit per
   1000 rounds monotone in the skill-gate floor $\lambda$; a
   three-member Chun-Shachter coalition extracts $+19.9$; a
   legitimate lagged insider under an AR(1) outcome process
   extracts $+57.1$ (Chapter 8).

## 1.4 Thesis structure

- **Chapter 2** reviews the three strands this thesis builds on:
  self-financed wagering mechanisms, online forecast combination,
  and probabilistic forecast evaluation.
- **Chapter 3** specifies the mechanism — round structure, skill
  gate, settlement algebra — and argues why the design choice of
  making the effective wager the single object that governs both
  influence and exposure preserves Lambert's axioms.
- **Chapter 4** describes the datasets, forecaster panel, and
  experimental protocol.
- **Chapter 5** reports synthetic validation: correctness,
  skill-recovery, deposit-policy ablation, weight-rule comparison,
  and a five-step bankroll-pipeline ablation.
- **Chapter 6** reports real-data results on Elia offshore wind and
  electricity-imbalance prices, including an external validation
  against Elia's own operational forecast.
- **Chapter 7** develops a rolling isotonic recalibration layer as an
  orthogonal post-hoc fix for the Ranjan–Gneiting linear-pool
  miscalibration.
- **Chapter 8** evaluates the mechanism against a theory-grounded
  catalogue of adversaries.
- **Chapter 9** discusses limitations, scope, and threats to
  validity.
- **Chapter 10** concludes and lists open directions for future work.

## 1.5 Scope and what this thesis does not do

For clarity, the following are explicitly *out of scope*.

- We do not propose a new scoring rule. CRPS and the pinball loss,
  both strictly proper [@gneiting2007strictly], are used unchanged.
- We do not replace Lambert's settlement algebra. The skill layer is a
  pre-round multiplicative modulator on the wager; no post-round
  re-normalisation, no side payments, no change to the $s_i - \bar{s}$
  redistribution law.
- We do not overturn the Ranjan–Gneiting impossibility. The
  mechanism's linear-pool aggregate is uncalibrated for the reason
  their theorem predicts; the recalibration layer closes part of the
  gap post-hoc without claiming to remove the underlying obstruction.
- We do not claim sybil-proofness under arbitrary report diversity.
  The Lambert axiom applies to identical reports with conserved total
  wager; we verify that narrow invariance to floating-point noise and
  measure the empirical leakage ($\approx$6.5%) under small
  report-diversification attacks.
- We do not characterise coalition-equilibrium or
  best-response dynamics. The robustness chapter tests eight named
  adversary strategies with published theoretical bases and reports
  attacker profit with confidence intervals; it does not compute
  Nash or correlated equilibria.
