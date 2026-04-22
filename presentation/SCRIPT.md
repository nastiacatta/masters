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
| 10 | Real Data: Elia Wind + Electricity | VALIDATION | ~2 min ⚠️ |
| 11 | Benchmark: CRPS Comparison | VALIDATION | ~1 min |
| 12 | Strategic Robustness | VALIDATION | ~1 min |
| 13 | Conclusion + Future Work | CLOSING | ~1.5 min |

**Total: ~19 min**

> ⚠️ Slides 6 and 10 are flagged at 2 minutes — keep narration tight and avoid tangents.
> Slide 11 is the "why we improve" figure with compact takeaway cards below.

---

# Script Part I — PROBLEM (Slides 1–5, ~6.5 min)

---

## [SLIDE 1] Title + Anecdote (~1 min)

Good morning. My name is Anastasia Cattaneo. Before I begin, I would like to thank my supervisors, Pierre Pinson and Michael Vitali, for their guidance throughout this project.

Recently, on the way to the airport, I checked Google Maps, Apple Maps, and Citymapper to estimate my travel time. They were all forecasting the same journey, but they did not give the same answer. And from experience, I knew I trusted Citymapper a little more.

That small decision captures the central question in this project: when several forecasts target the same future outcome, how should we combine them, and how should we decide which contributions should matter more?

---

## [SLIDE 2] What Is a Prediction Market? (~1.5 min)

Before going further, let me define the central concept.

A prediction market is a market in which participants trade on uncertain future outcomes. In general, the payoff of the contract depends on what happens in the future. That is the broad definition.

In this project, I study a more specific form of prediction market. Participants submit forecasts for a continuous outcome, and they also submit a **wager**, meaning the amount placed at risk in that round. The market then combines these submitted forecasts into a single aggregate forecast. Once the outcome is observed, the market settles and allocates rewards according to forecast performance.

So the structure I work with has four elements: submitted forecasts, submitted wagers, an aggregation rule, and a settlement rule.

This is useful when predictive information is distributed across different actors while the underlying data remain private or costly to share. In that setting, the market can use forecasts directly, without requiring anyone to reveal raw data. That motivation is common to the prediction-market literature this project builds on.

> *Footer cite: Wolfers and Zitzewitz (2004) — definition and broad framing; Raja et al. (2024) — market architecture.*

---

## [SLIDE 3] Why Combine Forecasts? (~1.5 min)

The next question is why we combine forecasts at all, rather than simply select a single forecaster and ignore the others.

The reason is that different forecasters capture different parts of the signal and make different errors. One source may respond faster to recent changes. Another may perform well on stable patterns. Another may contribute information that the others do not contain. Combining forecasts is therefore often better than relying on a single source.

In a market setting, however, averaging alone is not enough. The issue is not only statistical. It is also economic. The market has to decide how much weight each contribution should receive, and that decision should reflect more than the current wager alone. Equal weighting does not use the information available about contribution quality.

This is where the central problem appears: how should a prediction market learn the value of each contribution over time, and use that information when forming the aggregate forecast — while preserving a disciplined reward mechanism?

> *Footer cite: Prediction markets as information aggregation mechanisms — Wolfers and Zitzewitz (2004).*

---

## [SLIDE 4] Where This Work Fits (~1.5 min)

This project builds on three strands of work.

The first strand develops self-financed wager-based settlement. Participants submit a forecast and a wager, and the wager pool is redistributed after the outcome is observed. That strand gives the settlement logic and the economic discipline of the mechanism.

The second strand develops a full prediction-market architecture for forecast improvement, with a client, an aggregation operator, a scoring rule, and a payoff-allocation rule. That strand makes the structure of the market explicit, but each round is treated independently.

The third strand studies repeated prediction markets with intermittent participation and adaptive weighting. That strand introduces online adaptation over time, but the learned weights remain relative and context-dependent.

**Why combine these three.** Each strand addresses a different requirement of the same problem. A repeated prediction market needs memory across rounds, because the value of a contribution is not fully visible in one isolated interaction. A wager-based market needs a disciplined settlement rule, because influence in the aggregate forecast and financial exposure should remain connected. And a realistic repeated setting needs to handle intermittent participation, because contributors may not appear in every round. This project sits at the intersection of these three strands: repeated adaptation, explicit prediction-market structure, and self-financed settlement. That is the design objective.

The positioning matrix shows where each approach sits. Lambert et al. and Raja et al. give disciplined economic structure without adaptation. Vitali and Pinson give adaptation without self-financing. This project occupies the fourth corner — adaptive and self-financed, with an absolute per-forecaster skill signal.

> *Footer cite: Lambert et al. (2008); Raja et al. (2024); Vitali and Pinson (2025).*

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

Seven forecasting models participate in the market. Naive persistence uses the most recent observed value — it works well when the series is highly autocorrelated. EWMA smooths recent observations with exponential decay. ARIMA captures linear autoregressive and moving-average structure. XGBoost is a gradient-boosted tree ensemble for nonlinear interactions. The MLP is a multi-layer perceptron neural network. The Theta method decomposes the series into trend components. The Ensemble averages Naive and EWMA for diversification.

