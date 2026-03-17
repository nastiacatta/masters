# Experiment summary

## What this experiment is testing

Holds the mechanism fixed and varies only behaviour modules: benign baselines, realistic frictions (bursty, wealth shocks, risk aversion, discrete staking), and adversaries (sybils, arbitrageur, collusion, manipulator, insider).

## Configuration

- DGP / setup: behaviour_matrix
- Rounds: 200
- Users / accounts: 10
- Behaviour preset: N/A
- Mechanism: λ=0.3, η=1.0, σ_min=0.1, ω_max=0.0

## Headline results (numbers)

- **mean_N_t**: 5.77
- **mean_HHI**: 0.2577
- **mean_N_eff**: 4.268
- **final_gini**: 0.1476
- **final_ruin_rate**: 0

## How to read the plots

1. **Participation over time**: $N_t$ = number of active accounts per round. Drops indicate missingness.
2. **Gap distribution**: Histogram of time between consecutive participations per account. Bursty behaviour shows larger gaps.
3. **Stake distributions**: Pooled deposits $b_{i,t}$ and effective wagers $m_{i,t}$. Shape indicates staking policy.
4. **Stake as a signal**: Scatter of $m_{i,t}$ vs forecast width. Negative relation suggests confidence-based staking.
5. **Calibration + sharpness**: Empirical coverage of 80% intervals vs nominal; sharpness histogram (narrower = more confident).
6. **Concentration over time**: Top-1/top-5 weight share and HHI / $N^{\mathrm{eff}}_t$. High concentration means few agents dominate.
7. **Wealth health**: Gini(wealth) and ruin rate over time. High Gini or rising ruin rate indicates inequality or distress.
8. **Arbitrage heatmap** (arbitrage_scan only): $A(\theta)$ = max_r min_y π(r,y;θ). Positive values indicate arbitrage.
