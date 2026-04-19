DESIGN DIRECTIONS
Anastasia Cattaneo
Overview of defence, weighting, aggregation and learning components

MANIPULATION / ATTACKS
History-free wagering mechanism
Large-wager domination ( need to guarantee U > 0)
Intermittent-contribution mechanism
correction matrix: One agent submits an intentionally bad forecast, while all other colluding agents 
strategically drop out. "When these agents are missing, the aggregate forecast is bad."
payoff function: one winner submits their best forecast and all other colluders submit intentionally 
terrible forecasts ( total loss denominator is high)
Sybil attack
Whitewashing

Some attackers may be willing to lose money inside the mechanism to move the forecast because 
they benefit elsewhere
“What happens when traders can also directly influence the outcome the market is predicting?”  
[Trading On A Rigged Game: Outcome Manipulation In Prediction Markets] 
DEFENCE:  can use a truncated mean aggregator that drops extreme forecasts before averaging [ 
Guo & Kong (2025), “Robust aggregation of expert predictions under adversarial corruption” ]



WASH TRADING
Network-Based Detection of Wash Trading 
(November 6, 2025)
Allen Sirolly, Hongyao Ma,Yash Kanoria, Rajiv 
Sethi 

Peaking at nearly 60 percent of volume in 
December 2024, 20 percent of volume in early 
October 2025
why? They are betting on future rewards based 
on volume + visibility, signalling size
Need to design an approach to detection that 
survives adaptation
Wash traders:
Repeatedly open and then close positions
Trade mostly with each other, not with the 
broad market
Relevant once the mechanism is embedded 
in a tokenised market with volume or 
airdrop-style rewards

REINFORCEMENT LEARNING
it solves “the mechanism cannot adjust itself over time” by learning how to change 
payoff parameters as the market and forecasters evolve, instead of keeping them fixed

For intermittent contributions mechanism:
RL lets the operator learn a rule: “When the market looks like this, set the payoff parameters 
like that.”

state summarises how the market is doing recently
action is a small vector of mechanism settings
reward encodes long run goals for the operator 

CONS
You trade away clean guarantees (truthfulness, Sybilproofness), risk Goodhart effects and 
new Sybil attacks, need complex simulation and guardrails, and end up with a policy that is 
hard to audit



GAUSSIAN PROCESS AGGREGATION
solves missing contributions 
correction matrix assumes linear relationships among forecasters and cannot model context-specific 
skill or dependence

multi-output Gaussian Process (GP) 
Treat each forecaster as a function fi(x) of task features x(time, country, horizon, covariates)
Places a joint probabilistic model over all forecasters so that the kernel learns covariance within and 
between experts, including non-linear and context-specific relationships
Historical forecast-outcome data identify who tends to be useful in which contexts

At a new task, uses history and the observed forecasters to infer the missing ones
Looks at the current forecasts of the experts who did participate and compares this pattern to similar 
situations in the historical data
Based on how the missing expert has behaved in those past situations, and how they co-move with the 
observed experts, it produces a best-guess forecast for the missing expert plus an uncertainty bar





ONLINE LEARNING
skill and stake together
Need a way to continuously re-weight forecasters as performance and regimes change

How does it work?
Use a proper scoring rule (e.g. Brier / CRPS) to score each round.
Aggregate forecasts with a weight vector, compute loss of the aggregate.
Update weights​ online (OGD / Hedge) using the gradient of the loss, with
forgetting (constant step size) to track drift,
optional exploration (Exp3-style mixing) to avoid killing forecasters after bad streaks.

This layer is a general online-optimisation framework that:
works for any scoring rule and any aggregation method,
can be added to the wagering mechanism to blend learned skill with wagers,
handles concept drift and wealth dominance,
and provides performance guarantees relative to the best forecaster in hindsight.

Direction
Problem it mainly solves
What it adds
Strengths
Weaknesses
Role / best use
Manipulation 
/ attacks
Strategic abuse of rules (large 
wagers, Sybils, collusion, 
outcome influence).
Adds explicit threat model, 
caps, identity / reputation 
rules, and robust pooling like 
trimmed / truncated 
aggregation
Directly hardens the system; 
simple robust tools
Can discard honest 
extremes; needs 
assumptions on attacker 
share and governance 
choices.
Baseline defence layer that must 
wrap any mechanism and inform all 
other design choices.
Wash 
trading
Fake volume / self-trading
Adds network-level 
surveillance on trades to 
detect and flag tightly 
trading clusters.
Targets a failure mode
Attackers can adapt 
patterns
Tokenised trades or volume-linked 
incentives. Not a first-order risk
RL
Fixed parameters that cannot 
adapt to changing behaviour
Adds a policy that maps 
recent market state to a small 
set of tunable mechanism 
parameters
Very flexible; can coordinate 
several knobs and react to 
drift.
Weaker guarantees, 
Goodhart risk, requires 
heavy simulation, hard to 
audit.
Narrow meta-tuner of a few safe 
hyperparameters; mainly for 
simulation and careful online 
adjustment.
Gaussian 
process 
aggregation
Missing contributions and 
context-specific skill not 
captured by simple linear 
corrections.
Replaces / augments linear 
corrections with a multi-
output, covariate-aware 
model that can impute 
forecasts and quantify 
uncertainty.
Captures “who is good where 
and when”; principled 
treatment of sparsity and 
dependence
Computationally and 
statistically demanding; 
less transparent.
Advanced aggregation / imputation 
layer on top of intermittent 
contributions, where data and 
compute allow.
Online 
learning 
(weights)
Stake-only influence and static 
weights that ignore past 
performance and drift.
Inserts an online weight-
update layer that adjusts 
each expert’s influence over 
time and can be combined 
with wagers.
Simple, well-understood, 
directly reduces wealth 
domination and tracks 
changing skill.
Needs repeated tasks 
and careful integration 
with incentive properties.
Main practical upgrade: default way 
to blend skill and stake in both 
mechanisms