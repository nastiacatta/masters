"""
Adaptive evader: detector-aware attacker.

Objective includes an anomaly penalty based on logged features:
    max  kappa * d(.) - E[pi_t] - lambda * AnomalyScore(phi(history))

The evader modulates its manipulation to stay below detection thresholds.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class AdaptiveEvaderBehaviour:
    """
    Adversarial agent that balances manipulation with evasion.

    Adjusts manipulation intensity based on a simple anomaly score
    computed from its own history of actions.

    Implements BehaviourModel protocol.
    """

    def __init__(
        self,
        user: UserTraits,
        *,
        target: float = 0.0,
        kappa: float = 5.0,
        anomaly_lambda: float = 2.0,
        anomaly_window: int = 20,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
        b_max: float = 10.0,
    ) -> None:
        self.user = user
        self.target = target
        self.kappa = kappa
        self.anomaly_lambda = anomaly_lambda
        self.anomaly_window = anomaly_window
        self.scoring_mode = scoring_mode
        self.taus = taus or np.array([0.1, 0.25, 0.5, 0.75, 0.9])
        self.b_max = b_max
        self._rng: Optional[np.random.Generator] = None
        self._report_history: List[float] = []
        self._deposit_history: List[float] = []
        self._participation_history: List[bool] = []

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)
        self._report_history.clear()
        self._deposit_history.clear()
        self._participation_history.clear()

    def _anomaly_score(self) -> float:
        """Simple anomaly score based on action history variance and extremes."""
        if len(self._report_history) < 3:
            return 0.0

        window = self._report_history[-self.anomaly_window:]
        deposits = self._deposit_history[-self.anomaly_window:]
        participation = self._participation_history[-self.anomaly_window:]

        report_var = float(np.var(window))
        deposit_var = float(np.var(deposits)) if len(deposits) > 1 else 0.0

        part_rate = sum(participation) / max(len(participation), 1)

        report_extremeness = sum(1 for r in window if r < 0.1 or r > 0.9) / max(
            len(window), 1
        )

        score = report_var * 2.0 + deposit_var * 0.5 + report_extremeness * 3.0
        if part_rate > 0.95:
            score += 1.0

        return float(score)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None

        wealth = state.wealth_prev.get(self.user.user_id, self.user.initial_wealth)
        if wealth <= 0.01:
            self._participation_history.append(False)
            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=False,
                    meta={"attacker": "evader"},
                )
            ]

        anomaly = self._anomaly_score()

        effective_kappa = max(
            0.0, self.kappa - self.anomaly_lambda * anomaly
        )

        if effective_kappa < 0.1:
            report_val = float(np.clip(self._rng.normal(0.5, 0.1), 0.01, 0.99))
            deposit = wealth * self.user.stake_fraction * 0.5
        else:
            blend = min(effective_kappa / self.kappa, 1.0)
            honest = float(np.clip(self._rng.normal(0.5, 0.1), 0.01, 0.99))
            report_val = (1.0 - blend) * honest + blend * self.target
            report_val = float(np.clip(report_val, 0.01, 0.99))
            deposit = wealth * self.user.stake_fraction

        deposit = min(deposit, self.b_max, wealth)

        self._report_history.append(report_val)
        self._deposit_history.append(deposit)
        self._participation_history.append(True)

        if self.scoring_mode == "quantiles_crps":
            from scipy.stats import norm
            report = np.clip(
                norm.ppf(self.taus, loc=report_val, scale=self.user.noise_level),
                0.0, 1.0,
            )
        else:
            report = report_val

        return [
            AgentAction(
                account_id=self.user.user_id,
                participate=True,
                report=report,
                deposit=max(0.0, deposit),
                meta={
                    "attacker": "evader",
                    "anomaly_score": anomaly,
                    "effective_kappa": effective_kappa,
                },
            )
        ]

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
