# Selective Participation: Strategic vs Random Absence

**Plot**: 3x3 grid — rows: kappa=0, 0.05, 0.2. Columns: smoothed skill sigma (left), cumulative profit (centre), delta profit strategic-minus-random (right). Agent F5 (tau=1.0, worst), matched 50% absence rate.

**Decision rule**: absent(t) = 1 if loss_i(t) > median — perfect hindsight (upper bound on real advantage).

**Results**:

| kappa | Random profit | Strategic profit | Delta |
|-------|-------------|-----------------|-------|
| 0.00 | -10.05 | -2.04 | +8.01 |
| 0.05 | -7.27 | -1.62 | +5.65 |
| 0.20 | -7.32 | -1.30 | +6.03 |

- Strategic timing is always profitable (positive delta at all kappa).
- kappa > 0 reduces but does not eliminate the advantage.
- kappa > 0 works by decaying skill during absence, reducing stale influence.
