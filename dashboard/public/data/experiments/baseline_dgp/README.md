# Baseline DGP Diagnostic

**Plot**: 2x2 panel — truth vs reports time series (top-left), noise bar chart (top-right), error distribution KDEs (bottom-left), noise vs MAE scatter (bottom-right). y ~ U(0,1), 6 forecasters, 500 rounds.

**Results**:
- Near-perfect noise-MAE correlation (Pearson r = 0.999).
- Error distributions centred at zero (unbiased reports).
- Noise ranges ~3x (0.038 to 0.120), giving meaningful variation for the mechanism to learn.
