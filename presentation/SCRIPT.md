# Slide Map

| Slide | Title | Section | Time |
|-------|-------|---------|------|
| 1 | Title + Anecdote | PROBLEM | ~1 min |
| 2 | What Is a Prediction Market? | PROBLEM | ~1.5 min |
| 3 | Why Combine Forecasts? | PROBLEM | ~1.5 min |
| 4 | Where This Work Fits | PROBLEM | ~1.5 min |
| 5 | My Contribution | PROBLEM | ~1 min |
| 6 | Mechanism: Round-by-Round | SOLUTION | ~2 min ⚠️ |
| 7 | The Skill Signal | SOLUTION | ~1.5 min |
| 8 | Models, Data, and Synthetic Setup | SOLUTION | ~1.5 min |
| 9 | Synthetic Validation: Convergence | VALIDATION | ~1.5 min |
| 10 | Mechanism Guarantees | VALIDATION | ~1 min |
| 11 | Deposit Design | VALIDATION | ~1 min |
| 12 | Real Data: Elia Wind + Electricity | VALIDATION | ~2 min ⚠️ |
| 13 | Strategic Robustness | VALIDATION | ~1 min |
| 14 | Conclusion + Future Work | CLOSING | ~1.5 min |

**Total: ~19.5 min**

> ⚠️ Slides 6 and 12 are flagged at 2 minutes — keep narration tight and avoid tangents.

---

# Script Part I — PROBLEM (Slides 1–5, ~6.5 min)

---

## [SLIDE 1] Title + Anecdote (~1 min)

Last winter I was checking the weather forecast before a weekend trip. Three different apps gave me three different answers — one said rain, one said clear skies, one hedged with "partly cloudy." I ended up averaging them in my head and packing both sunglasses and an umbrella. That little moment stuck with me, because it is exactly the problem this thesis tries to solve — just at a much larger scale and with real money on the line.

Good morning. My name is Anastasia Cattaneo. I would like to thank my supervisors Pierre and Michael for their guidance throughout this work.

---

## [SLIDE 2] What Is a Prediction Market? (~1.5 min)

Before diving in, let me define the central concept.

A prediction market is a mechanism where participants submit probabilistic forecasts — not just a single number, but a full distribution expressing what they expect and how uncertain they are. Each participant backs their forecast with a wager: a financial stake that says "I am putting money behind this prediction." The market then aggregates these individual forecasts into a single collective prediction, weighting each contribution according to how much was staked.

After the outcome is observed, the market settles. Participants who predicted well earn a return; those who predicted poorly lose part of their stake. The wager creates a direct incentive to be accurate — you only risk money when you believe your forecast is genuinely informative.

This idea has practical applications across many domains. In energy, grid operators need accurate wind and solar forecasts to balance supply and demand. In supply chain management, firms need demand forecasts to plan inventory and staffing. In finance, traders aggregate views on asset prices and economic indicators.

The key insight is that useful predictive information is often scattered across many sources — different companies, models, or analysts — each holding private data that is costly to share directly. A prediction market lets you extract that information through forecasts and wagers, without requiring anyone to hand over raw data.

---

## [SLIDE 3] Why Combine Forecasts? (~1.5 min)

So why not just pick the single best forecaster and use their prediction?

The core motivation is that different forecasters make different errors. One model might be strong in calm conditions but weak during storms. Another might capture long-term trends but miss short-term spikes. Combining multiple forecasts averages out these individual errors and typically produces a more robust prediction than any single source alone.

But there is a catch. When forecasts come from strategic participants — people or firms with their own incentives — simple averaging is not enough. Participants might exaggerate confidence to gain more influence, or submit deliberately noisy forecasts to game the system.

What we really want is a market that learns how much to trust each contribution. Not all forecasters are equally valuable, and their value can change over time. Some adapt quickly when conditions shift. Some become stale. Some perform well only under specific circumstances.

The goal of this thesis is to design a mechanism that learns the importance of each forecaster's contribution from their track record, uses that to weight the aggregate forecast, and does all of this while maintaining the economic discipline — budget balance, truthfulness, resistance to manipulation — that makes the market trustworthy.