The real data comes from Elia, the Belgian grid operator. The wind dataset covers seventeen thousand five hundred and forty-four hourly observations of offshore wind power. The electricity dataset covers imbalance prices. Both use the same seven-forecaster panel with fixed random seeds, so the comparison is fully reproducible.

Why validate on synthetic data first? Because synthetic experiments use a known data-generating process where we control the true quality of each forecaster. This lets us verify that the mechanism learns the correct ranking before testing on real data where ground truth is unknown.

---

# Script Part III — VALIDATION (Slides 9–12, ~6 min)

---

## [SLIDE 9] Synthetic Validation: Convergence (~1.5 min)

The synthetic experiment answers a fundamental question: does the mechanism actually learn who is good?

Six forecasters with known noise levels, simulated over twenty thousand rounds across twenty seeds. The result: the learned skill scores correctly rank-order all forecasters. The Spearman rank correlation between true noise level and learned skill is ρ = 1.0 — perfect rank recovery. The mechanism never confuses a noisy forecaster for a skilled one, or vice versa.

The noise-skill correlation is r = −0.98, confirming that higher noise consistently maps to lower skill. The small gap from −1.0 reflects the stochastic nature of the simulation, not a systematic bias.

These numbers matter because if the mechanism cannot recover the correct ranking in a controlled setting where we know the answer, we have no reason to trust it on real data. Perfect rank recovery is the minimum bar — and the mechanism clears it.

The reward distribution follows the skill ranking: the least noisy forecaster achieves the highest skill and earns the highest cumulative profit. The noisiest gets the lowest skill and earns the least. The mechanism rewards genuine forecasting value.

---

## [SLIDE 10] Real Data: Elia Wind + Electricity (~2 min)

This is the first real-data validation. Everything before this was controlled simulation.

On Elia wind power — seventeen thousand five hundred and forty-four hourly observations, seven forecasters, tuned parameters — the mechanism achieves a **44 % CRPS reduction** over equal weights. The skill-weighted aggregate is substantially more accurate than simply averaging all seven forecasters with equal influence.

The skill trajectories on the right tell the story. The mechanism correctly identifies Naive persistence as the strongest forecaster — wind power is highly autocorrelated, so the most recent observation is a strong predictor. The Ensemble and EWMA follow. ARIMA, XGBoost, MLP, and Theta all land at roughly the same low skill — their quantile forecasts are over-spread relative to the realised distribution, so the CRPS penalises them similarly.

On the Elia electricity dataset, the improvement is smaller — **8 %** over equal weights. The forecasters are more similar in quality on that task, so there is less heterogeneity for the skill signal to exploit. This confirms a clear empirical pattern: gains are conditional on forecaster diversity. When everyone is roughly equally good, equal weights are hard to beat.

---

## [SLIDE 11] Benchmark Comparison: Prior Work and This Project (~1 min)

That 44 % improvement over equal weights is the headline number, but the key question is: how does this mechanism compare with the two closest prior designs on exactly the same data?

This figure evaluates all three methods on the same 7-forecaster panel, the same quantile reports, and the same 200-round warm-up, so the comparison is controlled.

Raja's history-free design shows modest gains — about 2 % improvement on both datasets. Without memory across rounds, the mechanism cannot systematically separate persistent forecasting value from noise, and confidence weighting alone is limited.

Vitali and Pinson's online gradient descent on the simplex achieves the lowest CRPS in this benchmark — 65 % on wind and 20 % on electricity. The trade-off is that the settlement is Shapley-based rather than Lambert self-financed wagering, and the learned weights are relative on a probability simplex: increasing one weight mechanically decreases the others.

This project's mechanism sits between them on CRPS — 44 % on wind and 8 % on electricity — while retaining Lambert's economic properties and reporting an absolute per-forecaster skill signal. The rolling CRPS panel shows that the relative ordering is stable over the full two-year series, rather than driven by a short segment.

The takeaway is the point of the project: adaptation, self-financing, and an absolute skill signal can coexist in a single mechanism, and the empirical cost of keeping all three can be quantified in this benchmark.

---

## [SLIDE 12] Strategic Robustness (~1 min)

The mechanism must resist manipulation. Three main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly — the sybil ratio is 1.000000. Diversified sybils — where clones submit different forecasts — yield a ratio of approximately 1.065. Sybilproofness holds under the standard Lambert assumption that clones report identically.

Arbitrage: Chen et al. showed that weighted-score wagering mechanisms admit an arbitrage interval in a single round. In the repeated setting with the skill gate and wealth dynamics, the arbitrageur agent extracted zero sustained profit.

We also tested eighteen behaviour presets across nine families — including reputation gaming, collusion, and risk-averse hedging. The mechanism detects reputation gaming within approximately twenty rounds.

The overall picture: the mechanism resists the standard attacks. Sophisticated adaptive adversaries remain an open direction for future work.

---

# Script Part IV — CLOSING (Slide 13, ~1.5 min)

---

