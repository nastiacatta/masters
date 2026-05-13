## [SLIDE 1] Title

### Slide bullets

* Forecasting from distributed information
* Different sources have different skill
* How should a market learn that?

### Script

Good morning. My name is Anastasia Cattaneo.

This thesis studies how to combine predictions from different sources when useful information is distributed across many actors.

That setting is common in energy, logistics, and operations. Different firms, models, or analysts each see part of the signal. They do not all see the same information, and they are not equally reliable. Some sources are consistently stronger than others, and that difference in skill matters for the final forecast.

So the broad question behind this thesis is simple: when predictive information is distributed, how should we combine it, and how should we decide whose forecast deserves more influence?

---

## [SLIDE 2] What is a prediction market?

### Slide bullets

* A client needs a forecast of something uncertain — say, tomorrow's wind power output
* The client posts the task on a platform and attaches a reward
* Forecasters each submit a forecast and back it with a wager
* The platform aggregates the forecasts into a single market forecast
* Once the outcome is observed, the platform redistributes the wagers by accuracy
* The platform crowdsources information without asking anyone to share their raw data

### Script

Let me tell this as a story. Suppose a client — a grid operator, say — needs a forecast of tomorrow's wind power output. They don't want to build every possible model themselves. So they post the task on a platform and attach a reward.

Forecasters come in. Each one submits a probabilistic forecast and backs it with a wager — a small financial stake that they are willing to lose if they are wrong. The platform collects all of the forecasts, aggregates them into a single market forecast, and publishes it.

When the outcome is observed, the platform redistributes the wagers. Forecasters who were closer to the truth are paid out of the pool contributed by those who were further from it.

There are three roles — the client who needs the forecast, the forecasters who contribute them, and the platform that runs the market. I will keep referring back to these throughout the talk.

The reason this architecture is useful: different firms, models, or analysts each see part of the signal, and their raw data is often commercially sensitive. It is easier to share a forecast than to share the full pipeline behind it.

---

## [SLIDE 3] Why combine forecasts?

### Slide bullets

* Different forecasters contribute different information
* A weighted combination is usually narrower and better-centred than any single one
* A market adds incentives and a combination rule
* Equal weighting ignores what we know about contribution quality
* How should the market learn how much weight each contribution should receive?

### Script

So why combine forecasts at all? The picture on the right gives the intuition. Each forecaster submits a full probability distribution — not a single number. A grey, purple and red curve, say. They have different means and different spreads because the forecasters see different information and make different errors.

A weighted combination — the teal curve — ends up narrower and better centred than any of the individual ones. That is the familiar wisdom of forecast combination. As long as errors are not perfectly correlated, combining helps on average.

A market takes this a step further by adding incentives and a combination rule. Participants are willing to show up, willing to reveal their forecast, and willing to back it with a wager.

But that raises a question that equal weighting does not answer: how much weight should each forecaster receive? If one of them is consistently more accurate than the others, equal weighting throws that information away. So the design question becomes: can a market learn who is reliably accurate, use that information to weight their forecasts, and do it all while staying budget-balanced and sybilproof?

---

## [SLIDE 4] Where this work sits

### Slide bullets

* Lambert et al.: self-financed wagering — seven properties, uniqueness
* Raja et al.: prediction market with a client and payoff allocation
* Vitali & Pinson: online learning, intermittent participation, relative weights
* Gap: adaptive + self-financed + absolute skill

### Script

There are three pieces of theory behind this work, and one gap between them.

Lambert and co-authors introduced the weighted-score wagering mechanism. Participants submit a forecast and a wager, the pool is redistributed by relative performance, and the mechanism satisfies seven formal properties including budget balance, truthfulness, and sybilproofness. They also proved uniqueness — weighted-score wagering is the only mechanism satisfying these properties.

Raja and co-authors extended this into an explicit prediction market with a client who posts a task and offers a reward. But each market instance is still history-free — there is no memory across rounds.