---

## [SLIDE 4] Where This Work Fits (~1.5 min)

My work sits at the intersection of two literatures that have not been fully connected.

Lambert et al. introduced the weighted-score wagering mechanism. Participants submit a forecast and a wager, the pool is redistributed based on relative performance, and the mechanism satisfies seven formal properties — including budget balance, truthfulness, and sybilproofness. They also proved uniqueness: weighted-score wagering is the only mechanism satisfying all seven. Raja et al. extended this to include a client who posts a task and offers a reward for forecast improvement. But both mechanisms are history-free — each round is independent, with no memory of past performance.

On the other side, online forecast aggregation methods can learn time-varying weights with regret guarantees, but they assume non-strategic forecasters and do not handle payments. Vitali & Pinson designed a market that handles missing submissions, but their weights are relative — they live on a probability simplex. If one person's weight rises, everyone else's mechanically falls. And their settlement structure is different from the self-financed wagering framework.

The positioning matrix shows where each approach sits. One literature gives strong market structure without adaptation. The other gives adaptation without self-financing. My thesis occupies the fourth corner — adaptive and self-financed.

---

## [SLIDE 5] My Contribution (~1 min)

Why is deposit alone not enough to determine influence? Because a wealthy but unskilled forecaster could dominate the market simply by staking large amounts, drowning out more accurate but less wealthy participants. The market needs a way to separate willingness to pay from demonstrated ability.

My contribution is to extend self-financed wagering with an online skill-learning layer. The effective wager — the single object that determines both how much weight your forecast receives and how much money you have at risk — equals the deposit multiplied by a learned skill factor.

The skill signal is absolute: it represents the importance of one participant's contribution directly, not their share relative to others. It is computed before the round begins, using only past information, which preserves the truthfulness argument from Lambert et al. And it handles intermittent participation through a staleness decay that prevents absent forecasters from freezing their reputation.

---

# Script Part II — SOLUTION (Slides 6–8, ~5 min)

---

## [SLIDE 6] Mechanism: Round-by-Round (~2 min)

> ⚠️ This slide is at the 2-minute limit — keep each step concise.

Why structure the mechanism as a repeating pipeline? Because the same effective wager needs to control both influence and financial exposure in every round, and the skill estimate must update after each outcome.

Each round has five steps.

First, submit. Each participant submits a probabilistic forecast — a set of quantiles — and decides how much to deposit. The deposit is a strategic choice: it can be fixed, proportional to wealth, or scaled by confidence.

Second, the skill gate. The mechanism multiplies the deposit by a factor that depends on the forecaster's learned skill — a number between a minimum floor and one. If past performance has been poor, most of the deposit is refunded immediately and only a small fraction enters the market as the effective wager.

Third, aggregation. The effective wagers serve as weights. Each forecaster's influence on the collective prediction is proportional to their effective wager — so the same object that determines financial exposure also determines how much your forecast counts.

Fourth, settlement. After the outcome is observed, the payoff follows the Lambert et al. weighted-score formula. Total payouts always equal total wagers — budget balance holds by construction.

Fifth, update. The realised loss is fed back into the skill estimator. The skill estimate updates for the next round, and wealth adjusts with profit or loss.

The critical design choice: the same effective wager controls both influence and financial exposure. You cannot have influence without risk.

---

## [SLIDE 7] The Skill Signal (~1.5 min)

Why does the skill signal need to be bounded? Because the raw loss accumulator — an exponentially weighted moving average of realised forecasting loss — can in principle grow without bound. A string of bad predictions pushes the accumulated loss toward positive infinity; a string of good ones toward negative infinity. If we used the raw accumulator directly, a single bad streak could permanently exclude a forecaster, and a single good streak could give them unbounded influence.

The exponential mapping compresses this unbounded range into the interval [σ_min, 1]. Lower accumulated loss means higher skill, approaching one. Higher accumulated loss pushes skill toward σ_min — the minimum floor. This floor is always positive, which means every forecaster retains some market access. No one is permanently excluded, and no one can dominate entirely.

