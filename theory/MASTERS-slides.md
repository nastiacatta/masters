HOW DO WE BLEND SKILL 
AND STAKE?
Anastasia Cattaneo

HOW DO WE BLEND SKILL AND STAKE?
options
improve the effective wager
SYSTEM
overview + goal
online update
intermittent contributions
double counting?
properties
MVP CODE
setup
test

a. OBJECTS (round t) 

a. OPTIONS


b. IMPROVE THE EFFECTIVE WAGER


SYSTEM

a. OBJECTS (round t) 

a. AGGREGATION, SCORING

a. PAYOFF

b. ONLINE UPDATE


b. ONLINE UPDATE OPTIONS

c. INTERMITTENT CONTRIBUTIONS

d. DOUBLE COUNTING?
double check that I am not doing the same thing twice with payoff function and when I do my efficient skill

MVP CODE

e. SETUP

e. SETUP

e. TEST


TESTS AND EXPERIMENTS
Anastasia Cattaneo

CODE STRUCTURE
TESTS
EXPERIMENTS
NEXT STEPS

CODE STRUCTURE


TESTS

EXPERIMENTS

NEXT STEPS

DATA GENERATION PROCESSES


TESTS AND EXPERIMENTS
Anastasia Cattaneo


TWO BLOCKS: CORE MECHANISM + 
USER-BEHAVUOUR
Anastasia Cattaneo

AIM
Generate realistic per-round inputs to stress-test 
incentives, robustness, and attacks

THE SPLIT
Block A: Core mechanism (platform, deterministic)
scoring rule application
aggregation and weights
settlement and payoffs
skill

Block B: User behaviour (agent/environment, strategic)
participation 
belief formation and forecasting 
reporting ( separates ˝is the agent well-informed?˛ from ˝does the agent tell the truth?˛)
wa
)
wager
identity strategy (single account, sybils, collusion, evasion)

WHY SEPARATE?
Participation is endogenous. 
Agents may rationally choose not to participate (or to participate only intermittently), and 
budget constraints can prevent informed agents from exerting influence through stake 
even when they would like to. So the mechanism cannot assume a fixed set of active users 
or wager sizes.


Truthfulness is preference-sensitive. 
Strictly proper scoring rules guarantee truthful reporting only under specific preference 
assumptions. With risk aversion or other utilities, agents may optimally hedge by reporting 
distorted beliefs.

CONTRACT BETWEEN BEHAVIOUR AND CORE 
Treat each user as a policy that outputs 
actions, and treat the mechanism as a 
pure state machine that takes actions 
plus the realised outcome and 
produces payouts and the next state.

That separation lets you swap in 
different behaviours (honest, noisy, 
strategic, collusive, wash-trading style) 
without touching the mechanism, and it 
makes manipulation experiments clean 
because the core never depends on 
motives.

ALL USER BEHAVIOURS
Participation and timing (availability, burstiness, selection-on-edge)
Information and belief formation (precision, bias, correlated errors, drift adaptation)
Reporting strategy (truthful, miscalibrated, hedged, strategic misreporting)
Staking and bankroll behaviour (wealth constraints, Kelly-like, house-money, lumpy 
bets)
Identity strategy (single account vs multi-account, reputation reset)
Learning and meta-strategy (adapt behaviour over time based on profits, rules, 
drift)
Adversarial behaviours (sybils, arbitrage, collusion, volume gaming, evasion, 
insiders)

Participation and timing
Baseline availability: constant participation probability per round (useful as a 
control)
Bursty activity: clustered participation (sessions) rather than IID  independent and 
identically distributed), to mimic real trading intensity https://
people.smp.uq.edu.au/PhilipPollett/papers/Hawkes.pdf
Deadline effects: late submissions, last-minute staking, time-to-close behaviour.
Selection on edge: enter only when expected advantage exceeds a threshold.
Selection on confidence / uncertainty: participate when own forecast is “sharp”.
Avoiding skill decay: participate only when the agent expects a high score
Task/market choice (if multiple questions): which events a user chooses to engage 
with.

Information structure and belief formation
how does a user form a belief each round, how does that belief change over time, and what 
determines its quality and shape?

