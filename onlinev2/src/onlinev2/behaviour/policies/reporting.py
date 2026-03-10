"""
Reporting policies: transform a user's private belief into a submitted report.

Required behaviours:
  1. Truthful: R = F (report the private belief as-is)
  2. Miscalibrated: variance scaling in probit space (over/under-confidence)
  3. Hedged: shrinkage-to-centre due to risk aversion
  4. Strategic: distort reports to move the aggregate
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, Optional

import numpy as np

from onlinev2.behaviour.traits import UserTraits


class ReportingPolicy(ABC):
    """Base class for report transformations."""

    @abstractmethod
    def transform_report(
        self,
        belief: np.ndarray,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        """
        Transform a belief (quantile array) into a submitted report.

        Parameters
        ----------
        belief : (K,) quantile forecasts from belief formation
        user : latent traits of the user
        rng : random generator
        context : dict with 'taus', 'agg_history', etc.

        Returns
        -------
        report : (K,) quantile array to submit
        """
        ...


class TruthfulReporting(ReportingPolicy):
    """R_{u,t} = F_{u,t} — report private belief unchanged."""

    def transform_report(
        self,
        belief: np.ndarray,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        return belief.copy()


class MiscalibratedReporting(ReportingPolicy):
    """
    Over- or under-confidence via variance scaling in probit space.

    Transforms quantiles through probit -> scale variance -> inverse probit.
    miscalibration > 0: overconfident (narrower spread)
    miscalibration < 0: underconfident (wider spread)
    """

    def transform_report(
        self,
        belief: np.ndarray,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        from scipy.stats import norm

        belief_clipped = np.clip(belief, 1e-6, 1.0 - 1e-6)
        z = norm.ppf(belief_clipped)

        center = float(np.median(z))

        scale = max(1.0 - user.miscalibration, 0.1)
        z_scaled = center + (z - center) * scale

        report = norm.cdf(z_scaled)
        return np.clip(report, 0.0, 1.0)


class HedgedReporting(ReportingPolicy):
    """
    Risk-averse hedging: shrinkage to centre.

    R_{u,t} = (1 - alpha_u) * F_{u,t} + alpha_u * U(0,1)

    where alpha_u depends on risk aversion.
    """

    def transform_report(
        self,
        belief: np.ndarray,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        alpha = min(user.risk_aversion / 5.0, 0.9)

        taus = context.get("taus", np.linspace(0.1, 0.9, len(belief)))
        uniform_quantiles = taus.copy()

        report = (1.0 - alpha) * belief + alpha * uniform_quantiles
        return np.clip(report, 0.0, 1.0)


class StrategicReporting(ReportingPolicy):
    """
    Strategic misreporting to move the aggregate toward a target.

    Distorts reports even if it reduces expected score, parameterised
    by manipulation_strength (kappa_u).
    """

    def __init__(self, target: Optional[float] = None) -> None:
        self.target = target

    def transform_report(
        self,
        belief: np.ndarray,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> np.ndarray:
        kappa = user.manipulation_strength
        if kappa <= 0.0:
            return belief.copy()

        target = self.target
        if target is None:
            target = float(rng.uniform(0.0, 1.0))

        target_report = np.full_like(belief, target)
        report = (1.0 - kappa) * belief + kappa * target_report
        return np.clip(report, 0.0, 1.0)


class PointTruthfulReporting:
    """Truthful point reporting (non-quantile mode)."""

    def transform_report(
        self,
        belief: float,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> float:
        return belief


class PointMiscalibratedReporting:
    """Add systematic noise to point forecast."""

    def transform_report(
        self,
        belief: float,
        user: UserTraits,
        rng: np.random.Generator,
        context: Dict,
    ) -> float:
        noise = user.miscalibration * rng.normal(0.0, user.noise_level)
        return float(np.clip(belief + noise, 0.0, 1.0))
