# Experiment summary

## What this experiment is testing

Compares IID vs bursty vs edge-threshold vs avoid-skill-decay participation, and compares missingness handling settings.

## Configuration

- DGP / setup: intermittency_stress_test
- Rounds: 200
- Users / accounts: 10
- Behaviour preset: N/A
- Mechanism: λ=N/A, η=N/A, σ_min=N/A, ω_max=N/A

## Headline results (numbers)

- **mean_N_t**: 4.762
- **mean_N_eff**: 5.682

## How to read the plots

1. **Participation over time**: $N_t$ = number of active accounts per round. Drops indicate missingness.
2. **Gap distribution**: Histogram of time between consecutive participations per account. Bursty behaviour shows larger gaps.
3. **Stake distributions**: Pooled deposits $b_{i,t}$ and effective wagers $m_{i,t}$. Shape indicates staking policy.
4. **Stake as a signal**: Scatter of $m_{i,t}$ vs forecast width. Negative relation suggests confidence-based staking.
5. **Calibration + sharpness**: Empirical coverage of 80% intervals vs nominal; sharpness histogram (narrower = more confident).
6. **Concentration over time**: Top-1/top-5 weight share and HHI / $N^{\mathrm{eff}}_t$. High concentration means few agents dominate.
7. **Wealth health**: Gini(wealth) and ruin rate over time. High Gini or rising ruin rate indicates inequality or distress.
8. **Arbitrage heatmap** (arbitrage_scan only): $A(\theta)$ = max_r min_y π(r,y;θ). Positive values indicate arbitrage.
