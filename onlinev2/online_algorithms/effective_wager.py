# Deprecated: use onlinev2.mechanism.weights instead.
import warnings
warnings.warn(
    "online_algorithms.effective_wager is deprecated; import from onlinev2.mechanism.weights instead.",
    DeprecationWarning,
    stacklevel=2,
)
from onlinev2.mechanism.weights import effective_wager, refund

__all__ = ["effective_wager", "refund"]