Vitali and Pinson move closer to the repeated setting. They use online gradient descent to learn combination weights and handle missing submissions. But their weights are relative — on a simplex. If one person's weight rises, everyone else's mechanically falls.

The gap is in the top-right corner of the matrix: adaptive *and* self-financed. One literature has the market structure without memory. The other has the memory without the market structure. This thesis puts them together.

---

## [SLIDE 5] My contribution

### Slide bullets

* A prediction market that is both self-financed and adaptive
* Effective wager = deposit × learned skill
* Skill is absolute, pre-round, handles intermittency
* The same object controls influence and financial exposure

### Script

The contribution is a prediction market that is both self-financed and adaptive. The idea is simple enough to fit on a single line: let the wager carry the learned skill.

Concretely, each participant still chooses a deposit, but the deposit alone does not determine influence. The mechanism estimates the participant's skill from past performance, then uses that estimate to decide how much of the deposit should count. The effective wager equals the deposit multiplied by a skill-dependent factor. If your skill is high, nearly all your deposit enters the market. If it is low, most is refunded.

Three properties matter. The skill signal is absolute — one forecaster's skill can improve without reducing anyone else's. It is pre-round — computed before the round begins, using only past information, which preserves the truthfulness argument from Lambert. And it handles intermittent participation through a staleness decay that prevents reputation freezing.

---

## [SLIDE 6] Mechanism: round by round

### Slide bullets

* Submit — forecaster sends forecast and deposit
* Effective wager — deposit is scaled by learned skill
* Aggregate — market forecast is a wager-weighted average
* Settle (reward sharing) — winners are paid from losers
* Skill update — σ moves with recent forecasting loss

### Script

One round at a time. Five steps.

Step one: each forecaster submits a forecast and a deposit. Step two: the deposit is scaled by learned skill, giving the effective wager m equal to b times g of sigma. Step three: the market forecast is a wager-weighted average of the individual forecasts. Step four — and this is where reward sharing happens — each forecaster's score is taken relative to the market mean, so forecasters who scored above the mean are paid out of the pool contributed by those who scored below it. Two things follow from that structure. The sum of payoffs equals the sum of wagers, so no outside money is needed. And the amount you can win or lose is proportional to how confident you were, through your deposit.

Step five updates the skill. Sigma moves with the forecaster's recent realised loss, through a simple exponential weighted moving average.

The curved arrow at the bottom is the round-to-round loop: the updated sigma from step 5 enters the effective wager in step 2 of the next round. So the market's memory of who forecasts well is carried entirely through the skill signal, without touching the settlement algebra. The same effective wager controls both how much weight you get in the aggregate and how much money is at risk.

---

## [SLIDE 7] The skill signal

### Slide bullets

* σ_i is how well forecaster i has been performing recently, on a 0-to-1 scale
* "Adaptive skill" means σ_i is re-estimated every round from realised loss
* Absolute, not relative — one forecaster improving does not push others down
* Implementation: EWMA of loss, mapped to [σ_min, 1] — the curve on the right

### Script

A quick definition first, because skill is a word I am going to use a lot. Sigma is my notation for how well forecaster i has been performing recently, on a zero-to-one scale. Higher means better recent accuracy. When I say "adaptive skill", I mean that sigma is re-estimated every round from the forecaster's realised loss — not fixed ahead of time, and not set by the forecaster's own report.

The key property is that this signal is absolute, not relative. In a simplex-based approach, one forecaster's weight going up pushes someone else's down by construction. Here the forecasters each have their own sigma, so learning that one of them is better does not mechanically demote the others.

Implementation-wise: the mechanism maintains an exponentially weighted moving average of realised forecasting loss for each forecaster, and maps that loss to a bounded skill score through the curve on the right. Lower loss gives higher sigma. The bound [σ_min, 1] keeps everyone in the market — no one is ever fully excluded — and a staleness decay pulls absent forecasters back toward baseline so reputations do not freeze.

---

## [SLIDE 8] Models, data, and synthetic setup

### Slide bullets

