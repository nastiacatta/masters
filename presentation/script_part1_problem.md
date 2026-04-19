# Script Part I — PROBLEM (Slides 1–5, ~6 min)

**Format: ON SLIDE = what the audience sees (concise bullets, key formulas, key numbers). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 1 — Title

**ON SLIDE:**
- Title: Adaptive Skill and Stake in Forecast Markets
- Subtitle: Coupling Self-Financed Wagering with Online Skill Learning
- Anastasia Cattaneo — Imperial College London, Dyson School of Design Engineering

**SCRIPT:**

Good morning. My name is Anastasia Cattaneo. This thesis asks a specific question: if a forecasting market learns who is reliable and gives those participants more influence, do the aggregate predictions improve — without breaking the economic guarantees that make the market trustworthy?

---

## SLIDE 2 — Why Forecast Aggregation Matters

**ON SLIDE:**
- Diagram: distributed data owners (energy, logistics, finance, weather) → Aggregation → Single improved probabilistic forecast → Better decisions
- Combining forecasts reduces error — well-established result in forecasting literature
- Modern standard: full probabilistic forecasts, not point estimates (Gneiting & Raftery, 2007)
- Quality measured by strictly proper scoring rules (e.g. CRPS)
- Real applications: energy bidding, election forecasting, supply chain planning

**SCRIPT:**

In energy, logistics, finance, and public policy, better predictions lead to better decisions. The information needed for strong forecasts is often scattered across many sources — different companies, models, or individuals — each holding private data that is costly to share.

Combining multiple forecasts almost always beats relying on any single one. Different forecasters capture different aspects of reality, and combining them averages out individual errors.

The modern standard goes beyond point estimates. We combine full probabilistic forecasts — entire distributions that express both what we expect and how uncertain we are. The quality of these distributions is measured by strictly proper scoring rules, like the Continuous Ranked Probability Score. A scoring rule is strictly proper when the only way to maximise your expected score is to report your true belief. That mathematical property is what makes truthful participation incentive-compatible.

The open question: how do you get people to participate, and how do you decide whose forecast should count more?

---

## SLIDE 3 — Prediction Markets as a Solution

**ON SLIDE:**
- Problem: data owners won't share raw data (privacy, competition, cost)
- Solution: share predictions instead; reward based on quality
- Market structure (Raja et al., 2024): client posts task → players submit forecasts + wagers → operator aggregates → post-event settlement
- Real platforms: Numerai (data science tournaments), Polymarket (event prediction), Kalshi (regulated exchange)
- Warning: Polymarket wash trading peaked at ~60% of weekly volume, Dec 2024 (Sirolly et al., 2025)
- Warning: Polymarket election prices driven by small core of highly active traders — "specialised competition rather than democratic wisdom aggregation" (Wu, 2025)

**SCRIPT:**

Prediction markets offer a clean solution. Instead of asking people to hand over raw data, you ask them to submit a probabilistic forecast and reward them based on how accurate it turns out to be. The market aggregates individual predictions into a collective view, and participants are compensated for the value of their contribution. The raw data never leaves the forecaster's hands.

This is already happening. Numerai runs data science tournaments where participants stake cryptocurrency on their predictions. Polymarket and Kalshi operate prediction exchanges for events from elections to economic indicators.

But recent evidence reveals serious problems. Sirolly and colleagues found that wash trading on Polymarket — entities trading with themselves to inflate volume — peaked at roughly sixty per cent of weekly share volume in December 2024. Wu's analysis of Polymarket's election markets shows that prices are shaped by specialised competition among a small core of highly active traders, not broad participation.

Real forecasting markets are strategically adversarial in ways that classical forecast combination does not capture. This motivates mechanisms with stronger formal guarantees.

---

## SLIDE 4 — Existing Work

**ON SLIDE:**

Column 1 — Self-Financed Wagering:
- Lambert et al. (2008): weighted-score wagering mechanism (WSWM)
- 7 properties (Theorem 1): budget balance, anonymity, truthfulness, sybilproofness, normality, individual rationality, monotonicity
- Uniqueness (Section 5): WSWMs parameterised by total wager are the only mechanisms satisfying budget balance + anonymity + truthfulness + normality + sybilproofness
- Assumes risk-neutral players
- Raja et al. (2024): added client + utility component; conditionally truthful for players, truthful for client; wind energy case study (GEFcom2014); quantile averaging sharper than linear opinion pooling
- Limitation: history-free — each round independent

