# Experiment summary

## What this experiment is testing

Latent truth + Bayes-consistent forecasters — verify skill recovery.

## Configuration

- DGP / setup: latent_fixed
- Rounds: 20000
- Forecasters / users: 6
- Seeds: 20
- Scoring mode: both
- Behaviour preset: N/A
- Mechanism: λ=N/A, η=N/A, σ_min=0.1, ω_max=N/A

## Headline results (numbers)

- **point_mae_spearman_sigma**: 1
- **point_mae_spearman_loss**: 1
- **quantiles_crps_spearman_sigma**: 1
- **quantiles_crps_spearman_loss**: 1

## How to read the plots

1. **Participation over time**: $N_t$ = number of active accounts per round. Drops indicate missingness.
2. **Gap distribution**: Histogram of time between consecutive participations per account. Bursty behaviour shows larger gaps.
3. **Stake distributions**: Pooled deposits $b_{i,t}$ and effective wagers $m_{i,t}$. Shape indicates staking policy.
4. **Stake as a signal**: Scatter of $m_{i,t}$ vs forecast width. Negative relation suggests confidence-based staking.
5. **Calibration + sharpness**: Empirical coverage of 80% intervals vs nominal; sharpness histogram (narrower = more confident).
6. **Concentration over time**: Top-1/top-5 weight share and HHI / $N^{\mathrm{eff}}_t$. High concentration means few agents dominate.
7. **Wealth health**: Gini(wealth) and ruin rate over time. High Gini or rising ruin rate indicates inequality or distress.
8. **Arbitrage heatmap** (arbitrage_scan only): $A(\theta)$ = max_r min_y π(r,y;θ). Positive values indicate arbitrage.
