"""
Insider-information type.

Implemented as higher precision and optional early access,
with selective entry (participates only when expected advantage is high).
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class InsiderBehaviour:
    """
    Adversarial agent with superior information.

    Has:
      - Higher signal precision (lower noise) than normal users
      - Optional early access to outcomes (lookahead)
      - Selective entry: participates only when information advantage is large

    Implements BehaviourModel protocol.
    """

    def __init__(
        self,
        user: UserTraits,
        *,
        y_sequence: Optional[np.ndarray] = None,
        precision_boost: float = 5.0,
        lookahead: int = 0,
        entry_threshold: float = 0.05,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
        b_max: float = 10.0,
    ) -> None:
        self.user = user
        self.y_sequence = y_sequence
        self.precision_boost = precision_boost
        self.lookahead = lookahead
        self.entry_threshold = entry_threshold
        self.scoring_mode = scoring_mode
        if taus is None:
            self.taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9], dtype=np.float64).ravel().copy()
        else:
            self.taus = np.asarray(taus, dtype=np.float64).ravel().copy()
        self.b_max = b_max
        self._rng: Optional[np.random.Generator] = None

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)

    def _get_insider_signal(self, t: int) -> float:
        """Get a high-precision signal, possibly with lookahead."""
        effective_noise = self.user.noise_level / max(self.precision_boost, 1.0)

        if self.y_sequence is not None and t < len(self.y_sequence):
            if self.lookahead > 0 and t < len(self.y_sequence):
                true_y = float(self.y_sequence[t])
                return float(np.clip(
                    true_y + self._rng.normal(0.0, effective_noise * 0.1),
                    0.0, 1.0,
                ))
            else:
                true_y = float(self.y_sequence[t])
                return float(np.clip(
                    true_y + self._rng.normal(0.0, effective_noise),
                    0.0, 1.0,
                ))

        return float(np.clip(self._rng.normal(0.5, effective_noise), 0.0, 1.0))

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None

        wealth = state.wealth_prev.get(self.user.user_id, self.user.initial_wealth)
        if wealth <= 0.01:
            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=False,
                    meta={"attacker": "insider"},
                )
            ]

        signal = self._get_insider_signal(state.t)

        if len(state.agg_history) > 0:
            last_agg = state.agg_history[-1]
            if isinstance(last_agg, (int, float)):
                agg_median = float(last_agg)
            elif hasattr(last_agg, '__len__') and len(last_agg) > 0:
                agg_median = float(np.median(last_agg))
            else:
                agg_median = 0.5
        else:
            agg_median = 0.5

        edge = abs(signal - agg_median)
        if edge < self.entry_threshold:
            return [
                AgentAction(
                    account_id=self.user.user_id,
                    participate=False,
                    meta={
                        "attacker": "insider",
                        "edge": float(edge),
                        "selective_skip": True,
                    },
                )
            ]

        deposit = min(
            wealth * self.user.stake_fraction * (1.0 + edge * 5.0),
            self.b_max,
            wealth,
        )

        if self.scoring_mode == "quantiles_crps":
            from scipy.stats import norm
            effective_noise = self.user.noise_level / max(self.precision_boost, 1.0)
            report = np.clip(
                norm.ppf(self.taus, loc=signal, scale=max(effective_noise, 1e-6)),
                0.0, 1.0,
            )
        else:
            report = signal

        return [
            AgentAction(
                account_id=self.user.user_id,
                participate=True,
                report=report,
                deposit=max(0.0, deposit),
                meta={
                    "attacker": "insider",
                    "edge": float(edge),
                    "signal": float(signal),
                },
            )
        ]

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
