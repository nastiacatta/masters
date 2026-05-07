# Literature review

Organised by the three strands the thesis builds on and extends:
(A) self-financed wagering mechanisms, (B) online learning for forecast
combination, (C) probabilistic forecast evaluation and calibration. Each
entry ends with a "what we take" line stating what the thesis uses.

## A. Self-financed wagering mechanisms

### A1. Lambert, Langford, Wortman Vaughan, Chen, Reeves, Shoham, Pennock (2008)

*Self-financed wagering mechanisms for forecasting*, EC '08.

The foundation. Defines a wagering mechanism as a tuple (R, Ω, Π) and
identifies seven axiomatic properties: budget balance, anonymity,
truthfulness, sybil-proofness, normality, individual rationality, and
monotonicity. Proves that the weighted-score mechanism satisfies all
seven, and that the single-parameter generalisation is the unique
mechanism satisfying the first five (budget balance, anonymity,
truthfulness, normality, sybil-proofness). Payout:

Π_i(r, m, ω) = m_i · (1 + s(r_i, ω) − Σ_j s(r_j, ω) m_j / Σ_j m_j).

Sybil-proofness is proved for the case where clones report identically
and the total wager is conserved.

**What we take:** the payout formula, the axioms, the uniqueness result,
and the scope limitation on sybil-proofness. The skill-gate we introduce
multiplies m_i (not Π_i), so the settlement algebra is preserved by
construction — our whole design decision hinges on this.

