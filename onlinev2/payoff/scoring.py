# Deprecated: use onlinev2.mechanism.scoring instead.
import warnings
warnings.warn(
    "payoff.scoring is deprecated; import from onlinev2.mechanism.scoring instead.",
    DeprecationWarning,
    stacklevel=2,
)
from onlinev2.mechanism.scoring import (
    mae_loss,
    score_mae,
    mae_score,
    pinball_loss,
    crps_hat_from_quantiles,
    score_crps_hat,
    score_from_loss,
    normalised_loss,
)

__all__ = [
    "mae_loss",
    "score_mae",
    "mae_score",
    "pinball_loss",
    "crps_hat_from_quantiles",
    "score_crps_hat",
    "score_from_loss",
    "normalised_loss",
]
