"""
Mechanism: scoring, settlement, skill updates, aggregation, runner, metrics.

Single source of truth for the Lambert self-financed wagering mechanism.
Does not import behaviour; actions are passed in via the AgentInput protocol.
"""

from onlinev2.mechanism.models import (
    AgentInput,
    MechanismParams,
    MechanismState,
    Report,
)
from onlinev2.mechanism.runner import run_round

__all__ = [
    "AgentInput",
    "MechanismParams",
    "MechanismState",
    "Report",
    "run_round",
]