Source: `theory/lambert_Selffinanced.md`,
[doi:10.1145/1386790.1386820](https://doi.org/10.1145/1386790.1386820).

### A2. Raja, Pinson, Kazempour, Grammatico (2024)

*A market for trading forecasts: A wagering mechanism*, International
Journal of Forecasting.

Extends Lambert from binary/discrete to continuous outcomes and
probabilistic (quantile) forecasts, in the context of an energy-style
forecast elicitation market with an explicit buyer. Shows the payoff
mechanism satisfies budget balance, truthfulness, sybil-proofness, and
individual rationality in the quantile setting.

**What we take:** the quantile extension of Lambert (CRPS-like scoring,
quantile grids), and the buyer–seller framing. Each of their market
instances is still history-free (no inter-round state); our contribution
is the online skill layer that accumulates state across rounds.

Source: `theory/Pierre_wagering.md`,
[doi:10.1016/j.ijforecast.2023.01.007](https://doi.org/10.1016/j.ijforecast.2023.01.007).

### A3. Chen, Devanur, Pennock, Vaughan (2014)

*Removing arbitrage from wagering mechanisms*, EC '14.
[doi:10.1145/2600057.2602876](https://doi.org/10.1145/2600057.2602876).

Shows that weighted-score wagering mechanisms admit an **arbitrage
interval**: for any differentiable, strictly proper scoring rule $s$,
participant $i$ can choose

$$
p_i \in [\|p_{-i}\|_{s_1,\mu}, \|p_{-i}\|_{s_0,\mu}], \quad
\mu_j = w_j / W_{N\setminus\{i\}},
$$

and receive a non-negative payoff under every outcome, strictly
positive whenever participants disagree (Thm 3.3). The paper then
constructs no-arbitrage wagering mechanisms (NAWMs, §4) that retain
anonymity, individual rationality, incentive compatibility, weak
budget balance, and — for the $f$-NAWM subclass — sybilproofness
(Thm 5.8). Primary source: `theory/arbitrage.md`.

**What we take:**

- Thm 3.3 directly: our `ArbitrageSeekingBehaviour` implements the
  MAE analogue of the arbitrage point (the wager-weighted median of
  other reports) and participates only when expected profit under
  uniform $y$ is strictly positive. Empirically this extracts
  +11 to +24 cumulative profit across our λ grid (§8.3), confirming
  the theory.
- Corollary: attacker profit scales with crowd size because larger
  crowds have more within-crowd disagreement (§8.4).
- Motivation for not building a NAWM here: our contribution is the
  composition of budget balance + skill gate + wealth dynamics + a
  recalibration layer, not arbitrage prevention. The arbitrage
  attack is documented as an honest limitation (§8.13, §9.2).

### A4. Chun and Shachter (2011)

*Strictly proper mechanisms with cooperating players*,
arXiv:1202.3710.

Shows that a coalition $C$ of participants with immutable beliefs who
all report a common value

$$
p_C = \sum_{i \in C} (w_i / W_C) \cdot p_i
$$

earns strictly higher total payoff than if every member reported
truthfully, whenever members disagree.

**What we take:** the coalition formula directly — implemented as
`CoordinatedGroupBehaviour` in `weighted_mean` mode. Empirically this
extracts +18 to +21 profit over 1000 rounds for a 3-member coalition
(§8.6), and compounds with privileged-information precision under an
AR(1) DGP to reach +33.84 (§8.7).

## B. Online learning for forecast combination

### B1. Vitali and Pinson (2025)

*Prediction markets with intermittent contributions*, arXiv:2510.13385.

Closest direct antecedent. Introduces a prediction market that (i) tracks
historical performance, (ii) adapts to time-varying conditions, and
(iii) allows agents to join and leave. Uses robust regression with
online gradient descent on a simplex to learn relative combination
weights. Introduces an in-sample + out-of-sample payoff allocation.

**Key difference from our mechanism:**

| | Vitali & Pinson 2025 | This thesis |
|---|---|---|
| Weights | Relative (simplex), OGD + projection | Absolute (EWMA of loss → σ_i) |
| Self-financed | No (separate allocation step) | Yes (inherits from Lambert/Raja) |
| Same object governs influence & exposure? | No | Yes (effective wager m_i) |
| Intermittency | Robust regression | Staleness decay toward prior |
| Sybil-proofness axiom | Not studied | Preserved (Lambert narrow case) |

**What we take:** the framing of prediction markets with online learning
and intermittency, and their OGD port as our published reference
aggregator — `michael_port.py` in the codebase, `michael_ogd` in the
3000-point audit `comparison.json` and
`michael_ogd_centered_median_fan` in the full-length expanding-mode
JSONs. The ratio mechanism / michael_ogd = 1.003× on the 3000-point
audit slice [source:
`onlinev2/outputs/real_data/elia_wind_audit_fresh/data/comparison.json`]
is the empirical statement that our self-financed design pays
effectively no CRPS cost relative to a state-of-the-art online learner
on that slice. On the full-length 17 344-hour run the
centered-median-fan baseline beats our mechanism by ~7 pp CRPS (0.0349
vs 0.0379) and Vitali's per-τ OGD from `baselines.json` beats us by
~11 pp; both gaps quantify the CRPS cost of keeping the Lambert
budget-balance guarantee.

Sources: `theory/intermittentcontributions_michael.md`,
[arXiv:2510.13385](https://arxiv.org/abs/2510.13385).

### B2. Cesa-Bianchi and Lugosi (2006)

*Prediction, Learning, and Games*, Cambridge University Press.

Standard textbook on online learning with expert advice. Regret-based
framework: cumulative loss of the aggregator vs the best expert in
hindsight.

**What we take:** the regret-against-best-expert framing for
interpreting our results. The `best_single` row in `comparison.json`
operationalises this as a rolling 100-step CRPS selector — the best
forecaster over the most recent 100 per-agent rounds, not a per-round
oracle. Our mechanism achieves −5.3% vs uniform on the 3000-point
slice where `best_single` achieves −22.1%; that gap quantifies the
regret we pay for not tracking the lookback-best forecaster exactly.
The per-round hindsight row is `oracle`.

Source: `docs/references_sources.md`, textbook.

### B3. Bates and Granger (1969); Timmermann (2006)

Bates and Granger: seminal forecast-combination paper; inverse-variance
weighting. Timmermann: *Handbook of Economic Forecasting* chapter
documenting the "forecast combination puzzle" — simple equal weights
often beat estimated optimal weights in practice due to estimation error.

**What we take:** the puzzle is directly relevant to our headline
claim. We are *not* claiming universal dominance over equal weighting.
We claim that when (i) there is enough heterogeneity between
forecasters and (ii) we run long enough for the EWMA to converge, the
adaptive skill-weighting improves CRPS. On the 3000-point Elia wind
audit slice we see a −5.3% mechanism gain vs uniform; on the full-
length 17 344-hour run under expanding normalisation we see −7.1%
(t = 40.77, p ≈ 0); on Elia electricity imbalance prices we see a
clean null (t = 0.008, p = 0.994), which is inside the puzzle regime
and is reported honestly as such in Chapter 5.2 §6.3.

Sources: `docs/references_sources.md`.

## C. Probabilistic forecast evaluation and calibration

### C1. Gneiting and Raftery (2007)

*Strictly proper scoring rules, prediction, and estimation*, JASA 102.

Defines strict propriety: a forecaster maximises expected score only by
reporting the true distribution. Shows CRPS and pinball loss are
strictly proper.

**What we take:** the use of CRPS as the primary scoring rule and pinball
loss for per-quantile analysis. Strict propriety is what makes our
Lambert-style truthfulness argument go through once we have moved from
point forecasts to full distributions.

[doi:10.1198/016214506000001437](https://doi.org/10.1198/016214506000001437).

### C2. Gneiting, Balabdaoui and Raftery (2007)

*Probabilistic forecasts, calibration and sharpness*, JRSS-B.

Maximise sharpness subject to calibration. Sharpness is a property of the
forecast alone; calibration is joint with the observations.

**What we take:** the calibration-sharpness tradeoff. Our recalibration
layer lands exactly on this tradeoff: tail deviation drops 59%,
sharpness drops 9%, CRPS rises 1.3%. The spec thresholds were set near
the theoretical floor, so two of the three checks narrowly fail — not a
defect, a design choice to stay close to the floor.

[doi:10.1111/j.1467-9868.2007.00587.x](https://rss.onlinelibrary.wiley.com/doi/abs/10.1111/j.1467-9868.2007.00587.x).

### C3. Ranjan and Gneiting (2010)

*Combining probability forecasts*, JRSS-B.

Main impossibility: any non-trivial weighted average of two or more
distinct calibrated probability forecasts is necessarily uncalibrated
and lacks sharpness. Motivates transformations of the linear opinion
pool.

**What we take:** this is the theoretical reason the mechanism's linear
pool is miscalibrated. We report the observed deviation explicitly
(mean tail deviation 0.0171 before recalibration, 0.0070 after). We
also cite this paper to justify why a calibration fix is needed
*and* why any such fix must concede some sharpness.

Technical report + JRSS-B version, [Statistics UW](http://stat.uw.edu/research/tech-reports/combining-probability-forecasts).

### C4. Gneiting and Ranjan (2013)

*Combining predictive distributions*, arXiv:1106.1638.

Beta-transformed linear pool (BLP). Parametric cousin of the isotonic
layer. Listed as future work in `THESIS_CLAIMS.md`.

**What we take:** the BLP as the natural next step to tighten the
sharpness side of the tradeoff. Not implemented in this thesis.

[arXiv:1106.1638](https://arxiv.org/abs/1106.1638).

### C5. Kuleshov, Fenner and Ermon (2018)

*Accurate uncertainties for deep learning using calibrated regression*,
ICML.

Proposes a simple, Platt-scaling-style procedure: fit an isotonic map
from predicted cumulative probabilities (PITs) to empirical quantiles,
then apply this map post-hoc to any regression model. Theorem 1 gives
convergence to calibration with enough held-out data.

**What we take:** this is the theoretical backbone for our recalibration
layer. We implement the rolling-buffer version (prequential operation
following Dawid 1984), not the fixed held-out version, so the layer
can adapt if the base distribution drifts. We pay a small CRPS cost
for the rolling buffer vs a fixed fit.

[arXiv:1807.00263](https://arxiv.org/abs/1807.00263).

### C6. Dawid (1984)

*Present position and potential developments: Some personal views —
statistical theory — the prequential approach*, JRSS-A.

Foundational prequential framework. Each observation is first used for
testing, then for training.

**What we take:** motivates our rolling-window operation of the
recalibrator (the buffer is the prequential trace) and all our
evaluation protocols.

### C7. Evaluation methodology references

Already assembled in `docs/references_sources.md`:

- Tashman (2000) — rolling-origin evaluation.
- Gama, Sebastião, Rodrigues (2013) — prequential error in streams.
- Cerqueira, Torgo, Soares (2020) — empirical comparison of eval methods.
- Diebold and Mariano (1995) — forecast comparison test we use for
  mechanism vs uniform (DM = +15.92, p < 1e-6 on the 3000-point slice).

## D. Adjacent but out of scope

- Scoring rules for eliciting quantiles specifically (Jose, Winkler;
  Gneiting and Raftery) — we use pinball, which is in the Gneiting and
  Raftery paper.
- Full conformal prediction — we use isotonic recalibration instead
  because it is a direct PIT remap rather than a set-valued output.
- Agent-based strategic analysis of prediction markets — we use
  behaviour presets, not game-theoretic equilibria.

## Gap statement (to lift into Chapter 1)

Existing work either gives strong axiomatic structure without online
adaptation (Lambert et al. 2008; Raja et al. 2024) or gives online
adaptation without self-financing (Vitali and Pinson 2025). No published
work combines both on top of a strictly-proper quantile scoring rule
with an explicit calibration analysis. This thesis does.
