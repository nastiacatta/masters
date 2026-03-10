"""
Latent traits per real user.

Each user has inherent characteristics drawn at population creation time.
These traits drive participation, belief, reporting, and staking policies.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Optional

import numpy as np


@dataclass
class UserTraits:
    """Immutable latent traits for a single real user."""

    user_id: str

    # Wealth
    initial_wealth: float = 10.0

    # Risk preferences (CRRA coefficient: 0 = risk neutral, >0 = risk averse)
    risk_aversion: float = 0.0

    # Signal quality
    signal_precision: float = 1.0  # higher = more precise private signal
    noise_level: float = 0.1  # std dev of idiosyncratic noise

    # Bias and miscalibration
    bias: float = 0.0  # systematic bias in point forecasts
    miscalibration: float = 0.0  # 0=well-calibrated, >0=overconfident, <0=underconfident

    # Participation propensity
    participation_prob: float = 0.8  # baseline Bernoulli probability
    burst_alpha: float = 0.9  # P(active -> active) for Markov chain
    burst_beta: float = 0.3  # P(inactive -> active) for Markov chain
    edge_threshold: float = 0.0  # min perceived edge to enter

    # Staking preferences
    stake_fraction: float = 0.3  # base fraction of wealth to stake
    kelly_coefficient: float = 1.0  # multiplier on Kelly-optimal fraction

    # Concept drift adaptation
    adaptation_rate: float = 0.1  # how fast internal estimate tracks drift

    # Adversarial parameters (optional)
    manipulation_strength: float = 0.0  # kappa_u for manipulators
    sybil_budget: int = 1  # number of accounts this user controls
    collusion_group_id: Optional[str] = None  # shared info group

    # Information group for correlated errors
    info_group_id: str = "default"

    # Insider access
    insider_precision_boost: float = 0.0  # extra precision from inside info


def generate_population(
    n_users: int,
    *,
    seed: int = 42,
    wealth_dist: str = "lognormal",
    wealth_mu: float = 2.0,
    wealth_sigma: float = 1.0,
    wealth_pareto_alpha: float = 2.0,
    risk_aversion_range: tuple = (0.0, 3.0),
    noise_range: tuple = (0.02, 0.3),
    participation_range: tuple = (0.5, 0.95),
    n_info_groups: int = 3,
) -> list[UserTraits]:
    """
    Generate a heterogeneous population of users with heavy-tailed wealth
    and varied latent traits.
    """
    rng = np.random.default_rng(seed)
    users: list[UserTraits] = []

    if wealth_dist == "lognormal":
        wealths = rng.lognormal(mean=wealth_mu, sigma=wealth_sigma, size=n_users)
    elif wealth_dist == "pareto":
        wealths = (rng.pareto(wealth_pareto_alpha, size=n_users) + 1.0) * np.exp(wealth_mu)
    else:
        raise ValueError(f"Unknown wealth_dist: {wealth_dist}")

    risk_aversions = rng.uniform(*risk_aversion_range, size=n_users)
    noises = rng.uniform(*noise_range, size=n_users)
    precisions = 1.0 / (noises + 1e-12)
    participations = rng.uniform(*participation_range, size=n_users)
    biases = rng.normal(0.0, 0.02, size=n_users)
    miscalibrations = rng.normal(0.0, 0.1, size=n_users)
    adaptation_rates = rng.uniform(0.02, 0.3, size=n_users)
    stake_fractions = rng.uniform(0.1, 0.5, size=n_users)
    kelly_coeffs = rng.uniform(0.3, 2.0, size=n_users)

    burst_alphas = rng.uniform(0.7, 0.98, size=n_users)
    burst_betas = rng.uniform(0.1, 0.5, size=n_users)
    edge_thresholds = rng.uniform(0.0, 0.1, size=n_users)

    group_ids = [f"group_{i % n_info_groups}" for i in range(n_users)]
    rng.shuffle(group_ids)  # type: ignore[arg-type]

    for i in range(n_users):
        users.append(
            UserTraits(
                user_id=f"user_{i}",
                initial_wealth=float(wealths[i]),
                risk_aversion=float(risk_aversions[i]),
                signal_precision=float(precisions[i]),
                noise_level=float(noises[i]),
                bias=float(biases[i]),
                miscalibration=float(miscalibrations[i]),
                participation_prob=float(participations[i]),
                burst_alpha=float(burst_alphas[i]),
                burst_beta=float(burst_betas[i]),
                edge_threshold=float(edge_thresholds[i]),
                stake_fraction=float(stake_fractions[i]),
                kelly_coefficient=float(kelly_coeffs[i]),
                adaptation_rate=float(adaptation_rates[i]),
                info_group_id=str(group_ids[i]),
            )
        )

    return users
