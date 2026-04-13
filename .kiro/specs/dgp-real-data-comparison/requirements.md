# Requirements Document

## Introduction

A DGP vs Real-Data Comparison feature for the Skill × Stake thesis dashboard. The feature adds new comparison slides to the existing Slides tab that juxtapose simulation (DGP) results, real-world data results, and thesis theory claims side by side. The goal is to highlight where the mechanism works as predicted by theory (wind), where equal weighting is surprisingly strong (electricity), and where real-world data diverges from the controlled DGP setting (best_single dominance in wind).

## Glossary

- **Comparison_Slide**: A slide component within the Slides_Page that displays DGP, real-data, and theory results side by side for a specific comparison dimension
- **DGP_Data**: The master_comparison experiment data from `core 2/experiments/master_comparison/data/master_comparison.json`, using the latent_fixed DGP with 10 agents and 500 rounds across multiple seeds
- **Electricity_Data**: The real-world comparison data from `real_data/elia_electricity/data/comparison.json` (10,000 rounds, 5 forecasters)
- **Wind_Data**: The real-world comparison data from `real_data/elia_wind/data/comparison.json` (17,544 rounds, 5 forecasters)
- **Wind_Extended_Data**: Additional wind experiment data files including `day_ahead.json`, `4h_ahead.json`, `deposit_sensitivity.json`, and `regime_shift.json`
- **Theory_Data**: The thesis results from `thesis_results.json` containing 5 thesis claims with metrics and interpretations
- **Comparison_Table**: A tabular UI element that shows method-level CRPS and ΔCRPS values across DGP, electricity, and wind datasets in aligned columns
- **Insight_Card**: A UI element that highlights a specific finding from the comparison with supporting data
- **Slides_Page**: The existing React page component at the `/slides` route (from the slides-tab spec)
- **SlideWrapper**: The existing shared wrapper component for consistent slide spacing and styling

## Requirements

### Requirement 1: DGP vs Real-Data Summary Comparison Slide

**User Story:** As a thesis viewer, I want to see DGP and real-data CRPS results side by side in a single table, so that I can immediately see how the mechanism performs across controlled and real-world settings.

#### Acceptance Criteria

1. THE Comparison_Slide SHALL load DGP_Data from `data/core 2/experiments/master_comparison/data/master_comparison.json` and compute the mean CRPS and mean ΔCRPS across all seeds for each method (uniform, skill, mechanism, best_single)
2. THE Comparison_Slide SHALL load Electricity_Data from `data/real_data/elia_electricity/data/comparison.json` and extract the CRPS and ΔCRPS for each method
3. THE Comparison_Slide SHALL load Wind_Data from `data/real_data/elia_wind/data/comparison.json` and extract the CRPS and ΔCRPS for each method
4. THE Comparison_Table SHALL display one row per method (uniform, skill, mechanism, best_single) with columns for: method name, DGP mean CRPS, DGP mean ΔCRPS, electricity CRPS, electricity ΔCRPS, wind CRPS, wind ΔCRPS
5. THE Comparison_Table SHALL visually highlight the best-performing method (lowest mean CRPS) within each dataset column
6. IF any data file fails to load, THEN THE Comparison_Slide SHALL display a user-friendly error message identifying which dataset failed and still render the successfully loaded datasets

### Requirement 2: Mechanism Improvement Magnitude Slide

**User Story:** As a thesis viewer, I want to see the relative improvement of the mechanism over equal weighting across datasets, so that I can understand where skill+stake adds the most value.

#### Acceptance Criteria

1. THE Comparison_Slide SHALL display the percentage improvement of the mechanism over uniform weighting for each dataset: DGP, electricity, and wind
2. THE Comparison_Slide SHALL display the absolute ΔCRPS of the mechanism versus uniform for each dataset
3. THE Comparison_Slide SHALL include an Insight_Card highlighting that electricity improvement is tiny (ΔCRPS ≈ −0.000061) while wind improvement is substantial (ΔCRPS ≈ −0.0196, approximately 21%)
4. THE Comparison_Slide SHALL include an Insight_Card explaining that the DGP shows reliable mechanism improvement because the latent truth is identifiable in the simulation

### Requirement 3: Best-Single Forecaster Anomaly Slide

**User Story:** As a thesis viewer, I want to understand the best_single forecaster behaviour across DGP and real data, so that I can see where aggregation fails to beat the best individual.

#### Acceptance Criteria

1. THE Comparison_Slide SHALL display the best_single CRPS alongside the mechanism CRPS for each dataset (DGP, electricity, wind)
2. THE Comparison_Slide SHALL include an Insight_Card highlighting that in wind data, best_single (CRPS ≈ 0.033) dominates all aggregation methods (mechanism CRPS ≈ 0.073), a pattern not observed in the DGP
3. THE Comparison_Slide SHALL include an Insight_Card explaining that in the DGP, aggregation methods can approach or beat best_single because the latent truth is identifiable and skill weights converge correctly
4. WHEN the electricity dataset is displayed, THE Comparison_Slide SHALL note that best_single also beats aggregation methods but the gap between mechanism and best_single is smaller than in wind

### Requirement 4: Theory Validation Slide

