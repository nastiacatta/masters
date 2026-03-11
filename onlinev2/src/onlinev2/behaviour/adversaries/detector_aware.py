"""
Detector-aware behavioural variant.

A participant type that reports near a target with additive noise to reduce
detectability while still exerting influence.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class DetectorAwareBehaviour:
    """
    Detector-aware behavioural variant: target report with stochastic
    perturbation to balance influence and detectability.
    """
    traits: UserTraits
    target: float = 0.0
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0
    jitter: float = 0.08
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
                    meta={"agent_type": "detector_aware"},
                )
            ]
        camouflage = float(self.rng.normal(0.0, self.jitter))
        report = clamp01(self.target + camouflage)
        frac = 0.08 + 0.15 * self.traits.manipulation_strength
        deposit = float(np.clip(frac * wealth, 0.0, min(wealth, self.b_max)))
        return [
            AgentAction(
                account_id=self.traits.user_id,
                participate=True,
                report=report,
                deposit=deposit,
                meta={"agent_type": "detector_aware", "camouflage": camouflage},
            )
        ]

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
