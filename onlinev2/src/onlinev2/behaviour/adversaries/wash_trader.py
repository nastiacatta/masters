"""
Wash-trading analogue: fake participation to maximise side rewards while minimising economic exposure.

Scaffolding only — disabled by default when there are no activity/volume rewards.
Minimum implementation: always participate with low-information reports, stake to maximise
any side reward per submission while minimising economic exposure.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class WashTradeLikeBehaviour:
    """
    Fake participation aimed at maximising any side reward per submission
    while minimising economic exposure (minimal stake, low-information reports).

    Use when the mechanism or platform offers activity/volume-based rewards;
    otherwise this behaviour has no advantage and is disabled by default.
    """

    def __init__(
        self,
        user: UserTraits,
        *,
        min_stake: float = 0.01,
        report_entropy: bool = True,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
    ) -> None:
        self.user = user
        self.min_stake = min_stake
        self.report_entropy = report_entropy
        self.scoring_mode = scoring_mode
        if taus is None:
            self.taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9], dtype=np.float64).ravel().copy()
        else:
            self.taus = np.asarray(taus, dtype=np.float64).ravel().copy()
        self._rng: Optional[np.random.Generator] = None

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None

        wealth = state.wealth_prev.get(self.user.user_id, self.user.initial_wealth)
        deposit = min(self.min_stake, wealth, 1.0)
        if deposit <= 0:
            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=False,
                    meta={"attacker": "wash_trader"},
                )
            ]

        if self.report_entropy:
            report_val = float(self._rng.uniform(0.0, 1.0))
        else:
            report_val = 0.5

        if self.scoring_mode == "quantiles_crps":
            from scipy.stats import norm
            report = np.clip(
                norm.ppf(self.taus, loc=report_val, scale=0.5),
                0.0, 1.0,
            )
        else:
            report = report_val

        return [
            AgentAction(
                account_id=self.user.user_id,
                participate=True,
                report=report,
                deposit=deposit,
                meta={"attacker": "wash_trader", "low_info": True},
            )
        ]

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
