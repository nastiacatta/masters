"""Compatibility shim: use onlinev2.core.skill for new code."""
from onlinev2.core.skill import (
    update_ewma_loss,
    loss_to_skill,
    calibrate_gamma,
    missingness_L0,
)
__all__ = ["update_ewma_loss", "loss_to_skill", "calibrate_gamma", "missingness_L0"]
