"""
Arbitrageur: riskless profit seeker.

Given current state, searches a small candidate set of reports (and deposits)
and picks the one that maximises worst-case profit over a grid of outcomes:

    pi^wc(r) = min_{y in Y} pi(r, y)

Logs when pi^wc(r) > 0 as "arbitrage found".
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class ArbitrageurBehaviour:
    """
    Adversarial agent that searches for riskless profit opportunities.

    Implements BehaviourModel protocol.
    """

    def __init__(
        self,
        user: UserTraits,
        *,
        y_grid_size: int = 21,
        report_grid_size: int = 21,
        deposit_candidates: Optional[List[float]] = None,
        b_max: float = 10.0,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
    ) -> None:
        self.user = user
        self.y_grid = np.linspace(0.0, 1.0, y_grid_size)
        self.report_grid = np.linspace(0.01, 0.99, report_grid_size)
        self.deposit_candidates = deposit_candidates or [0.5, 1.0, 2.0, 5.0]
        self.b_max = b_max
        self.scoring_mode = scoring_mode
        self.taus = taus or np.array([0.1, 0.25, 0.5, 0.75, 0.9])
        self._rng: Optional[np.random.Generator] = None
        self.arbitrage_log: List[Dict[str, Any]] = []

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)
        self.arbitrage_log.clear()

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        from onlinev2.mechanism.scoring import score_mae, score_crps_hat

        assert self._rng is not None

        wealth = state.wealth_prev.get(self.user.user_id, self.user.initial_wealth)
        if wealth <= 0.01:
            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={"attacker": "arbitrageur", "arbitrage_found": False},
                )
            ]

        best_wc_profit = -np.inf
        best_report = None
        best_deposit = 0.0
        best_profits_grid = None

        sigma_self = state.sigma_prev.get(self.user.user_id, 0.5)
        other_weights = {
            k: v for k, v in state.weights_prev.items()
            if k != self.user.user_id
        }
        M_others = sum(other_weights.values())

        for r_candidate in self.report_grid:
            for b_candidate in self.deposit_candidates:
                b = min(b_candidate, wealth, self.b_max)
                if b <= 0:
                    continue

                wc_profit = np.inf
                profits_grid = []

                for y in self.y_grid:
                    if self.scoring_mode == "quantiles_crps":
                        q = np.full((1, len(self.taus)), r_candidate)
                        s = float(score_crps_hat(y, q, self.taus)[0])
                    else:
                        s = float(score_mae(y, r_candidate))

                    m_self = b * (0.3 + 0.7 * sigma_self)
                    M_total = M_others + m_self
                    if M_total < 1e-12:
                        pi = 0.0
                    else:
                        s_bar_approx = 0.5
                        pi = m_self * (s - s_bar_approx) 

                    profits_grid.append(pi)
                    wc_profit = min(wc_profit, pi)

                if wc_profit > best_wc_profit:
                    best_wc_profit = wc_profit
                    best_report = r_candidate
                    best_deposit = b
                    best_profits_grid = profits_grid

        arbitrage_found = best_wc_profit > 0.0
        self.arbitrage_log.append({
            "t": state.t,
            "arbitrage_found": arbitrage_found,
            "worst_case_profit": float(best_wc_profit) if np.isfinite(best_wc_profit) else 0.0,
            "best_report": best_report,
            "best_deposit": best_deposit,
        })

        if best_report is not None and best_deposit > 0:
            if self.scoring_mode == "quantiles_crps":
                report = np.full(len(self.taus), best_report)
            else:
                report = best_report

            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=True,
                    report=report,
                    deposit=best_deposit,
                    meta={
                        "attacker": "arbitrageur",
                        "arbitrage_found": arbitrage_found,
                        "worst_case_profit": float(best_wc_profit),
                    },
                )
            ]

        return [
            AgentAction(
                account_id=self.user.user_id,
                participate=False,
                report=None,
                deposit=0.0,
                meta={"attacker": "arbitrageur", "arbitrage_found": False},
            )
        ]

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
