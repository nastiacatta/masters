# Slide Map

| Slide | Title | Section | Time |
|-------|-------|---------|------|
| 1 | Title + Anecdote | PROBLEM | ~1 min |
| 2 | What Is a Prediction Market? | PROBLEM | ~1.5 min |
| 3 | Why Combine Forecasts? | PROBLEM | ~1.5 min |
| 4 | Where This Work Fits | PROBLEM | ~1.5 min |
| 5 | Mechanism Comparison | PROBLEM | ~1 min |
| 6 | My Contribution | PROBLEM | ~1 min |
| 7 | Mechanism: Round-by-Round | SOLUTION | ~2 min ⚠️ |
| 8 | The Skill Signal | SOLUTION | ~1.5 min |
| 9 | Models, Data, and Synthetic Setup | SOLUTION | ~1.5 min |
| 10 | Synthetic Validation: Convergence | VALIDATION | ~1.5 min |
| 11 | Mechanism Guarantees | VALIDATION | ~1 min |
| 12 | Deposit Design | VALIDATION | ~1 min |
| 13 | Real Data: Elia Wind + Electricity | VALIDATION | ~2 min ⚠️ |
| 14 | Benchmark Comparison: Prior Work and This Thesis | VALIDATION | ~1.5 min |
| 15 | Strategic Robustness | VALIDATION | ~1 min |
| 16 | Conclusion + Future Work | CLOSING | ~1.5 min |

**Total: ~22 min**

> ⚠️ Slides 7 and 13 are flagged at 2 minutes — keep narration tight and avoid tangents.
> Slide 14 is the "why we improve" figure — land the three trade-offs (Raja / Vitali / Thesis) and move on.

---

# Script Part I — PROBLEM (Slides 1–6, ~7.5 min)

---

## [SLIDE 1] Title + Anecdote (~1 min)

Recently, on the way to the airport, I checked Google Maps, Apple Maps, and Citymapper. They all predicted the same journey time, but they did not give the same answer. And from experience, I knew I trusted Citymapper a little more.

That small decision captures the core question behind this thesis: when multiple predictors disagree, how do we learn whose information should count more — and how do we do it in a way that stays robust when incentives are strategic and money is at stake?

Good morning. My name is Anastasia Cattaneo. Before I begin, I would like to thank my supervisors Pierre Pinson and Michael Vitali — their guidance, and their own published work on prediction markets, shaped every part of this thesis.

---

## [SLIDE 2] What Is a Prediction Market? (~1.5 min)

Before diving in, let me define the central concept.

A prediction market is a mechanism where participants submit probabilistic forecasts — not just a single number, but a full distribution expressing what they expect and how uncertain they are. Each participant backs their forecast with a wager: a financial stake that says "I am putting money behind this prediction." The market then aggregates these individual forecasts into a single collective prediction, weighting each contribution by how much was staked.

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

My work sits at the intersection of three literatures that have not been fully connected.

Lambert et al. introduced the weighted-score wagering mechanism. Participants submit a forecast and a wager, the pool is redistributed based on relative performance, and the mechanism satisfies seven formal properties — including budget balance, truthfulness, and sybilproofness. They also proved uniqueness: weighted-score wagering is the only mechanism satisfying all seven. Raja et al. extended this to include a client who posts a task and offers a reward for forecast improvement. But both mechanisms are history-free — each round is independent, with no memory of past performance.

On the other side, Vitali & Pinson designed a repeated market that handles missing submissions and learns time-varying weights through online gradient descent. Their weights are relative — they live on a probability simplex. If one person's weight rises, everyone else's mechanically falls. And their settlement is not self-financed in the Lambert sense.

The positioning matrix shows where each approach sits. Lambert and Raja give strong economic structure without adaptation. Vitali gives adaptation without self-financing. My thesis occupies the fourth corner — adaptive and self-financed, with an absolute skill signal.

---

## [SLIDE 5] Mechanism Comparison (~1 min)

Before moving to my contribution, let me show exactly where the gap is.

This table compares three approaches across five dimensions. All three mechanisms are self-financed — participants fund the market through their own wagers. But Lambert et al. and Raja et al. both use static, per-round weights. There is no memory of past performance — each round starts fresh. My thesis introduces adaptive weight learning that carries information across rounds.

On skill learning: Lambert and Raja have none. The mechanism has no concept of forecaster quality beyond the current wager. My thesis adds an EWMA skill signal — an exponentially weighted moving average of realised forecasting loss that tracks each participant's value over time.

Deposit design is similar. Lambert and Raja do not specify how deposits should be chosen. My thesis introduces a skill gate that scales the effective wager by learned skill, plus a deposit policy framework that lets participants scale stakes by wealth and confidence.

Finally, key properties. Lambert et al. proved seven formal properties including uniqueness. Raja et al. added client reward allocation. My thesis preserves the seven properties and adds skill learning and deposit design on top.

The positioning matrix from the previous slide showed the gap. This table shows exactly what fills it.

---

## [SLIDE 6] My Contribution (~1 min)

