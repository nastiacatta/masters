# Requirements Document

## Introduction

This document specifies requirements for a comprehensive redesign of the Behaviour Analysis section of the thesis dashboard. The current BehaviourPage covers 9 behaviour presets across 6 tabs (Taxonomy, Intermittency, Adversarial, Hedging, Seasonality, Sensitivity), but the underlying taxonomy from the thesis describes a much richer two-block architecture: Block A (core mechanism as a pure state machine) and Block B (user behaviour as agent policies). The BEHAVIOUR_COVERAGE.md audit reveals significant gaps: many behaviours from the full taxonomy (bias, miscalibration, budget constraints, learning, operational frictions, etc.) are "taxonomy only" or absent from the dashboard entirely.

This redesign restructures the behaviour analysis around the complete 9-family taxonomy, introduces a user-level generative model (sample stable hidden attributes per agent, then generate per-round actions conditional on attributes and evolving platform state), and closes the coverage gaps identified in the audit. The thesis research question is: "Can combining stake with an online, time-varying skill layer improve aggregate forecasts under non-stationarity, strategic behaviour, and intermittent participation?"

## Glossary

- **Behaviour_Page**: The `/behaviour` route in the Dashboard that presents behaviour analysis experiments and taxonomy.
- **Block_A**: The core mechanism (platform, deterministic): scoring rule application, aggregation and weights, settlement and payoffs, skill update. Treated as a pure state machine.
- **Block_B**: User behaviour (agent/environment, strategic): participation, belief formation, reporting, wager, identity strategy. Treated as agent policies.
- **Behaviour_Contract**: The interface between Block_B and Block_A: each user is a policy that outputs (participate, report, deposit) per round; the mechanism consumes only these observable actions.
- **Agent_Policy**: A function mapping (hidden attributes, platform state, round) → (participate, report, deposit). Represents one user's complete behavioural strategy.
- **Hidden_Attributes**: Stable per-agent parameters sampled once at creation: intrinsic skill (signal precision), risk aversion (CRRA γ), participation baseline, bias, budget, identity count. These do not change across rounds.
- **CRRA**: Constant Relative Risk Aversion utility function u(w) = w^(1−γ)/(1−γ) used to model agent preferences over wealth.
- **Behaviour_Family**: One of the 9 top-level categories in the taxonomy: Participation, Information, Reporting, Staking, Objectives, Identity, Learning, Adversarial, Operational.
- **Behaviour_Preset**: A named configuration of Agent_Policy parameters that produces a specific behavioural pattern (e.g., baseline, bursty, manipulator, sybil).
- **User_Generator**: The generative model that samples Hidden_Attributes per agent and produces per-round actions conditional on those attributes and evolving platform state.
- **Scenario_Simulator**: The `simulateScenario()` function in `scenarioSimulator.ts` that runs a Behaviour_Preset through the core mechanism for a specified number of rounds.
- **Coverage_Matrix**: A visual summary showing which Behaviour_Family items have dedicated experiments vs taxonomy-only status.
- **runPipeline**: The main simulation function that composes DGP → behaviour → core mechanism → results for T rounds.
- **Skill_Gate**: The function g(σ) = λ + (1−λ)σ^η that modulates effective wager based on estimated skill.
- **EWMA**: Exponentially Weighted Moving Average used for online skill estimation: L_{i,t} = (1−ρ)L_{i,t-1} + ρ·ℓ_{i,t}.
- **Family_Card**: A UI component displaying one Behaviour_Family with its sub-items, coverage status, and entry points to experiments.
- **Comparison_Table**: A tabular component showing metrics (CRPS, Gini, N_eff, participation, Δ vs baseline) across multiple Behaviour_Presets.

## Requirements

### Requirement 1: Expanded Behaviour Taxonomy with Full 9-Family Coverage

**User Story:** As a thesis reader, I want to see the complete behaviour taxonomy organised into all 9 families from the thesis, so that I understand the full scope of strategic behaviours the mechanism must handle.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL display all 9 Behaviour_Families as Family_Cards: Participation and Timing, Information and Belief Formation, Reporting Strategy, Staking and Bankroll Management, Objectives and Preferences, Identity and Account Management, Learning and Meta-Strategy, Adversarial Behaviours, Operational Frictions.
2. WHEN a user views a Family_Card, THE Family_Card SHALL display the family name, a one-sentence description, a list of sub-items within that family, and a coverage indicator (experiment-backed, taxonomy-only, or not covered) for each sub-item.
3. THE Behaviour_Page SHALL display a Coverage_Matrix summary showing the count of experiment-backed vs taxonomy-only vs not-covered items per Behaviour_Family.
4. WHEN a user clicks a sub-item that has an experiment, THE Behaviour_Page SHALL navigate to the corresponding experiment tab or section.

