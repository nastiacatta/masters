# Script Part I — PROBLEM (Slides 1–5, ~6 min)

**Format: ON SLIDE = what the audience sees (the React component output). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 1 — Title

**ON SLIDE:**
- Dark gradient background, centred text
- Title: "Adaptive Skill and Stake in Forecast Markets"
- Subtitle: "Coupling Self-Financed Wagering with Online Skill Learning"
- Footer: Anastasia Cattaneo — Imperial College London

**SCRIPT:**

Good morning. My name is Anastasia Cattaneo. This thesis asks a specific question: if a forecasting market learns who is reliable and gives those participants more influence, do the aggregate predictions improve — without breaking the economic guarantees that make the market trustworthy?

---

## SLIDE 2 — Why Forecast Aggregation?

**ON SLIDE:**
- Split layout: bullets on left, SVG flow diagram on right
- Flow diagram: four data source boxes (Energy, Logistics, Finance, Weather) with arrows converging into an "Aggregation" box, then arrow to "Single Forecast" output box
- Bullets:
  - Combining forecasts reduces error
  - Full probabilistic forecasts (not point estimates)
  - Quality: strictly proper scoring rules (CRPS)
  - Information distributed, costly to share
  - How to incentivise and weight correctly?

**SCRIPT:**

In energy, logistics, finance, and public policy, better predictions lead to better decisions. The information needed for strong forecasts is often scattered across many sources — different companies, models, or individuals — each holding private data that is costly to share.

Combining multiple forecasts almost always beats relying on any single one. Different forecasters capture different aspects of reality, and combining them averages out individual errors.

The modern standard goes beyond point estimates. We combine full probabilistic forecasts — entire distributions that express both what we expect and how uncertain we are. The quality of these distributions is measured by strictly proper scoring rules, like the Continuous Ranked Probability Score. A scoring rule is strictly proper when the only way to maximise your expected score is to report your true belief.

The open question: how do you get people to participate, and how do you decide whose forecast should count more?

---

## SLIDE 3 — Prediction Markets

**ON SLIDE:**
- Split layout: bullets on left, horizontal pipeline SVG on right
- Pipeline: Client → Forecasters → Operator → Settlement (boxes with arrows, labels: "task", "reports + wagers", "aggregate")
- Bottom warning in coral: "Wash trading ~60% of volume | Prices driven by small elite"
- Bullets:
  - Share predictions, not raw data
  - Reward based on forecast quality
  - Client posts task; forecasters submit reports + wagers
  - Market operator aggregates and settles
  - Platforms: Numerai, Polymarket, Kalshi
  - [!] Wash trading ~60% of volume
  - [!] Prices driven by small elite
  - Need mechanisms with formal guarantees
- Reference: [1] Sirolly et al., 2025  [2] Wu, U. Chicago, 2025

**SCRIPT:**

Prediction markets offer a clean solution. Instead of asking people to hand over raw data, you ask them to submit a probabilistic forecast and reward them based on how accurate it turns out to be. The market aggregates individual predictions into a collective view, and participants are compensated for the value of their contribution.

This is already happening. Numerai runs data science tournaments where participants stake cryptocurrency on their predictions. Polymarket and Kalshi operate prediction exchanges for events from elections to economic indicators.

But recent evidence reveals serious problems. Sirolly and colleagues found that wash trading on Polymarket peaked at roughly sixty per cent of weekly share volume in December 2024. Wu's analysis shows that prices are shaped by specialised competition among a small core of highly active traders, not broad participation.

Real forecasting markets are strategically adversarial in ways that classical forecast combination does not capture. This motivates mechanisms with stronger formal guarantees.

---

## SLIDE 4 — Where This Work Fits

**ON SLIDE:**
- Split layout: bullets on left, 2×2 positioning matrix SVG on right
- Matrix axes: x = Static → Adaptive, y = No financial guarantees → Self-financed
- Four cards positioned in quadrants:
  - Lambert/Raja (2008/2024): top-left (self-financed, static)
  - Online Aggregation (OGD, Hedge): bottom-right (adaptive, no payments)
  - Vitali & Pinson (2025): middle-right (adaptive, relative weights)
  - THIS THESIS: top-right with teal glow (adaptive + self-financed)
