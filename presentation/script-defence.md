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

## [SLIDE 2] Why this problem matters

### Slide bullets

* Decisions depend on good forecasts
* Information is dispersed across actors
* Raw data are often costly to share
* Forecasts can be shared more easily than data

### Script

Forecast quality matters because many decisions are made under uncertainty. In energy, that includes scheduling, balancing, bidding, and reserve planning. In logistics and operations, it includes inventory, staffing, and risk management.

The practical difficulty is that the relevant information is often fragmented. One participant may have a better model. Another may have better local data. A third may adapt faster when conditions change.

At the same time, raw data are often private, commercially sensitive, or simply expensive to share. So in practice, it is often easier to share a forecast than to share the full data and modelling pipeline behind it.

That shifts the design problem. We want a way to extract useful predictive information without requiring full data disclosure.

---

## [SLIDE 3] Why simple aggregation is not enough

### Slide bullets

* Combining forecasts often improves robustness
* Different forecasters make different errors
* Participants are strategic
* Forecasters are not equally skilled
* Skill changes over time

### Script

A natural response is forecast aggregation. That usually helps because different forecasters make different errors. Combining them can improve robustness and average accuracy.

But once forecasts come from strategic participants, aggregation alone is not enough. We need participants to take part. We need them to report honestly. And we need a sensible rule for deciding whose forecast should count more.

A repeated setting adds a further issue. Forecasters are not equally skilled, and their reliability can change over time. Some adapt quickly. Some become stale. Some perform well only under specific conditions.

That is the central issue in this thesis. A forecasting market should not treat all influence as fixed. It should learn who is reliable.

---

## [SLIDE 4] Thesis question

### Slide bullets

* Can the market learn reliability?
* Can it use reliability to improve the aggregate forecast?
* Can it preserve the core market discipline?

### Script

This leads to the specific thesis question.

Can a forecasting market learn which participants are reliably accurate, give those participants more influence over time, and improve the aggregate forecast?

And can it do that while preserving the core market discipline — budget balance, truthfulness, sybilproofness — that makes the mechanism credible?

---

## [SLIDE 5] Where this work sits

### Slide bullets

* Lambert: self-financed wagering — seven properties, uniqueness
* Raja: forecasting market with client and payoff allocation
* Vitali: online learning, intermittent participation, relative weights
* Gap: adaptive + self-financed + absolute skill

### Script

There are three main pieces of theory behind this work.

Lambert and co-authors introduced the weighted-score wagering mechanism. Participants submit a forecast and a wager, the pool is redistributed by relative performance, and the mechanism satisfies seven formal properties including budget balance, truthfulness, and sybilproofness. They also proved uniqueness — weighted-score wagering is the only mechanism satisfying these properties.

Raja and co-authors extended this into an explicit forecasting market with a client who posts a task and offers a reward. But each market instance is still history-free.

Vitali and Pinson move closer to the repeated setting. They use online gradient descent to learn combination weights and handle missing submissions. But their weights are relative — on a simplex. If one person's weight rises, everyone else's mechanically falls.

So the gap is clear. One literature gives strong market structure without adaptation. Another gives adaptation without the same self-financed design. My thesis combines the two.

---

## [SLIDE 6] My contribution

### Slide bullets

* Self-financed forecasting market with online skill learning
* Effective wager = deposit × skill gate
* Skill is absolute, pre-round, handles intermittency
* Same object controls influence and financial exposure

### Script

My contribution is a self-financed forecasting market with an online skill-learning layer.

Each participant still chooses a deposit, but deposit alone does not determine influence. The mechanism estimates the participant's reliability from past performance, then uses that estimate to decide how much of the deposit should count. The effective wager equals the deposit multiplied by a skill-dependent factor. If your skill is high, nearly all your deposit enters the market. If it is low, most is refunded.

The skill signal is absolute — it represents the reliability of one participant directly, not their share in a normalised weight vector. It is computed before the round begins, using only past information, which preserves the truthfulness argument from Lambert. And it handles intermittent participation through a staleness decay that prevents reputation freezing.

---

## [SLIDE 7] System and mechanism

### Slide bullets

* Environment: synthetic DGPs + real Elia wind and electricity
* Agents: 7 forecasters — Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble
* Behaviour: honest, noisy, strategic, adversarial presets
* Pipeline: submit → skill gate → aggregate → settle → update

### Script

The system has three layers. The environment defines the data — both synthetic benchmarks and real data from the Elia Belgian grid operator for offshore wind power and electricity imbalance prices.

The agent layer generates per-round actions. On the real data, seven forecasting models participate. Naive persistence uses the most recent observed value as the forecast — it works well when the series is highly autocorrelated, which wind power is. EWMA with span five smooths recent observations using exponential decay. ARIMA is a classical linear time-series model that captures autoregressive and moving-average structure. XGBoost is a gradient-boosted tree ensemble that captures nonlinear interactions from lag features. The MLP is a multi-layer perceptron neural network — the most flexible model in the panel. The Theta method decomposes the series into trend components. And the ensemble simply averages Naive and EWMA for diversification.

All models are strictly causal — they use only data up to time t minus one to predict time t. Each model produces a point forecast, and the mechanism converts it into a full probabilistic forecast by resampling from the model's recent prediction errors to build a distribution of plausible outcomes.

The behaviour layer is separated from the core. It can produce honest forecasters or adversarial ones — sybils, arbitrageurs, reputation gamers — without touching the settlement logic.

The core pipeline runs each round in five steps: submit, skill gate, aggregate, settle, update. The same effective wager determines both aggregation weight and financial exposure. Budget balance holds by construction.

---

## [SLIDE 8] Why the skill layer matters

