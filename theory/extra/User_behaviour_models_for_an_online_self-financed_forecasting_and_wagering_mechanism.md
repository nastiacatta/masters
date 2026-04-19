User behaviour models for an online self-
financed forecasting and wagering mechanism
Motivation and design constraints
Your core mechanism sits in the family of self-financed (budget-balanced) wagering mechanisms built on
strictly  proper scoring  rules.  In  the  classical  formulation,  players  submit  probabilistic  forecasts
(probabilities or distributions), stake an amount, and the wager pool is redistributed as a function of
relative scoring performance, without external subsidy. 
Two  consequences  from  the  literature  are  worth  treating  as  “boundary  conditions”  for  any  user-
behaviour block you plug into the mechanism:
First, participation is endogenous. In standard prediction markets and trading-based mechanisms, a
trader may rationally choose not to act if their belief equals the prevailing price, and budget constraints
can  prevent  informed  agents  from  moving  the  market.  These  participation  frictions  are  explicitly
highlighted in the wagering-mechanism literature as failure modes of thin markets and price-taking
environments. 
Second,  truthfulness guarantees are preference-sensitive. Strictly proper scoring rules incentivise
truthful reports under the assumption that agents maximise expected score (risk-neutral expected
payoff maximisation).  
 When agents are risk-averse or have more general preferences, proper
scoring rules can induce biased reports unless the payment structure is adjusted or preferences are
elicited or learned. 
These two points are exactly why it is useful to factor your simulator into (i) a core mechanism that is
policy-agnostic and (ii) a behavioural layer that can generate realistic, strategic, and adversarial inputs.
Two-block decomposition that keeps the mechanism policy-
agnostic
A clean separation is easiest if you treat the mechanism as a deterministic state machine that only
consumes a standardised “submission object” from each participating account each round.
Core mechanism block (platform): implements settlement, aggregation, and state updates that are
defined by the mechanism (scoring, payoffs, any skill-to-weight mapping, caps, and book-keeping). This
is  the  block  whose  properties  you  typically  want  to  prove  or  test  (budget  balance,  monotonicity,
sybilproofness under assumptions, robustness to missingness, etc.). 
User-behaviour block (agent/environment): generates participation decisions, forecast reports, and
wager/deposit choices, plus any “identity strategy” (single account vs multi-account) that the platform
cannot  directly  observe.  This  is  the  block  you  vary  to  generate  synthetic  wager  data,  stress-test
incentives, and model manipulation.

A practical interface boundary is:
RoundInput_t = { (account_id i,
                  participate a_{i,t} ∈ {0,1},
                  report r_{i,t} (point or distribution),
                  stake/deposit b_{i,t} ≥ 0,
                  optional metadata z_{i,t}) }_{i=1..N_accounts}
CoreMechanism(state_{t}, RoundInput_t, realised_outcome y_t) -> state_{t+1}, 
logs_t
UserBehaviour(agent_private_state_{t}, observations_{t}) -> RoundInput_t
Key point: the mechanism should never need to know why a report or wager was chosen. It just applies
its rules.
If you want to study sybils and collusion, you additionally want a hidden mapping from “real user” to
“accounts” living entirely inside the user-behaviour block, because the platform typically only sees
accounts. This mirrors real exchanges where economic identity is costly or imperfectly enforced, and
where multi-wallet behaviour can appear. 
Behavioural dimensions worth modelling in your setting
The most useful behaviours to model are those that change the joint distribution of 
 over
time, because that is what drives both forecast quality and the incentive surface.
Participation and timing
Intermittent  and  selective  participation  is  not  just  missing  data:  it  is  often  strategic  selection on
confidence, “edge”, or opportunity. A recent market-design line explicitly targets settings where agents
may “enter and exit the market at will” and the mechanism must handle missing submissions. 
In your simulator, participation models that tend to be informative are:
Baseline availability: constant participation probability per round (useful as a control).
Bursty activity: clustered participation (sessions) rather than IID, to mimic real trading intensity
patterns often modelled by self-exciting processes in finance. 
Edge-threshold entry: participate only when the agent believes 
 is
large enough to justify risk. This directly connects to the “no incentive to participate when belief
matches price” issue noted in the wagering literature. 
Avoiding skill decay: participate only when the agent expects a high score, to protect any
performance-based reputation or skill estimate (especially relevant in repeated, online-weighted
systems).
Information structure and belief formation
To generate realistic report distributions you need more than “skill = noise level”. The forecasting
literature  treats  probabilistic  forecasts  as  distributions  whose  quality  combines  calibration  with
sharpness, and proper scores reward both jointly. 
(r , b , a )
i,t
i,t
i,t
• 
• 
• 
∣belief −current aggregate∣
• 

