# Aggregation DGPs: Endogenous Truth

**Plot**: 2x3 panel — Method 1 (top row), Method 3 (bottom row). Columns: truth vs reports, report vs truth scatter, MAE bar chart. 3 forecasters with w=(0.8, 0.1, 0.5), sigma=(0.3, 0.6, 1.0), 1000 rounds.

**Results**:
- Higher weight + lower noise = lower MAE: F0 (w=0.8, sigma=0.3) is best.
- Method 3 has higher MAE and lower correlations due to per-agent mean shocks.
- Endogenous truth creates a feedback loop — agent's weight in the truth function directly affects its accuracy.
