Designing and Implementing Prediction Markets
Anastasia Cattaneo
Forecasting platforms elicit predictive information from many contributors. This raises a central
design problem: how to transform these inputs into a single aggregate probability and how to allo-
cate influence across forecasters. In practice, current mechanisms rely on static rules, for example,
weights proportional to stake. As forecasting tasks become more complex, information sources
more heterogeneous, and participants more strategic, the limitations of such static mechanisms
become more apparent.
The project aims to investigate whether aggregate probabilistic forecasts can be improved by con-
tinuously re-weighting forecasters as their performance and the environment evolve. Rather than
treating stake or historical accuracy as fixed inputs, the platform maintains a time-varying skill
profile for each forecaster, updated online from strictly proper scoring-rule losses, and then uses
this profile to modify how much weight each forecast receives. By designing and prototyping a
platform that blends wagering mechanisms with a general online learning layer, the project will
assess how an adaptive weighting scheme that combines skill and stake affects forecast accuracy
and market outcomes.
General Context
Forecasting has always been at the forefront of decision-making and planning in fields such as
energy, macroeconomics and public policy[1]. High-quality predictions depend on access to high-
quality data, and forecasts are often improved by combining data from distributed sources. How-
ever, this data is held by different owners who perceive disclosure as costly because of competitive,
regulatory or privacy concerns. One way to increase collaboration is to give incentives in exchange
for this data. This could be done through prediction markets where individual forecasts are shared
in exchange for a reward linked to their contribution to the resulting aggregate forecast. [4]
Prediction markets are information markets where participants trade in contracts whose payoff
depends on the outcome of unknown future events, such as elections or sports results. These
markets aggregate information by pulling together heterogeneous signals, models and beliefs into
a single probabilistic view of the future. In a well-functioning prediction market, this “wisdom
of the crowds” will be the best predictor of the event and is as good, or better than, conventional
polling and expert judgement [2].
Forecast elicitation mechanisms ask sellers to report their beliefs concerning a future event. After
the event occurs, forecasters are ranked according to the quality of their forecasts and evaluated by
a scoring rule. Rewarding only the best forecaster matches many real-world forecasting settings,
but ignores the fact that other participants can still provide valuable information.

With the success story of platforms like Numerai, there is a real potential for real-world aggrega-
tive forecasting marketplaces. Commercial adoption has accelerated, particularly on regulated
exchanges such as Kalshi and crypto-native platforms such as Polymarket. These platforms attract
heterogeneous information sources and produce continuously updated, probabilistic signals that
are easy to interpret. However, Polymarket records reveal substantial wash trading, where entities
trade largely with themselves through clusters of wallets to inflate apparent volume, chase airdrop
rewards, or manipulate perceived liquidity. An iterative network-based procedure estimated wash
trading on Polymarket to peak at around 60 per cent of weekly share volume in December 2024
[3]. Wu [10] shows that Polymarket’s election markets are driven by a small core of highly active
traders, with prices shaped by specialised competition rather than broad, democratic participation.
These findings suggest that realistic forecast-trading environments are not only noisy and non-
stationary, but also strategically adversarial in ways not captured by classical forecast-combination
models.
State of Affairs
Combining multiple forecasts produced from a single target series is widely used to improve accu-
racy through the integration of information gleaned from different sources. Combination schemes
have evolved from simple combination methods without estimation to sophisticated methods in-
volving time-varying weights, nonlinear combinations, correlations among components, and cross-
learning. A forecast aggregation problem involves combining multiple, noisy predictions of the
same outcome into a single forecast that is more accurate, better calibrated and more robust than
its constituents. Combining two unbiased forecasts with imperfectly correlated errors reduces
mean squared error relative to either forecast alone. In many applications, simple equal-weighted
averages perform at least as well as statistically “optimal” weight estimates, because the latter are
fragile in the presence of estimation error and non-stationarity. This is called the forecast combi-
nation puzzle [6].
Probabilistic forecast aggregation introduces an additional layer. Instead of point forecasts, con-
tributors provide predictive distributions or sets of quantiles, and the aggregator creates a combined
distribution. Two main families of methods dominate: linear pools, which average densities, and
quantile-based schemes, which average quantile functions. In both cases, strictly proper scoring
rules such as the Continuous Ranked Probability Score (CRPS) and quantile (pinball) loss provide
objective functions for both evaluation and optimisation of weights [5]. Neyman and Roughgar-
den [7] establish a structural link between strictly proper scoring rules and probabilistic pooling,
showing that each scoring rule induces a quasi-arithmetic pooling operator under which the corre-
sponding scoring-rule loss is concave in the expert weights. This concavity is critical for applying
online gradient-based methods to learn weights with regret guarantees.
Mechanism-design approaches recast prediction markets as structured forecast-elicitation mecha-
nisms. Raja, Pinson and Kazempour [4] propose a wagering mechanism in which a buyer elicits
probabilistic forecasts from a set of sellers, each of whom also submits a non-negative wager.
Payoffs are computed using a strictly proper scoring rule, and the mechanism is designed to be
self-financing, budget balanced, individually rational and resistant to simple identity-splitting at-
tacks, while preserving truthful reporting as a best response for risk-neutral agents.