Behaviourally, you will typically want at least these latent traits:
Signal precision (or model quality): governs expected loss.
Bias and miscalibration: systematic over- or under-confidence, or biased mean.
Correlation across agents: common information sources create correlated errors, which
changes the value of aggregation.
Concept drift exposure: some agents adapt quickly, some do not (relevant because
nonstationarity degrades “optimal” weight estimation and changes who is skilled). 
Report strategy under incentives and preferences
Three report behaviours are particularly important because they can look similar in the data but have
different causes.
Truthful (risk-neutral) reporting: the intended benchmark for strictly proper scores. 
Hedged reporting from risk aversion: risk-averse agents facing risk-neutral scoring payments
may shade probabilities towards less extreme values or otherwise distort reports. 
Strategic misreporting to affect others: in market settings, participants can misrepresent
information to mislead others and profit, a concern explicitly discussed in wagering and market-
design work. 
Even if your mechanism is not an order book, the last behaviour matters whenever a participant has
utility from shifting the platform’s aggregate forecast (for example, reputational or decision-market
externalities). Experimental evidence suggests manipulators can try to distort market signals, and
whether this succeeds depends on how other participants respond. 
Wager and bankroll behaviour
In “forecast trading” style designs, wagers are not just money-at-risk: they are often interpreted as self-
reported confidence and are used as weights in aggregation and payoffs. This interpretation is explicit
in forecast-wager market designs where reported wagers weight aggregation and scale penalties/
rewards. 
For your purposes, wager behaviour is best modelled as an interaction between wealth constraints, risk
preferences, and perceived edge:
Wealth and affordability: stakes are bounded by a budget, so wealth evolves and feeds back
into future behaviour.
Risk management heuristics: a classic normative model is proportional betting to maximise
long-run log-wealth growth (the Kelly criterion), which yields a “bet a fraction of bankroll” style
policy rather than fixed stakes. 
Outcome-dependent risk appetite: prior gains and losses can shift risk-taking (house-money
and break-even effects), which is a direct way to generate realistic nonstationarity in stake sizes
even when signal quality is constant. 
Discrete or lumpy staking: human users often bet in round numbers or tiers, which creates
multimodality in stake distributions.
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 

Learning, adaptation, and meta-strategy
A repeated mechanism creates a new behavioural axis: agents can trade off short-run expected profit
against long-run influence or reputation. Two sources of adaptation you can model:
Forecast skill adaptation: agents improve their models over time or degrade under drift.
Strategic adaptation: agents update participation and staking based on realised profits,
detected competition, or perceived platform rules.
Drift and estimation error are key reasons simple aggregation can outperform complex methods in
practice, and they are also why online weight learning and robustness to regime shifts becomes central.
Canonical generative models for participation and wager data
A useful way to structure synthetic generation is a hierarchical latent-variable model: sample stable
traits per user, then generate per-round actions conditional on those traits and the evolving platform
state.
Latent trait layer
For each real user
 (not account), sample:
Wealth 
 from a heavy-tailed distribution (log-normal or Pareto are typical in finance for
heterogeneity).
Risk aversion 
 (for example CRRA coefficient) to control stake fraction.
Signal quality 
 (precision) and bias parameters for miscalibration.
Participation propensity parameters (baseline rate plus burstiness).
Optional manipulation parameters: external incentive 
, sybil budget, collusion group.
Per-round behaviour layer
At each round , for each user :
Participation decision
“Edge-based entry” matches the theoretical concern that agents may not act unless they
disagree with the current signal. 
Belief and report Let the agent form a predictive distribution 
 from a private signal model
(for example Gaussian with mean error and variance tied to  
). Then generate a reported
distribution 
 by applying one of:
truthful: 
miscalibrated: 
strategically hedged:  
, motivated by the risk-aversion bias results for
scoring rules. 
• 
• 
u
• 
Wu,0
• 
Au
• 
τu
• 
• 
κu
t
u
1. 
a
∼
u,t
Bernoulli(p
),
where  log
=
u,t
1 −pu,t
pu,t
α +
u
β ⋅
u Edge
+
u,t
γ ⋅
u WealthShock
.
u,t
2. 
Fu,t
τu
Ru,t
3. 
R
=
u,t
Fu,t
4. 
R
=
u,t
Calibrate(F
; over/under-confidence)
u,t
5. 
R
=
u,t
Hedge(F
; A )
u,t
u

