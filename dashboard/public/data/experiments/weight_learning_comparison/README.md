# Weight Learning: Exogenous vs Endogenous DGPs

**Plot**: 3×2 grid — rows: baseline, latent-fixed, aggregation M1. Left: weight trajectories over time (smoothed). Right: target vs learned bar chart.

**Design**: Online LMS with no simplex constraint — weights are independent (non-negative, free scale), matching the wagering mechanism where each m_i is set per-agent.

**Results**:
- Baseline (exogenous): learns inverse-variance direction well (MAE = 0.018).
- Latent-fixed (exogenous): learns inverse-posterior-variance direction (MAE = 0.024).
- Aggregation M1 (endogenous): recovers raw structural weights w = (0.8, 0.1, 0.5) without normalisation (MAE = 0.029).
- Exogenous DGPs converge faster/smoother; endogenous is noisier due to AR(1) non-stationarity.
