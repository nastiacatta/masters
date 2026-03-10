"""
Population builder: assemble a heterogeneous population of users
with assigned policies for participation, belief, reporting, staking, and identity.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np

from onlinev2.behaviour.traits import UserTraits, generate_population
from onlinev2.behaviour.policies.participation import (
    ParticipationPolicy,
    BaselineParticipation,
)
from onlinev2.behaviour.policies.belief import BeliefPolicy, PrivateSignalBelief
from onlinev2.behaviour.policies.reporting import (
    ReportingPolicy,
    TruthfulReporting,
)
from onlinev2.behaviour.policies.staking import StakingPolicy, FixedFractionStaking
from onlinev2.behaviour.policies.identity import IdentityPolicy, SingleAccountIdentity


@dataclass
class UserConfig:
    """A user with all assigned policies."""

    traits: UserTraits
    participation: ParticipationPolicy = field(default_factory=BaselineParticipation)
    belief: BeliefPolicy = field(default_factory=PrivateSignalBelief)
    reporting: ReportingPolicy = field(default_factory=TruthfulReporting)
    staking: StakingPolicy = field(default_factory=FixedFractionStaking)
    identity: IdentityPolicy = field(default_factory=SingleAccountIdentity)


def build_population(
    n_users: int,
    *,
    seed: int = 42,
    participation_policy: Optional[ParticipationPolicy] = None,
    belief_policy: Optional[BeliefPolicy] = None,
    reporting_policy: Optional[ReportingPolicy] = None,
    staking_policy: Optional[StakingPolicy] = None,
    identity_policy: Optional[IdentityPolicy] = None,
    **population_kwargs,
) -> List[UserConfig]:
    """
    Convenience: generate traits then wrap each user with a shared policy set.

    To customise individual users, modify the returned list.
    """
    users = generate_population(n_users, seed=seed, **population_kwargs)

    pp = participation_policy or BaselineParticipation()
    bp = belief_policy or PrivateSignalBelief()
    rp = reporting_policy or TruthfulReporting()
    sp = staking_policy or FixedFractionStaking()
    ip = identity_policy or SingleAccountIdentity()

    return [
        UserConfig(
            traits=u,
            participation=pp,
            belief=bp,
            reporting=rp,
            staking=sp,
            identity=ip,
        )
        for u in users
    ]