Stake choice A generic stake policy is: 
where 
 is the fraction of bankroll risked this round.
Useful choices for 
 that produce distinct stake distributions: - fixed fraction: 
 - “Kelly-like”:
 (log-growth  motivated),  producing  larger  stakes  when  the  user  believes  they  have
strong information.  
 - house-money:  
, producing stake inflation
after gains. 
 - lumpy tiers: 
 in stake units to mimic discrete behaviour.
Account strategy (optional) If modelling sybils, map each user  to accounts 
 and
split stake/report decisions across accounts. This is precisely the identity-manipulation problem
that “sybilproofness” is meant to rule out at the mechanism level. 
This  structure  lets  you  generate  realistic  joint  patterns  such  as  “high  confidence,  high  stake,
intermittent  entry”,  or  “consistent  participation,  low  stake,  noisy  forecasts”,  and  it  makes  it
straightforward to inject attackers by changing only the behaviour parameters.
Adversarial and manipulative behaviours to simulate
Your project goal includes modelling attacks and manipulation. The key is to treat manipulation as
behaviour that is optimised against your mechanism’s logs and rules, not just random noise.
Identity attacks and sybil strategies
Sybil attacks are the ability of one entity to control many apparent identities. In decentralised or weakly
verified  environments,  the  classic  result  is  that  sybils  are  always  possible  without  some  logically
centralised identity or resource constraint. 
For your simulator, sybil behaviours worth modelling include:
Stake splitting to bypass per-account caps: if you cap influence or stake per account, splitting
a bankroll across accounts can increase total influence.
Reputation reset: if new accounts start with a favourable prior skill or looser constraints, a bad
actor can discard identities after losses.
Sybil farming under incentives: if the platform adds any side reward proportional to
participation or volume, multi-account strategies become economically attractive, even if the
core settlement is budget-balanced.
Sybilproofness in one-shot weighted-score wagering is a designed property, but modifications (caps,
alternative  weight  mappings,  online  reputation  coupling)  can  re-open  identity  incentives,  so  sybil
behaviour is a first-class stress test for your extensions. 
Arbitrage exploitation as an “attack-like” behaviour
An important strategic behaviour is arbitrage that yields non-negative profit regardless of outcome. A
key  critique  is  that  weighted-score  wagering  mechanisms  can  admit  an  arbitrage  interval  where
participants can extract a guaranteed positive payoff by betting within a certain range. 
6. 
b
=
u,t
min(W
, b
, W
⋅
u,t
max
u,t f
),
u,t
f
∈
u,t
[0, 1]
fu,t
f
=
u,t
fu
f
∝
u,t
Edgeu,t
f
=
u,t
f ⋅
u (1 + δ ⋅1[π
>
u,t−1
0])
b
∈
u,t
{0.5, 1, 2, 5, 10, … }
1. 
u
i ∈I(u, t)
• 
• 
• 

For data generation and robustness, this creates a distinctive user type:
Arbitrageur agents who choose reports specifically to guarantee profit, not to express beliefs.
In a repeated setting, arbitrageurs can dominate wealth dynamics and distort any attempt to interpret
stake as confidence, because their stake is driven by mechanism structure rather than information. This
is precisely why “no-arbitrage wagering mechanisms” were proposed as an alternative family that
removes riskless profit opportunities while retaining incentive and rationality properties under their
assumptions. 
Collusion patterns
Collusion is coordinated behaviour by multiple accounts that is hard to detect from individual actions
alone. In many economic settings, collusion is naturally modelled as a network phenomenon, and
modern detection work uses graph-based representations because relational patterns carry signal that
IID feature models miss. 
In your mechanism, collusion can take forms such as:
Coordinated participation and staking: a group appears and disappears together,
concentrating influence at specific rounds.
Report synchronisation: accounts submit highly correlated distributions and stake in a way that
increases their combined weight.
Reputation grooming: some accounts behave conservatively to build skill estimates, then
deploy concentrated stakes later.
Even if you do not implement collusion detection now, modelling these patterns is valuable because
they create realistic false positives for anomaly detection and stress-test robustness of online skill
gating.
Volume inflation, wash trading, and incentive gaming
If  you  later  move  towards  an  order-book  implementation  (or  if  you  include  any  “volume-based”
rewards), wash trading becomes the canonical manipulation. Wash trading is broadly described by
regulators as trades that create the appearance of market activity without real economic exposure or
position change. 
A recent empirical study proposes an iterative network-based method that detects wash trading via
clusters  of  counterparties  that  transact  mostly  with  each  other,  and  applies  it  to  Polymarket
,
estimating wash-trading-like activity peaking near 60% of weekly volume in December 2024. 
 The
