"""
Strategic-influence behavioural regime.

A participant type that reports a fixed target value to move the aggregate,
with stake scaled by a trait governing influence intensity.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class StrategicInfluenceBehaviour:
    """
    Behavioural regime: strategic influence on the reported aggregate.
    Submits a fixed target report and deposit scaled by influence intensity.
    """
    traits: UserTraits
    target: float = 0.0
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0
    kappa: float = 5.0  # legacy param, unused

    def reset(self, seed: int) -> None:
        self.rng = np.random.default_rng(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        wealth = max(0.0, float(state.wealth_prev.get(self.traits.user_id, self.traits.initial_wealth)))
        if wealth <= 0.0:
            return [
                AgentAction(
                    account_id=self.traits.user_id,
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={"agent_type": "strategic_influence"},
                )
            ]
        report = clamp01(self.target)
        deposit = float(np.clip(wealth * min(0.6, 0.15 + self.traits.manipulation_strength), 0.0, min(wealth, self.b_max)))
        return [
            AgentAction(
                account_id=self.traits.user_id,
                participate=True,
                report=report,
                deposit=deposit,
                meta={"agent_type": "strategic_influence", "target": report},
            )
        ]

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
