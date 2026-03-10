"""
Core mechanism types: params and mutable state for the deterministic round runner.

Mechanism does not import behaviour; actions passed to run_round satisfy the AgentInput
protocol (account_id, participate, report, deposit, meta). The behaviour layer
produces AgentAction instances that conform to this interface.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Protocol

import numpy as np


Report = Any


class AgentInput(Protocol):
    """Protocol for per-account round input. Satisfied by behaviour.protocol.AgentAction."""

    account_id: str
    participate: bool
    report: Any
    deposit: float
    meta: Dict[str, Any]


@dataclass
class MechanismParams:
    """Immutable mechanism hyper-parameters (fixed across a simulation run)."""

    lam: float = 0.3
    eta: float = 1.0
    sigma_min: float = 0.1
    omega_max: Optional[float] = None
    rho: float = 0.1
    gamma: float = 4.0
    kappa: float = 0.0
    L0: float = 0.0
    U: float = 0.0
    scoring_mode: str = "point_mae"
    taus: Optional[np.ndarray] = None
    eps: float = 1e-12


@dataclass
class MechanismState:
    """Mutable state that evolves from round to round."""

    t: int = 0
    wealth: Dict[str, float] = field(default_factory=dict)
    ewma_loss: Dict[str, float] = field(default_factory=dict)
    sigma: Dict[str, float] = field(default_factory=dict)
    weights_prev: Dict[str, float] = field(default_factory=dict)
    agg_prev: Optional[Report] = None
    profit_prev: Dict[str, float] = field(default_factory=dict)
