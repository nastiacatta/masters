"""
External-utility manipulator: wants to move the aggregate forecast.

Objective (discrete optimisation):
    max_{r, b}  kappa * d(R_hat_t, R_hat_target_t) - E[pi_t]

The manipulator accepts expected losses on scoring in exchange for
moving the aggregate toward a desired target.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class ManipulatorBehaviour:
    """
    Adversarial agent that submits reports to move the aggregate
    toward a target, trading off scoring loss for influence.

    Implements BehaviourModel protocol.
    """

    def __init__(
        self,
        user: UserTraits,
        *,
        target: float = 0.0,
        kappa: float = 5.0,
        report_grid_size: int = 21,
        deposit_candidates: Optional[List[float]] = None,
        b_max: float = 10.0,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
    ) -> None:
        self.user = user
        self.target = target
        self.kappa = kappa
        self.report_grid = np.linspace(0.01, 0.99, report_grid_size)
        self.deposit_candidates = deposit_candidates or [1.0, 2.0, 5.0, 10.0]
        self.b_max = b_max
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
        if wealth <= 0.01:
            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=False,
                    meta={"attacker": "manipulator"},
                )
            ]

        if len(state.agg_history) > 0:
            last_agg = state.agg_history[-1]
            if isinstance(last_agg, (int, float)):
                current_agg = float(last_agg)
            elif hasattr(last_agg, '__len__') and len(last_agg) > 0:
                current_agg = float(np.median(last_agg))
            else:
                current_agg = 0.5
        else:
            current_agg = 0.5

        best_obj = -np.inf
        best_r = 0.5
        best_b = 1.0

        sigma_self = state.sigma_prev.get(self.user.user_id, 0.5)

        for r_candidate in self.report_grid:
            for b_candidate in self.deposit_candidates:
                b = min(b_candidate, wealth, self.b_max)
                if b <= 0:
                    continue

                m_self = b * (0.3 + 0.7 * sigma_self)
                M_others = sum(
                    v for k, v in state.weights_prev.items()
                    if k != self.user.user_id
                )
                M_total = M_others + m_self
                if M_total < 1e-12:
                    continue

                w_self = m_self / M_total
                shifted_agg = (1.0 - w_self) * current_agg + w_self * r_candidate

                distance_reduction = abs(current_agg - self.target) - abs(
                    shifted_agg - self.target
                )

                expected_loss = abs(r_candidate - current_agg) * m_self

                obj = self.kappa * distance_reduction - expected_loss

                if obj > best_obj:
                    best_obj = obj
                    best_r = r_candidate
                    best_b = b

        if self.scoring_mode == "quantiles_crps":
            report = np.full(len(self.taus), best_r)
        else:
            report = best_r

        return [
            AgentAction(
                account_id=self.user.user_id,
                participate=True,
                report=report,
                deposit=best_b,
                meta={
                    "attacker": "manipulator",
                    "target": self.target,
                    "objective": float(best_obj),
                },
            )
        ]

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