* Environment: synthetic DGPs + real Elia wind and electricity
* Agents: 7 forecasters — Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble
* Behaviour: honest, noisy, strategic, adversarial presets
* All models are strictly causal (use data only up to time t−1)

### Script

The test setup has three layers. The environment is the data — both synthetic benchmarks where I control the ground truth, and real data from the Elia Belgian grid operator for offshore wind power and electricity imbalance prices.

The agent layer is the forecasters. Seven forecasting models participate on the real data. Naive persistence takes the most recent observed value as the forecast — it works well when the series is highly autocorrelated, which wind power is, and that is why Naive is competitive with the more complex models on wind. EWMA smooths recent observations with exponential decay. ARIMA is a classical linear time-series model. XGBoost is a gradient-boosted tree ensemble that captures nonlinear interactions from lag features. The MLP is a multi-layer perceptron — the most flexible model in the panel. Theta decomposes the series into trend components. And the ensemble simply averages Naive and EWMA.

All models are strictly causal — they use only data up to time t minus one. Each produces a point forecast, and the mechanism turns it into a full probabilistic forecast by resampling from the model's recent prediction errors.

The behaviour layer is separated from the core, so I can run the same mechanism against honest forecasters, noisy ones, or adversarial ones — sybils, arbitrageurs — without touching the settlement logic.

---

## [SLIDE 9] Synthetic validation — convergence

### Slide bullets

* Six forecasters with known noise levels, 20 000 rounds
* Learned ranking matches true ranking perfectly: Spearman ρ = 1.0
* Rewards flow to lower-noise forecasters
* Baseline sanity check before touching real data

### Script

Before going to real data, I need to know the skill layer actually recovers the right ordering when I know the ground truth. That is what the synthetic case gives me. Six forecasters of known, fixed noise levels, twenty thousand rounds.

The figure shows the learned sigma for each forecaster converging over time. The ordering matches the true noise ordering perfectly — Spearman rho of one point zero. And the reward distribution is consistent with that ordering: lower-noise forecasters earn more across the long run.

This is a baseline sanity check, not the main result. It tells me the machinery works when I can verify it against ground truth. The real question is what happens on real data, where I do not know who is actually best.

---

## [SLIDE 10] Real data — Elia wind and electricity

### Slide bullets

* Elia wind, 17 544 rounds: mechanism −7.0% CRPS vs equal weights
* Skill ranks forecasters by realised loss — XGBoost first, ARIMA ≈ Naive next
* Elia electricity: near-tie with equal weights — forecasters similar in quality
* Best-single selector still beats the mechanism on wind — combination puzzle

### Script

A quick reminder of two pieces of notation before the numbers. **CRPS** is the continuous ranked probability score — a proper scoring rule for probabilistic forecasts, where lower is better, and where a model that gets both the central estimate and the spread right scores lowest. **Sigma** is the learned skill I defined two slides ago.

On the Elia wind dataset — seventeen thousand five hundred and forty-four hourly evaluation rounds, seven forecasters — the mechanism achieves a seven per cent reduction in mean CRPS compared to equal weighting, under a strictly-causal pipeline. The curves on the right show the learned sigma for each forecaster over time. You can highlight any single forecaster by clicking its pill.

The ordering the mechanism recovers is: **XGBoost** on top with steady-state sigma around zero point eight one, then **ARIMA** and **Naive** effectively tied just below, then the MLP, the Ensemble, EWMA, and Theta. That matches per-agent CRPS on the same data — XGBoost has the lowest per-agent CRPS, and Naive stays competitive because wind power at an hour-ahead horizon is very autocorrelated. The point is that the skill layer learns this ordering from realised loss directly, without being told anything about autocorrelation.

I want to flag two honest caveats. First, an earlier version of this deck reported forty-four per cent improvement. That figure came from a normalisation that leaked evaluation-window statistics into training. After auditing the pipeline, the right number is seven per cent. Second, a rolling best-single selector — which each round picks whichever forecaster has the lowest recent CRPS — still beats the mechanism by around sixteen percentage points on wind. That is the forecast combination puzzle surfacing honestly. The thesis contribution is conditional improvement over equal weighting while preserving self-financing, not universal CRPS dominance.