Vitali and Pinson [8] extend this framework to markets with intermittent contributions, where
forecasters may be absent at some time steps, and multiple clients request forecasts. They introduce
a robust regression layer that maps individual quantile forecasts into an aggregate forecast and uses
a correction matrix to compensate for missing contributors, together with a history-based payoff
rule that rewards long-run marginal contribution.
Online Learning for Forecast Aggregation
At the algorithmic level, online convex optimisation (OCO) provides a natural framework for adap-
tive forecast aggregation. In each round, a learner chooses a weight vector in a convex set, observes
experts’ forecasts, forms an aggregate prediction, then observes the outcome and incurs a convex
loss such as CRPS or average pinball loss. OCO algorithms like Online Gradient Descent or
Hedge offer guarantees that cumulative loss will not exceed that of the best fixed (or slowly vary-
ing) weight vector in hindsight by more than a sublinear regret term, even under non-stationarity
and mild adversarial conditions [9].
These methods have been applied to probabilistic load and renewable forecasting, where adaptive
weights help track regime shifts and changes in expert quality. Recent work on adaptive probabilis-
tic net-load forecasting combines an offline state-space model with online quantile regressions, run
at multiple learning rates and aggregated as experts, to improve point and probabilistic accuracy
through structural shifts such as COVID-19 [12]. Similar ideas appear in work [11], where the on-
line pinball loss is monitored for each quantile, smoothed with an exponentially weighted moving
average, and used to construct quantile-specific shift indicators that control adaptive learning rates,
allowing ensembles to switch between fast and slow updates in response to distributional shifts.
Within a prediction-with-expert-advice framework, paper [13] shows how to aggregate probabilis-
tic forecasts scored by CRPS, treating each forecaster as a distribution-valued expert and providing
explicit aggregation rules with regret guarantees relative to the best one in hindsight.
In Bayesian predictive synthesis (BPS), where combination weights depend on forecaster perfor-
mance and macro indicators. The paper [14] develops a tree-based BPS-RT specification in which
combination weights depend on simple performance and macro indicators, and shows improved
density forecasts for euro-area GDP and US inflation.
Taken together, the current state of affairs is characterised by: (i) a mature literature on probabilis-
tic forecast combinations and proper scoring rules; (ii) mechanism-design approaches that turn
prediction markets into explicit wager-based forecast-elicitation schemes; and (iii) online learn-
ing and robustness frameworks that address non-stationarity and adversarial manipulation. This
project builds directly on the above work, using wager-based mechanisms as structural templates
and online convex optimisation as the aggregation layer, to prototype a forecast-trading platform,
and study its accuracy, interpretability and robustness in realistic settings.

Methodology
The goal is to design and develop a platform for the pooling of predictive information as a proof of
concept. A sandbox environment will be created in which multiple forecasters submit probabilistic
predictions and wagers on repeated forecasting tasks, and the platform aggregates, scores, and
rewards them. The core market design will follow the contribution-based wagering mechanisms of
[4] and the intermittent-contribution framework of [8].
This term I researched four design directions: (i) manipulation and defence, covering large-wager
domination, Sybil attacks, collusion, whitewashing and outcome influence, and in tokenised set-
tings fake volume through wash trading; (ii) reinforcement learning for mechanism tuning, which
solves “the mechanism cannot adjust itself over time” by learning a policy that maps a recent sum-
mary of market state to a small vector of payoff parameters, instead of keeping them fixed, but
at the cost of weaker guarantees; (iii) multi-output Gaussian process aggregation, which replaces
linear correction matrices by treating each forecaster as a function of task features, learning co-
variance within and between experts so that the model can impute missing contributions with an
associated uncertainty and capture context-specific skill; and (iv) online learning for forecaster
weights. The project will focus on (iv) as the main contribution, with (i)–(iii) treated as stretch
goals and context for future work. An initial Python implementation of the wagering mechanism
in [4] has been developed as a baseline.
Next term, the main focus will be the online learning layer. Forecaster skill is not fixed: contrib-
utors improve or deteriorate, regimes change, and static wager-weighted aggregation allows rich
but inaccurate players to dominate. To address this, the platform will maintain a time-varying skill
vector over forecasters.
In each round:
1. All individual probabilistic forecasts are scored using a strictly proper scoring rule, such as
the Brier score for binary events or CRPS / pinball loss for distributional / quantile forecasts
[4].
2. The platform forms an aggregate forecast using a weight vector over forecasters, combined
with the wager-based mechanism’s aggregation operator.
3. The aggregate forecast incurs a convex loss derived from the scoring rule.
4. Forecaster weights are updated online using algorithms such as Online Gradient Descent or
Hedge, applied to this convex loss.
A constant step size and a forgetting factor will ensure that recent performance has greater influence
than distant history and is intended to help the system react to drift. A small fixed-share exploration
term will keep a non-zero weight on all forecasters. This will be added to evaluate if agents who
improve after a poor period could be rediscovered.
The market will then be extended to a fully dynamic setting in which forecasters may enter and

