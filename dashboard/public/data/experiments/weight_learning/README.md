# Weight Learning: Convergence to True Weights

**Plot**: 3-row figure — one row per aggregation method (M1, M2, M3). Each shows smoothed and raw weight trajectories over 20,000 rounds with dashed target lines at w=(0.8, 0.1, 0.5).

**Results**:
- All three methods converge to true weights. Ranking w1 > w3 > w2 is correctly recovered.
- Methods 1 and 2 are nearly identical (same generative model).
- Method 3 has more oscillation due to per-agent mean shocks, but still converges.
