"""
Belief formation policies.

Produces a private predictive distribution F_{u,t} for each user each round.

Must include:
  1. Private signal model with user-specific precision
  2. Correlated errors via common shocks
  3. Concept drift exposure with heterogeneous adaptation
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple

import numpy as np

from onlinev2.behaviour.traits import UserTraits


class BeliefPolicy(ABC):
    """Base class for belief formation."""

    @abstractmethod
    def form_belief(
        self,
        user: UserTraits,
        t: int,
        y_history: list,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        """
        Return user's predictive distribution as quantile forecasts.

        Returns (K,) array of quantile values at standard tau levels.
        """
        ...


class PrivateSignalBelief(BeliefPolicy):
    """
    Private signal model: user observes y + noise with user-specific precision.

    Supports:
      - Correlated errors via common shocks:
          epsilon_{u,t} = sqrt(rho) * xi_{g,t} + sqrt(1-rho) * nu_{u,t}
      - Concept drift with heterogeneous adaptation
    """

    def __init__(
        self,
        *,
        taus: Optional[np.ndarray] = None,
        correlation_rho: float = 0.3,
        n_info_groups: int = 3,
        drift_phi: float = 0.95,
        drift_sigma: float = 0.05,
    ) -> None:
        self.taus = (
            taus
            if taus is not None
            else np.array([0.1, 0.25, 0.5, 0.75, 0.9])
        )
        self.correlation_rho = correlation_rho
        self.n_info_groups = n_info_groups
        self.drift_phi = drift_phi
        self.drift_sigma = drift_sigma

        self._group_shocks: Dict[str, float] = {}
        self._latent_mean: float = 0.5
        self._user_estimates: Dict[str, float] = {}

    def reset(self, seed: int) -> None:
        self._group_shocks.clear()
        self._latent_mean = 0.5
        self._user_estimates.clear()

    def update_drift(self, rng: np.random.Generator) -> None:
        """Advance the drifting latent mean: mu_{t+1} = phi * mu_t + zeta_t."""
        zeta = rng.normal(0.0, self.drift_sigma)
        self._latent_mean = np.clip(
            self.drift_phi * self._latent_mean + zeta, 0.0, 1.0
        )

    def generate_group_shocks(self, rng: np.random.Generator) -> None:
        """Generate common shocks xi_{g,t} for each information group."""
        for g in range(self.n_info_groups):
            self._group_shocks[f"group_{g}"] = float(rng.normal(0.0, 1.0))

    def form_belief(
        self,
        user: UserTraits,
        t: int,
        y_history: list,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        if user.user_id not in self._user_estimates:
            self._user_estimates[user.user_id] = self._latent_mean

        prev_est = self._user_estimates[user.user_id]
        self._user_estimates[user.user_id] = (
            (1.0 - user.adaptation_rate) * prev_est
            + user.adaptation_rate * self._latent_mean
        )

        group_shock = self._group_shocks.get(user.info_group_id, 0.0)
        rho = self.correlation_rho

        common_part = np.sqrt(rho) * group_shock
        idio_part = np.sqrt(1.0 - rho) * rng.normal(0.0, 1.0)
        epsilon = common_part + idio_part

        signal = self._user_estimates[user.user_id] + user.noise_level * epsilon + user.bias

        from scipy.stats import norm

        signal = np.clip(signal, 0.001, 0.999)
        user_sigma = user.noise_level * (1.0 + abs(user.miscalibration))

        quantiles = norm.ppf(self.taus, loc=signal, scale=max(user_sigma, 1e-6))
        quantiles = np.clip(quantiles, 0.0, 1.0)

        return quantiles

    def form_point_belief(
        self,
        user: UserTraits,
        t: int,
        y_history: list,
        rng: np.random.Generator,
        context: Dict,
    ) -> float:
        """Return a single point forecast (median of the distribution)."""
        quantiles = self.form_belief(user, t, y_history, rng, context)
        median_idx = np.searchsorted(self.taus, 0.5)
        return float(quantiles[min(median_idx, len(self.taus) - 1)])
