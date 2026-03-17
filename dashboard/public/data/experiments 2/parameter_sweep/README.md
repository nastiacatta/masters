# Parameter Sweep: lambda vs sigma_min

**Plot**: Two heatmaps over a 5x5 grid — mean CRPS (left), Gini coefficient of profits (right). 200 rounds, 8 forecasters.

**Results**:
- CRPS is stable (~0.027) across all (lambda, sigma_min) pairs — weighting barely affects quality under homogeneous noise.
- Gini decreases with lambda: lambda=0 (skill-only) gives Gini~0.23, lambda=1 (deposit-only) gives ~0.22.
- Lambda is primarily a fairness knob, not a quality knob.
