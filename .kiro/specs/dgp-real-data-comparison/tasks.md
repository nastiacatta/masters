# Implementation Plan: DGP vs Real-Data Comparison

## Overview

Add five comparison slides to the existing Slides tab that juxtapose DGP simulation results with real-world Elia data and thesis theory claims. Implementation proceeds from shared utilities and types, through the data-fetching hook, to individual slide components, and finally wiring into SlidesPage.

## Tasks

- [ ] 1. Create shared types, utilities, and data-fetching hook
  - [x] 1.1 Create `src/lib/comparison/types.ts`
    - Define all TypeScript interfaces: `ComparisonRow`, `DgpConfig`, `DgpData`, `RealDataConfig`, `RealComparisonData`, `AggregatedRow`, `ThesisClaim`, `DepositSensitivityData`, `WindExperimentData`, `UseDataResult<T>`, `InsightCardProps`
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 9.1_

  - [x] 1.2 Create `src/lib/comparison/comparisonUtils.ts`
    - Implement `aggregateByMethod(rows)`: group by method, compute arithmetic mean of `mean_crps` and `delta_crps_vs_equal`, return `AggregatedRow[]`
    - Implement `formatCrps(value)`: format to 6 decimal places
    - Implement `formatDelta(value)`: format with sign prefix, return "—" for zero
    - Implement `formatPercent(value)`: format to 1 decimal place with % suffix
    - Implement `deltaColor(value)`: return green class for negative, red for positive, slate for zero
    - Implement `computeImprovement(uniformCrps, methodCrps)`: return `(uniformCrps - methodCrps) / uniformCrps * 100`, handle division by zero
    - Implement `findBestMethod(rows)`: return the method with the lowest CRPS from a non-empty array
    - _Requirements: 7.1, 7.2, 9.1, 9.2, 9.3, 9.4, 9.5, 1.5, 2.1_

  - [x] 1.3 Create `src/lib/comparison/useComparisonData.ts`
    - Implement `useComparisonData<T>(path, validate?)` hook returning `{ data, error, loading }`
    - Use `useEffect` + `fetch` with `AbortController` for cleanup on unmount
    - Accept optional type guard for runtime validation
    - Follow the same pattern as the existing `ResultsSlide` fetch logic
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 1.4 Write property test for multi-seed aggregation (Property 1)
    - **Property 1: Multi-seed aggregation produces correct arithmetic means**
    - Generate 100+ random `ComparisonRow[]` arrays with 1–5 methods and 1–20 seeds each
    - Verify `aggregateByMethod` output matches hand-computed arithmetic means for `meanCrps`, `meanDelta`, and `seedCount`
    - **Validates: Requirements 1.1, 7.1, 7.2**

  - [ ] 1.5 Write property test for delta formatting and coloring (Property 2)
    - **Property 2: Delta formatting and coloring are sign-consistent**
    - Generate 100+ random numbers (including 0, negatives, positives, very small values)
    - Verify `formatDelta` and `deltaColor` produce sign-consistent outputs with correct formatting (6 decimal digits for non-zero)
    - **Validates: Requirements 9.2, 9.4, 9.5**

  - [ ] 1.6 Write property test for percentage improvement computation (Property 3)
    - **Property 3: Percentage improvement computation**
    - Generate 100+ random pairs of (uniformCrps > 0, methodCrps ≥ 0)
    - Verify `computeImprovement` matches `(uniformCrps - methodCrps) / uniformCrps * 100`
    - Verify `formatPercent` output ends with "%" and has 1 decimal
    - **Validates: Requirements 2.1, 9.3**

  - [ ] 1.7 Write property test for best method identification (Property 4)
    - **Property 4: Best method identification selects minimum CRPS**
    - Generate 100+ random non-empty arrays of `{ method, crps }` with distinct CRPS values
    - Verify the best-method function returns the entry with minimum CRPS
    - **Validates: Requirements 1.5**

- [x] 2. Checkpoint — Ensure shared utilities compile and all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create InsightCard and DgpSummarySlide
  - [x] 3.1 Create `src/components/slides/comparison/InsightCard.tsx`
    - Implement reusable card component accepting `InsightCardProps` (icon, color, title, description)
    - Use Tailwind styling consistent with existing slide components
    - _Requirements: 2.3, 2.4, 3.2, 3.3, 3.4_

  - [x] 3.2 Create `src/components/slides/comparison/DgpSummarySlide.tsx`
    - Fetch DGP data from `data/core 2/experiments/master_comparison/data/master_comparison.json`
    - Fetch electricity data from `data/real_data/elia_electricity/data/comparison.json`
    - Fetch wind data from `data/real_data/elia_wind/data/comparison.json`
    - Use `useComparisonData` hook for each fetch
    - Aggregate DGP rows via `aggregateByMethod`
    - Render a Comparison_Table with one row per method (uniform, skill, mechanism, best_single) and columns for DGP mean CRPS, DGP mean ΔCRPS, electricity CRPS, electricity ΔCRPS, wind CRPS, wind ΔCRPS
    - Highlight the best-performing method (lowest CRPS) within each dataset column
    - Display "averaged over N seeds" footnote for DGP column
    - Handle partial failure: show error banner per dataset, render successful datasets
    - Use `SlideWrapper` for layout
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 6.3, 6.4, 7.1, 7.2, 7.3, 8.1, 8.2, 8.4, 9.1, 9.2, 9.4, 9.5_

