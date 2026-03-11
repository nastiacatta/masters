"""
Coordinated multi-account participation.

A strategy class in which multiple participant identities submit the same
report in a round (coordinated participation).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class CoordinatedGroupBehaviour:
    """
    Coordinated group behavioural regime: members share a single
    coordinated report per round, with individual stakes.
    """
    members: Sequence[UserTraits]
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0

    def reset(self, seed: int) -> None:
        self.rng = np.random.default_rng(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        if not self.members:
            return []

        anchor = 0.5 if not state.y_history else float(np.mean(state.y_history[-min(15, len(state.y_history)):]))
        coordinated_report = clamp01(anchor + self.rng.normal(0.0, 0.03))

        out: List[AgentAction] = []
        for tr in self.members:
            wealth = max(0.0, float(state.wealth_prev.get(tr.user_id, tr.initial_wealth)))
            if wealth <= 0.0:
                out.append(
                    AgentAction(
                        account_id=tr.user_id,
                        participate=False,
                        report=None,
                        deposit=0.0,
                        meta={"agent_type": "coordinated_group"},
                    )
                )
                continue

            deposit = float(np.clip(tr.stake_fraction * wealth, 0.0, min(wealth, self.b_max)))
            out.append(
                AgentAction(
                    account_id=tr.user_id,
                    participate=True,
                    report=coordinated_report,
                    deposit=deposit,
                    meta={"agent_type": "coordinated_group", "coordinated": True},
                )
            )
        return out

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
