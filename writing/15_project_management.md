# Project management {#ch:project-management}

<!--
Main-body section required by the DESE70002 assessment criterion
"Project Management". The handbook Q&A is explicit that this is
part of the main body, not an appendix: "Some of the assessment
criteria such as project management or personal reflection may
seem alien in a scientific report, but are a part of the Design
Engineering Master's Project report submission."

Kept deliberately short (≈1 page) because the dense technical
chapters demand most of the 35-page budget. Draft stub — to be
written out once the technical chapters are settled.
-->

## Work plan and structure

The nine-month project was organised around three technical
milestones aligned with the academic calendar:

1. **Autumn term — mechanism and synthetic validation.** Port the
   Lambert settlement algebra to the reference implementation,
   establish the thirteen Lambert combinatorial invariants as
   regression tests, and verify skill recovery on a known-noise
   synthetic panel. Output: Early Stage Gateway (ESG) report.
2. **Spring term — real-data validation and recalibration.**
   Integrate the Elia offshore-wind and electricity-imbalance
   datasets, tune hyperparameters on held-out data, and add the
   rolling isotonic recalibration layer. Output: Late Stage
   Gateway (LSG) presentation.
3. **Summer term — robustness and writing.** Build the theory-grounded
   adversary catalogue, run paired-seed attacker experiments, and
   consolidate into the final report and oral examination.

Weekly supervisor meetings anchored the rhythm; asynchronous
progress notes went into the repository's `NEXT_STEPS.md`.

## Risk management and contingency

Three risks materialised during the project and prompted explicit
plan changes.

- **Data leakage in the real-data pipeline.** A leaky normalisation
  step inflated mechanism performance by roughly $2$~pp of CRPS.
  Caught during the post-ESG audit (see `model-training-testing-audit`
  specification). Mitigation: strict expanding causal normalisation,
  regression tests, and a full rerun of all real-data numbers.
- **Electricity-imbalance null result.** The seven-forecaster panel
  gave statistically indistinguishable CRPS across all aggregation
  rules ($t = 0.008$, $p = 0.994$). Contingency: report the null
  rather than chase significance, and use the result to support the
  conditional-improvement framing.
- **Computational cost of the full-length wind run.** Running
  $17{,}344$ hours with seven forecasters and multiple aggregation
  variants required caching the forecaster outputs under a versioned
  pipeline tag (`PIPELINE_VERSION`, `AUDIT_SEEDS`). Contingency:
  invalidation-aware artefact store with per-seed idempotent
  outputs.

## Resources and auditability

The repository hosts all experimental code, tuning notes, and raw
output artefacts. Numerical claims in the report carry
`[source: path/to/artefact]` tags to the committed JSON or CSV
files; the `figures_and_tables.md` registry maps figure IDs to
artefact paths. All hyperparameters are selected on held-out data
via a sensitivity sweep (`onlinev2/outputs/sensitivity_sweep.json`)
rather than by hand.

## Stakeholder engagement

The project has three stakeholder groups: the academic supervisor
(weekly technical guidance), the module leaders (gateway feedback at
ESG and LSG), and the external research lineage
(\citealt{lambert2008selffinanced, vitali2025intermittent, raja2024wagering})
whose published implementations and proofs are cited and, where
possible, ported directly.