same study highlights three institutional drivers that are directly relevant for behaviour modelling: no
KYC identity verification, low or zero transaction fees, and anticipated token airdrops that reward activity
(“airdrop farming”). 
Even in your current wagering mechanism, you can model wash-trade analogues as “fake participation”
if  you  introduce  any  side-channel  rewards  tied  to  number  of  submissions,  apparent  activity,  or
leaderboard ranking. In other words, volume-based growth incentives can turn “participation” itself into
an adversarial target. 
• 
• 
• 
• 

Adaptive evasion against behavioural detectors
If you intend to study detection, you need to model the fact that manipulators adapt. An adversarial
learning  framework  for  market  manipulation  explicitly  studies  a  generator  that  transforms
manipulation order streams to resemble benign trading while preserving the manipulation effect,
illustrating a cat-and-mouse dynamic between detector and attacker. 
The transferable insight for your project is: if you train detectors on a fixed manipulation template, you
should expect behavioural shift. So your “user behaviour” block should include attacker variants that
optimise against your detection features, not just against settlement payoff.
Insider-information behaviour (optional but realistic)
Some platforms explicitly prohibit trading on material non-public information, reflecting the practical
importance of inside-information behaviour in event markets. For example, the rulebook of Kalshi
includes a rule prohibiting use of material non-public information. 
In simulation terms, “insiders” are simply agents with unusually high signal precision and early access.
Modelling them is useful because they create realistic stake concentration and abrupt forecast shifts,
and they interact strongly with participation selection (they enter only when they know something).
Metrics and experimental protocols to evaluate behaviour–
mechanism interactions
To  make  behaviour  research  productive,  define  metrics  that  separate:  forecast  quality,  economic
properties, concentration, and adversarial detectability.
Forecast quality and calibration
Use at least one strictly proper score aligned with your report format (probabilities, quantiles, or full
distributions). Strictly proper scoring rules are designed so that the truthful distribution maximises
expected score under the true belief, and they evaluate probabilistic forecasts while reflecting both
calibration and sharpness. 
Beyond average score, include diagnostics:
Calibration checks (for example PIT-style diagnostics for continuous distributions) motivated by
the calibration/sharpness framework. 
Sharpness proxies (interval widths, entropy-like measures), because behavioural models often
trade sharpness for safety under risk aversion.
Wealth and influence concentration
Because  your  mechanism  ties  influence  to  stake  (and  possibly  skill-gated  stake),  track  whether
outcomes are dominated by a small set of accounts.
Two robust, mechanism-agnostic measures:
Influence concentration per round: if 
 are normalised aggregation weights, compute 
• 
• 
• 
wi,t

(Herfindahl-style concentration), or the effective number of participants 
.
Wealth  inequality  over  time: compute  a  Gini  coefficient  over  
 as  an  outcome  of
behavioural staking and mechanism payoffs.
These are especially important when you model whales, sybils, and intermittent participation, because
all three can produce “looks like participation” while concentrating effective control.
Incentive compatibility stress tests under behaviour
Because the classical truthfulness story assumes risk neutrality, add explicit “preference stress tests”:
Compare truthful agents vs risk-averse hedgers, holding signal quality fixed. The literature
shows risk aversion can systematically bias reports under standard proper scoring payments. 
Add dynamic incentives: test whether agents can improve long-run outcomes by sacrificing
short-run score to manipulate a skill estimate.
Adversarial benchmarks and detection metrics
If you study manipulation, evaluate both impact and detectability:
Impact on aggregate forecast: distance between aggregate forecast and a counterfactual “no
attacker” aggregate.
Attacker cost: realised losses or expected losses tolerated to achieve impact.
Detection performance: precision/recall of anomaly detectors under attacker adaptation,
motivated by adversarial evasion frameworks. 
Network signatures (if you log interactions): closed-cluster measures inspired by wash
trading detection, where suspicious activity forms self-contained subgraphs. 
Implementation blueprint for experiments
Once you adopt the two-block interface, you can run a systematic matrix of experiments by holding the
mechanism fixed and varying only behaviour modules:
benign baselines (truthful, IID participation, simple staking)
realistic frictions (bursty entry, wealth shocks, risk aversion, discrete staking)
adversaries (sybils, arbitrageurs, colluders, external-utility manipulators)
adaptive adversaries (detector-aware variants)
This structure mirrors how the forecasting-market literature separates mechanism properties from
practical variants, and how recent work in intermittent prediction markets isolates missingness and
time-variation as first-class concerns. 
Finally, if you want an external anchor for how real platforms separate “core aggregation mechanism”
from staking behaviour, Numerai
 documents staking as optional, where staked submissions can be
