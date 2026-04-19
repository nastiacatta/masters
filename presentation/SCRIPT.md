# Script Part I — PROBLEM (Slides 1–5, ~6 min)

---

## SLIDE 1 — Title

Good morning. My name is Anastasia Cattaneo. This thesis asks a specific question: if a forecasting market learns who is reliable and gives those participants more influence, do the aggregate predictions improve — without breaking the economic guarantees that make the market trustworthy?

---

## SLIDE 2 — Why Forecast Aggregation?

In energy, logistics, finance, and public policy, better predictions lead to better decisions. The information needed for strong forecasts is often scattered across many sources — different companies, models, or individuals — each holding private data that is costly to share.

Combining multiple forecasts almost always beats relying on any single one. Different forecasters capture different aspects of reality, and combining them averages out individual errors.

The modern standard goes beyond point estimates. We combine full probabilistic forecasts — entire distributions that express both what we expect and how uncertain we are. The quality of these distributions is measured by strictly proper scoring rules, like the Continuous Ranked Probability Score. A scoring rule is strictly proper when the only way to maximise your expected score is to report your true belief.

The open question: how do you get people to participate, and how do you decide whose forecast should count more?

---

## SLIDE 3 — Prediction Markets

Prediction markets offer a clean solution. Instead of asking people to hand over raw data, you ask them to submit a probabilistic forecast and reward them based on how accurate it turns out to be. The market aggregates individual predictions into a collective view, and participants are compensated for the value of their contribution.

This is already happening. Numerai runs data science tournaments where participants stake cryptocurrency on their predictions. Polymarket and Kalshi operate prediction exchanges for events from elections to economic indicators.

But recent evidence reveals serious problems. Sirolly and colleagues found that wash trading on Polymarket peaked at roughly sixty per cent of weekly share volume in December 2024. Wu's analysis shows that prices are shaped by specialised competition among a small core of highly active traders, not broad participation.

Real forecasting markets are strategically adversarial in ways that classical forecast combination does not capture. This motivates mechanisms with stronger formal guarantees.

---

## SLIDE 4 — Where This Work Fits

My work directly extends the self-financed wagering mechanism literature. Lambert and colleagues introduced the weighted-score wagering mechanism, where participants submit a forecast and a wager, and the pool is redistributed based on relative performance. They proved this satisfies seven properties including budget balance, truthfulness, and sybilproofness. Raja and colleagues extended this to include a client who offers a reward for forecast improvement. But both mechanisms are history-free — each round is independent, with no memory of past performance.

Online forecast aggregation can learn time-varying weights with regret guarantees, but assumes non-strategic forecasters and does not handle payments. Vitali and Pinson designed a market that handles missing submissions, but their weights are relative and their settlement structure is different.

The positioning matrix shows where each approach sits. Existing work occupies three corners. My thesis occupies the fourth — adaptive and self-financed.

---

## SLIDE 5 — My Contribution

My contribution is to extend self-financed wagering with an online skill-learning layer. The effective wager — the single object that determines both how much weight your forecast gets and how much money you have at risk — is your deposit multiplied by a learned skill factor. Strong past performance means nearly all of your deposit counts. Poor performance means most is refunded and only a fraction enters the market.

The skill signal is absolute: it represents your reliability independently of who else participates. It is computed before the round begins, preserving the truthfulness argument. And it handles intermittent participation through a staleness decay that prevents absent forecasters from freezing their reputation. The mechanism preserves budget balance and sybilproofness from the original Lambert framework.


# Script Part II — SOLUTION (Slides 6–8, ~5 min)

---

## SLIDE 6 — Mechanism: Round-by-Round

Each round has five steps.

First, each participant submits a probabilistic forecast — a set of quantiles — and decides how much to deposit. The deposit comes from the forecaster's current wealth, scaled by a confidence measure derived from how narrow their forecast distribution is.

Second, the skill gate. The deposit is multiplied by a factor that depends on the forecaster's learned skill — a number between a minimum floor and one. If past performance has been poor, most of the deposit is refunded immediately and only a small fraction enters the market as the effective wager.

Third, aggregation. The effective wagers serve as weights. Each forecaster's influence on the collective prediction is proportional to their effective wager.

Fourth, settlement. After the outcome is observed, the payoff follows the Lambert weighted-score formula. Total payouts always equal total wagers — budget balance holds by construction.

Fifth, the realised loss is fed back into the system. The skill estimate updates for the next round, and wealth adjusts with profit.

The critical design choice: the same effective wager controls both influence and financial exposure. You cannot have influence without risk. And the skill signal is computed before the round begins, using only past information — preserving truthfulness.

---

## SLIDE 7 — The Skill Signal

The skill signal is the core innovation. Each forecaster has a loss state that tracks performance over time using an exponentially weighted moving average. When a forecaster participates, their loss state blends the previous value with the current round's loss. The learning rate controls how quickly old performance is forgotten.

When a forecaster is absent, their loss state decays toward a neutral baseline. You cannot build a high reputation and then disappear to preserve it. With no new evidence, skill gradually reverts to a prior.

The loss state maps to a bounded skill score through an exponential function. Lower accumulated loss means higher skill, approaching one. Higher loss pushes skill toward the minimum floor, which is always positive — every forecaster retains some market access.

The critical difference from Vitali and Pinson: their weights are relative — they live on a probability simplex. If one person's weight rises, everyone else's mechanically falls. My skill signal is absolute. One forecaster's skill can improve without reducing another's.

---

## SLIDE 8 — Architecture

