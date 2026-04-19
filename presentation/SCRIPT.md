# Script Part I — PROBLEM (Slides 1–5, ~6 min)

**Format: ON SLIDE = what the audience sees (concise bullets, key formulas, key numbers). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 1 — Title

**ON SLIDE:**
- Title: Adaptive Skill and Stake in Forecast Markets
- Subtitle: Coupling Self-Financed Wagering with Online Skill Learning
- Anastasia Cattaneo — Imperial College London, Dyson School of Design Engineering

**SCRIPT:**

Good morning. My name is Anastasia Cattaneo. This thesis asks a specific question: if a forecasting market learns who is reliable and gives those participants more influence, do the aggregate predictions improve — without breaking the economic guarantees that make the market trustworthy?

---

## SLIDE 2 — Why Forecast Aggregation Matters

**ON SLIDE:**
- Diagram: distributed data owners (energy, logistics, finance, weather) → Aggregation → Single improved probabilistic forecast → Better decisions
- Combining forecasts reduces error — well-established result in forecasting literature
- Modern standard: full probabilistic forecasts, not point estimates (Gneiting & Raftery, 2007)
- Quality measured by strictly proper scoring rules (e.g. CRPS)
- Real applications: energy bidding, election forecasting, supply chain planning

**SCRIPT:**

In energy, logistics, finance, and public policy, better predictions lead to better decisions. The information needed for strong forecasts is often scattered across many sources — different companies, models, or individuals — each holding private data that is costly to share.

Combining multiple forecasts almost always beats relying on any single one. Different forecasters capture different aspects of reality, and combining them averages out individual errors.

The modern standard goes beyond point estimates. We combine full probabilistic forecasts — entire distributions that express both what we expect and how uncertain we are. The quality of these distributions is measured by strictly proper scoring rules, like the Continuous Ranked Probability Score. A scoring rule is strictly proper when the only way to maximise your expected score is to report your true belief. That mathematical property is what makes truthful participation incentive-compatible.

The open question: how do you get people to participate, and how do you decide whose forecast should count more?

---

## SLIDE 3 — Prediction Markets as a Solution

**ON SLIDE:**
- Problem: data owners won't share raw data (privacy, competition, cost)
- Solution: share predictions instead; reward based on quality
- Market structure (Raja et al., 2024): client posts task → players submit forecasts + wagers → operator aggregates → post-event settlement
- Real platforms: Numerai (data science tournaments), Polymarket (event prediction), Kalshi (regulated exchange)
- Warning: Polymarket wash trading peaked at ~60% of weekly volume, Dec 2024 (Sirolly et al., 2025)
- Warning: Polymarket election prices driven by small core of highly active traders — "specialised competition rather than democratic wisdom aggregation" (Wu, 2025)

**SCRIPT:**

Prediction markets offer a clean solution. Instead of asking people to hand over raw data, you ask them to submit a probabilistic forecast and reward them based on how accurate it turns out to be. The market aggregates individual predictions into a collective view, and participants are compensated for the value of their contribution. The raw data never leaves the forecaster's hands.

This is already happening. Numerai runs data science tournaments where participants stake cryptocurrency on their predictions. Polymarket and Kalshi operate prediction exchanges for events from elections to economic indicators.

But recent evidence reveals serious problems. Sirolly and colleagues found that wash trading on Polymarket — entities trading with themselves to inflate volume — peaked at roughly sixty per cent of weekly share volume in December 2024. Wu's analysis of Polymarket's election markets shows that prices are shaped by specialised competition among a small core of highly active traders, not broad participation.

Real forecasting markets are strategically adversarial in ways that classical forecast combination does not capture. This motivates mechanisms with stronger formal guarantees.

---

## SLIDE 4 — Existing Work

**ON SLIDE:**