### Requirement 2: Two-Block Architecture Visualisation

**User Story:** As a thesis reader, I want to see the separation between Block A (core mechanism) and Block B (user behaviour) clearly visualised, so that I understand the contract-based architecture of the forecast market.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL display a diagram showing Block_A (core mechanism as state machine) and Block_B (agent policies) with the Behaviour_Contract interface between them.
2. THE diagram SHALL label the Behaviour_Contract outputs: (participate: boolean, report: number, deposit: number) flowing from Block_B to Block_A.
3. THE diagram SHALL label the platform state flowing back from Block_A to Block_B: (wealth, skill estimate σ, aggregate forecast, round number).
4. WHEN a user hovers over a block in the diagram, THE Behaviour_Page SHALL highlight the corresponding components and display a tooltip with a one-sentence description.

### Requirement 3: User-Level Generative Model Configuration

**User Story:** As a thesis reader, I want to understand and configure the user-level generative model that produces agent behaviours, so that I can see how hidden attributes drive observable actions.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL display the User_Generator model structure: sample Hidden_Attributes per agent, then generate per-round actions conditional on attributes and platform state.
2. THE Behaviour_Page SHALL display the Hidden_Attributes with their distributions: intrinsic skill (signal precision), CRRA risk aversion parameter γ, participation baseline probability, systematic bias, initial budget, and identity count.
3. WHEN a user selects a Behaviour_Preset, THE Behaviour_Page SHALL display the corresponding Hidden_Attributes configuration as a parameter summary card.
4. THE Behaviour_Page SHALL display the CRRA utility function formula: u(w) = w^(1−γ)/(1−γ) with an explanation of how γ maps to risk-neutral (γ=0), risk-averse (γ>0), and risk-seeking (γ<0) behaviour.

### Requirement 4: Information and Belief Formation Experiments

**User Story:** As a thesis reader, I want to see experiments covering bias, miscalibration, correlated errors, and costly information, so that I understand how belief formation quality affects the mechanism.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL include an Information tab with experiments for: systematic bias, miscalibration (overconfidence/underconfidence), correlated errors across agents, and costly information acquisition.
2. WHEN a bias experiment is run, THE Behaviour_Page SHALL display the aggregate forecast error compared to the unbiased baseline, showing how the skill layer downweights biased agents over time.
3. WHEN a miscalibration experiment is run, THE Behaviour_Page SHALL display calibration curves (predicted quantile vs observed frequency) for miscalibrated agents alongside well-calibrated agents.
4. WHEN a correlated-errors experiment is run, THE Behaviour_Page SHALL display the effective number of independent signals (N_eff) and show how correlated errors reduce diversity in the aggregate.
5. IF a belief formation experiment produces results where the mechanism fails to downweight poor forecasters within 50 rounds, THEN THE Behaviour_Page SHALL display a warning indicator on the corresponding metric.

### Requirement 5: Expanded Reporting Strategy Experiments

**User Story:** As a thesis reader, I want to see experiments covering noisy reporting, reputation gaming, and sandbagging, so that I understand the full range of reporting distortions.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL include experiments for: noisy/sloppy reporting (random noise added to truthful reports), reputation gaming (agents who sacrifice short-term accuracy to inflate σ), and sandbagging (agents who deliberately underperform to lower expectations).
2. WHEN a noisy-reporting experiment is run, THE Behaviour_Page SHALL display the noise level (standard deviation of added noise) alongside the resulting CRPS degradation and σ trajectory.
3. WHEN a reputation-gaming experiment is run, THE Behaviour_Page SHALL display the attacker's σ trajectory over time, showing whether the gaming strategy succeeds in inflating skill estimates.
4. WHEN a sandbagging experiment is run, THE Behaviour_Page SHALL display the agent's true skill vs estimated skill (σ) over time, and the payoff difference compared to truthful reporting.

### Requirement 6: Expanded Staking and Bankroll Management Experiments

**User Story:** As a thesis reader, I want to see experiments covering budget constraints, house-money effects, lumpy bets, and Kelly-like sizing, so that I understand how staking strategies interact with the skill gate.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL include a Staking tab with experiments for: budget-constrained agents (finite wealth that can run out), house-money effect (increased risk-taking after gains), lumpy/discrete bets (agents who can only stake in fixed increments), and Kelly-like stake sizing (deposit proportional to estimated edge).
2. WHEN a budget-constraint experiment is run, THE Behaviour_Page SHALL display the number of agents who reach ruin (wealth below minimum deposit threshold) and the round at which ruin occurs.
3. WHEN a house-money experiment is run, THE Behaviour_Page SHALL display the wealth trajectory alongside the deposit trajectory, showing how deposits increase after gains and decrease after losses.
4. WHEN a Kelly-like sizing experiment is run, THE Behaviour_Page SHALL display the deposit-as-fraction-of-wealth trajectory compared to fixed-fraction and σ-scaled deposit policies.
5. THE Behaviour_Page SHALL display a deposit policy comparison chart showing CRPS, Gini, and N_eff for each staking strategy side by side.