### Slide bullets

* EWMA of realised forecasting loss
* Recent performance weighted more heavily
* Absent forecasters decay toward baseline
* Bounded skill in [σ_min, 1]
* Absolute, not relative

### Script

The skill layer is the main innovation.

For each forecaster, the mechanism maintains an exponentially weighted moving average of realised forecasting loss. The learning rate controls how quickly old performance is forgotten. When a forecaster is absent, their loss state decays toward a neutral baseline at a separate staleness rate.

The loss state maps to a bounded skill score through an exponential function. Lower accumulated loss means higher skill, approaching one. Higher loss pushes skill toward the minimum floor, which is always positive — every forecaster retains some market access.

The critical difference from relative-weight approaches: my skill signal is absolute. One forecaster's skill can improve without reducing another's. And it feeds into the effective wager, which controls both settlement payoffs and aggregation weights — keeping the Lambert settlement algebra intact.

---

## [SLIDE 9] Main empirical result

### Slide bullets

* Elia wind: ~7.0% CRPS reduction vs equal weights (post-audit, strictly-causal)
* Elia electricity: tied with equal weights (forecasters similar)
* Mechanism correctly ranks forecasters by skill
* Per-round oracle-of-best still beats the mechanism on wind (~16%)
* Gains depend on forecaster heterogeneity

### Script

On the Elia wind dataset — seventeen thousand three hundred and forty-four evaluation rounds (after a two-hundred-round warmup), seven forecasters, γ = 16, ρ = 0.5 — the mechanism achieves a seven per cent reduction in mean CRPS compared to equal weighting, under strictly-causal normalisation. The test statistic is Diebold–Mariano t = 40.77, p below zero-point-zero-zero-one.

The graph shows the learned skill for each forecaster over time. The skill layer recovers the per-forecaster CRPS ordering correctly — this is the headline skill-recovery result. But on this dataset the gap between the top and bottom forecasters in real CRPS is modest, so the mechanism's reweighting produces only a modest gain in the aggregate.

An earlier version of this deck reported forty-four per cent. That figure was produced under a whole-series min/max normalisation that leaked evaluation-window extremes into every training round. After the training-pipeline audit, all reported CRPS numbers use only warmup-window statistics for normalisation, and the mechanism's advantage shrinks correspondingly. The post-audit numbers are the right ones to defend.

On the Elia electricity dataset, the mechanism is essentially tied with equal weights — the improvement is under one per cent. The forecasters are more similar in quality on that task, so there is less heterogeneity for the skill layer to exploit.

Importantly, a rolling one-hundred-step best-single selector — which each round picks the forecaster with the lowest recent CRPS — beats the mechanism by roughly sixteen percentage points on wind. This is the forecast-combination puzzle surfacing honestly. The thesis contribution is not universal CRPS dominance; it is conditional improvement over equal weights while preserving the Lambert properties of budget balance, self-financing, and sybil-invariance under identical reports.

---

## [SLIDE 10] Mechanism guarantees and credibility

### Slide bullets

* Budget balance: gap < 10⁻¹³
* Sybil ratio = 1.000000 for identical reports
* Skill recovery: Spearman ρ = 1.0000
* Noise-skill correlation: r = −0.98

### Script

Before interpreting the forecasting result, the mechanism must be correct.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is about ten to the minus thirteen — machine precision. The mechanism is self-financed to numerical tolerance.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero. However, sybil splitting with diversified reports — where clones submit slightly different forecasts — does yield a ratio of about one point zero six five. Sybilproofness holds only when clones report identically, which is the standard assumption in Lambert's framework.

Skill recovery: in the controlled benchmark with six forecasters of known noise levels over twenty thousand rounds, the learned ranking matches the true ranking perfectly. Spearman rank correlation is one point zero zero zero zero.

The noise-skill correlation is minus zero point nine eight — the mechanism reliably rewards skilled forecasters and penalises noisy ones.

---

## [SLIDE 11] Interpretation, limitations, and conclusion

### Slide bullets

* Conditional improvement, not universal dominance
* Best single can still win
* Tail calibration: mean deviation ≈ 0.017 before recalibration; recalibration closes ≈ 59%
* Truthfulness holds under risk neutrality
* Richer adversaries remain open
* Influence depends on earned reliability

### Script

The result should be interpreted carefully.

The mechanism improves the aggregate forecast in a disciplined market setting, especially when there is enough heterogeneity for the skill layer to learn from. But the best single forecaster can still outperform the aggregate, and equal weights remain competitive when forecasters are similar in quality.

The limitations are clear. Tail calibration shows systematic deviation of about one-point-seven percentage points on average — the aggregate is well-calibrated for central quantiles but weakens in the tails, a known limitation of the linear opinion pool (Ranjan and Gneiting, 2010). The post-hoc isotonic recalibration layer closes about fifty-nine per cent of that gap at a one-point-three per cent CRPS cost. Truthfulness holds only under risk neutrality, following Lambert's original assumption. And richer strategic behaviour — sophisticated adaptive adversaries — remains open.

To conclude: this thesis develops a self-financed forecasting market with online skill learning. Influence depends on earned reliability rather than deposit alone. On real energy data with seven forecasting models, the mechanism reduces mean CRPS by about seven per cent over equal weights on wind power and is essentially tied on electricity prices — substantially more modest than the pre-audit figures, but genuine and measured under a strictly-causal pipeline. The mechanism is correct to machine precision, the skill signal recovers true ordering perfectly, and the standard attacks are contained.

The answer to the thesis question is yes, but conditionally. The gains are real when there is heterogeneity to exploit.

Thank you. I am happy to take questions.