Column 1 — Self-Financed Wagering:
- Lambert et al. (2008): weighted-score wagering mechanism (WSWM)
- 7 properties (Theorem 1): budget balance, anonymity, truthfulness, sybilproofness, normality, individual rationality, monotonicity
- Uniqueness (Section 5): WSWMs parameterised by total wager are the only mechanisms satisfying budget balance + anonymity + truthfulness + normality + sybilproofness
- Assumes risk-neutral players
- Raja et al. (2024): added client + utility component; conditionally truthful for players, truthful for client; wind energy case study (GEFcom2014); quantile averaging sharper than linear opinion pooling
- Limitation: history-free — each round independent

Column 2 — Online Forecast Aggregation:
- Online convex optimisation (OGD, Hedge) — learns time-varying weights with regret guarantees
- Limitation: assumes non-strategic, always-available forecasters; no payments

Column 3 — Intermittent Contributions:
- Vitali & Pinson (2025): online robust regression with correction matrix for missing forecasts
- Weights updated by online gradient descent on pinball loss, projected onto simplex
- Payoff: blend of in-sample Shapley + out-of-sample scoring
- Properties: budget balance, symmetry, zero-element, individual rationality, truthfulness
- Real case study: Belgian offshore wind; IEEE version: 9 sellers (3 NWP × 3 ML models)
- Limitation: relative weights on simplex; different settlement structure

**SCRIPT:**

My work directly extends the self-financed wagering mechanism literature. Lambert and colleagues introduced the weighted-score wagering mechanism, where participants submit a forecast and a wager, and the pool is redistributed based on relative performance under a proper scoring rule. They proved this satisfies seven properties including budget balance, truthfulness, and sybilproofness — and that it is the unique mechanism doing so. Raja and colleagues extended this to include a client who offers a reward for forecast improvement, and demonstrated on a wind energy case study that quantile averaging produces sharper aggregates than linear pooling. But both mechanisms are history-free. Each round is independent, with no memory of past performance.

Online forecast aggregation can learn time-varying weights with regret guarantees, but assumes non-strategic forecasters and does not handle payments. Vitali and Pinson designed a market that handles missing submissions and demonstrated it on real Belgian wind data, but their weights are relative and their settlement structure is different.

The positioning matrix on the right shows where each approach sits. The x-axis is whether the mechanism adapts to forecaster quality over time. The y-axis is whether it provides self-financed guarantees. Existing work occupies three corners. My thesis occupies the fourth — adaptive and self-financed.

---

## SLIDE 5 — My Contribution

**ON SLIDE:**
- Dark slide, centred text:
  - Title: "My Contribution"
  - "I extend self-financed wagering with an online skill-learning layer"
  - "effective wager = deposit × learned skill"
  - "The skill signal is absolute, pre-round, and handles intermittent participation while preserving budget balance and sybilproofness"

**SCRIPT:**

My contribution is to extend self-financed wagering with an online skill-learning layer. The effective wager — the single object that determines both how much weight your forecast gets and how much money you have at risk — is your deposit multiplied by a learned skill factor. Strong past performance means nearly all of your deposit counts. Poor performance means most is refunded and only a fraction enters the market.

The skill signal is absolute: it represents your reliability independently of who else participates. It is computed before the round begins, preserving the truthfulness argument. And it handles intermittent participation through a staleness decay that prevents absent forecasters from freezing their reputation. The mechanism preserves budget balance and sybilproofness from the original Lambert framework.
# Script Part II — SOLUTION (Slides 6–8, ~5 min)

**Format: ON SLIDE = what the audience sees (concise bullets, key formulas, key numbers). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 6 — The Mechanism: Round-by-Round

**ON SLIDE:**
- Flowchart — five steps per round:
  1. Submit: player submits quantile forecast + deposit from wealth and confidence
  2. Skill gate: effective wager = deposit × skill factor; remainder refunded immediately
  3. Aggregate: weighted combination using effective wagers as weights
  4. Settle: outcome revealed; payoff redistributes the wager pool based on relative scores; budget-balanced by construction
  5. Update: loss fed into EWMA; skill recomputed for next round; wealth updated with profit
- Key box: "Same effective wager controls BOTH influence and exposure → incentives aligned"
- Side note: "Skill fixed BEFORE round begins, from past losses only → truthfulness preserved"

