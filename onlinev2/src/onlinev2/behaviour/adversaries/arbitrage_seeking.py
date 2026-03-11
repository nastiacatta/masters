"""
Arbitrage-seeking strategy.

A participant type that participates only when a simple worst-case profit
lower bound (given current aggregate and report) is strictly positive.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState, clamp01
from onlinev2.behaviour.traits import UserTraits


@dataclass
class ArbitrageSeekingBehaviour:
    """
    Arbitrage-seeking strategy: chooses report at boundary (0 or 1) opposite
    to current aggregate and participates only when worst-case profit bound > 0.
    """
    traits: UserTraits
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0
    arbitrage_log: List[Dict[str, float]] = field(default_factory=list)

    def reset(self, seed: int) -> None:
        self.rng = np.random.default_rng(seed)
        self.arbitrage_log = []

    def _choose_candidate(self, state: RoundPublicState) -> float:
        ref = 0.5
        if state.agg_history:
            try:
                ref = float(np.asarray(state.agg_history[-1]).mean())
            except Exception:
                ref = 0.5
        return 0.0 if ref >= 0.5 else 1.0

    def _worst_case_profit_lb(self, report: float, state: RoundPublicState, deposit: float) -> float:
        ref = 0.5
        if state.agg_history:
            try:
                ref = float(np.asarray(state.agg_history[-1]).mean())
            except Exception:
                ref = 0.5
        edge = abs(float(report) - ref)
        raw = deposit * (0.12 * edge - 0.01)
        return max(0.0, float(raw))

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        wealth = max(0.0, float(state.wealth_prev.get(self.traits.user_id, self.traits.initial_wealth)))
        if wealth <= 0.0:
            self.arbitrage_log.append(
                {"t": float(state.t), "arbitrage_found": False, "worst_case_profit": 0.0}
            )
            return [
                AgentAction(
                    account_id=self.traits.user_id,
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={"agent_type": "arbitrage_seeking"},
                )
            ]

        deposit = float(np.clip(0.2 * wealth, 0.0, min(wealth, self.b_max)))
        candidate = clamp01(self._choose_candidate(state))
        lb = self._worst_case_profit_lb(candidate, state, deposit)
        found = bool(lb > 0.0)

        self.arbitrage_log.append(
            {
                "t": float(state.t),
                "candidate_report": float(candidate),
                "deposit": float(deposit),
                "worst_case_profit": float(lb),
                "arbitrage_found": bool(found),
            }
        )

        if not found:
            return [
                AgentAction(
                    account_id=self.traits.user_id,
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={"agent_type": "arbitrage_seeking"},
                )
            ]

        return [
            AgentAction(
                account_id=self.traits.user_id,
                participate=True,
                report=float(candidate),
                deposit=float(deposit),
                meta={"agent_type": "arbitrage_seeking", "arbitrage_found": True},
            )
        ]

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        return None
