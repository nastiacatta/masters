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
  Caught during the mid-year pipeline audit. Mitigation: strict
  expanding causal normalisation, regression tests, and a full
  rerun of all real-data numbers.
- **Electricity-imbalance null result.** The seven-forecaster panel
  gave statistically indistinguishable CRPS across all aggregation
  rules ($t = 0.008$, $p = 0.994$). Contingency: report the null
  rather than chase significance, and use the result to support the
  conditional-improvement framing.
- **Computational cost of the full-length wind run.** Running
  $17{,}344$ hours with seven forecasters and multiple aggregation
  variants required per-seed caching of forecaster outputs under a
  versioned tag so that pipeline changes invalidated the cache
  automatically.

## Resources and auditability

The repository hosts all experimental code, tuning notes, and raw
output files. Every numerical claim in the report is linked to the
output that produced it, and hyperparameters are selected on
held-out data via a sensitivity sweep rather than by hand.

## Stakeholder engagement

Three stakeholder groups were engaged during the project: the
academic supervisor (weekly technical guidance), the module leaders
(gateway feedback at ESG and LSG), and the external research lineage
(\citealt{lambert2008selffinanced, vitali2025intermittent, raja2024wagering})
whose published implementations and proofs are cited and, where
possible, ported directly.

## Scope relative to the ESG plan

The Early Stage Gateway project plan identified four design
directions: (i) manipulation and defence, (ii) reinforcement
learning for mechanism tuning, (iii) multi-output Gaussian-process
aggregation, and (iv) online learning for forecaster weights. The
proposal committed to (iv) as the main contribution, with (i)--(iii)
as stretch goals. The present thesis delivers (iv) in full,
addresses (i) at depth in Chapter~\ref{ch:robustness}, and leaves
(ii) and (iii) as future work. Two smaller deviations from the ESG
plan are worth recording. The online update is an exponentially
weighted moving average rather than Hedge or Online Gradient
Descent on the simplex, because the mechanism already imposes a
simplex-free scalar skill; the trade-off is discussed in
Chapter~\ref{ch:mechanism}. The real-data validation was performed
on the Elia offshore-wind and electricity-imbalance series rather
than the Survey of Professional Forecasters proposed at ESG,
because the Elia data is long enough for the online estimator to
converge and has an independent operational baseline, which the
SPF does not.
