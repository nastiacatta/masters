"""
Named behaviour presets for experiments.

Experiments import presets from here instead of constructing policy classes directly.
Presets are used with make_behaviour(name, **kwargs).
"""
from __future__ import annotations

from typing import Any, Dict, Optional

# Lazy imports to avoid circular deps; factory resolves them by name.
PRESET_NAMES = frozenset({
    "BENIGN_BASELINE",
    "BURSTY_REALISTIC",
    "HEDGED_RISK_AVERSE",
    "COLLUSION_GROUP",
    "SYBIL_SPLIT_K",
    "MANIPULATOR",
    "EVADER",
    "INSIDER",
    "ARBITRAGEUR",
})


def get_preset_kwargs(name: str, **overrides: Any) -> Dict[str, Any]:
    """
    Return kwargs for build_population / CompositeBehaviourModel for a named preset.

    name: one of BENIGN_BASELINE, BURSTY_REALISTIC, HEDGED_RISK_AVERSE,
          COLLUSION_GROUP, SYBIL_SPLIT_K, MANIPULATOR, EVADER, INSIDER, ARBITRAGEUR.
    overrides: override any key (e.g. n_users, seed, k for SYBIL_SPLIT_K).
    """
    from onlinev2.behaviour.policies.participation import (
        BaselineParticipation,
        BurstyParticipation,
        EdgeThresholdParticipation,
        AvoidSkillDecayParticipation,
    )
    from onlinev2.behaviour.policies.reporting import (
        TruthfulReporting,
        MiscalibratedReporting,
        HedgedReporting,
        StrategicReporting,
    )
    from onlinev2.behaviour.policies.staking import (
        FixedFractionStaking,
        KellyLikeStaking,
        HouseMoneyStaking,
        LumpyTierStaking,
    )
    from onlinev2.behaviour.policies.identity import (
        SingleAccountIdentity,
        SplitAccountIdentity,
    )

    base: Dict[str, Any] = {
        "participation_policy": BaselineParticipation(),
        "reporting_policy": TruthfulReporting(),
        "staking_policy": FixedFractionStaking(),
        "identity_policy": SingleAccountIdentity(),
    }

    if name == "BENIGN_BASELINE":
        pass
    elif name == "BURSTY_REALISTIC":
        base["participation_policy"] = BurstyParticipation()
        base["staking_policy"] = KellyLikeStaking()
    elif name == "HEDGED_RISK_AVERSE":
        base["reporting_policy"] = HedgedReporting()
        base["staking_policy"] = HouseMoneyStaking()
    elif name == "COLLUSION_GROUP":
        base["participation_policy"] = BurstyParticipation()
        base["reporting_policy"] = TruthfulReporting()
        base["staking_policy"] = FixedFractionStaking()
        base["_adversary"] = "collusion"
    elif name == "SYBIL_SPLIT_K":
        k = overrides.pop("k", 3)
        base["identity_policy"] = SplitAccountIdentity(k=k)
    elif name == "MANIPULATOR":
        base["_adversary"] = "manipulator"
    elif name == "EVADER":
        base["_adversary"] = "evader"
    elif name == "INSIDER":
        base["_adversary"] = "insider"
    elif name == "ARBITRAGEUR":
        base["_adversary"] = "arbitrageur"
    else:
        raise ValueError(f"Unknown preset: {name}. Known: {sorted(PRESET_NAMES)}")

    base.update(overrides)
    return base
