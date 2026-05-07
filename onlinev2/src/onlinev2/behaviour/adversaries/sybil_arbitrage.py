"""
Combined sybil + arbitrage-seeking adversary.

Motivation: Chen-Devanur-Pennock-Vaughan (2014) show the no-arbitrage
wagering family is sybilproof under the `f`-norm construction
(Theorem 5.8). The weighted-score wagering mechanism used by this project
is the non-arbitrage-free variant (MAE-WSWM). A natural robustness check
is whether an attacker who already exploits the weighted-median
arbitrage can *amplify* its profit by splitting the same total stake
across k sybil accounts.

This adversary wraps :class:`ArbitrageSeekingBehaviour` and redirects
its single AgentAction into k identically reporting sybil accounts. The
total deposit is split evenly; all sybils report the same arbitrage
point, so the coalition mimics a single-account arbitrage but with an
inflated N_eff and a different wager distribution.

Tests in the experiment suite compare

    profit_total(k=1) vs profit_total(k=3) vs profit_total(k=5)

to check sybil-proofness empirically. Under the MAE-WSWM this should
produce near-identical totals (the mechanism is Lambert-sybilproof);
any k-dependent pattern is a stress-test finding worth reporting.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from onlinev2.behaviour.adversaries.arbitrage_seeking import ArbitrageSeekingBehaviour
from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


@dataclass
class SybilArbitrageBehaviour:
    """Split-account arbitrageur.

    Parameters
    ----------
    traits
        Parent traits; wealth and stake are shared across all k sybils.
    k_accounts
        Number of sybil accounts to fan out across.
    target_others
        Optional callback supplying the lagged (p_{-i}, w_{-i}) snapshot
        (see ``ArbitrageSeekingBehaviour``).
    """
    traits: UserTraits
    k_accounts: int = 3
    scoring_mode: str = "point_mae"
    taus: Optional[Sequence[float]] = None
    b_max: float = 10.0
    target_others: Optional[Any] = None
    expected_profit_threshold: float = 1e-4
    _arb: ArbitrageSeekingBehaviour = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self._arb = ArbitrageSeekingBehaviour(
            traits=self.traits,
            scoring_mode=self.scoring_mode,
            taus=self.taus,
            b_max=self.b_max,
            target_others=self.target_others,
            expected_profit_threshold=self.expected_profit_threshold,
        )

    @property
    def arbitrage_log(self) -> List[Dict[str, float]]:
        return self._arb.arbitrage_log

    def reset(self, seed: int) -> None:
        self._arb.reset(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        # Delegate to the underlying arbitrage seeker. It returns one
        # AgentAction against the parent user_id; we fan it out into
        # k evenly sized sybil accounts that all submit the same report.
        inner = self._arb.act(state)
        if not inner:
            return []
        parent = inner[0]
        k = max(1, int(self.k_accounts))

        if not parent.participate:
            # Emit k non-participating placeholders so downstream
            # detectors still see the linked-account layout.
            return [
                AgentAction(
                    account_id=f"{self.traits.user_id}__sybil_{j}",
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={
                        "agent_type": "sybil_arbitrage",
                        "sybil_parent": self.traits.user_id,
                        "sybil_index": j,
                        "sybil_k": k,
                    },
                )
                for j in range(k)
            ]

        per_deposit = float(parent.deposit) / float(k)
        report = parent.report
        out: List[AgentAction] = []
        for j in range(k):
            out.append(
                AgentAction(
                    account_id=f"{self.traits.user_id}__sybil_{j}",
                    participate=True,
                    report=report,
                    deposit=per_deposit,
                    meta={
                        **dict(parent.meta),
                        "agent_type": "sybil_arbitrage",
                        "sybil_parent": self.traits.user_id,
                        "sybil_index": j,
                        "sybil_k": k,
                    },
                )
            )
        return out

    def observe_round_result(self, *, t: int, y_t: float, logs_t: Dict[str, Any]) -> None:
        self._arb.observe_round_result(t=t, y_t=y_t, logs_t=logs_t)
