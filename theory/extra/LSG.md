Designing and 
Implementing 
Prediction Markets
Late Stage Gateway | Anastasia Cattaneo 

Prediction markets can reward information contribution without 
requiring raw data sharing
In repeated forecasting, participation varies, conditions change, and 
agents may behave strategically
OVERVIEW
How can a history-aware repeated self-
financed prediction market be designed to 
aggregate probabilistic forecasts accurately 
and robustly over time?

LITERATURE AND RESEARCH GAP
Most existing market mechanisms are one-shot or history-free
Proper scoring rules support truthful probabilistic elicitation
Repeated settings add missingness, drift, and strategic participation
Gap: a repeated self-financed market with stake- and skill-based 
influence

PROBLEM
Stake-only weighting can confuse capital with information quality
History-free mechanisms ignore who has been reliable over time
Repeated settings add:
intermittent participation
drift and non-stationarity
strategic entry, staking, and reporting

PROPOSED MECHANISM


SYSTEM OVERVIEW
DGP: generates environment and realised outcomes
Behaviour block: participation, reports, deposits
Core mechanism: aggregation, scoring, settlement, skill update

FINDINGS
The mechanism is structurally sound
The online learner passes a controlled identifiability sanity check
The skill layer is informative
Deposit design matters a lot

 Precision-aligned deposits outperform noisy or arbitrary deposits

NEXT STEPS
Real data: datasets and 
model-generated 
forecasts
Focus on behaviour
Demo dashboard
