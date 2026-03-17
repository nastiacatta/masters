# Scoring Path Validation: Point/MAE vs Quantiles/CRPS

**Plot**: 2x2 panel — invariant test table (top-left), cumulative profit under MAE (top-right), skill evolution under MAE (bottom-left), skill evolution under CRPS (bottom-right). 100 rounds, 8 forecasters.

**Results**:
- All 9 invariant tests pass for both scoring paths (budget gaps ~ 1e-15).
- Skill ordering is consistent across scoring rules.
- CRPS provides slightly cleaner skill separation than MAE.
