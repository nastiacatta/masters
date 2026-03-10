import numpy as np
from typing import Union


class QuantileLoss:
    def __init__(self, q: float):
        self.q = float(q)
        if not (0 < self.q < 1):
            raise ValueError(f"Quantile q must be in (0, 1), got {q}")
    
    def __call__(self, y_pred: Union[float, np.ndarray], y_true: Union[float, np.ndarray]) -> Union[float, np.ndarray]:
        y_pred = np.asarray(y_pred, dtype=np.float64)
        y_true = np.asarray(y_true, dtype=np.float64)
        
        if y_pred.shape != y_true.shape:
            y_pred, y_true = np.broadcast_arrays(y_pred, y_true)
        
        errors = y_true - y_pred
        loss = np.where(
            errors >= 0,
            self.q * errors,
            (1.0 - self.q) * (-errors)
        )
        
        return loss
