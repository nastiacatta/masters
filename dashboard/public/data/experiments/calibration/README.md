# Calibration Reliability Diagram

**Plot**: Reliability diagram — empirical coverage p_hat(tau) vs nominal tau for the aggregate quantile forecast. 300 rounds, 5 quantile levels.

**Results**:
- Lower quantiles are miscalibrated: tau=0.10 has 0.3% coverage (expected 10%).
- Upper quantiles are well-calibrated: tau=0.90 has 98.7% coverage.
- The miscalibration is a DGP artefact: the baseline constructs q_0.10 = report - 1.28*sigma_i, which is systematically below y since sigma_i is small. So P(y <= q_0.10) ~ 0.
- Compare with `skill_recovery/crps_calibration.png` — Bayes-consistent reports give near-perfect calibration.
