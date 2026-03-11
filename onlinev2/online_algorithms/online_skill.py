# Deprecated: use onlinev2.mechanism.skill instead.
import warnings
warnings.warn(
    "online_algorithms.online_skill is deprecated; import from onlinev2.mechanism.skill instead.",
    DeprecationWarning,
    stacklevel=2,
)
from onlinev2.mechanism.skill import (
    update_ewma_loss,
    loss_to_skill,
    calibrate_gamma,
    missingness_L0,
)

__all__ = [
    "update_ewma_loss",
    "loss_to_skill",
    "calibrate_gamma",
    "missingness_L0",
]
