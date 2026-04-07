# Implementation Plan: Behaviour Analysis Redesign

## Overview

Restructure the Behaviour Analysis page from 6 tabs / 9 presets to 11 tabs / 19 presets around the full 9-family taxonomy. Bottom-up: simulation engine, shared components, page restructuring, family tabs, interactive config. TypeScript (React 19 + Vite). Existing shared utilities consumed but not modified.

## Tasks

- [x] 1. Expand simulation engine with new data models and presets
  - [x] 1.1 Add new types and interfaces to the behaviour module
    - Create `dashboard/src/lib/behaviour/hiddenAttributes.ts` with `HiddenAttributes`, `PresetConfig`, `BehaviourFamily`, `TaxonomyItem`
    - Create `dashboard/src/lib/behaviour/presetMeta.ts` with full 19-preset config
    - Create `dashboard/src/lib/behaviour/taxonomyData.ts` with `TAXONOMY_ITEMS` (46 items, 9 families)
    - Export `MechanismResponseMetrics` from `dashboard/src/lib/behaviour/mechanismMetrics.ts`
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 14.1_
  - [x] 1.2 Expand `BehaviourPresetId` union type to 19 presets
    - Update in `scenarioSimulator.ts` adding 10 new IDs and `PRESET_META` entries
    - _Requirements: 14.1_
  - [x] 1.3 Implement 10 new preset behaviours in `buildRoundBehaviour()` in `runPipeline.ts`
    - `biased`, `miscalibrated`, `noisy_reporter`, `budget_constrained`, `house_money`, `kelly_sizer`, `reputation_gamer`, `sandbagger`, `reinforcement_learner`, `latency_exploiter`
    - _Requirements: 14.1, 14.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 9.1, 9.2_
  - [x]* 1.4 Write property test: all 19 presets produce valid PipelineResult
    - **Property 19: All presets produce valid ScenarioResult**
    - **Validates: Requirements 14.1, 14.3**
  - [x]* 1.5 Write property test: simulation determinism
    - **Property 21: Simulation determinism**
    - **Validates: Requirements 14.4**
  - [x]* 1.6 Write property test: biased preset produces biased reports
    - **Property 20: Biased preset produces biased reports**
    - **Validates: Requirements 14.2**

- [x] 2. Checkpoint — Verify simulation engine
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement mechanism response metrics and hooks
  - [x] 3.1 Create `useMechanismMetrics` hook in `dashboard/src/hooks/useMechanismMetrics.ts`
    - Compute skillRecoveryRounds, wealthPenalty, aggregateContamination, concentrationImpact, ewmaHalfLife
    - _Requirements: 15.1, 15.4_
  - [x] 3.2 Create `useScenarioRun` hook in `dashboard/src/hooks/useScenarioRun.ts`
    - Wrap `runPipeline()` in `useMemo`; return `{ result, isStale }`
    - _Requirements: 12.2_
  - [x]* 3.3 Write property test: mechanism response metrics completeness
    - **Property 22: Mechanism response metrics completeness**
    - **Validates: Requirements 15.1, 15.3**
  - [x]* 3.4 Write property test: EWMA half-life correctness
    - **Property 23: EWMA half-life correctness**
    - **Validates: Requirements 15.4**


