"""
Strategic reporter adversary.

Focused on moving the aggregate forecast rather than maximising immediate score.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class StrategicReporterBehaviour:
    """
    Strategic reporter: reports to push the aggregate toward a target,
    accepting short-term score loss for aggregate influence.
    """
    traits: UserTraits
    target: float = 0.5
    pull: float = 0.8
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0

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
                    meta={"agent_type": "strategic_reporter"},
                )
            ]
        anchor = 0.5
        if state.agg_history:
            try:
                anchor = float(np.asarray(state.agg_history[-1]).mean())
            except Exception:
                pass
        report = clamp01((1.0 - self.pull) * anchor + self.pull * self.target)
        deposit = float(np.clip(wealth * (0.1 + 0.2 * self.traits.manipulation_strength), 0.0, min(wealth, self.b_max)))
        return [
            AgentAction(
                account_id=self.traits.user_id,
                participate=True,
                report=report,
                deposit=deposit,
                meta={"agent_type": "strategic_reporter", "target": self.target},
            )
        ]

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