When a forecaster is absent, their loss state decays toward a neutral baseline at a separate staleness rate. You cannot build a high reputation and then disappear to preserve it. With no new evidence, skill gradually reverts to a prior.

The critical difference from Vitali & Pinson: their weights are relative — on a probability simplex. If one person's weight rises, everyone else's mechanically falls. My skill signal is absolute. One forecaster's skill can improve without reducing another's. This means the signal measures the value of each individual contribution, not a competitive share.

---

## [SLIDE 8] Models, Data, and Synthetic Setup (~1.5 min)

Before showing results, let me introduce the experimental setup.

Seven forecasting models participate in the market. Naive persistence uses the most recent observed value — it works well when the series is highly autocorrelated. EWMA smooths recent observations with exponential decay. ARIMA captures linear autoregressive and moving-average structure. XGBoost is a gradient-boosted tree ensemble for nonlinear interactions. The MLP is a multi-layer perceptron neural network — the most flexible model in the panel. The Theta method decomposes the series into trend components. And the Ensemble simply averages Naive and EWMA for diversification.

The real data comes from Elia, the Belgian grid operator. The wind dataset covers seventeen thousand five hundred and forty-four hourly observations of offshore wind power generation, with all seven forecasters. The electricity dataset covers imbalance prices with five forecasters.

Why validate on synthetic data first? Because synthetic experiments use a known data-generating process where we control the true quality of each forecaster. This lets us verify that the mechanism learns the correct ranking before testing on real data where ground truth is unknown. Synthetic-then-real is the standard validation approach: first confirm the mechanism works in controlled conditions, then test whether the gains transfer to practice.

---

# Script Part III — VALIDATION (Slides 9–13, ~6.5 min)

---

## [SLIDE 9] Synthetic Validation: Convergence (~1.5 min)

The synthetic experiment answers a fundamental question: does the mechanism actually learn who is good?

Six forecasters with known noise levels, simulated over twenty thousand rounds across twenty seeds. The result: the learned skill scores correctly rank-order all forecasters. The Spearman rank correlation between true noise level and learned skill is ρ = 1.0 — perfect rank recovery. This means the mechanism never confuses a noisy forecaster for a skilled one, or vice versa.

The noise-skill correlation is r = −0.98, confirming that higher noise consistently maps to lower skill. The small gap from −1.0 reflects the stochastic nature of the simulation, not a systematic bias.

Why do these numbers matter? Because if the mechanism cannot recover the correct ranking in a controlled setting where we know the answer, we have no reason to trust it on real data. Perfect rank recovery is the minimum bar — and the mechanism clears it.

The reward distribution follows the skill ranking: the least noisy forecaster (noise level 0.15) achieves a skill of 0.959 and earns the highest cumulative profit. The noisiest (noise level 1.00) gets a skill of 0.820 and earns the least. The mechanism rewards genuine forecasting value.

---

## [SLIDE 10] Mechanism Guarantees (~1 min)

Before interpreting any forecasting result, the mechanism must satisfy its formal guarantees.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is approximately 10⁻¹³ — that is machine precision. The mechanism is self-financed to numerical tolerance, meaning it neither creates nor destroys value.

Mean profit across all participants is effectively zero. The mechanism purely redistributes stakes — it does not subsidise or tax.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The sybil ratio is 1.000000 — identity splitting with identical reports provides no advantage, confirming the theoretical sybilproofness property from Lambert et al.

These are not approximate claims. The mechanism satisfies formal guarantees to machine precision.

---

## [SLIDE 11] Deposit Design (~1 min)

Why does deposit design matter? Because the deposit determines how much information enters the market. If deposits are uninformative — random or fixed — the mechanism has less signal to work with.

The experiments reveal a practical finding: the bankroll-confidence deposit rule — which scales the deposit by both wealth and forecast confidence — captures most of the available gain compared to an oracle that knows the true precision of each forecaster. The gap between bankroll-confidence and oracle is much smaller than the gap between random deposits and fixed deposits.