Signal precision / intrinsic skill: controls expected loss distribution ( how noisy the userˇs information 
is, even if they are honest)
Bias: systematic over/underestimation; directional bias.
Miscalibration: overconfidence/underconfidence at fixed mean.
Correlated information: shared news sources; correlated errors across users.
Non-stationarity and drift (˝rules of the world˛ that produce outcomes are not constant): beliefs under regime change; speed of adaptation.
some agents adapt quickly, some do not ] changes who is skilled
Costly information: effort or cost to improve precision (strategic ˝research˛ d
 decisions)
Shared mistake (everyone gets nudged the 
same way this round)
Personal mistake (your own random wobble)

 Reporting strategy (what is submitted)
Truthful reporting: report equals belief (benchmark behaviour).
Noisy / sloppy reporting: random deviations, rounding, quantile inconsistencies.
Hedging under risk/preferences: report-shrinking towards the aggregate or 
towards 0.5 (for binary) to reduce payoff variance. https://ideas.repec.org/a/eee/ecolet/v117y2012i1p357-361.html
Strategic misreporting:
Manipulate the aggregate
Participants can misrepresent information to mislead others and profit 
Reputation/skill gaming: sacrifice short-run profit to influence future skill 
estimates or weight updates.
Sandbagging / signalling: deliberately dull forecasts early, then sharpen later.

 Staking, deposits, and bankroll management
Budget constraint: stake limited by wealth; deposit/withdraw behaviour (if modelled).
Wealth creates path dependence and selection effects: after losses, agents may be unable to 
participate meaningfully; after wins, they can dominate unless cap or gate
External deposits/withdrawals can mimic real users topping up or cashing out, decoupling 
behaviour from pure mechanism payouts.
Risk attitude: risk-neutral vs risk-averse vs risk-seeking; loss aversion.
Path dependence,  prior gains and losses can shift risk-taking: “house money”, break-even, tilt 
after losses.
Gambling with the House Money and Trying to Break Even: The Effects of Prior Outcomes on 
Risky Choice https://business.columbia.edu/sites/default/files-efs/pubfiles/1154/thaler_and_johnson.pdf
Discrete / lumpy bets: round numbers, tiered stakes, minimum-bet effects. Users often bet in round 
numbers or tiers, which creates multimodality in stake distributions.
Concentration limits response: behaviour around per-round caps (try to sit just below caps).

 Staking, deposits, and bankroll management
Stake sizing policy: fixed fraction, Kelly-like (stake to maximise long-run growth, not just 
expected profit) , edge-proportional (If the user thinks they have more advantage /edge, 
they risk more) , capped.
˝Kelly˛ (the Kelly criterion) is a stake-sizing rule that tells you what fraction of your bankroll to 
bet to maximise long-run growth of wealth (maximise expected log wealth).

5. Objectives and preferences (why they act)
Explains systematic deviations from truthful + expected-profit maximisation
Utility over wealth (risk preferences) vs pure expected value
Pure expected value: choose the action that maximises expected profit.
Utility over wealth: choose the action that maximises expected satisfaction from 
money, not money itself.
Risk-averse agents prefer steadier outcomes even if expected profit is slightly 
lower.
Risk-seeking agents may prefer gambles.
Externalities: they benefit if the aggregate forecast moves (decision markets, 
reputational incentives, political motives).
Non-monetary motives: entertainment, signalling (they want others to see they are 
confident or cautious), leaderboard chasing.
Compliance cost / risk: reluctance to stake heavily, or preference for ˝safe-looking˛ a
 
actions ( it feels risky or embarrassing if wrong, prefer actions that look reasonable 
to others.)

 Identity and account management
Single identity vs multi-account control.
Stake splitting across accounts (cap circumvention).
Reputation reset: abandon accounts after losses or low skill.
Account lifecycle: creation timing, dormancy, reactivation.


Want a hidden mapping from “real user” to “accounts” living entirely inside the user-
behaviour block, because the platform typically only sees
accounts. This mirrors real exchanges where economic identity is costly or imperfectly 
enforced, and where multi-wallet behaviour can appear.

