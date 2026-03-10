import numpy as np
from typing import Tuple, Union
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.functions import (
    quantile_loss_gradient,
    project_to_simplex
)


def online_adaptive_robust_quantile_regression(
    x: np.ndarray,
    y: float,
    prev_w: np.ndarray,
    prev_D: np.ndarray,
    alpha: np.ndarray,
    q: float,
    learning_rate: float = 0.01
) -> Tuple[np.ndarray, np.ndarray, float]:
    x = np.asarray(x, dtype=np.float64).flatten()
    prev_w = np.asarray(prev_w, dtype=np.float64).flatten()
    prev_D = np.asarray(prev_D, dtype=np.float64)
    alpha = np.asarray(alpha, dtype=np.int32).flatten()
    y = float(y)
    
    n_forecasters = len(x)
    
    masked_x = x * (1.0 - alpha.astype(np.float64))
    
    w_adjusted = prev_w + prev_D @ alpha.astype(np.float64)
    agg_quantile_t = np.sum(w_adjusted * masked_x)
    
    gradient_scalar = quantile_loss_gradient(y, agg_quantile_t, q)
    
    gradient_w = gradient_scalar * masked_x
    
    gradient_D = gradient_scalar * np.outer(masked_x, alpha.astype(np.float64))
    
    new_w = prev_w - learning_rate * gradient_w
    new_w = project_to_simplex(new_w)
    
    new_D = prev_D - learning_rate * gradient_D
    
    return new_w, new_D, agg_quantile_t


def online_adaptive_robust_quantile_regression_multiple_lead_times(
    x: np.ndarray,
    y: np.ndarray,
    prev_w: np.ndarray,
    prev_D: np.ndarray,
    alpha: np.ndarray,
    q: float,
    learning_rate: float = 0.01
) -> Tuple[np.ndarray, np.ndarray, Union[float, np.ndarray]]:
    x = np.asarray(x, dtype=np.float64)
    prev_w = np.asarray(prev_w, dtype=np.float64).flatten()
    prev_D = np.asarray(prev_D, dtype=np.float64)
    alpha = np.asarray(alpha, dtype=np.int32).flatten()
    y = np.asarray(y, dtype=np.float64).flatten()
    
    if x.ndim == 1:
        x = x.reshape(-1, 1)
    
    n_forecasters, lead_time = x.shape
    
    alpha_2d = alpha.astype(np.float64)[:, np.newaxis]
    masked_x = x * (1.0 - alpha_2d)  # shape (n_forecasters, lead_time)
    
    # CRITICAL: For lead_time>1, agg_quantile_t must be a vector (matches Julia Vector{Vector} behavior)
    w_adjusted = prev_w + prev_D @ alpha.astype(np.float64)  # shape (n_forecasters,)
    # Matrix multiplication: (n_forecasters,) @ (n_forecasters, lead_time) -> (lead_time,)
    agg_quantile_t = w_adjusted @ masked_x  # shape (lead_time,) NOT scalar
    
    # Elementwise gradient loss for each lead time
    gradient_loss = np.array([
        quantile_loss_gradient(y[lt], agg_quantile_t[lt], q)
        for lt in range(lead_time)
    ], dtype=np.float64)  # shape (lead_time,)
    
    # gradient_w: mean over lead times for each forecaster
    gradient_w = np.mean(masked_x * gradient_loss[np.newaxis, :], axis=1)  # shape (n_forecasters,)
    
    # gradient_D: outer product
    gradient_D = np.outer(gradient_w, alpha.astype(np.float64))  # shape (n_forecasters, n_forecasters)
    
    new_w = prev_w - learning_rate * gradient_w
    new_w = project_to_simplex(new_w)
    
    new_D = prev_D - learning_rate * gradient_D
    
    return new_w, new_D, agg_quantile_t

