"""
Privileged-information behavioural regime.

A participant type that may condition reports on advance or lagged
information about the outcome (e.g. institutional or temporal advantage).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class PrivilegedInformationBehaviour:
    """
    Privileged-information behavioural regime: reports can be conditioned
    on an optional outcome sequence or lagged public history with low noise.
    """
    traits: UserTraits
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0
    y_sequence: Optional[Sequence[float]] = None

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
                    meta={"agent_type": "privileged_information"},
                )
            ]

        if self.y_sequence is not None and state.t < len(self.y_sequence):
            report = clamp01(float(self.y_sequence[state.t]))
        elif state.y_history:
            report = clamp01(float(state.y_history[-1] + self.rng.normal(0.0, self.traits.noise_level * 0.2)))
        else:
            report = 0.5

        frac = min(0.85, self.traits.stake_fraction + self.traits.insider_bonus)
        deposit = float(np.clip(frac * wealth, 0.0, min(wealth, self.b_max)))
        return [
            AgentAction(
                account_id=self.traits.user_id,
                participate=True,
                report=report,
                deposit=deposit,
                meta={"agent_type": "privileged_information"},
            )
        ]

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