- [x] 4. Build shared behaviour components
  - [x] 4.1 Create `FamilyCard` in `dashboard/src/components/behaviour/FamilyCard.tsx`
    - Family name, description, sub-items as pills with coverage status indicators
    - _Requirements: 1.2_
  - [x]* 4.2 Write property test: FamilyCard displays all required fields
    - **Property 1: FamilyCard displays all required fields**
    - **Validates: Requirements 1.2**
  - [x] 4.3 Create `CoverageAudit` in `dashboard/src/components/behaviour/CoverageAudit.tsx`
    - Aggregate stats bar, per-family coverage bars, clickable experiment items
    - _Requirements: 1.3, 13.1, 13.2, 13.4_
  - [x]* 4.4 Write property test: coverage statistics are mathematically correct
    - **Property 2: Coverage statistics are mathematically correct**
    - **Validates: Requirements 1.3, 13.2**
  - [x]* 4.5 Write property test: experiment-backed item click navigates to correct tab
    - **Property 3: Experiment-backed item click navigates to correct tab**
    - **Validates: Requirements 1.4, 13.3**
  - [x]* 4.6 Write property test: coverage audit groups items correctly by family
    - **Property 18: Coverage audit groups items correctly by family**
    - **Validates: Requirements 13.1, 13.4**
  - [x] 4.7 Create `ComparisonTable` in `dashboard/src/components/behaviour/ComparisonTable.tsx`
    - Sortable columns, default sort by delta CRPS descending, colour-coded delta cells, row click
    - _Requirements: 11.1, 11.2, 11.3, 11.5_
  - [x]* 4.8 Write property test: ComparisonTable contains all required columns
    - **Property 13: ComparisonTable contains all required columns**
    - **Validates: Requirements 11.1**
  - [x]* 4.9 Write property test: ComparisonTable sort correctness
    - **Property 14: ComparisonTable sort correctness**
    - **Validates: Requirements 11.2, 11.3**
  - [x]* 4.10 Write property test: ComparisonTable delta CRPS colour coding
    - **Property 15: ComparisonTable delta CRPS colour coding**
    - **Validates: Requirements 11.5**
  - [x] 4.11 Create `FamilyImpactChart` in `dashboard/src/components/behaviour/FamilyImpactChart.tsx`
    - Grouped bar chart: worst-case delta CRPS per family via Recharts
    - _Requirements: 11.4_
  - [x] 4.12 Create `ParamConfigPanel` in `dashboard/src/components/behaviour/ParamConfigPanel.tsx`
    - Slider + numeric input per param, min/max labels, reset button, loading overlay
    - _Requirements: 12.1, 12.3, 12.4, 12.5_
  - [x]* 4.13 Write property test: config panel shows correct parameters with ranges
    - **Property 16: Config panel shows correct parameters with ranges**
    - **Validates: Requirements 12.1, 12.3**
  - [x] 4.14 Create `MechanismResponseCard` in `dashboard/src/components/behaviour/MechanismResponseCard.tsx`
    - Four metric values, attack vector, defence mechanism, effectiveness percentage
    - _Requirements: 15.1, 15.3_
  - [x] 4.15 Create `GenerativeModelCard` in `dashboard/src/components/behaviour/GenerativeModelCard.tsx`
    - Hidden attributes table, distributions, CRRA formula card
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x]* 4.16 Write property test: preset selection shows correct hidden attributes
    - **Property 4: Preset selection shows correct hidden attributes**
    - **Validates: Requirements 3.2, 3.3**
  - [x] 4.17 Create `ArchitectureDiagram` in `dashboard/src/components/behaviour/ArchitectureDiagram.tsx`
    - Block A / Block B with Behaviour Contract arrows, hover tooltips, Framer Motion animation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Checkpoint — Verify shared components
  - Ensure all tests pass, ask the user if questions arise.


- [x] 6. Restructure BehaviourPage with 11-tab navigation and Overview tab
  - [x] 6.1 Refactor `BehaviourPage.tsx` tab structure from 6 to 11 tabs
    - Overview, Participation, Information, Reporting, Staking, Objectives, Identity, Learning, Adversarial, Operational, Sensitivity
    - Add tab indicator for experiment-backed vs taxonomy-only status
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x]* 6.2 Write property test: tab content indicator correctness
    - **Property 12: Tab content indicator correctness**
    - **Validates: Requirements 10.3, 10.4**
  - [x] 6.3 Implement OverviewTab
    - ArchitectureDiagram, 9 FamilyCards grid, CoverageAudit, ComparisonTable, FamilyImpactChart
    - Wire clicks to tab navigation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 11.1, 11.4, 13.1_
  - [x] 6.4 Add simulation runs for all 19 presets in BehaviourPage
    - Add `useMemo` calls for 10 new presets; build expanded `behaviourSummary`
    - _Requirements: 14.1, 11.1_