On Elia electricity, the mechanism is essentially tied with equal weights. The forecasters are more similar in quality on that dataset, so there is less heterogeneity for the skill layer to exploit. This is the pattern you would expect: the gain scales with how different the forecasters actually are.

---

---

## [SLIDE 11] Benchmark — CRPS comparison vs prior work

### Slide bullets

* Raja et al., Vitali & Pinson, and this project, on the same pipeline
* Vitali & Pinson: lowest CRPS — but relative weights, not self-financed
* Raja et al.: self-financed, but no memory across rounds
* This project: adaptive *and* self-financed

### Script

The mechanism reduces CRPS relative to equal weighting on wind, but how does it compare to the prior mechanisms from slide 4? I ran all three on the same pipeline.

Vitali and Pinson reach the lowest CRPS in the benchmark — around twenty-one per cent better than equal weights on wind. That is not surprising: their weights are unconstrained on a simplex, and they explicitly optimise a loss. What they give up is self-financing — payoffs are not guaranteed to be covered by wagers.

Raja et al. is close to equal weighting. The mechanism is self-financed but has no memory across rounds, so it cannot reward consistent skill.

This project sits in between: seven per cent on wind, self-financed, adaptive. The point of the comparison is not to claim dominance. It is to show that the self-financing constraint costs CRPS, and the cost is bounded and measurable — about eleven percentage points on this benchmark.

---

## [SLIDE 12] Strategic robustness

### Slide bullets

* Sybil (identical reports): no advantage
* Sybil (diversified reports): small advantage, ~6%
* Arbitrage: no sustained profit
* Strategic deposit gaming: no advantage
* Mechanism resists the standard attacks

### Script

Correctness in expectation is not enough. The mechanism also has to resist the standard attacks.

Identical-report sybils — splitting one identity into clones with the same total deposit and the same forecast — give no advantage. The ratio of total profit to the original forecaster's profit is exactly one. That is the strongest sybil case and it is the one Lambert's uniqueness theorem covers.

Diversified-report sybils — clones that submit slightly different forecasts — give a small advantage, around six per cent. That is a known weakness of wagering mechanisms and the amber mark on the slide is deliberately honest about it.

Arbitrage and strategic deposit gaming produce no sustained profit in the behaviour tests I ran — eighteen presets across nine families of strategy. The shield on the slide summarises the overall result: the mechanism resists the standard attacks. Where it does not, I say so.

---

## [SLIDE 13] Conclusion and future work

### Slide bullets

* Adaptation, self-financing, and an absolute skill signal can coexist
* Wind: −7.0% CRPS vs equal weights; electricity: essentially tied
* Best single can still win — the combination puzzle is real
* Future: close the gap to Vitali & Pinson without losing self-financing; tail calibration; richer adversaries

### Script

To wrap up. The contribution of this thesis is to show that adaptation, self-financing, and an absolute skill signal can coexist in a single mechanism. That was not obvious going in — the two literatures had been pulling apart.

On real energy data, the mechanism reduces mean CRPS by seven per cent over equal weights on wind and is essentially tied on electricity. The effect scales with how different the forecasters are. The skill signal recovers the true ordering perfectly on synthetic data and recovers a reasonable ordering on real data. The mechanism is correct to machine precision and resists the standard attacks.

Three honest caveats. First, the best single forecaster can still outperform the aggregate on wind — the combination puzzle is real and I do not solve it here. Second, tail calibration shows systematic under-dispersion of about five percentage points; the post-hoc isotonic layer closes about forty per cent of that gap at a small CRPS cost. Third, truthfulness holds under risk neutrality, following Lambert, and richer adaptive adversaries are an open question.

Three directions for future work. Closing the CRPS gap to Vitali and Pinson without giving up self-financing is the most interesting — it is the direction that would turn "conditional improvement" into something stronger. Improving tail calibration is a concrete second step. Testing against a wider range of strategic adversaries is the third.

Thank you. I am happy to take questions.
