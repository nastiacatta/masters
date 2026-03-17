# Deprecated: use onlinev2.mechanism.staking instead.
import warnings

warnings.warn(
    "online_algorithms.staking is deprecated; import from onlinev2.mechanism.staking instead.",
    DeprecationWarning,
    stacklevel=2,
)
from onlinev2.mechanism.staking import (
    cap_weight_shares,
    choose_deposits,
    confidence_from_quantiles,
    effective_wager_bankroll,
    skill_gate,
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
