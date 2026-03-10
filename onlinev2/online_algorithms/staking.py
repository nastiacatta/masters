# TODO: Deprecated. Import from onlinev2.mechanism.staking instead.
from onlinev2.mechanism.staking import (
    confidence_from_quantiles,
    choose_deposits,
    skill_gate,
    effective_wager_bankroll,
    cap_weight_shares,
    update_wealth,
)

__all__ = [
    "confidence_from_quantiles",
    "choose_deposits",
    "skill_gate",
    "effective_wager_bankroll",
    "cap_weight_shares",
    "update_wealth",
]
