"""
Backwards-compatible baseline behaviours matching existing deposit modes.

These adapters wrap the legacy deposit logic so that existing experiments
continue to run unmodified through the BehaviourModel interface.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, BehaviourModel, RoundPublicState


class ExponentialDepositBehaviour:
    """IID exponential deposits (matches legacy 'exponential' deposit_mode)."""

    def __init__(
        self,
        n_agents: int,
        *,
        scale: float = 1.0,
        missing_prob: float = 0.2,
        reports_data: np.ndarray,
        q_reports_data: Optional[np.ndarray] = None,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
    ) -> None:
        self.n_agents = n_agents
        self.scale = scale
        self.missing_prob = missing_prob
        self.reports_data = reports_data
        self.q_reports_data = q_reports_data
        self.scoring_mode = scoring_mode
        self.taus = taus
        self._rng: Optional[np.random.Generator] = None
        self._ids = [f"agent_{i}" for i in range(n_agents)]

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None, "Call reset(seed) before act()"
        t = state.t
        actions: List[AgentAction] = []

        alpha = (self._rng.random(self.n_agents) < self.missing_prob).astype(int)
        if int(alpha.sum()) == self.n_agents:
            alpha[int(self._rng.integers(0, self.n_agents))] = 0

        deposits = self._rng.exponential(scale=self.scale, size=self.n_agents)
        deposits[alpha == 1] = 0.0

        for i in range(self.n_agents):
            participate = alpha[i] == 0
            if participate:
                if self.scoring_mode == "quantiles_crps" and self.q_reports_data is not None:
                    report = self.q_reports_data[i, t, :].copy()
                else:
                    report = float(self.reports_data[i, t])
            else:
                report = None

            actions.append(
                AgentAction(
                    account_id=self._ids[i],
                    participate=participate,
                    report=report,
                    deposit=float(deposits[i]),
                )
            )
        return actions

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass


class FixedDepositBehaviour:
    """Fixed deposits for all active agents (matches legacy 'fixed' deposit_mode)."""

    def __init__(
        self,
        n_agents: int,
        *,
        fixed_deposit: float = 1.0,
        missing_prob: float = 0.2,
        reports_data: np.ndarray,
        q_reports_data: Optional[np.ndarray] = None,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
    ) -> None:
        self.n_agents = n_agents
        self.fixed_deposit = fixed_deposit
        self.missing_prob = missing_prob
        self.reports_data = reports_data
        self.q_reports_data = q_reports_data
        self.scoring_mode = scoring_mode
        self.taus = taus
        self._rng: Optional[np.random.Generator] = None
        self._ids = [f"agent_{i}" for i in range(n_agents)]

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None
        t = state.t
        actions: List[AgentAction] = []

        alpha = (self._rng.random(self.n_agents) < self.missing_prob).astype(int)
        if int(alpha.sum()) == self.n_agents:
            alpha[int(self._rng.integers(0, self.n_agents))] = 0

        for i in range(self.n_agents):
            participate = alpha[i] == 0
            if participate:
                if self.scoring_mode == "quantiles_crps" and self.q_reports_data is not None:
                    report = self.q_reports_data[i, t, :].copy()
                else:
                    report = float(self.reports_data[i, t])
                deposit = self.fixed_deposit
            else:
                report = None
                deposit = 0.0

            actions.append(
                AgentAction(
                    account_id=self._ids[i],
                    participate=participate,
                    report=report,
                    deposit=deposit,
                )
            )
        return actions

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass


class BankrollBehaviour:
    """
    Bankroll-confidence deposits (matches legacy 'bankroll' deposit_mode).

    Deposit: b_i = min(W_i, b_max, f * W_i * c_i)
    Skill gating (m_i = b_i * g(sigma_i)) stays inside the mechanism (core).
    """

    def __init__(
        self,
        n_agents: int,
        *,
        W0: float = 10.0,
        f_stake: float = 0.3,
        b_max: float = 10.0,
        beta_c: float = 1.0,
        c_min: float = 0.8,
        c_max: float = 1.3,
        missing_prob: float = 0.2,
        reports_data: np.ndarray,
        q_reports_data: Optional[np.ndarray] = None,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
        lag_confidence: bool = False,
    ) -> None:
        self.n_agents = n_agents
        self.W0 = W0
        self.f_stake = f_stake
        self.b_max = b_max
        self.beta_c = beta_c
        self.c_min = c_min
        self.c_max = c_max
        self.missing_prob = missing_prob
        self.reports_data = reports_data
        self.q_reports_data = q_reports_data
        self.scoring_mode = scoring_mode
        self.taus = taus
        self.lag_confidence = lag_confidence
        self._rng: Optional[np.random.Generator] = None
        self._ids = [f"agent_{i}" for i in range(n_agents)]
        self._prev_q: Optional[np.ndarray] = None

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)
        self._prev_q = None

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        from onlinev2.mechanism.staking import confidence_from_quantiles, choose_deposits

        assert self._rng is not None
        t = state.t
        actions: List[AgentAction] = []

        alpha = (self._rng.random(self.n_agents) < self.missing_prob).astype(int)
        if int(alpha.sum()) == self.n_agents:
            alpha[int(self._rng.integers(0, self.n_agents))] = 0

        W = np.array(
            [state.wealth_prev.get(self._ids[i], self.W0) for i in range(self.n_agents)],
            dtype=np.float64,
        )

        if (
            self.scoring_mode == "quantiles_crps"
            and self.q_reports_data is not None
            and self.taus is not None
        ):
            q_source = (
                self._prev_q
                if (self.lag_confidence and self._prev_q is not None)
                else self.q_reports_data[:, t, :]
            )
            c_t = confidence_from_quantiles(
                q_source,
                self.taus,
                eps=1e-6,
                beta_c=self.beta_c,
                c_min=self.c_min,
                c_max=self.c_max,
            )
            self._prev_q = self.q_reports_data[:, t, :].copy()
        else:
            c_t = np.ones(self.n_agents, dtype=np.float64)

        b_t = choose_deposits(
            W, c_t, alpha, f=self.f_stake, b_max=self.b_max
        )

        for i in range(self.n_agents):
            participate = alpha[i] == 0
            if participate:
                if self.scoring_mode == "quantiles_crps" and self.q_reports_data is not None:
                    report = self.q_reports_data[i, t, :].copy()
                else:
                    report = float(self.reports_data[i, t])
                deposit = float(b_t[i])
            else:
                report = None
                deposit = 0.0

            actions.append(
                AgentAction(
                    account_id=self._ids[i],
                    participate=participate,
                    report=report,
                    deposit=deposit,
                )
            )
        return actions

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