- Bullets:
  - Lambert/Raja: self-financed, truthful — but static (no skill learning)
  - Online aggregation: adaptive weights — but no payments or guarantees
  - Vitali-Pinson: adaptive + intermittent — but relative weights, different settlement
  - This thesis: adaptive AND self-financed
- Reference: [3] Lambert et al., 2008  [4] Raja et al., 2024  [5] Vitali & Pinson, 2025

**SCRIPT:**

My work directly extends the self-financed wagering mechanism literature. Lambert and colleagues introduced the weighted-score wagering mechanism, where participants submit a forecast and a wager, and the pool is redistributed based on relative performance. They proved this satisfies seven properties including budget balance, truthfulness, and sybilproofness. Raja and colleagues extended this to include a client who offers a reward for forecast improvement. But both mechanisms are history-free — each round is independent, with no memory of past performance.

Online forecast aggregation can learn time-varying weights with regret guarantees, but assumes non-strategic forecasters and does not handle payments. Vitali and Pinson designed a market that handles missing submissions, but their weights are relative and their settlement structure is different.

The positioning matrix shows where each approach sits. Existing work occupies three corners. My thesis occupies the fourth — adaptive and self-financed.

---

## SLIDE 5 — My Contribution

**ON SLIDE:**
- Dark gradient background, centred layout (custom ContributionSlide component)
- Section label: "PROBLEM"
- Title: "My Contribution"
- Subtitle: "Coupling self-financed wagering with online skill learning"
- KaTeX equation in teal-bordered box: m_i = b_i × g(σ_i)
- Below equation: "effective wager = deposit × learned skill"
- Three teal pill badges: "Absolute", "Pre-round", "Handles Intermittency"
- Gold footer: "Preserves budget balance and sybilproofness"

**SCRIPT:**

My contribution is to extend self-financed wagering with an online skill-learning layer. The effective wager — the single object that determines both how much weight your forecast gets and how much money you have at risk — is your deposit multiplied by a learned skill factor. Strong past performance means nearly all of your deposit counts. Poor performance means most is refunded and only a fraction enters the market.

The skill signal is absolute: it represents your reliability independently of who else participates. It is computed before the round begins, preserving the truthfulness argument. And it handles intermittent participation through a staleness decay that prevents absent forecasters from freezing their reputation. The mechanism preserves budget balance and sybilproofness from the original Lambert framework.


# Script Part II — SOLUTION (Slides 6–8, ~5 min)

**Format: ON SLIDE = what the audience sees (the React component output). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 6 — Mechanism: Round-by-Round

**ON SLIDE:**
- Full-width custom component (MechanismPipelineSlide)
- Section label: "SOLUTION"
- Title: "Mechanism: Round-by-Round"
- Five step boxes in a horizontal pipeline with arrows between them:
  1. Submit — "Forecaster submits quantile forecast q and deposit b" — formula: q_i(τ), b_i
  2. Effective Wager (teal-emphasised border) — "Effective wager = deposit × skill factor (KEY equation)" — formula: m_i = b_i · g(σ_i)
  3. Aggregate — "Weighted average using effective wagers as weights" — formula: q̂(τ) = Σ w_i · q_i(τ)
  4. Settle — "Payoff based on relative score — budget balanced" — formula: Π_i = m_i(1 + s_i − s̄)
  5. Skill Update — "Skill updates from loss via exponential smoothing" — formula: σ_i = σ_min + (1−σ_min)e^{−γL_i}
- Dashed feedback arrow from step 5 back to step 2: "skill feeds back (next round)"
- Bottom insight banner: "Same effective wager m determines both aggregation weight and financial exposure"

**SCRIPT:**

Each round has five steps.

First, each participant submits a probabilistic forecast — a set of quantiles — and decides how much to deposit. The deposit comes from the forecaster's current wealth, scaled by a confidence measure derived from how narrow their forecast distribution is.

Second, the skill gate. The deposit is multiplied by a factor that depends on the forecaster's learned skill — a number between a minimum floor and one. If past performance has been poor, most of the deposit is refunded immediately and only a small fraction enters the market as the effective wager.

Third, aggregation. The effective wagers serve as weights. Each forecaster's influence on the collective prediction is proportional to their effective wager.

Fourth, settlement. After the outcome is observed, the payoff follows the Lambert weighted-score formula. Total payouts always equal total wagers — budget balance holds by construction.

Fifth, the realised loss is fed back into the system. The skill estimate updates for the next round, and wealth adjusts with profit.