**SCRIPT:**

Each round has five steps.

First, each participant submits a probabilistic forecast — a set of quantiles — and decides how much to deposit. The deposit comes from the forecaster's current wealth, scaled by a confidence measure derived from how narrow their forecast distribution is. A confident forecaster with a tight distribution deposits more; an uncertain one deposits less. There is a hard cap.

Second, the skill gate. The deposit is multiplied by a factor that depends on the forecaster's learned skill — a number between a minimum floor and one. If past performance has been poor, most of the deposit is refunded immediately and only a small fraction enters the market as the effective wager. If past performance has been strong, nearly all of the deposit counts. The floor ensures every forecaster retains some minimum exposure.

Third, aggregation. The effective wagers serve as weights. Each forecaster's influence on the collective prediction is proportional to their effective wager.

Fourth, settlement. After the outcome is observed, the payoff follows the Lambert weighted-score formula. Each participant receives their effective wager back, plus or minus an amount that depends on how their score compares to the wager-weighted average score. Total payouts always equal total wagers — budget balance holds by construction.

Fifth, the realised loss is fed back into the system. The skill estimate updates for the next round, and wealth adjusts with profit. Winners accumulate capital; losers see their capacity shrink.

The critical design choice: the same effective wager controls both influence and financial exposure. You cannot have influence without risk. And the skill signal is computed before the round begins, using only past information. This timing separation preserves the truthfulness argument from the original Lambert mechanism.

---

## SLIDE 7 — The Skill Signal

**ON SLIDE:**
- EWMA update (when present): loss state blends previous value with current round's loss
- Staleness decay (when absent): loss state reverts toward neutral baseline
- Skill mapping: exponential function from loss state to bounded skill score (1.0 down to minimum floor)
- Plot: skill vs accumulated loss — exponential decay curve
- Three properties:
  - Absolute: reliability independent of other participants
  - Pre-round: computed from past losses only
  - Handles intermittency: absent forecasters decay toward baseline
- Contrast: Vitali-Pinson uses relative weights on simplex (OGD + projection); this thesis uses absolute skill (EWMA + exponential mapping)

**SCRIPT:**

The skill signal is the core innovation. Each forecaster has a loss state that tracks performance over time using an exponentially weighted moving average. When a forecaster participates, their loss state blends the previous value with the current round's loss — measured by a strictly proper scoring rule, either mean absolute error or the CRPS. The learning rate controls how quickly old performance is forgotten.

When a forecaster is absent, their loss state decays toward a neutral baseline. This is deliberate. You cannot build a high reputation and then disappear to preserve it. With no new evidence, skill gradually reverts to a prior. This directly addresses the intermittent contributions problem.

The loss state maps to a bounded skill score through an exponential function. Lower accumulated loss means higher skill, approaching one. Higher loss pushes skill toward the minimum floor, which is always positive — every forecaster retains some market access.

The critical difference from Vitali and Pinson: their weights are relative. They live on a probability simplex and are updated by gradient descent with projection. If one person's weight rises, everyone else's mechanically falls, even if everyone improved. My skill signal is absolute. It represents a forecaster's reliability independently of who else is in the market. One forecaster's skill can improve without reducing another's. This matters for interpretability and for the settlement algebra.

---

## SLIDE 8 — Architecture and Implementation

**ON SLIDE:**
- Three-layer modular diagram:
  - Layer 1 — Environment: data-generating processes (exogenous truth, endogenous truth)
  - Layer 2 — Agents: behaviour block (honest, noisy, risk-averse, sybil, arbitrageur, colluder, wash trader, strategic influence, insider); each outputs (participate, report, deposit); core does not know motives
  - Layer 3 — Platform: core mechanism (scoring → aggregation → settlement → skill update); deterministic, side-effect-free
- Code: onlinev2 Python package
  - core/ (settlement, skill, staking, scoring, aggregation, weights, metrics)
  - behaviour/ (policies, adversaries)
  - dgps/, experiments/
- Test suite: 20+ invariant tests, both point and quantile modes; property-based testing with Hypothesis
- Experiment ladder: correctness → pure forecasting → dynamic robustness → strategic robustness

