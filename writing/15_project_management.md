# Project management {#ch:project-management}

<!--
Main-body section required by the DESE70002 assessment criterion
"Project Management". Kept deliberately short (≈1 page) because the
technical chapters demand most of the 35-page budget.
-->

## Work plan and structure

The nine-month project was organised around three technical
milestones aligned with the academic calendar:

1. **Autumn term --- mechanism and synthetic validation.** Port the
   Lambert settlement algebra to the reference simulator, establish
   the thirteen Lambert combinatorial invariants as regression
   checks, and verify skill recovery on a known-noise synthetic
   panel. Deliverable: Early Stage Gateway (ESG) report.
2. **Spring term --- real-data validation and recalibration.** Integrate
   the Elia offshore-wind and electricity-imbalance datasets, tune
   hyperparameters on held-out data, and add the rolling isotonic
   recalibration layer. Deliverable: Late Stage Gateway (LSG)
   presentation.
3. **Summer term --- robustness and writing.** Build the theory-grounded
   adversary catalogue, run paired-seed attacker experiments, and
   consolidate into the final report and oral examination.

Weekly supervisor meetings anchored the rhythm; asynchronous
progress was logged in the repository's development notes.

## Risk management and contingency

Three risks materialised during the project and prompted explicit
plan changes.

- **Data leakage in the real-data pipeline.** A leaky normalisation
  step inflated mechanism performance by roughly $2$~pp of CRPS.
  Caught during the post-ESG audit. Mitigation: strict
  expanding causal normalisation, regression tests, and a full
  rerun of all real-data numbers.
- **Electricity-imbalance null result.** The seven-forecaster panel
  gave statistically indistinguishable CRPS across all aggregation
  rules ($t = 0.008$, $p = 0.994$). Contingency: report the null
  rather than chase significance, and use the result to support the
  conditional-improvement framing.
- **Computational cost of the full-length wind run.** Running
  $17{,}344$ hours with seven forecasters and multiple aggregation
  variants required caching the forecaster outputs under a versioned
  pipeline tag. Contingency: an invalidation-aware
  artefact store with per-seed idempotent outputs.

## Resources and auditability

The repository hosts all experimental code, tuning notes, and raw
output artefacts. Every numerical claim in the report is linked to
the artefact that produced it; the figures and tables registry maps
each identifier to its source. Hyperparameters are selected on
held-out data via a sensitivity sweep rather than by hand.

## Stakeholder engagement

Three stakeholder groups were engaged during the project: the
academic supervisor (weekly technical guidance), the module leaders
(gateway feedback at ESG and LSG), and the external research lineage
(\citealt{lambert2008selffinanced, vitali2025intermittent, raja2024wagering})
whose published implementations and proofs are cited and, where
possible, ported directly.