The critical design choice: the same effective wager controls both influence and financial exposure. You cannot have influence without risk. And the skill signal is computed before the round begins, using only past information — preserving truthfulness.

---

## SLIDE 7 — The Skill Signal

**ON SLIDE:**
- Split layout: bullets on left, custom SkillSignalSlide component on right
- Right panel shows:
  - "Skill Mapping: Loss → Skill" header
  - Gradient bar (teal → gold → coral) with labels: "Low loss → σ ≈ 1" on left, "High loss → σ → σ_min" on right
  - Three example forecaster cards with skill circles: Strong (0.96, teal), Average (0.85, gold), Weak (0.55, coral)
  - Three teal property badges: "Absolute", "Pre-round", "Handles Intermittency"
  - Gold-bordered note: "Staleness decay: absent forecasters revert toward baseline — no gaming by disappearing"
- Bullets:
  - Present: EWMA blends loss with history
  - Absent: staleness decay toward baseline
  - Mapping: loss to σ in [σ_min, 1]
  - Absolute (not relative to others)
  - Pre-round (past losses only)
  - Handles intermittent participation

**SCRIPT:**

The skill signal is the core innovation. Each forecaster has a loss state that tracks performance over time using an exponentially weighted moving average. When a forecaster participates, their loss state blends the previous value with the current round's loss. The learning rate controls how quickly old performance is forgotten.

When a forecaster is absent, their loss state decays toward a neutral baseline. You cannot build a high reputation and then disappear to preserve it. With no new evidence, skill gradually reverts to a prior.

The loss state maps to a bounded skill score through an exponential function. Lower accumulated loss means higher skill, approaching one. Higher loss pushes skill toward the minimum floor, which is always positive — every forecaster retains some market access.

The critical difference from Vitali and Pinson: their weights are relative — they live on a probability simplex. If one person's weight rises, everyone else's mechanically falls. My skill signal is absolute. One forecaster's skill can improve without reducing another's.

---

## SLIDE 8 — Architecture

**ON SLIDE:**
- Split layout: bullets on left, three-layer SVG diagram on right
- Diagram layers:
  - Environment (DGPs): three boxes — "Synthetic", "Elia Wind", "Elia Electricity"
  - Agents (policies): three boxes — "Honest", "Noisy", "Adversarial" (coral border)
  - Platform (core mechanism): four teal boxes — "Scoring", "Aggregation", "Settlement", "Skill Update"
- Arrows between layers labelled: "participate", "report", "deposit"
- Bullets:
  - Environment: DGPs (synthetic + real data)
  - Agents: honest, noisy, adversarial
  - Platform: deterministic core mechanism
  - Agents output (participate, report, deposit)
  - Core consumes without knowing motives
  - 20+ invariant tests, property-based testing

**SCRIPT:**

The implementation separates three layers cleanly. The environment layer defines the data-generating process — how outcomes and forecaster signals are produced. This includes both synthetic DGPs for controlled testing and real data from the Elia Belgian grid operator. The agent layer generates per-round actions: participation decisions, reports, and deposits. It can produce honest forecasters or adversarial ones — sybils, arbitrageurs, colluders — without touching the core. The platform layer applies the mechanism: scoring, aggregation, settlement, and skill updates. It is deterministic and consumes standardised inputs without knowing why they were chosen.

This separation makes clean experimentation possible. The same mechanism can be tested under different environments, participation patterns, and attack strategies, all without modifying the core. The system has over twenty invariant tests covering budget balance, zero-sum accounting, sybil invariance, and scoring bounds, with property-based testing using Hypothesis to stress the invariants.


# Script Part III — VALIDATION (Slides 9–14, ~7 min)

**Format: ON SLIDE = what the audience sees (the React component output). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 9 — Correctness

**ON SLIDE:**
- Full-width custom component (CorrectnessSlide via SlideShell)
- Section label: "VALIDATION"
- Title: "Mechanism Guarantees"
- Subtitle: "Verified to machine precision across all properties"
- Table with four rows, each with: status checkmark, property name, meaning, result
  | ✓ | Budget gap | Self-financed — no external subsidy needed | < 10⁻¹³ |
  | ✓ | Mean profit | Zero-sum — no money created or destroyed | < 10⁻¹³ |
  | ✓ | Sybil ratio | No advantage from splitting | = 1.0 (exact) |
  | ✓ | Noise-skill corr. | Skilled forecasters reliably rewarded | r = −0.98 |
