"""Compatibility shim: use onlinev2.core.staking for new code."""
from onlinev2.core.staking import (
    confidence_from_quantiles,
    choose_deposits,
    skill_gate,
    effective_wager_bankroll,
    cap_weight_shares,
    update_wealth,
)
__all__ = [
    "confidence_from_quantiles", "choose_deposits", "skill_gate",
    "effective_wager_bankroll", "cap_weight_shares", "update_wealth",
]
