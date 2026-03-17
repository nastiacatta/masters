# Skill Recovery Benchmark

**Plots**: Three files from the latent-fixed DGP with 6 Bayes-consistent forecasters (tau in [0.15, 1.0]), 2000 rounds.

- `point_mae_recovery.png` — 2x2: tau vs tail loss, tau vs tail sigma, smoothed sigma(t), smoothed loss(t).
- `quantiles_crps_recovery.png` — same layout using CRPS scoring.
- `crps_calibration.png` — PIT histogram + per-agent calibration plot.

**Results**:
- Perfect rank recovery: Spearman correlation = 1.000 for both MAE and CRPS paths.
- Six agents stratify into distinct skill bands after ~500 rounds.
- Bayes-consistent forecasters produce near-perfect calibration (points on the diagonal).