- Each row has a teal left border accent

**SCRIPT:**

Before any forecasting claim, the mechanism must be correct.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is about ten to the minus thirteen — machine precision. The mechanism is self-financed to numerical tolerance.

Mean profit is effectively zero. The mechanism purely redistributes; it does not create or destroy value.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero. Identity splitting provides no advantage, confirming the theoretical sybilproofness property from Lambert.

The noise-skill correlation is minus zero point nine eight — the mechanism reliably rewards skilled forecasters and penalises noisy ones. All twenty-plus unit tests pass for both point-forecast and quantile-forecast modes.

---

## SLIDE 10 — Deposit Design

**ON SLIDE:**
- Split layout: bullets on left, custom DepositAblationSlide component on right
- Right panel shows:
  - Title: "CRPS by Deposit Policy (lower is better)"
  - Horizontal bar chart with four bars:
    - Oracle: 0.0227 (−46%)
    - Bankroll+Conf: 0.0375 (−11%) — highlighted in teal
    - Fixed (b=1): 0.0423 (baseline)
    - Random: 0.0456
  - Gold-bordered annotation: "Weight rule comparison: Skill adds 3.5% over uniform under fixed deposits — but deposit design dominates"
- Highlight bar: "Practical deposit rules capture most of the available gain"
- Bullets:
  - Random (IID Exp): 0.0456
  - Fixed (b=1): 0.0423
  - Bankroll+Conf: 0.0375 (−11%)
  - Oracle: 0.0227 (−46%)
  - Bankroll-confidence: practical default
  - Cannot control what forecasters stake

**SCRIPT:**

Deposit design is an important finding from the controlled DGP experiments. Four deposit regimes, same weight rule, twenty seeds each. Random exponential deposits give the worst CRPS. Fixed unit deposits improve slightly. Bankroll-confidence deposits — where stake comes from wealth and the forecaster's own confidence — achieve an 11.3 per cent improvement over fixed. Oracle-precision deposits — using the true signal precision, which no real system could access — reach a 46.3 per cent improvement.

The practical insight: when deposits carry information about forecast quality, the mechanism works better. The bankroll-confidence rule is a practical default that captures a meaningful portion of the available gain. But this is a design consideration, not the main finding — in practice, we cannot control what forecasters choose to stake. The mechanism must work well regardless.

---

## SLIDE 11 — Real Data Validation ★

**ON SLIDE:**
- Full-width custom component (ContributionsChartSlide via SlideShell)
- Section label: "VALIDATION"
- Title: "Real Data Validation"
- Teal-bordered header box:
  - Bold: "Mechanism achieves −21% CRPS improvement on Elia wind data"
  - Below: "17,544 rounds, 5 forecasters"
- Below header: "Forecasters: ARIMA, XGBoost, MLP, Moving Average, Naive"
- Bar chart: two bars — "Equal Weights" (imperial blue, 0.0456) vs "Mechanism" (teal, 0.0360)
- Y-axis: "CRPS (lower is better)"
- Bottom row with two findings:
  - Teal box: "Wind: −21% CRPS improvement over equal weights"
  - Coral box: "Limitation: gains conditional on forecaster heterogeneity"

**SCRIPT:**

This is the key validation. Everything before this was controlled simulation — synthetic DGPs where we know the ground truth. Now we test on real data.

On real Elia wind power data — seventeen thousand five hundred and forty-four data points from the Belgian grid operator — with five real forecasters: ARIMA for linear time series modelling, XGBoost for gradient-boosted trees, a multi-layer perceptron neural network, a moving average baseline, and a naive persistence model — the mechanism achieves a twenty-one per cent CRPS improvement over equal weights.

These are not toy models. ARIMA captures linear temporal structure. XGBoost captures nonlinear interactions. The MLP learns flexible function approximations. The moving average and naive models provide baselines of varying sophistication. The heterogeneity between these models is what gives the mechanism something to work with.

On the electricity dataset, the improvement is smaller. The forecasters are more similar in quality on that task, so there is less heterogeneity for the skill signal to exploit. This confirms that gains are conditional on forecaster diversity — when everyone is roughly equally good, equal weights are hard to beat.

---

## SLIDE 12 — Skill Recovery