exit over time. To handle missing forecasts under intermittent participation, I will adapt robust
online regression techniques that learn a correction matrix among forecasts and adjust the weights
when some inputs are unavailable [8].
The online learning layer will first be tested on synthetic datasets, where I can control the number
of forecasters, their bias and variance, the presence of regime shifts, and the pattern of entries and
exits. In a second stage, subject to data availability, I will explore applying the framework to at
least one real multi-forecaster dataset, such as the Survey of Professional Forecasters [15], treated
as a set of pseudo-forecasters with heterogeneous and time-varying skill.
Expected Results and Impact
The expected results of this project are the development of a proof-of-concept forecast-trading
platform with a history-aware online learning layer for forecaster weighting. By applying online
convex optimisation to losses derived from strictly proper scoring rules, the system aims to improve
aggregate forecast accuracy under non-stationarity and intermittent participation.
Impact will be assessed through KPIs on (i) predictive performance (average Brier score or CRPS,
calibration) and (ii) market behaviour (wealth and influence concentration, stability of participa-
tion). The feasibility of combining learned skill weights with monetary stake, while preserving
core properties of the underlying wagering mechanism, will be evaluated with the aim of inform-
ing the design of more accurate and robust prediction platforms.

Gantt Chart
Figure 1: Gantt Chart
References
[1] F. Petropoulos, D. Apiletti, V. Assimakopoulos, et al. Forecasting: theory and practice. Inter-
national Journal of Forecasting, 38(3), 705–871, 2022.
[2] J. Wolfers and E. Zitzewitz. Prediction markets. Journal of Economic Perspectives, 18(2),
107–126, 2004.
[3] A. Sirolly, H. Ma, Y. Kanoria and R. Sethi. Network-based detection of wash trading. SSRN
working paper, 2025.
[4] A. A. Raja, P. Pinson, J. Kazempour and S. Grammatico. A market for trading forecasts: a
wagering mechanism. International Journal of Forecasting, 40(1), 142–159, 2024.
[5] T. Gneiting and A. E. Raftery. Strictly proper scoring rules, prediction, and estimation. Journal
of the American Statistical Association, 102(477), 359–378, 2007.
[6] X. Wang, Y. Kang and F. Petropoulos. Forecast combinations: an over 50-year review. Inter-
national Journal of Forecasting, 39(4), 1518–1547, 2023.
[7] E. Neyman and T. Roughgarden. From proper scoring rules to max–min optimal forecast
aggregation. Operations Research, 71(6), 2175–2195, 2023.
[8] M. Vitali and P. Pinson. Prediction markets with intermittent contributions. Preprint, 2025.

[9] E. Hazan. Introduction to Online Convex Optimization. Now Publishers, 2016.
[10] H. Wu. Prediction Markets as Sociotechnical Assemblages: Specialized Competition and the
Financialization of Uncertainty. MA thesis, University of Chicago, 2025.
[11] D. Qin, X. Wu, D. Sun, Z. Liang and N. Zhang. Load forecasting under distribution shift: an
online quantile ensembling approach. Applied Energy, 401, 126812, 2025.
[12] J. de Vilmarest, J. Browell, M. Fasiolo, Y. Goude and O. Wintenberger. Adaptive probabilistic
forecasting of electricity (net-)load. IEEE Transactions on Power Systems, 39(2), 4154–4166,
2024.
[13] V. V. V’yugin and V. G. Trunov. Online learning with continuous ranked probability score.
In Conformal and Probabilistic Prediction and Applications, Proceedings of Machine Learning
Research, 105, 1–15, 2019.
[14] T. Chernis, N. Hauzenberger, F. Huber, G. Koop and J. Mitchell. Predictive density combina-
tion using a tree-based synthesis function. Working paper, arXiv:2311.12671, 2023.
[15] Federal Reserve Bank of Philadelphia. Survey of Professional Forecasters.
