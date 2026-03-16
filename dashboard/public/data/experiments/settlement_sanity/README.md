# Settlement Sanity Checks

**Plot**: 2x2 panel — profit histogram, ROI histogram, min payout time series, invariant scorecard. 500 random rounds, 3–20 agents.

**Results**:
- Budget balance holds to machine precision (max gap ~ 2.8e-14).
- Payouts are always non-negative (min = 0.0029).
- Equal scores produce exactly zero profit.
- ROI bounded in [-0.73, 0.67], within theoretical [-1, 1].