**SCRIPT:**

The implementation separates three layers cleanly. The environment layer defines the data-generating process — how outcomes and forecaster signals are produced. The agent layer generates per-round actions: participation decisions, reports, and deposits. It can produce honest forecasters or adversarial ones — sybils, arbitrageurs, colluders, wash traders — without touching the core. The platform layer applies the mechanism: scoring, aggregation, settlement, and skill updates. It is deterministic and consumes standardised inputs without knowing why they were chosen.

This separation makes clean experimentation possible. The same mechanism can be tested under different environments, participation patterns, and attack strategies, all without modifying the core.

The system is implemented as the onlinev2 Python package with over twenty invariant tests covering budget balance, zero-sum accounting, sybil invariance, scoring bounds, and timing constraints. Property-based testing with Hypothesis generates random inputs to stress the invariants.

Experiments follow a strict ladder: first establish correctness, then test pure forecasting performance, then dynamic robustness under drift and missingness, then strategic robustness under adversarial behaviour.
# Script Part III — VALIDATION (Slides 9–14, ~7 min)

**Format: ON SLIDE = what the audience sees (concise bullets, key formulas, key numbers). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 9 — Correctness: The Mechanism Works

**ON SLIDE:**
- Invariant checks (1000 rounds, 20 seeds):
  | Invariant | Result |
  |---|---|
  | Max absolute budget gap | 2.84 × 10⁻¹⁴ |
  | Mean profit | 3.01 × 10⁻¹⁷ |
  | Equal-score zero profit | True |
  | Sybil profit ratio (identical reports) | 1.000000 |
  | Sybil max |delta| | 2.07 × 10⁻¹⁷ |
- Scoring tests: pinball non-negative ✓, CRPS non-negative ✓, perfect beats shifted ✓, CRPS bounded ✓
- All 20+ unit tests PASS (both point and quantile modes)

**SCRIPT:**

Before any forecasting claim, the mechanism must be correct.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is about two point eight times ten to the minus fourteen — machine precision. The mechanism is self-financed to numerical tolerance.

Mean profit is three times ten to the minus seventeen — effectively zero. The mechanism purely redistributes; it does not create or destroy value.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero, with the largest residual at two times ten to the minus seventeen — floating-point noise. Identity splitting provides no advantage, confirming the theoretical sybilproofness property from Lambert.

All scoring tests pass: pinball loss is non-negative, CRPS is non-negative, a perfect forecast beats a shifted one, and CRPS is bounded. Over twenty unit tests pass for both point-forecast and quantile-forecast modes, covering budget balance, non-negative cashout, permutation invariance, missing-agent exclusion, profit bounds, and timing constraints.

---

## SLIDE 10 — Deposit Design Is the Strongest Lever

**ON SLIDE:**
- Deposit policy comparison (mechanism weight rule, 20 seeds):
  | Deposit policy | CRPS | vs Fixed |
  |---|---|---|
  | IID Exponential (random) | 0.0456 ± 0.0003 | — |
  | Fixed Unit (b=1) | 0.0423 ± 0.0002 | baseline |
  | Bankroll + Confidence | 0.0375 ± 0.0001 | −11.3% |
  | Oracle Precision (true τ) | 0.0227 ± 0.0001 | −46.3% |
- Ordering: Oracle < Bankroll < Fixed < Random
- Key insight: "How stake enters the system matters more than the weighting rule"

**SCRIPT:**

The single strongest empirical finding: how stake enters the system matters more than the weighting rule.

Four deposit regimes, same weight rule, twenty seeds each. Random exponential deposits — pure noise — give the worst CRPS at zero point zero four five six. Fixed unit deposits — everyone stakes one — come in at zero point zero four two three. Bankroll-confidence deposits — where stake comes from wealth and the forecaster's own confidence — achieve zero point zero three seven five, an 11.3 per cent improvement over fixed. Oracle-precision deposits — using the true signal precision, which no real system could access — reach zero point zero two two seven, a 46.3 per cent improvement over fixed.

