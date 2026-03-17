# Latent-Fixed DGP Diagnostic

**Plot**: 2x3 panel — truth vs reports (top-left), posterior shrinkage scatter (top-centre), MAE by tau (top-right), fan chart best agent (bottom-left), fan chart worst agent (bottom-centre), calibration (bottom-right). 6 forecasters, tau in [0.15, 1.0], 1000 rounds.

**Results**:
- MAE is strictly monotonic in tau (0.034 to 0.166).
- Best agent's fan chart is narrow (high confidence); worst agent's spans nearly [0,1].
- Near-perfect calibration for all 6 agents (points on diagonal), confirming Bayes-consistency.