Column 2 — Online Forecast Aggregation:
- Online convex optimisation (OGD, Hedge) — learns time-varying weights with regret guarantees
- Limitation: assumes non-strategic, always-available forecasters; no payments

Column 3 — Intermittent Contributions:
- Vitali & Pinson (2025): online robust regression with correction matrix for missing forecasts
- Weights updated by online gradient descent on pinball loss, projected onto simplex
- Payoff: blend of in-sample Shapley + out-of-sample scoring
- Properties: budget balance, symmetry, zero-element, individual rationality, truthfulness
- Real case study: Belgian offshore wind; IEEE version: 9 sellers (3 NWP × 3 ML models)
- Limitation: relative weights on simplex; different settlement structure

**SCRIPT:**

To position my contribution, I need to describe three areas of existing work that each solve part of the problem but not all of it.

The first — and the one my work directly extends — is self-financed wagering mechanisms. Lambert and colleagues introduced the weighted-score wagering mechanism, where participants submit a forecast and a wager, and the pool is redistributed based on relative performance under a proper scoring rule. Their Theorem 1 establishes seven properties: budget balance, anonymity, truthfulness, sybilproofness, normality, individual rationality, and monotonicity. Their uniqueness result is stronger: WSWMs parameterised by total wager are the only mechanisms satisfying five of those properties simultaneously. This assumes risk-neutral players.

Raja and colleagues extended this to include a client who posts a task and a reward. Their mechanism is conditionally truthful for players — meaning a risk-averse player who lacks enough information to manipulate the system does best by reporting honestly — and truthful for the client. They demonstrated on a wind energy case study that quantile averaging produces sharper aggregates than linear opinion pooling. But both mechanisms are history-free. Each round is independent, with no memory of past performance.

Second, online forecast aggregation. Online convex optimisation learns time-varying weights with regret guarantees and can track changes in expert quality. But it assumes non-strategic, always-available forecasters and does not handle payments.

Third, Vitali and Pinson designed a market that handles missing submissions through a correction matrix in an online robust regression framework. Weights are updated by gradient descent on pinball loss and projected onto the simplex. Payoffs blend in-sample Shapley values with out-of-sample scoring. They demonstrated this on real Belgian offshore wind data — in the IEEE version, nine sellers built from three weather model sources and three machine learning models. But their weights are relative and their settlement structure differs from the self-financed wagering framework.

---

## SLIDE 5 — The Gap and My Contribution

**ON SLIDE:**
- Problem: "Stake alone is not a good proxy for information quality"
- Diagram: {High Wealth + Low Skill} → dominates aggregate in history-free mechanism
- Gap: no existing design couples self-financed wagering (with its guarantees) with an online skill-learning layer producing an absolute per-user skill signal
- Contribution: mechanism where effective wager = deposit × learned skill factor
  - Skill signal is absolute (not relative), pre-round (preserving truthfulness), handles intermittent participation
  - Mechanism preserves budget balance, sybilproofness, bounded loss

**SCRIPT:**

Here is the gap. The wagering mechanisms of Lambert and Raja have strong economic properties, but they are history-free. Stake alone determines influence, and stake is not a reliable proxy for information quality. A wealthy but poor forecaster can deposit a large wager and dominate the aggregate even when their predictions are consistently wrong.

Online learning can identify who is good over time, but it does not handle payments, incentives, or strategic behaviour. Vitali and Pinson bridge part of this gap, but their weights are relative and their settlement is structurally different.

No existing design couples self-financed wagering — with its guarantees of budget balance, sybilproofness, and truthfulness — with an online learning layer that produces an absolute, per-user skill signal.

That is what I built. The effective wager — the single object that determines both how much weight your forecast gets and how much money you have at risk — is your deposit multiplied by a learned skill factor. Strong past performance means nearly all of your deposit counts. Poor performance means most is refunded and only a fraction enters the market. The skill signal is absolute: it represents your reliability independently of who else participates. It is computed before the round begins, preserving truthfulness. And it handles intermittent participation through a staleness decay that prevents absent forecasters from freezing their reputation.
