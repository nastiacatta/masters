"""
Wash trader / activity gamer adversary.

Creates fake activity via multiple accounts with self-contained interaction patterns
to inflate activity metrics.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class WashTraderBehaviour:
    """
    Wash-style activity gamer: uses multiple accounts to create fake activity
    and inflate participation metrics.
    """
    traits: UserTraits
    k_accounts: int = 3
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
                    meta={"agent_type": "wash_trader"},
                )
            ]
        anchor = 0.5
        if state.y_history:
            anchor = float(np.mean(state.y_history[-min(10, len(state.y_history)):]))
        report = clamp01(anchor + self.rng.normal(0.0, 0.05))
        per_deposit = float(np.clip(wealth * 0.1 / self.k_accounts, 0.01, min(wealth / self.k_accounts, self.b_max)))
        out: List[AgentAction] = []
        for j in range(self.k_accounts):
            out.append(
                AgentAction(
                    account_id=f"{self.traits.user_id}__wash_{j}",
                    participate=True,
                    report=report,
                    deposit=per_deposit,
                    meta={"agent_type": "wash_trader", "wash_parent": self.traits.user_id},
                )
            )
        return out

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
