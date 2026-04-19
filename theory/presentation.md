# Adaptive Skill and Stake in Forecast Markets

## Motivation

This project studies a repeated probabilistic forecasting market. Forecasting matters because better predictions lead to better decisions. Even modest improvements in forecast quality can have substantial operational value. At the same time, the information required to generate strong forecasts is often decentralised across individuals, firms, or models, and that information may be costly to share because of privacy, competition, or coordination frictions. Prediction markets are attractive because they allow participants to contribute predictive information and be rewarded for that contribution without revealing the underlying data itself. This is the main motivation for a market-based design. Instead of asking agents to reveal raw data, the mechanism asks them to reveal predictive information, and rewards them according to the quality of that contribution.

The limitation is that classical self-financed wagering mechanisms are mainly history-free. They use current reports and current stake, but they do not maintain a persistent view of who has been reliable over time. The central question of this project is therefore whether aggregate forecasts can improve when current influence depends not only on stake, but also on a learned estimate of skill based on past realised outcomes.

## Core Problem

The core problem is that stake alone is not a good proxy for information quality. A wealthy but weak forecaster can still gain a lot of influence. At the same time, a history-free mechanism ignores whether someone has actually been reliable over repeated rounds.

## Round-by-Round Mechanism

This shows the mechanism as a simple round-by-round process.

At the start of a round, each participant makes two choices: they submit a forecast and they decide how much to deposit. That deposit reflects current commitment. It tells us how much they are willing to put at risk in that round.

The mechanism then adjusts that deposit using a skill estimate that has been learned from past realised performance. So the key idea is that not all deposited stake counts equally. A participant who has been more reliable in earlier rounds has more of their deposit translated into actual market influence. A participant with weaker past performance still has exposure, but less of their deposit counts when the market forms its aggregate forecast.

Once that adjustment is made, the mechanism uses these effective wagers as weights. In other words, the market forecast is built by combining individual forecasts, but giving more weight to participants whose current stake is backed by stronger historical reliability.

After the outcome is realised, the same effective wager is used again in settlement. So the object that determines influence is also the object that determines financial exposure. That is an important design choice, because it keeps incentives aligned. Participants are not given influence for free. If they have more impact on the aggregate forecast, they also carry more exposure in the payoff rule.

Finally, the round does not just end with payoffs. Realised forecasting performance is fed back into the system and updates each participant's skill estimate for the next round.

## Platform Architecture

The platform is modular. First, a data-generating process defines the environment and realised outcomes. Second, a behaviour block generates participation, reports, and deposits. Third, the core mechanism applies aggregation, scoring, settlement, and skill updates. This split matters because the mechanism should not need to know why an agent chose a report or a wager. It just consumes standardised inputs. That makes it possible to test the same mechanism under different environments, participation rules, and adversarial behaviours.

## Implementation and Testing

The mechanism is implemented as a deterministic core with aggregation, payoff, and online updating, and the test suite is explicitly built around budget balance, zero-sum accounting, missingness handling, and related invariants. In the endogenous aggregation setup, the online learner is being asked a limited but clear question: can it recover the forecasters who structurally matter more under the chosen DGP? That is a valid sanity check for the learning rule.

## Key Results

The main result so far is correctness: the mechanism settles and accounts properly. Second, the learned skill signal is meaningful, because it tracks forecaster quality and affects influence and payoffs. Third, deposit design matters a lot, so performance depends not just on the weighting rule but also on how stake enters the system. On forecast quality, the gains are conditional rather than universal: the mechanism helps most in learnable settings, but equal weighting remains a strong benchmark. Third, the strongest empirical lever is deposit quality. When deposits are aligned with information quality, performance improves a lot. When stake is noisy or arbitrary, performance degrades. So in these runs, how stake enters the mechanism matters at least as much as the weighting rule itself.

## Responsiveness and Robustness

Fourth, responsiveness matters. Under drift, faster adaptation helps, while slower adaptation hurts. That supports the idea that repeated forecasting needs an explicitly dynamic design rather than a static one-shot rule.

Finally, the robustness results are mixed. In the current attack runs, adversaries do not extract sustained positive profit, which is encouraging. But some manipulations still distort activity, concentration, and participation, and the detection layer has clear blind spots. So robustness looks promising, but it is not a solved problem.