paid out or burned after scoring, and staking is interpreted as “skin in the game” that affects model
weighting. 
 This is a concrete example of why modelling stake choice as behaviour (not mechanism)
is analytically and empirically useful.
H =
t
w
i
∑
i,t
1/Ht
• 
{W }
i,t
• 
• 
• 
• 
• 
• 
• 
• 
• 
• 

https://ai.stanford.edu/~nlambert/papers/
Lambert_et_al_%28EC_2008%29.pdf
https://ai.stanford.edu/~nlambert/papers/Lambert_et_al_%28EC_2008%29.pdf
https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf
https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf
https://ai.stanford.edu/~nlambert/papers/riskpreferences_july2018.pdf
https://ai.stanford.edu/~nlambert/papers/riskpreferences_july2018.pdf
https://sieci.pjwstk.edu.pl/media/bibl/
%5BDouceur%5D_%5BSybil%20Attack%5D_%5BIPTPS%5D_%5B2002%5D.pdf
https://sieci.pjwstk.edu.pl/media/bibl/%5BDouceur%5D_%5BSybil%20Attack%5D_%5BIPTPS%5D_%5B2002%5D.pdf
https://arxiv.org/abs/2510.13385
https://arxiv.org/abs/2510.13385
https://people.smp.uq.edu.au/PhilipPollett/papers/Hawkes.pdf
https://people.smp.uq.edu.au/PhilipPollett/papers/Hawkes.pdf
https://econweb.ucsd.edu/~atimmerm/combine.pdf
https://econweb.ucsd.edu/~atimmerm/combine.pdf
https://ideas.repec.org/a/eee/ecolet/v117y2012i1p357-361.html
https://ideas.repec.org/a/eee/ecolet/v117y2012i1p357-361.html
https://yiling.seas.harvard.edu/files/2025/01/ec208-chen-long.pdf
https://yiling.seas.harvard.edu/files/2025/01/ec208-chen-long.pdf
https://www.sciencedirect.com/science/article/abs/pii/S0167268105001575
https://www.sciencedirect.com/science/article/abs/pii/S0167268105001575
https://arxiv.org/pdf/2205.02668
https://arxiv.org/pdf/2205.02668
https://www.princeton.edu/~wbialek/rome/refs/kelly_56.pdf
https://www.princeton.edu/~wbialek/rome/refs/kelly_56.pdf
https://business.columbia.edu/sites/default/files-efs/pubfiles/1154/thaler_and_johnson.pdf
https://business.columbia.edu/sites/default/files-efs/pubfiles/1154/thaler_and_johnson.pdf
https://arxiv.org/abs/2410.07091
https://arxiv.org/abs/2410.07091
https://www.cftc.gov/sites/default/files/filings/orgrules/14/12/rule121714comexdcm012.pdf
https://www.cftc.gov/sites/default/files/filings/orgrules/14/12/rule121714comexdcm012.pdf
https://gamblingharm.org/wp-content/uploads/2025/11/Polymarket-Wash-Trading-
Study.pdf
https://gamblingharm.org/wp-content/uploads/2025/11/Polymarket-Wash-Trading-Study.pdf
https://strategicreasoning.org/wp-content/uploads/2020/06/Manipulation_Disguise.pdf
https://strategicreasoning.org/wp-content/uploads/2020/06/Manipulation_Disguise.pdf
https://www.cftc.gov/sites/default/files/filings/orgrules/25/07/rules07012525155.pdf
https://www.cftc.gov/sites/default/files/filings/orgrules/25/07/rules07012525155.pdf
https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jrssb.pdf
https://sites.stat.washington.edu/raftery/Research/PDF/Gneiting2007jrssb.pdf

https://docs.numer.ai/numerai-tournament/staking
https://docs.numer.ai/numerai-tournament/staking