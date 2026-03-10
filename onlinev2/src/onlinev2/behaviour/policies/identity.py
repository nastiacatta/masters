"""
Hidden mapping from real users to accounts (sybils).

All identity logic lives in behaviour; core only sees accounts.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction


class IdentityPolicy(ABC):
    """Base class for identity-to-account mappings."""

    @abstractmethod
    def map_user_action(
        self,
        *,
        user_id: str,
        participate: bool,
        report: Optional[np.ndarray],
        deposit: float,
        meta: Dict,
    ) -> List[AgentAction]:
        """Map a single user's intended action to one or more account actions."""
        ...


class SingleAccountIdentity(IdentityPolicy):
    """One user, one account. The default honest mapping."""

    def map_user_action(
        self,
        *,
        user_id: str,
        participate: bool,
        report: Optional[np.ndarray],
        deposit: float,
        meta: Dict,
    ) -> List[AgentAction]:
        return [
            AgentAction(
                account_id=user_id,
                participate=participate,
                report=report,
                deposit=deposit,
                meta={**meta, "real_user_id": user_id},
            )
        ]


class SplitAccountIdentity(IdentityPolicy):
    """
    Stake splitting to bypass per-account caps.

    Splits deposit across k accounts, each submitting the same report.
    sum of deposits across accounts == intended user deposit.
    """

    def __init__(self, k: int = 2) -> None:
        if k < 1:
            raise ValueError("k must be >= 1")
        self.k = k

    def map_user_action(
        self,
        *,
        user_id: str,
        participate: bool,
        report: Optional[np.ndarray],
        deposit: float,
        meta: Dict,
    ) -> List[AgentAction]:
        if not participate or self.k == 1:
            return [
                AgentAction(
                    account_id=f"{user_id}_0",
                    participate=participate,
                    report=report,
                    deposit=deposit,
                    meta={**meta, "real_user_id": user_id, "sybil_index": 0},
                )
            ]

        split_deposit = deposit / self.k
        actions = []
        for j in range(self.k):
            actions.append(
                AgentAction(
                    account_id=f"{user_id}_{j}",
                    participate=True,
                    report=report,
                    deposit=split_deposit,
                    meta={
                        **meta,
                        "real_user_id": user_id,
                        "sybil_index": j,
                        "sybil_total": self.k,
                    },
                )
            )
        return actions


class ReputationResetIdentity(IdentityPolicy):
    """
    Discard identity after losses to reset reputation.

    When cumulative losses exceed a threshold, creates a new account.
    """

    def __init__(self, loss_threshold: float = -5.0) -> None:
        self.loss_threshold = loss_threshold
        self._cumulative_profit: Dict[str, float] = {}
        self._generation: Dict[str, int] = {}

    def map_user_action(
        self,
        *,
        user_id: str,
        participate: bool,
        report: Optional[np.ndarray],
        deposit: float,
        meta: Dict,
    ) -> List[AgentAction]:
        if user_id not in self._generation:
            self._generation[user_id] = 0
            self._cumulative_profit[user_id] = 0.0

        gen = self._generation[user_id]
        account_id = f"{user_id}_gen{gen}"

        return [
            AgentAction(
                account_id=account_id,
                participate=participate,
                report=report,
                deposit=deposit,
                meta={
                    **meta,
                    "real_user_id": user_id,
                    "generation": gen,
                    "reputation_reset": True,
                },
            )
        ]

    def update_profit(self, user_id: str, profit: float) -> None:
        """Call after each round to track cumulative profit."""
        self._cumulative_profit[user_id] = (
            self._cumulative_profit.get(user_id, 0.0) + profit
        )
        if self._cumulative_profit[user_id] < self.loss_threshold:
            self._generation[user_id] = self._generation.get(user_id, 0) + 1
            self._cumulative_profit[user_id] = 0.0


class SybilFarmingIdentity(IdentityPolicy):
    """
    Sybil farming for side rewards from participation/volume.

    Creates multiple accounts with minimal economic exposure.
    Scaffolding only — disabled by default.
    """

    def __init__(self, n_sybils: int = 5, min_deposit: float = 0.01) -> None:
        self.n_sybils = n_sybils
        self.min_deposit = min_deposit

    def map_user_action(
        self,
        *,
        user_id: str,
        participate: bool,
        report: Optional[np.ndarray],
        deposit: float,
        meta: Dict,
    ) -> List[AgentAction]:
        if not participate:
            return [
                AgentAction(
                    account_id=f"{user_id}_farm_0",
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={**meta, "real_user_id": user_id, "farming": True},
                )
            ]

        actions = []
        real_deposit = max(deposit - self.n_sybils * self.min_deposit, 0.0)
        actions.append(
            AgentAction(
                account_id=f"{user_id}_farm_0",
                participate=True,
                report=report,
                deposit=real_deposit,
                meta={
                    **meta,
                    "real_user_id": user_id,
                    "farming": True,
                    "farm_primary": True,
                },
            )
        )
        for j in range(1, self.n_sybils + 1):
            actions.append(
                AgentAction(
                    account_id=f"{user_id}_farm_{j}",
                    participate=True,
                    report=report,
                    deposit=self.min_deposit,
                    meta={
                        **meta,
                        "real_user_id": user_id,
                        "farming": True,
                        "farm_primary": False,
                    },
                )
            )
        return actions
