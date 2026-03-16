# DGP Comparison

**Plot**: 4x3 grid — one row per DGP (baseline, latent-fixed, aggregation M1, aggregation M3). Columns: truth vs reports, distribution (histogram + KDE), report vs truth scatter. 500 rounds.

**Results**:
- Truth distributions differ: baseline is uniform, latent-fixed is bell-shaped, aggregation is bimodal.
- Report correlations range from r~0.60 (M3, worst agent) to r~0.99 (latent-fixed, best agent).
- The four DGPs create meaningfully distinct testing scenarios for the mechanism.
