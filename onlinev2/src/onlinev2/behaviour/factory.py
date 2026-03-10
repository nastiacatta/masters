"""
Single behaviour entrypoint: make_behaviour(name, **kwargs) -> BehaviourModel.

All experiments use make_behaviour(...) rather than constructing composite objects directly.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import BehaviourModel
from onlinev2.behaviour.population import build_population, UserConfig
from onlinev2.behaviour.composite import CompositeBehaviourModel
from onlinev2.behaviour.traits import UserTraits, generate_population
from onlinev2.behaviour.config.behaviour_configs import get_preset_kwargs, PRESET_NAMES


def make_behaviour(
    name: str,
    *,
    n_users: int = 10,
    seed: int = 42,
    scoring_mode: str = "point_mae",
    taus: Optional[np.ndarray] = None,
    b_max: float = 10.0,
    **kwargs: Any,
) -> BehaviourModel:
    """
    Build a BehaviourModel from a named preset.

    name: one of BENIGN_BASELINE, BURSTY_REALISTIC, HEDGED_RISK_AVERSE,
          COLLUSION_GROUP, SYBIL_SPLIT_K, MANIPULATOR, EVADER, INSIDER, ARBITRAGEUR.
    n_users: number of users (or accounts after identity mapping).
    seed: used for population generation and reset().
    scoring_mode: "point_mae" or "quantiles_crps".
    taus: quantile levels (for quantiles_crps).
    b_max: max deposit cap.
    **kwargs: passed to get_preset_kwargs (e.g. k for SYBIL_SPLIT_K, target for MANIPULATOR).

    Returns a CompositeBehaviourModel (or an adversary wrapper when preset is adversarial).
    """
    preset = get_preset_kwargs(name, n_users=n_users, seed=seed, **kwargs)
    adversary = preset.pop("_adversary", None)

    if adversary is None:
        pop = build_population(
            n_users,
            seed=seed,
            participation_policy=preset.get("participation_policy"),
            reporting_policy=preset.get("reporting_policy"),
            staking_policy=preset.get("staking_policy"),
            identity_policy=preset.get("identity_policy"),
        )
        return CompositeBehaviourModel(
            pop,
            scoring_mode=scoring_mode,
            taus=taus,
            b_max=b_max,
        )

    # Adversarial preset: one benign population plus one adversary
    from onlinev2.behaviour.policies.identity import SingleAccountIdentity
    from onlinev2.behaviour.policies.participation import BaselineParticipation
    from onlinev2.behaviour.policies.reporting import TruthfulReporting
    from onlinev2.behaviour.policies.staking import FixedFractionStaking

    benign_pop = build_population(
        n_users - 1,
        seed=seed,
        participation_policy=BaselineParticipation(),
        reporting_policy=TruthfulReporting(),
        staking_policy=FixedFractionStaking(),
        identity_policy=SingleAccountIdentity(),
    )
    adv_traits = UserTraits(user_id="attacker_0", initial_wealth=10.0, noise_level=0.05, stake_fraction=0.3)

    if adversary == "arbitrageur":
        from onlinev2.behaviour.adversaries.arbitrageur import ArbitrageurBehaviour
        adv = ArbitrageurBehaviour(adv_traits, scoring_mode=scoring_mode, taus=taus, b_max=b_max)
    elif adversary == "manipulator":
        from onlinev2.behaviour.adversaries.manipulator import ManipulatorBehaviour
        target = kwargs.get("target", 0.0)
        adv = ManipulatorBehaviour(adv_traits, target=target, scoring_mode=scoring_mode, taus=taus, b_max=b_max)
    elif adversary == "evader":
        from onlinev2.behaviour.adversaries.evader import AdaptiveEvaderBehaviour
        target = kwargs.get("target", 0.0)
        adv = AdaptiveEvaderBehaviour(adv_traits, target=target, scoring_mode=scoring_mode, taus=taus, b_max=b_max)
    elif adversary == "insider":
        from onlinev2.behaviour.adversaries.insider import InsiderBehaviour
        adv = InsiderBehaviour(adv_traits, scoring_mode=scoring_mode, taus=taus, b_max=b_max, y_sequence=kwargs.get("y_sequence"))
    elif adversary == "collusion":
        from onlinev2.behaviour.adversaries.collusion import CollusionGroupBehaviour
        members = [adv_traits]
        adv = CollusionGroupBehaviour(members, scoring_mode=scoring_mode, taus=taus, b_max=b_max)
    else:
        raise ValueError(f"Unknown adversary: {adversary}")

    adversary_behaviours = {adv_traits.user_id: adv}
    return CompositeBehaviourModel(
        benign_pop,
        adversary_behaviours=adversary_behaviours,
        scoring_mode=scoring_mode,
        taus=taus,
        b_max=b_max,
    )
