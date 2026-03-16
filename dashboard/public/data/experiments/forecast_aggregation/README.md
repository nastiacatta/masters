# Forecast Aggregation: Blended vs Baselines

**Plot**: Two panels — rolling 50-round mean CRPS (left), cumulative mean CRPS (right). Four methods: blended (mechanism), equal weights, stake-only, skill-only. 300 rounds, 10 forecasters, 20% missingness.

**Results**:
- All methods converge to similar CRPS (~0.023) because the baseline DGP has homogeneous noise.
- Blended at least matches equal weighting — does no harm when skill differences are small.
- See `aggregation_skill_effect` for the heterogeneous-skill case where method choice matters.