A practical deposit rule based only on observable quantities — wealth and forecast width — captures a meaningful portion of the available gain. The oracle remains the ceiling, but bankroll-confidence gets a real fraction of the way there.

The practical implication: the most important design choice is not the weighting rule but how stake enters the system. When deposits carry information about forecast quality, the mechanism works well. When stake is noisy, performance degrades regardless of how sophisticated the aggregation is.

---

## SLIDE 11 — Weight Rules and the Combination Puzzle

**ON SLIDE:**
- Under fixed deposits (20 seeds):
  | Weight rule | CRPS |
  |---|---|
  | Uniform | 0.0434 ± 0.0002 |
  | Deposit | 0.0434 ± 0.0002 |
  | Skill | 0.0419 ± 0.0002 |
  | Mechanism (skill × deposit) | 0.0423 ± 0.0002 |
  | Best single forecaster | 0.0232 ± 0.0001 |
- Skill vs uniform improvement: 3.5%
- Note: deposit = uniform under fixed deposits (all deposits equal)
- Under bankroll deposits (20 seeds):
  | Deposit only | 0.0230 ± 0.0001 |
  | Mechanism | 0.0375 ± 0.0001 |
- Caveat: gains from skill are conditional on heterogeneity and horizon
- Reference: forecast combination puzzle — equal weights hard to beat (Wang et al., 2023)

**SCRIPT:**

The second set of results compares weight rules. Under fixed deposits — which isolate the skill signal because all deposits are equal — skill-only weighting achieves a CRPS of zero point zero four one nine, improving over uniform at zero point zero four three four. That is a 3.5 per cent improvement.

Under bankroll deposits, deposit-only weighting reaches zero point zero two three zero — already close to the best single forecaster. The deposit itself carries so much information that the skill signal adds little on top.

This connects to the forecast combination puzzle: simple equal-weighted averages are hard to beat. Estimated optimal weights are fragile under estimation error and non-stationarity. Equal weights make no estimation errors.

The results are honest about this. The mechanism does not claim universal superiority. It claims that when there is genuine heterogeneity in forecaster quality and enough rounds for learning to converge, adaptive skill-weighted aggregation adds value. The conditions matter.

---

## SLIDE 12 — Skill Recovery and Dynamic Robustness

**ON SLIDE:**
- Skill recovery (T=20000, 6 forecasters, 20 seeds):
  | Forecaster | True noise (τ) | Mean loss | Learned skill (σ) |
  |---|---|---|---|
  | f0 | 0.15 | 0.023 | 0.959 |
  | f1 | 0.22 | 0.033 | 0.942 |
  | f2 | 0.32 | 0.047 | 0.919 |
  | f3 | 0.46 | 0.066 | 0.890 |
  | f4 | 0.68 | 0.089 | 0.854 |
  | f5 | 1.00 | 0.112 | 0.820 |
- Spearman rank correlation (τ vs σ): 1.0000 for both modes
- Staleness decay: absent forecasters revert toward baseline; removes incentive for strategic absence

**SCRIPT:**

The skill recovery experiment tests whether the mechanism correctly identifies who is good. Six forecasters with known noise levels, simulated over twenty thousand rounds, twenty seeds. The learned skill scores correctly rank-order all forecasters: the least noisy — with a true noise of zero point one five — achieves a skill of zero point nine five nine. The noisiest — true noise one point zero zero — gets zero point eight two zero. The Spearman rank correlation between true noise and learned skill is one point zero zero zero zero for both point and quantile modes. Perfect rank recovery.

The staleness decay parameter is critical for dynamic robustness. When a forecaster is absent, their skill gradually reverts toward baseline. This removes the incentive for strategic absence — participating only when you expect to score well and hiding otherwise. You cannot build a reputation and then freeze it by disappearing.

---

## SLIDE 13 — Strategic Robustness

**ON SLIDE:**
- Sybil (identical reports, conserved total wager):
  - Mean profit ratio: 1.000000
  - Max |delta|: 2.07 × 10⁻¹⁷
  - Sybilproofness holds for identical reports