- [x] 7. Implement family tabs — Participation, Information, Reporting
  - [x] 7.1 Implement ParticipationTab
    - Migrate bursty experiment; add selective entry; ParamConfigPanel; GenerativeModelCard
    - _Requirements: 1.1, 12.1_
  - [x] 7.2 Implement InformationTab
    - Bias, miscalibration, correlated errors experiments; costly info placeholder; ParamConfigPanel
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x]* 7.3 Write property test: bias experiment error reflects bias magnitude
    - **Property 5: Bias experiment error reflects bias magnitude**
    - **Validates: Requirements 4.2**
  - [x]* 7.4 Write property test: warning indicator for slow skill downweighting
    - **Property 6: Warning indicator for slow skill downweighting**
    - **Validates: Requirements 4.5**
  - [x] 7.5 Implement ReportingTab
    - Noisy reporting, reputation gaming, sandbagging; migrate hedged reports; ParamConfigPanel
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x]* 7.6 Write property test: noisy reporting CRPS degradation scales with noise
    - **Property 7: Noisy reporting CRPS degradation scales with noise**
    - **Validates: Requirements 5.2**

- [x] 8. Checkpoint — Verify Participation, Information, Reporting tabs
  - Ensure all tests pass, ask the user if questions arise.


- [x] 9. Implement family tabs — Staking, Objectives, Identity
  - [x] 9.1 Implement StakingTab
    - Budget constraints, house-money, Kelly-like sizing; migrate deposit policy comparison; ParamConfigPanel
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x]* 9.2 Write property test: budget-constrained ruin detection
    - **Property 8: Budget-constrained ruin detection**
    - **Validates: Requirements 6.2**
  - [x] 9.3 Implement ObjectivesTab
    - CRRA comparison (gamma = 0, 0.5, 1, 2), loss aversion, preference heterogeneity; CRRA formula card
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [x]* 9.4 Write property test: higher CRRA gamma produces lower deposits
    - **Property 9: Higher CRRA gamma produces lower deposits**
    - **Validates: Requirements 8.2**
  - [x] 9.5 Implement IdentityTab
    - Migrate sybil, collusion, reputation_reset; MechanismResponseCards; phase transition marker
    - _Requirements: 1.1, 15.1, 15.2_

- [x] 10. Implement family tabs — Learning, Adversarial, Operational
  - [x] 10.1 Implement LearningTab
    - Reinforcement from profits experiment; rule learning and exploration placeholders; ParamConfigPanel
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [x]* 10.2 Write property test: reinforcement learner profit-participation correlation
    - **Property 10: Reinforcement learner profit-participation correlation**
    - **Validates: Requirements 7.2**
  - [x] 10.3 Implement AdversarialTab (restructured)
    - Migrate manipulator, arbitrageur, evader; MechanismResponseCards; defence summaries; EWMA half-life
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  - [x] 10.4 Implement OperationalTab
    - Latency experiment; interface errors and automation placeholders; ParamConfigPanel
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [x]* 10.5 Write property test: latency exploiter information advantage
    - **Property 11: Latency exploiter information advantage**
    - **Validates: Requirements 9.2**

- [x] 11. Checkpoint — Verify all family tabs
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Wire interactive parameter configuration and Sensitivity tab
  - [x] 12.1 Wire ParamConfigPanel to simulation re-runs across all family tabs
    - Local `useState` for tunable params; `useMemo` dependency triggers re-run; reset to defaults
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [x]* 12.2 Write property test: parameter change produces different simulation results
    - **Property 17: Parameter change produces different simulation results**
    - **Validates: Requirements 12.2**
  - [x] 12.3 Update SensitivityTab with expanded presets
    - Extend lambda x sigma_min sweep; add preset selector for all 19 presets
    - _Requirements: 10.1_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Property tests validate the 23 correctness properties from the design document
- All simulations use `runPipeline()` as the primary simulation path
- Taxonomy-only tabs display a "Taxonomy only — no simulation data" indicator per Requirement 10.4
