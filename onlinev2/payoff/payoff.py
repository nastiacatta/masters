# Deprecated: use onlinev2.mechanism.settlement and onlinev2.mechanism.aggregation instead.
import warnings
warnings.warn(
    "payoff.payoff is deprecated; import from onlinev2.mechanism.settlement and onlinev2.mechanism.aggregation instead.",
    DeprecationWarning,
    stacklevel=2,
)
from onlinev2.mechanism.settlement import (
    skill_payoff,
    utility_payoff,
    settle_round,
    raja_competitive_payout,
    profit,
)
from onlinev2.mechanism.aggregation import aggregate_forecast

__all__ = [
    "skill_payoff",
    "utility_payoff",
    "settle_round",
    "raja_competitive_payout",
    "profit",
    "aggregate_forecast",
]
