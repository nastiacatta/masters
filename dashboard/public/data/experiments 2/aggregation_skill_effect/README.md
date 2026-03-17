# Effect of Effective Wager on Aggregate Forecast

**Plot**: 2x3 grid — top row: cumulative CRPS trajectories; bottom row: bar charts with SE error bars. Three deposit regimes (random, fixed, correlated) x five aggregation methods. Latent-fixed DGP, tau in [0.15, 1.0], 5 seeds.

**Deposit regimes**:
- **Random**: b_i independent of tau — deposits are noise, so blended is dragged toward stake-only.
- **Fixed**: b_i = 1 — clean ablation removing deposit noise.
- **Correlated**: b_i proportional to 1/tau^2 — best case for stake-weighting (not learned).

**Results** (warm-start CRPS, mean +/- SE):
- Blended beats equal weighting once skill is learned (after T0=300).
- Best individual (0.023) is outperformed by blended (0.023) under correlated deposits — combining forecasts helps.
- Skill-only (0.041) is worse than correlated-stakes (0.023) because the sigma mapping compresses weight differences.