In practice, we cannot force forecasters to use any particular deposit rule. The mechanism must work regardless. But providing a sensible default — stake proportional to wealth and confidence — helps the market extract more value from each round.

---

## [SLIDE 12] Real Data: Elia Wind + Electricity (~2 min)

> ⚠️ This slide is at the 2-minute limit — present the numbers with context but avoid re-explaining the models.

This is the key validation. Everything before this was controlled simulation. Now we test on real data where ground truth is unknown.

On Elia wind power data — seventeen thousand five hundred and forty-four hourly observations from the Belgian grid operator, seven forecasters, tuned parameters — the mechanism achieves a 34% CRPS improvement over equal weights. That means the skill-weighted aggregate is substantially more accurate than simply averaging all seven forecasters with equal influence.

The mechanism correctly identifies Naive persistence as the strongest forecaster, with the highest learned skill at 0.82. This makes sense: wind power is highly autocorrelated, so the most recent observation is a strong predictor. The MLP and the Ensemble are close behind. ARIMA is weakest because linear models are less suited to the nonlinear, non-stationary structure of wind power.

On the Elia electricity dataset, the improvement is smaller — around 4% over equal weights. The forecasters are more similar in quality on that task, so there is less heterogeneity for the skill signal to exploit. This confirms that gains are conditional on forecaster diversity: when everyone is roughly equally good, equal weights are hard to beat.

An important caveat: the best single forecaster — Naive — still outperforms the aggregate on wind, at −47% versus equal weights. The mechanism improves the aggregate substantially, but has not yet surpassed the best individual. This is a direction for future improvement, not a failure — it tells us where the ceiling is.

---

## [SLIDE 13] Strategic Robustness (~1 min)

The mechanism must resist manipulation. Three main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly — the sybil ratio is 1.000000. However, sybil splitting with diversified reports — where clones submit different forecasts — yields a ratio of approximately 1.065. Sybilproofness holds under the standard assumption that clones report identically, following Lambert et al.

Arbitrage: Chen et al. showed that weighted-score wagering mechanisms admit an arbitrage interval in a single round. In the repeated setting with the skill gate and wealth dynamics, the arbitrageur agent extracted zero sustained profit.

We also tested eighteen behaviour presets across nine families — including reputation gaming, collusion, and risk-averse hedging. The mechanism detects reputation gaming within approximately twenty rounds and limits the damage from all tested strategies.

The overall picture: the mechanism resists the standard attacks. Sophisticated adaptive adversaries remain an open direction for future work.

---

# Script Part IV — CLOSING (Slide 14, ~1.5 min)

---

## [SLIDE 14] Conclusion + Future Work (~1.5 min)

To summarise. This thesis develops a self-financed prediction market that couples weighted-score settlement with online skill learning. The skill signal is absolute, pre-round, and handles intermittent participation.

The results, in context. On Elia wind power with seven forecasters: the mechanism achieves a 34% CRPS improvement over equal weights. On Elia electricity: approximately 4%. The best single forecaster — Naive persistence — still outperforms the aggregate on wind at −47% versus equal weights. The improvement is conditional on forecaster heterogeneity.

The mechanism satisfies formal guarantees to machine precision: budget balance to 10⁻¹³, sybil invariance with identical reports, and perfect skill rank recovery with Spearman ρ = 1.0.

The main limitations are clear directions for improvement. Tail calibration shows under-dispersion of about five percentage points — the aggregate is well-calibrated centrally but weakens in the tails. Equal weights remain competitive when forecasters are similar in quality. Truthfulness holds under risk neutrality, following Lambert et al.

Future work: compare the implementation against Raja et al. to understand what the skill layer adds beyond their client-reward structure. Investigate tail calibration through richer distributional combination methods. Test against more sophisticated adaptive adversaries.

This thesis asked whether aggregate forecasts improve when influence depends on learned skill. The answer is conditionally yes — the gains are real on real energy data with real forecasting models, and the mechanism satisfies its formal guarantees to machine precision.

Thank you. I am happy to take questions.