- Sybil with diversified reports: ratio = 1.065 (sybilproofness does not hold)
- Strategic deposit manipulation: ratio = 1.000000
- Arbitrage: Chen et al. (2014) showed WSWMs admit an arbitrage interval when participants disagree
- In repeated setting: arbitrageur extracted zero profit across all floor parameter values
- Note: adaptive adversaries remain an open challenge

**SCRIPT:**

For strategic robustness, the main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The mean ratio is one point zero zero zero zero zero zero, with the largest deviation at two times ten to the minus seventeen. Identity splitting with identical reports provides no advantage.

However, sybil splitting with diversified reports — where clones submit different forecasts — does yield a ratio of one point zero six five. Sybilproofness holds only when clones report identically, which is the standard assumption in Lambert's framework. Strategic deposit manipulation — where a sybil tries to game the deposit — also yields a ratio of exactly one.

Arbitrage: Chen and colleagues showed in 2014 that weighted-score wagering mechanisms admit an arbitrage interval — a range of predictions that guarantee positive payoff when other participants disagree. In my repeated setting, scanning across all values of the floor parameter, the arbitrageur agent extracted zero profit. The skill gate and wealth dynamics appear to limit sustained arbitrage, though the theoretical single-round vulnerability remains.

The overall picture: the mechanism resists the standard attacks. Sybil splitting with identical reports does not help. Arbitrage is not exploitable in practice. But sophisticated adaptive adversaries remain an open challenge. Robustness is promising but not a solved problem.

---

## SLIDE 14 — Contributions, Limitations, and Closing

**ON SLIDE:**
- Contributions:
  1. Mechanism coupling self-financed wagering with online skill learning; skill is absolute, pre-round, handles intermittency
  2. Empirical verification: budget balance (< 10⁻¹⁴), sybilproofness (ratio = 1.000000), bounded loss
  3. Deposit design is the strongest lever: bankroll-confidence achieves 11.3% improvement over fixed
  4. Skill recovery: Spearman rank correlation = 1.0000 (T=20000, 6 forecasters)
  5. Real data validation: −21% CRPS on Elia wind with 5 forecasters (ARIMA, XGBoost, MLP, MA, Naive)
  6. Modular simulation platform (onlinev2) with test suite and dashboard
- Limitations:
  - Tail calibration: under-dispersion ~5 pp in tails (inherent to quantile averaging)
  - Equal weights competitive on electricity dataset (gains conditional on heterogeneity)
  - Truthfulness holds under risk neutrality only (Lambert assumption)
- Closing: "Can aggregate forecasts improve when influence depends on learned skill? Conditionally yes. The strongest lever is deposit design."

**SCRIPT:**

I designed a self-financed wagering mechanism that couples weighted-score settlement with online skill learning. The skill signal is absolute, computed before each round, and handles intermittent participation. The core properties are verified empirically: budget balance to machine precision, sybilproofness with profit ratios of exactly one, and bounded loss.

The strongest empirical finding is that deposit design matters more than the weighting rule. Bankroll-confidence deposits achieve an 11.3 per cent improvement over fixed deposits. The skill signal recovers the correct forecaster ordering perfectly — Spearman correlation of one point zero zero zero zero over twenty thousand rounds.

Critically, this is not just synthetic. On real Elia wind power data — seventeen thousand data points, five real forecasters including ARIMA, XGBoost, and a neural network — the mechanism achieves a twenty-one per cent CRPS improvement over equal weights. On electricity data the improvement is smaller, confirming that gains are conditional on forecaster heterogeneity.

The main limitations: tail calibration shows under-dispersion of about five percentage points, equal weights remain competitive when forecasters are similar in quality, and truthfulness holds only under risk neutrality.

This thesis asked whether aggregate forecasts improve when influence depends not only on stake but also on learned skill. The answer is conditionally yes. The mechanism is correct, the skill signal is meaningful, and the gains are real — both on synthetic benchmarks and on real energy data.

Thank you. I am happy to take questions.