The Sybil Attack John R. Douceur Microsoft Research johndo@microsoft.com “One 
can have, some claim, as many electronic personas as one has time and energy to 
create.” – Judith S. Donath

 Learning and meta-strategy (adaptation to 
the mechanism)
A repeated mechanism creates a new behavioural axis: agents can trade off short-run expected 
profit
against long-run influence or reputation.€
R
Reinforcement from profits: adjust participation, stake, or aggressiveness after wins/losses.
Rule learning: infer how skill gating, caps, and scoring work and exploit them.
Opponent awareness: react to whales( avoid rounds where a whale dominates, or copy them, or 
try to counter them) , to crowd behaviour (follow the crowd, or deliberately take the opposite 
side ), or to observed aggregate dynamics.
Exploration vs exploitation: try new strategies vs stick to a profitable one.

Because the world changes (drift) and weights are noisy to estimate (estimation error), simple 
averages can beat complex models. That is why you need online weight updates and safeguards 
against regime shifts.

 Adversarial and manipulative behaviours
Sybil strategies (multi-account influence).
Collusion: coordinated reporting/staking across a group; reputation grooming then 
deployment.
Arbitrage / mechanism exploitation: riskless or low-risk profit patterns if your design 
permits them.
Volume/activity gaming: if any rewards depend on activity or participation.
Evasion / disguise: attackers adapt to detection features (behaviour that looks 
benign).
Insider-type behaviour: unusually early/precise signals; selective entry when 
informed.

9. Operational frictions and data artefact
Latency and missed rounds: delayed submission, dropouts, partial participation.
Interface errors: invalid quantiles, inconsistent distributions, stake entry mistakes.
Automation vs human: bot-like regularity, API bursts, deterministic patterns.

They can look like “manipulation”, but they are often just noise from timing, UI, or 
automation.

GENERATION MODEL
user-level generator: you sample a small set of stable hidden attributes for each real 
person, then you generate per-round actions (participation, report, stake, sybil 
splitting) conditional on those attributes and the evolving platform state.
constant relative risk aversion

Adversarial and manipulative behaviours to simulate
The key is to treat manipulation as behaviour that is optimised against mechanismˇss 
rules, not just random noise.

Identity attacks and sybil strategies
Stake splitting to bypass per-account caps: if you cap influence or stake per 
account, splitting a bankroll across accounts can increase total influence.
Reputation reset: if new accounts start with a favourable prior skill or looser 
constraints, a bad actor can discard identities after losses.
Sybil farming under incentives: if the platform adds any side reward proportional to
participation or volume, multi-account strategies become economically attractive, even 
if the core settlement is budget-balanced.

Arbitrage exploitation
An important strategic behaviour is arbitrage that yields non-negative profit regardless 
of outcome. A key critique is that weighted-score wagering mechanisms can admit an 
arbitrage interval where participants can extract a guaranteed positive payoff by 
betting within a certain range.

For data generation and robustness, this creates a distinctive user type:
Arbitrageur agents who choose reports specifically to guarantee profit, not to 
express beliefs.
In a repeated setting, arbitrageurs can dominate wealth dynamics and distort any 
attempt to interpret stake as confidence, because their stake is driven by mechanism 
structure rather than information.

Collusion patterns
Collusion is coordinated behaviour by multiple accounts that is hard to detect from 
individual actions alone. In many economic settings, collusion is naturally modelled as 
a network phenomenon, and modern detection work uses graph-based 
representations because relational patterns carry signal that IID feature models miss.

Coordinated participation and staking: a group appears and disappears together,
concentrating influence at specific rounds.
Report synchronisation: accounts submit highly correlated distributions and stake in 
a way that increases their combined weight.
Reputation grooming: some accounts behave conservatively to build skill 
estimates, then deploy concentrated stakes later.

LSG  + OVERVIEW

Collusion patterns
Collusion is coordinated behaviour by multiple accounts that is hard to detect from 
individual actions alone. In many economic settings, collusion is naturally modelled as 
a network phenomenon, and modern detection work uses graph-based 
representations because relational patterns carry signal that IID feature models miss.

Coordinated participation and staking: a group appears and disappears together,
concentrating influence at specific rounds.
Report synchronisation: accounts submit highly correlated distributions and stake in 
a way that increases their combined weight.
Reputation grooming: some accounts behave conservatively to build skill 
estimates, then deploy concentrated stakes later.