### Requirement 7: Learning and Meta-Strategy Experiments

**User Story:** As a thesis reader, I want to see experiments covering reinforcement from profits, rule learning, and exploration vs exploitation, so that I understand how adaptive agents interact with the mechanism over time.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL include a Learning tab with experiments for: reinforcement from profits (agents who increase participation after profitable rounds), rule learning (agents who adapt their reporting strategy based on observed mechanism behaviour), and exploration vs exploitation (agents who balance trying new strategies against exploiting known profitable ones).
2. WHEN a reinforcement experiment is run, THE Behaviour_Page SHALL display the correlation between lagged profit and next-round participation probability, alongside the resulting participation trajectory.
3. WHEN a rule-learning experiment is run, THE Behaviour_Page SHALL display the agent's strategy parameter trajectory over time (e.g., bias magnitude, deposit fraction) showing convergence or oscillation.
4. WHEN an exploration-vs-exploitation experiment is run, THE Behaviour_Page SHALL display the cumulative regret curve comparing the adaptive agent to an oracle that always plays the optimal fixed strategy.

### Requirement 8: Objectives and Preferences Experiments

**User Story:** As a thesis reader, I want to see experiments comparing expected-value maximisers with CRRA utility maximisers and agents with non-monetary motives, so that I understand how heterogeneous preferences affect the aggregate.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL include an Objectives tab with experiments for: expected-value vs CRRA utility maximisation, loss aversion (asymmetric sensitivity to gains vs losses), and non-monetary motives (agents who value participation or reputation independently of payoff).
2. WHEN a CRRA comparison experiment is run, THE Behaviour_Page SHALL display deposit trajectories for agents with different γ values (0, 0.5, 1, 2) on the same chart, showing how risk aversion reduces staking.
3. WHEN a loss-aversion experiment is run, THE Behaviour_Page SHALL display the wealth trajectory showing asymmetric responses to gains and losses, and the resulting Gini coefficient compared to the symmetric baseline.
4. THE Behaviour_Page SHALL display a preference heterogeneity summary showing how mixing agents with different γ values affects aggregate CRPS compared to a homogeneous population.

### Requirement 9: Operational Frictions Experiments

**User Story:** As a thesis reader, I want to see experiments covering latency, interface errors, and automation patterns, so that I understand how real-world operational issues affect mechanism performance.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL include an Operational tab with experiments for: submission latency (reports arrive after the outcome is partially revealed), interface errors (agents accidentally submit wrong values), and automation patterns (bot-like agents with zero-variance timing and reports).
2. WHEN a latency experiment is run, THE Behaviour_Page SHALL display the information advantage of late-submitting agents and the resulting impact on aggregate fairness (Gini, N_eff).
3. WHEN an interface-error experiment is run, THE Behaviour_Page SHALL display the error rate alongside the mechanism's ability to recover (σ trajectory after erroneous submissions).
4. WHEN an automation experiment is run, THE Behaviour_Page SHALL display the detection signal (variance of submission timing and report precision) that distinguishes automated from human agents.

### Requirement 10: Restructured Tab Navigation

**User Story:** As a thesis reader, I want the behaviour analysis tabs to be organised around the 9-family taxonomy rather than ad-hoc groupings, so that I can systematically explore each behaviour category.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL organise content into tabs aligned with the taxonomy: Overview (taxonomy + architecture), Participation, Information, Reporting, Staking, Objectives, Identity, Learning, Adversarial, Operational, Sensitivity.
2. WHEN a user switches tabs, THE Behaviour_Page SHALL animate the transition with a fade and vertical slide (150ms duration).
3. THE Behaviour_Page SHALL display a tab indicator showing which tabs have experiment-backed content vs taxonomy-only content.
4. WHILE a tab contains only taxonomy-level content without experiments, THE Behaviour_Page SHALL display a "Taxonomy only — no simulation data" indicator and show the theoretical description of the behaviour family.

### Requirement 11: Enhanced Cross-Behaviour Comparison

