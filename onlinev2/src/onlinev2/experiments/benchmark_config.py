"""
Canonical benchmark configuration for comparable experiments.

Same seeds, DGPs, horizon, participation pattern, and agent panel across
all methods in a batch. Used by master_comparison and bankroll_ablation.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

# Default canonical config (NEXT_STEPS.md)
CANONICAL_SEEDS: List[int] = [42, 43, 44, 45, 46]
CANONICAL_T = 500
CANONICAL_N_FORECASTERS = 10
CANONICAL_MISSING_PROB = 0.2
CANONICAL_TAU_I = [0.15, 0.22, 0.32, 0.46, 0.68, 0.75, 0.82, 0.88, 0.93, 1.0]  # first n_forecasters used
CANONICAL_TAUS = [0.1, 0.25, 0.5, 0.75, 0.9]


@dataclass
class BenchmarkConfig:
    """Fixed controls for a comparison batch."""
    seeds: List[int] = field(default_factory=lambda: list(CANONICAL_SEEDS))
    T: int = CANONICAL_T
    n_forecasters: int = CANONICAL_N_FORECASTERS
    missing_prob: float = CANONICAL_MISSING_PROB
    dgp_name: str = "latent_fixed"
    sigma_z: float = 1.0

    def tau_i(self):
        """First n_forecasters entries of canonical tau_i."""
        import numpy as np
        tau = CANONICAL_TAU_I if len(CANONICAL_TAU_I) >= self.n_forecasters else [
            0.15 + (0.85 * i / max(1, self.n_forecasters - 1)) for i in range(self.n_forecasters)
        ]
        return np.array(tau[: self.n_forecasters], dtype=np.float64)

    def taus(self):
        """Quantile levels for CRPS."""
        import numpy as np
        return np.array(CANONICAL_TAUS, dtype=np.float64)


def get_canonical_config(seeds=None, T=None, n_forecasters=None):
    """Return BenchmarkConfig with optional overrides."""
    return BenchmarkConfig(
        seeds=seeds or CANONICAL_SEEDS,
        T=T or CANONICAL_T,
        n_forecasters=n_forecasters or CANONICAL_N_FORECASTERS,
    )