Why is deposit alone not enough to determine influence? Because a wealthy but unskilled forecaster could dominate the market simply by staking large amounts, drowning out more accurate but less wealthy participants. The market needs a way to separate willingness to pay from demonstrated ability.

My contribution is to extend self-financed wagering with an online skill-learning layer. The effective wager — the single object that determines both how much weight your forecast receives and how much money you have at risk — equals the deposit multiplied by a learned skill factor.

The skill signal is absolute: it represents the importance of one participant's contribution directly, not their share relative to others. It is computed before the round begins, using only past information, which preserves the truthfulness argument from Lambert et al. And it handles intermittent participation through a staleness decay that prevents absent forecasters from freezing their reputation.

---

# Script Part II — SOLUTION (Slides 7–9, ~5 min)

---

## [SLIDE 7] Mechanism: Round-by-Round (~2 min)

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

## [SLIDE 8] The Skill Signal (~1.5 min)

Why does the skill signal need to be bounded? Because the raw loss accumulator — an exponentially weighted moving average of realised forecasting loss — can in principle grow without bound. A string of bad predictions pushes the accumulated loss toward positive infinity; a string of good ones toward negative infinity. If we used the raw accumulator directly, a single bad streak could permanently exclude a forecaster, and a single good streak could give them unbounded influence.

The exponential mapping compresses this unbounded range into the interval [σ_min, 1]. Lower accumulated loss means higher skill, approaching one. Higher accumulated loss pushes skill toward σ_min — the minimum floor. This floor is always positive, which means every forecaster retains some market access. No one is permanently excluded, and no one can dominate entirely.

When a forecaster is absent, their loss state decays toward a neutral baseline at a separate staleness rate. You cannot build a high reputation and then disappear to preserve it. With no new evidence, skill gradually reverts to a prior.

The critical difference from Vitali & Pinson: their weights are relative — on a probability simplex. If one person's weight rises, everyone else's mechanically falls. My skill signal is absolute. One forecaster's skill can improve without reducing another's. This means the signal measures the value of each individual contribution, not a competitive share.

---

## [SLIDE 9] Models, Data, and Synthetic Setup (~1.5 min)

Before showing results, let me introduce the experimental setup.

Seven forecasting models participate in the market. Naive persistence uses the most recent observed value — it works well when the series is highly autocorrelated. EWMA smooths recent observations with exponential decay. ARIMA captures linear autoregressive and moving-average structure. XGBoost is a gradient-boosted tree ensemble for nonlinear interactions. The MLP is a multi-layer perceptron neural network. The Theta method decomposes the series into trend components. The Ensemble averages Naive and EWMA for diversification.

The real data comes from Elia, the Belgian grid operator. The wind dataset covers seventeen thousand five hundred and forty-four hourly observations of offshore wind power. The electricity dataset covers imbalance prices. Both use the same seven-forecaster panel with fixed random seeds, so the comparison is fully reproducible.

Why validate on synthetic data first? Because synthetic experiments use a known data-generating process where we control the true quality of each forecaster. This lets us verify that the mechanism learns the correct ranking before testing on real data where ground truth is unknown.

---

# Script Part III — VALIDATION (Slides 10–15, ~8 min)

---

## [SLIDE 10] Synthetic Validation: Convergence (~1.5 min)

The synthetic experiment answers a fundamental question: does the mechanism actually learn who is good?

Six forecasters with known noise levels, simulated over twenty thousand rounds across twenty seeds. The result: the learned skill scores correctly rank-order all forecasters. The Spearman rank correlation between true noise level and learned skill is ρ = 1.0 — perfect rank recovery. The mechanism never confuses a noisy forecaster for a skilled one, or vice versa.

The noise-skill correlation is r = −0.98, confirming that higher noise consistently maps to lower skill. The small gap from −1.0 reflects the stochastic nature of the simulation, not a systematic bias.

These numbers matter because if the mechanism cannot recover the correct ranking in a controlled setting where we know the answer, we have no reason to trust it on real data. Perfect rank recovery is the minimum bar — and the mechanism clears it.

The reward distribution follows the skill ranking: the least noisy forecaster achieves the highest skill and earns the highest cumulative profit. The noisiest gets the lowest skill and earns the least. The mechanism rewards genuine forecasting value.

---

## [SLIDE 11] Mechanism Guarantees (~1 min)

Before interpreting any forecasting result, the mechanism must satisfy its formal guarantees.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is approximately 10⁻¹³ — that is machine precision. The mechanism is self-financed to numerical tolerance.

Mean profit across all participants is effectively zero. The mechanism purely redistributes stakes — it does not subsidise or tax.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The sybil ratio is 1.000000 — identity splitting with identical reports provides no advantage, confirming the theoretical sybilproofness property from Lambert et al.

These are not approximate claims. The mechanism satisfies formal guarantees to machine precision.

---

## [SLIDE 12] Deposit Design (~1 min)

Why does deposit design matter? Because the deposit determines how much information enters the market. If deposits are uninformative — random or fixed — the mechanism has less signal to work with.