**User Story:** As a thesis reader, I want to compare the impact of different behaviours on mechanism performance in a single unified view, so that I can identify which behaviours pose the greatest threat.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL display a Comparison_Table covering all Behaviour_Presets with columns: Behaviour name, Family, Mean CRPS, Δ CRPS vs baseline (%), Gini, N_eff, Mean participation rate.
2. THE Comparison_Table SHALL sort rows by Δ CRPS vs baseline by default, with the most damaging behaviours at the top.
3. WHEN a user clicks a column header in the Comparison_Table, THE Comparison_Table SHALL re-sort by that column.
4. THE Behaviour_Page SHALL display a grouped bar chart showing CRPS impact by Behaviour_Family, aggregating the worst-case Δ CRPS from each family.
5. THE Comparison_Table SHALL colour-code the Δ CRPS column: green for improvements (< −1%), grey for neutral (−1% to +1%), red for degradation (> +1%).

### Requirement 12: Behaviour Preset Configuration Panel

**User Story:** As a thesis reader, I want to adjust behaviour parameters interactively and see the simulation results update, so that I can explore the sensitivity of the mechanism to different behavioural assumptions.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL provide a configuration panel for each Behaviour_Preset showing the adjustable parameters (e.g., participation probability, bias magnitude, risk aversion γ, deposit fraction, noise scale).
2. WHEN a user adjusts a parameter in the configuration panel, THE Behaviour_Page SHALL re-run the simulation with the updated parameter and display the new results within 2 seconds.
3. THE configuration panel SHALL display parameter ranges with sensible defaults and min/max bounds.
4. THE configuration panel SHALL display a "Reset to default" button that restores the preset's original parameter values.
5. IF a simulation takes longer than 2 seconds, THEN THE Behaviour_Page SHALL display a progress indicator and disable parameter controls until the simulation completes.

### Requirement 13: Behaviour Coverage Audit Dashboard

**User Story:** As a thesis reader, I want to see a clear audit of which behaviours from the taxonomy are covered by experiments and which are not, so that I understand the scope and limitations of the analysis.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL display a coverage audit section listing all items from the 9-family taxonomy with their coverage status: experiment-backed, taxonomy-only, or not covered.
2. THE coverage audit SHALL display aggregate statistics: total items, experiment-backed count, taxonomy-only count, not-covered count, and overall coverage percentage.
3. WHEN a user clicks an experiment-backed item in the coverage audit, THE Behaviour_Page SHALL navigate to the corresponding experiment view.
4. THE coverage audit SHALL group items by Behaviour_Family and display a per-family coverage bar showing the proportion of experiment-backed items.

### Requirement 14: Expanded Behaviour Presets in Simulation Engine

**User Story:** As a thesis reader, I want the simulation engine to support new behaviour presets beyond the current 9, so that the dashboard can demonstrate the full taxonomy.

#### Acceptance Criteria

1. THE Scenario_Simulator SHALL support new Behaviour_Presets for: biased reporter, miscalibrated reporter, noisy reporter, budget-constrained agent, house-money agent, Kelly-sizer, reputation gamer, sandbagger, reinforcement learner, and latency exploiter.
2. WHEN a new Behaviour_Preset is selected, THE Scenario_Simulator SHALL generate agent actions using the corresponding Agent_Policy with the preset's Hidden_Attributes configuration.
3. THE Scenario_Simulator SHALL produce the same output interface (ScenarioResult with rounds, finalAgents, summary) for all Behaviour_Presets, including new ones.
4. FOR ALL Behaviour_Presets, running the Scenario_Simulator with the same seed SHALL produce identical results (deterministic simulation).

### Requirement 15: Behaviour-Mechanism Interaction Metrics

**User Story:** As a thesis reader, I want to see metrics that specifically measure how the mechanism responds to each behaviour, so that I can evaluate the mechanism's robustness properties.

#### Acceptance Criteria

1. THE Behaviour_Page SHALL display mechanism response metrics for each Behaviour_Preset: skill recovery time (rounds for σ to drop below 0.5 after attack onset), wealth penalty (attacker's final wealth vs honest baseline), aggregate contamination (peak Δ CRPS during attack), and concentration impact (Δ Gini vs baseline).
2. WHEN a behaviour involves a phase transition (e.g., reputation reset switching from honest to attack), THE Behaviour_Page SHALL display the transition point on time-series charts with a vertical reference line and label.
3. THE Behaviour_Page SHALL display a mechanism defence summary card for each adversarial behaviour, stating: the attack vector, the defence mechanism (skill gate, EWMA decay, weight cap), and the measured effectiveness (quantified as % of attack impact absorbed).
4. THE Behaviour_Page SHALL display the EWMA half-life (ln(2)/ρ rounds) as a reference metric alongside skill recovery times.