The implementation separates three layers cleanly. The environment layer defines the data-generating process — how outcomes and forecaster signals are produced. This includes both synthetic DGPs for controlled testing and real data from the Elia Belgian grid operator. The agent layer generates per-round actions: participation decisions, reports, and deposits. It can produce honest forecasters or adversarial ones — sybils, arbitrageurs, colluders — without touching the core. The platform layer applies the mechanism: scoring, aggregation, settlement, and skill updates. It is deterministic and consumes standardised inputs without knowing why they were chosen.

This separation makes clean experimentation possible. The same mechanism can be tested under different environments, participation patterns, and attack strategies, all without modifying the core. The system has over twenty invariant tests covering budget balance, zero-sum accounting, sybil invariance, and scoring bounds, with property-based testing using Hypothesis to stress the invariants.


# Script Part III — VALIDATION (Slides 9–14, ~7 min)

---

## SLIDE 9 — Correctness

Before any forecasting claim, the mechanism must be correct.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is about ten to the minus thirteen — machine precision. The mechanism is self-financed to numerical tolerance.

Mean profit is effectively zero. The mechanism purely redistributes; it does not create or destroy value.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero. Identity splitting provides no advantage, confirming the theoretical sybilproofness property from Lambert.

The noise-skill correlation is minus zero point nine eight — the mechanism reliably rewards skilled forecasters and penalises noisy ones.

---

## SLIDE 10 — Deposit Design

The DGP experiments reveal that deposit design matters. If deposits correlate with forecast quality — which is what the bankroll-confidence rule achieves by using wealth and forecast width — the mechanism performs better. This is intuitive: more information entering the system means better aggregation.

The non-obvious finding is quantitative: a simple practical deposit rule captures most of the available gain compared to an oracle that knows the true precision. The gap between bankroll-confidence and oracle is much smaller than the gap between random deposits and fixed deposits.

In practice, we cannot force forecasters to use any particular deposit rule. The mechanism must work regardless. But providing a sensible default — stake proportional to wealth and confidence — helps.

---

## SLIDE 11 — Real Data Validation

This is the key validation. Everything before this was controlled simulation — synthetic DGPs where we know the ground truth. Now we test on real data.

On real Elia wind power data — seventeen thousand five hundred and forty-four data points from the Belgian grid operator — with five real forecasters: ARIMA for linear time series modelling, XGBoost for gradient-boosted trees, a multi-layer perceptron neural network, a moving average baseline, and a naive persistence model — the mechanism achieves a twenty-one per cent CRPS improvement over equal weights.

These are not toy models. ARIMA captures linear temporal structure. XGBoost captures nonlinear interactions. The MLP learns flexible function approximations. The moving average and naive models provide baselines of varying sophistication. The heterogeneity between these models is what gives the mechanism something to work with.

On the electricity dataset, the improvement is smaller. The forecasters are more similar in quality on that task, so there is less heterogeneity for the skill signal to exploit. This confirms that gains are conditional on forecaster diversity — when everyone is roughly equally good, equal weights are hard to beat.

---

## SLIDE 12 — Skill Recovery

The skill recovery experiment validates that the mechanism correctly identifies who is good. This is evidence the skill signal works as intended.

Six forecasters with known noise levels, simulated over twenty thousand rounds, twenty seeds. The learned skill scores correctly rank-order all forecasters: the least noisy — with a true noise of zero point one five — achieves a skill of zero point nine five nine. The noisiest — true noise one point zero zero — gets zero point eight two zero. The Spearman rank correlation between true noise and learned skill is one point zero zero zero zero for both point and quantile modes. Perfect rank recovery.

The staleness decay parameter is critical. When a forecaster is absent, their skill gradually reverts toward baseline. This removes the incentive for strategic absence — participating only when you expect to score well and hiding otherwise.

---

## SLIDE 13 — Strategic Robustness

For strategic robustness, the main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero. Identity splitting with identical reports provides no advantage.

However, sybil splitting with diversified reports — where clones submit different forecasts — does yield a ratio of one point zero six five. Sybilproofness holds only when clones report identically, which is the standard assumption in Lambert's framework.

Arbitrage: Chen and colleagues showed that weighted-score wagering mechanisms admit an arbitrage interval in a single round. In my repeated setting, the arbitrageur agent extracted zero profit. The skill gate and wealth dynamics limit sustained arbitrage.

We also tested eighteen behaviour presets across nine families — including reputation gaming, collusion, and risk-averse hedging. The mechanism detects reputation gaming within approximately twenty rounds and limits the damage from all tested strategies.

The overall picture: the mechanism resists the standard attacks. But sophisticated adaptive adversaries remain an open challenge.

---

## SLIDE 14 — Closing

To close. I designed a self-financed wagering mechanism that couples weighted-score settlement with online skill learning. The skill signal is absolute, computed before each round, and handles intermittent participation.

The key contributions: first, the mechanism design itself — coupling wagering with online skill learning. Second, empirical verification of correctness to machine precision. Third, the deposit design finding — bankroll-confidence captures most of the available gain as a practical default. Fourth, perfect skill recovery with Spearman correlation of one. Fifth — and most importantly — real data validation. On Elia wind power data with seventeen thousand data points and five real forecasters — ARIMA, XGBoost, MLP, moving average, and naive — the mechanism achieves a twenty-one per cent CRPS improvement over equal weights. Sixth, the modular simulation platform with test suite and dashboard.

The main limitations: tail calibration shows under-dispersion of about five percentage points, equal weights remain competitive when forecasters are similar in quality, and truthfulness holds only under risk neutrality.

This thesis asked whether aggregate forecasts improve when influence depends on learned skill. The answer is conditionally yes. The mechanism is correct, the skill signal is meaningful, and the gains are real — on real energy data with real forecasting models.

Thank you. I am happy to take questions.