The experiments reveal a practical finding: the bankroll-confidence deposit rule — which scales the deposit by both wealth and forecast confidence — captures most of the available gain compared to an oracle that knows the true precision of each forecaster. The gap between bankroll-confidence and oracle is much smaller than the gap between random deposits and fixed deposits.

In practice, we cannot force forecasters to use any particular deposit rule. The mechanism must work regardless. But providing a sensible default — stake proportional to wealth and confidence — helps the market extract more value from each round.

---

## [SLIDE 13] Real Data: Elia Wind + Electricity (~2 min)

This is the first real-data validation. Everything before this was controlled simulation.

On Elia wind power — seventeen thousand five hundred and forty-four hourly observations, seven forecasters, tuned parameters — the mechanism achieves a **44 % CRPS reduction** over equal weights. The skill-weighted aggregate is substantially more accurate than simply averaging all seven forecasters with equal influence.

The skill trajectories on the right tell the story. The mechanism correctly identifies Naive persistence as the strongest forecaster — wind power is highly autocorrelated, so the most recent observation is a strong predictor. The Ensemble and EWMA follow. ARIMA, XGBoost, MLP, and Theta all land at roughly the same low skill — their quantile forecasts are over-spread relative to the realised distribution, so the CRPS penalises them similarly.

On the Elia electricity dataset, the improvement is smaller — **8 %** over equal weights. The forecasters are more similar in quality on that task, so there is less heterogeneity for the skill signal to exploit. This confirms a clear empirical pattern: gains are conditional on forecaster diversity. When everyone is roughly equally good, equal weights are hard to beat.

---

## [SLIDE 14] Benchmark Comparison: Prior Work and This Thesis (~1.5 min)

That 44 % improvement over equal weights is the headline number, but the key question is: how does this mechanism compare with the two closest prior designs on exactly the same data?

This figure evaluates all three methods on the same 7-forecaster panel, the same quantile reports, and the same 200-round warm-up, so the comparison is controlled.

Raja's history-free design shows modest gains — about 2 % improvement on both datasets. Without memory across rounds, the mechanism cannot systematically separate persistent forecasting value from noise, and confidence weighting alone is limited.

Vitali and Pinson's online gradient descent on the simplex achieves the lowest CRPS in this benchmark — 65 % on wind and 20 % on electricity. The trade-off is that the settlement is Shapley-based rather than Lambert self-financed wagering, and the learned weights are relative on a probability simplex: increasing one weight mechanically decreases the others.

The thesis mechanism sits between them on CRPS — 44 % on wind and 8 % on electricity — while retaining Lambert's economic properties and reporting an absolute per-forecaster skill signal. The rolling CRPS panel shows that the relative ordering is stable over the full two-year series, rather than driven by a short segment.

The takeaway is the point of the thesis: adaptation, self-financing, and an absolute skill signal can coexist in a single mechanism, and the empirical cost of keeping all three can be quantified in this benchmark.

---

## [SLIDE 15] Strategic Robustness (~1 min)

The mechanism must resist manipulation. Three main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly — the sybil ratio is 1.000000. Diversified sybils — where clones submit different forecasts — yield a ratio of approximately 1.065. Sybilproofness holds under the standard Lambert assumption that clones report identically.

Arbitrage: Chen et al. showed that weighted-score wagering mechanisms admit an arbitrage interval in a single round. In the repeated setting with the skill gate and wealth dynamics, the arbitrageur agent extracted zero sustained profit.

We also tested eighteen behaviour presets across nine families — including reputation gaming, collusion, and risk-averse hedging. The mechanism detects reputation gaming within approximately twenty rounds.

The overall picture: the mechanism resists the standard attacks. Sophisticated adaptive adversaries remain an open direction for future work.

---

# Script Part IV — CLOSING (Slide 16, ~1.5 min)

---

## [SLIDE 16] Conclusion + Future Work (~1.5 min)

To summarise. This thesis develops a self-financed prediction market that couples weighted-score settlement with online skill learning. The skill signal is absolute, pre-round, and handles intermittent participation.

As the previous slide showed, the thesis mechanism jointly provides adaptation across rounds, self-financing, and an absolute skill signal. In this benchmark, Raja lacks adaptation and Vitali is not self-financed; the thesis mechanism sits between them on CRPS while retaining Lambert's property set.

The mechanism also satisfies its formal guarantees to machine precision: budget balance and mean profit are zero to numerical tolerance, sybil invariance holds exactly for identical reports, and synthetic validation recovers the true skill ranking with Spearman ρ = 1.0.

Future work has a clear priority: close the CRPS gap to Vitali **without** giving up self-financing. That likely means richer score functions or richer aggregation primitives, not abandoning the Lambert framework. Beyond that: improve tail calibration, which is currently under-dispersed by about five percentage points, and test against adaptive strategic adversaries rather than only fixed behaviour presets.

This thesis asked whether a prediction market can learn how much each contribution should matter, while keeping a disciplined reward mechanism. The answer is yes — the gains are real on real energy data, the mechanism satisfies its formal guarantees, and it occupies a position in the design space that no prior work has reached.

Thank you. I am happy to take questions.