- [x] 4. Create MechanismImprovementSlide and BestSingleAnomalySlide
  - [x] 4.1 Create `src/components/slides/comparison/MechanismImprovementSlide.tsx`
    - Fetch DGP, electricity, and wind data using `useComparisonData`
    - Display percentage improvement of mechanism over uniform for each dataset using `computeImprovement`
    - Display absolute ΔCRPS of mechanism vs uniform for each dataset
    - Render InsightCard: electricity improvement is tiny (ΔCRPS ≈ −0.000061) while wind is substantial (≈ −0.0196, ~21%)
    - Render InsightCard: DGP shows reliable improvement because latent truth is identifiable
    - Handle partial failure per dataset
    - Use `SlideWrapper` for layout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.3, 6.4, 8.1, 8.2, 8.4, 9.1, 9.2, 9.3_

  - [x] 4.2 Create `src/components/slides/comparison/BestSingleAnomalySlide.tsx`
    - Fetch DGP, electricity, and wind data using `useComparisonData`
    - Display best_single CRPS alongside mechanism CRPS for each dataset
    - Render InsightCard: wind best_single (≈0.033) dominates all aggregation (mechanism ≈0.073)
    - Render InsightCard: DGP aggregation can approach/beat best_single due to identifiable latent truth
    - Note for electricity: best_single beats aggregation but gap is smaller than wind
    - Handle partial failure per dataset
    - Use `SlideWrapper` for layout
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.3, 6.4, 8.1, 8.2, 8.4, 9.1, 9.2_

- [x] 5. Create TheoryValidationSlide and WindExtendedSlide
  - [x] 5.1 Create `src/components/slides/comparison/TheoryValidationSlide.tsx`
    - Fetch thesis claims from `data/thesis_results.json` using `useComparisonData`
    - Fetch DGP, electricity, and wind data for evidence
    - Display "skill improves accuracy" claim with DGP ΔCRPS as confirming evidence and electricity ΔCRPS as weak-confirmation
    - Display "equal weighting is a strong baseline" claim with electricity ΔCRPS as strong support and wind ΔCRPS as counter-evidence
    - If thesis data fails to load, show error but still render DGP/real-data content
    - Use `SlideWrapper` for layout
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.3, 6.4, 8.1, 8.2, 8.4_

  - [x] 5.2 Create `src/components/slides/comparison/WindExtendedSlide.tsx`
    - Fetch `day_ahead.json`, `4h_ahead.json`, `deposit_sensitivity.json`, `regime_shift.json` from `data/real_data/elia_wind/data/` using `useComparisonData`
    - Display summary rows for day-ahead and 4h-ahead showing method, mean CRPS, ΔCRPS vs uniform
    - Display deposit sensitivity results showing mechanism improvement across deposit policies (fixed, exponential, bankroll)
    - Display regime shift results showing mechanism performance under non-stationarity
    - Handle partial failure per experiment file
    - Use `SlideWrapper` for layout
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.3, 6.4, 8.1, 8.2, 8.4, 9.1, 9.2, 9.3_

- [x] 6. Checkpoint — Ensure all slide components compile without errors
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Wire comparison slides into SlidesPage
  - [x] 7.1 Update `src/pages/SlidesPage.tsx`
    - Import all 5 comparison slide components from `src/components/slides/comparison/`
    - Insert them after the Wind ResultsSlide and before KeyFindingsSlide
    - Render in order: DgpSummarySlide → MechanismImprovementSlide → BestSingleAnomalySlide → TheoryValidationSlide → WindExtendedSlide
    - _Requirements: 6.1, 6.2_

  - [ ] 7.2 Write unit tests for slide ordering and integration
    - Verify the 5 comparison slides appear after Wind Results and before KeyFindings
    - Verify each comparison slide renders inside a SlideWrapper
    - Mock fetch calls; verify partial failure renders error banner per dataset
    - Verify loading indicators appear and disappear correctly
    - Verify "averaged over N seeds" footnote appears with correct N
    - _Requirements: 6.1, 6.2, 6.3, 7.3, 8.1, 8.2_

- [x] 8. Final checkpoint — Ensure all components compile, slides render in correct order, data loads correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design uses TypeScript + React + Tailwind CSS, matching the existing dashboard stack
- Property tests use `fast-check` (already in devDependencies)
- The `useComparisonData` hook follows the same `useEffect` + `AbortController` pattern as the existing `ResultsSlide`
- Each slide fetches its own data independently; partial failure in one dataset does not block others
- DGP data path includes a space: `data/core 2/experiments/master_comparison/data/master_comparison.json`
- All formatting functions are pure and shared from `comparisonUtils.ts` for consistency across slides