## [SLIDE 13] Conclusion + Future Work (~1.5 min)

To summarise. This project develops a self-financed prediction market that couples weighted-score settlement with online skill learning. The skill signal is absolute, pre-round, and handles intermittent participation.

As the previous slide showed, the mechanism jointly provides adaptation across rounds, self-financing, and an absolute skill signal. In this benchmark, Raja lacks adaptation and Vitali is not self-financed; this project's mechanism sits between them on CRPS while retaining Lambert's property set.

The mechanism also satisfies its formal guarantees to machine precision: budget balance and mean profit are zero to numerical tolerance, sybil invariance holds exactly for identical reports, and synthetic validation recovers the true skill ranking with Spearman ρ = 1.0.

Future work has a clear priority: close the CRPS gap to Vitali **without** giving up self-financing. That likely means richer score functions or richer aggregation primitives, not abandoning the Lambert framework. Beyond that: improve tail calibration, which is currently under-dispersed by about five percentage points, and test against adaptive strategic adversaries rather than only fixed behaviour presets.

This project asked whether a prediction market can learn how much each contribution should matter, while keeping a disciplined reward mechanism. The answer is yes — the gains are real on real energy data, the mechanism satisfies its formal guarantees, and it occupies a position in the design space that no prior work has reached.

Thank you. I am happy to take questions.

---

# Demo (live dashboard) — ~1–2 min

If we have a moment after questions — or you prefer to see it now — I will switch out of presentation mode to the **interactive dashboard** in the same browser app.

**What it is.** The dashboard reads the same JSON outputs the slides are built from: Elia wind and electricity comparisons, the Raja / Vitali / project baseline benchmark, diagnostics for budget balance and sybil checks, and the behaviour-lab presets behind the robustness slide.

**Suggested live path (you can ask me to jump anywhere).**

1. **Home** — short orientation: what the mechanism does and where to click next.
2. **Results** — pick Elia wind or electricity; scroll mean CRPS by method, optional skill trajectories, and any figure you want zoomed.
3. **Diagnostics / robustness** — the numerical checks that match the “mechanism guarantees” slide (machine-precision budget gap, sybil invariance for identical clones, and related plots).
4. **Behaviour** (optional, if time) — the preset families and comparison table that support the strategic-robustness narrative.

**How to use it with me.** Ask for a specific dataset, method, or figure name from the slides; I will navigate there and read the headline number off the chart so we stay aligned with what you already saw.

---

# [APPENDIX] — Backup Material for Q&A

> These notes are not part of the main presentation. Use only if the corresponding question arises during Q&A.

---

## Q1: "Why not just use Vitali & Pinson's approach?"

Key points:
- Vitali achieves −65 % CRPS on wind — the best in this benchmark.
- Trade-off: Shapley settlement (not self-financed), relative weights on a simplex.
- This project's mechanism preserves Lambert's seven formal properties, including budget balance and sybilproofness.
- The cost is ~21 pp in CRPS — quantified, not hand-waved.

## Q2: "Why does Naive still beat the aggregate?"

Key points:
- Wind power is highly autocorrelated → Naive persistence is exceptionally strong.
- The mechanism improves the aggregate by −44 % vs equal weights, but the ceiling is the best individual.
- Known limitation of linear opinion pools. Future work: nonlinear combination methods.

## Q3: "How sensitive are the results to hyperparameters?"

Key points:
- Parameter sweep shows robustness across a wide range.
- γ (skill learning rate) has the strongest effect.
- Tuned values: γ = 16, ρ = 0.5, λ = 0.05 — selected via grid search on a validation split.
- Refer to the parameter sweep figure in the appendix slides.

## Q4: "What happens with fewer forecasters?"

Key points:
- Mechanism needs heterogeneity. With N < 4, not enough diversity.
- Sweet spot: N ≥ 6 with genuinely different model families.

## Q5: "Is truthfulness guaranteed?"

Key points:
- Truthfulness holds under risk neutrality (Lambert et al.'s original assumption).
- Under risk aversion, forecasters may shade reports.
- Shared limitation with all Lambert-family mechanisms.

## Q6: "How does the mechanism handle regime changes?"

Key points:
- EWMA naturally adapts — recent performance weighted more heavily.
- Staleness decay: absent forecasters revert toward baseline.
- Seasonal analysis on Elia wind shows improvement in all four seasons.

## Q7: "What is the computational cost?"

Key points:
- Each round is O(N). EWMA update, skill gate, Lambert settlement — all linear.
- Full 17,544-round Elia experiment runs in under 30 seconds on a laptop.

## Q8: "What about the mechanism guarantees?"

Key points:
- Budget balance: maximum gap between total payouts and total wagers is ~10⁻¹³ (machine precision). Self-financed to numerical tolerance.
- Mean profit across all participants is effectively zero — pure redistribution.
- Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly (sybil ratio = 1.000000).
- Noise-skill correlation r = −0.98 — skilled forecasters are reliably rewarded.
- These are not approximate claims — formal guarantees hold to machine precision.
- Full guarantees table is in Appendix tab C.