**User Story:** As a thesis viewer, I want to see how the real-data results validate or challenge the thesis theory claims, so that I can assess the thesis contributions.

#### Acceptance Criteria

1. THE Comparison_Slide SHALL load Theory_Data from `data/thesis_results.json`
2. THE Comparison_Slide SHALL display the thesis claims "skill improves accuracy in identifiable benchmark" and "equal weighting is a strong baseline" alongside the corresponding real-data evidence
3. WHEN displaying the "skill improves accuracy" claim, THE Comparison_Slide SHALL show the DGP ΔCRPS as confirming evidence and the electricity ΔCRPS as a weak-confirmation case (tiny improvement)
4. WHEN displaying the "equal weighting is a strong baseline" claim, THE Comparison_Slide SHALL show the electricity ΔCRPS (≈ −0.000061) as strong supporting evidence and the wind ΔCRPS (≈ −0.0196) as a case where the mechanism does meaningfully improve
5. IF Theory_Data fails to load, THEN THE Comparison_Slide SHALL display a user-friendly error message and still render the DGP and real-data comparison content

### Requirement 5: Wind Extended Analysis Slide

**User Story:** As a thesis viewer, I want to see the additional wind experiments (day-ahead, 4h-ahead, deposit sensitivity, regime shift), so that I can understand the mechanism's robustness on real wind data.

#### Acceptance Criteria

1. THE Comparison_Slide SHALL load Wind_Extended_Data from `data/real_data/elia_wind/data/day_ahead.json`, `data/real_data/elia_wind/data/4h_ahead.json`, `data/real_data/elia_wind/data/deposit_sensitivity.json`, and `data/real_data/elia_wind/data/regime_shift.json`
2. THE Comparison_Slide SHALL display a summary row for each wind experiment showing the method, mean CRPS, and ΔCRPS versus uniform for the day-ahead and 4h-ahead horizons
3. THE Comparison_Slide SHALL display the deposit sensitivity results showing how mechanism improvement varies across deposit policies (fixed, exponential, bankroll)
4. THE Comparison_Slide SHALL display the regime shift results showing mechanism performance under non-stationary conditions
5. IF any Wind_Extended_Data file fails to load, THEN THE Comparison_Slide SHALL display a user-friendly error message for that specific experiment and still render the successfully loaded experiments

### Requirement 6: Slide Integration into Existing Slides Tab

**User Story:** As a thesis viewer, I want the comparison slides to appear in the existing slide sequence, so that the DGP vs real-data story flows naturally within the presentation.

#### Acceptance Criteria

1. THE Slides_Page SHALL insert the comparison slides after the existing Wind Results slide and before the existing Behaviour Architecture slide
2. THE Slides_Page SHALL render the comparison slides in the following order: DGP vs Real-Data Summary, Mechanism Improvement Magnitude, Best-Single Forecaster Anomaly, Theory Validation, Wind Extended Analysis
3. THE Slides_Page SHALL use the existing SlideWrapper component for all comparison slides to maintain consistent spacing and styling
4. THE Slides_Page SHALL use the same Tailwind CSS design tokens (colours, spacing, typography) as the existing slides

### Requirement 7: DGP Multi-Seed Aggregation

**User Story:** As a thesis viewer, I want the DGP results to be averaged across all seeds, so that the comparison reflects the expected DGP performance rather than a single random run.

#### Acceptance Criteria

1. WHEN loading DGP_Data, THE Comparison_Slide SHALL group rows by method and compute the arithmetic mean of mean_crps across all seeds for each method
2. WHEN loading DGP_Data, THE Comparison_Slide SHALL compute the arithmetic mean of delta_crps_vs_equal across all seeds for each method
3. THE Comparison_Slide SHALL display the number of seeds used in the DGP aggregation as a footnote or label (e.g. "averaged over N seeds")

### Requirement 8: Data Loading and Error Resilience

**User Story:** As a thesis viewer, I want the comparison slides to handle data loading gracefully, so that partial failures do not break the entire presentation.

#### Acceptance Criteria

1. THE Comparison_Slide SHALL display a loading indicator while any data file is being fetched
2. WHEN all data files have loaded or failed, THE Comparison_Slide SHALL remove the loading indicator
3. IF a fetch is in progress and the component unmounts, THEN THE Comparison_Slide SHALL cancel the in-flight request using an AbortController
4. THE Comparison_Slide SHALL use the existing `{ data, error, loading }` state pattern consistent with the ResultsSlide component

### Requirement 9: Comparison Data Formatting

**User Story:** As a thesis viewer, I want CRPS values and deltas to be formatted consistently, so that I can compare numbers across datasets without confusion.

#### Acceptance Criteria

1. THE Comparison_Table SHALL format mean CRPS values to 6 decimal places
2. THE Comparison_Table SHALL format ΔCRPS values to 6 decimal places with a sign prefix (+ or −)
3. THE Comparison_Table SHALL format percentage improvements to 1 decimal place with a % suffix
4. WHEN a ΔCRPS value is zero, THE Comparison_Table SHALL display "—" instead of a numeric value
5. WHEN a ΔCRPS value is negative (improvement), THE Comparison_Table SHALL display the value in green; WHEN positive (degradation), THE Comparison_Table SHALL display the value in red