**ON SLIDE:**
- Split layout: bullets on left, custom SkillRecoverySlide component on right
- Right panel shows:
  - Title: "True Noise (tau) vs Learned Skill (sigma)"
  - Teal badge: "Spearman ρ = 1.0000"
  - Scatter chart: 6 forecaster points (F1–F6) with tau on x-axis, sigma on y-axis
  - Each point labelled with its tau value
  - Dashed imperial fitted curve showing exponential decay relationship
  - Axes: "True Noise (tau)" and "Learned Skill (sigma)"
- Bullets:
  - 6 forecasters, T=20000, 20 seeds
  - Least noisy (tau=0.15): sigma = 0.959
  - Most noisy (tau=1.00): sigma = 0.820
  - Spearman rank correlation = 1.0000
  - Staleness decay prevents gaming

**SCRIPT:**

The skill recovery experiment validates that the mechanism correctly identifies who is good. This is evidence the skill signal works as intended.

Six forecasters with known noise levels, simulated over twenty thousand rounds, twenty seeds. The learned skill scores correctly rank-order all forecasters: the least noisy — with a true noise of zero point one five — achieves a skill of zero point nine five nine. The noisiest — true noise one point zero zero — gets zero point eight two zero. The Spearman rank correlation between true noise and learned skill is one point zero zero zero zero for both point and quantile modes. Perfect rank recovery.

The staleness decay parameter is critical. When a forecaster is absent, their skill gradually reverts toward baseline. This removes the incentive for strategic absence — participating only when you expect to score well and hiding otherwise.

---

## SLIDE 13 — Strategic Robustness

**ON SLIDE:**
- Full-width custom component (StrategicRobustnessSlide via SlideShell)
- Section label: "VALIDATION"
- Title: "Strategic Robustness"
- Subtitle: "Does the mechanism resist manipulation?"
- Centred attack table with four rows:
  | Sybil (identical) | 1.000000 | ✓ |
  | Sybil (diversified) | 1.065 | ⚠ |
  | Arbitrage | 0 profit | ✓ |
  | Strategic Deposit | 1.000000 | ✓ |
- Shield icon with checkmark below table
- Message: "Mechanism resists standard attacks"
- Reference: [6] Chen et al., EC 2014

**SCRIPT:**

For strategic robustness, the main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero. Identity splitting with identical reports provides no advantage.

However, sybil splitting with diversified reports — where clones submit different forecasts — does yield a ratio of one point zero six five. Sybilproofness holds only when clones report identically, which is the standard assumption in Lambert's framework.

Arbitrage: Chen and colleagues showed that weighted-score wagering mechanisms admit an arbitrage interval in a single round. In my repeated setting, the arbitrageur agent extracted zero profit. The skill gate and wealth dynamics limit sustained arbitrage.

The overall picture: the mechanism resists the standard attacks. But sophisticated adaptive adversaries remain an open challenge.

---

## SLIDE 14 — Closing

**ON SLIDE:**
- Dark gradient background, centred text
- Title: "Thank you"
- Subtitle: "Anastasia Cattaneo\nImperial College London\n2026"

**SCRIPT:**

To close. I designed a self-financed wagering mechanism that couples weighted-score settlement with online skill learning. The skill signal is absolute, computed before each round, and handles intermittent participation.

The core properties are verified empirically: budget balance to machine precision, sybilproofness with profit ratios of exactly one, and bounded loss.

The key contributions: first, the mechanism design itself — coupling wagering with online skill learning. Second, empirical verification of correctness. Third, the deposit design finding — bankroll-confidence captures most of the available gain. Fourth, perfect skill recovery with Spearman correlation of one. Fifth — and most importantly — real data validation. On Elia wind power data with seventeen thousand data points and five real forecasters — ARIMA, XGBoost, MLP, moving average, and naive — the mechanism achieves a twenty-one per cent CRPS improvement over equal weights. Sixth, the modular simulation platform with test suite and dashboard.

The main limitations: tail calibration shows under-dispersion of about five percentage points, equal weights remain competitive when forecasters are similar in quality, and truthfulness holds only under risk neutrality.

This thesis asked whether aggregate forecasts improve when influence depends on learned skill. The answer is conditionally yes. The mechanism is correct, the skill signal is meaningful, and the gains are real — on real energy data with real forecasting models.

Thank you. I am happy to take questions.
