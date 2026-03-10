"""
Behaviour–mechanism interface.

The core mechanism never calls any "choose deposit" or "participation" code.
The simulator loop only ever gets per-round inputs via BehaviourModel.act.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Protocol, Sequence

import numpy as np

Report = Any  # point float or (K,) quantile array


@dataclass(frozen=True)
class RoundPublicState:
    """Observable state broadcast to every behaviour model at the start of a round."""

    t: int
    y_history: Sequence[float]
    agg_history: Sequence[Report]
    weights_prev: Dict[str, float]
    sigma_prev: Dict[str, float]
    wealth_prev: Dict[str, float]
    profit_prev: Dict[str, float]


@dataclass(frozen=True)
class AgentAction:
    """Single-account action submitted by a behaviour model for one round."""

    account_id: str
    participate: bool
    report: Optional[Report] = None
    deposit: float = 0.0
    meta: Dict[str, Any] = field(default_factory=dict)


class BehaviourModel(Protocol):
    """Protocol that every behaviour implementation must satisfy."""

    def reset(self, seed: int) -> None:
        """Re-initialise all internal RNG state."""
        ...

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        """Return one AgentAction per account for this round."""
        ...

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        """Receive outcome and settlement logs after the round."""
        ...
