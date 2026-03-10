import numpy as np
from typing import List, Tuple, Union
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.functions import (
    quantile_loss_gradient,
    project_to_simplex,
    initialize_weights
)


def online_quantile_regression_update(
    forecasters_preds: np.ndarray,
    prev_forecaster_weights: np.ndarray,
    y_true: Union[float, np.ndarray],
    q: float,
    learning_rate: float = 0.01
) -> Tuple[np.ndarray, float]:
    forecasters_preds = np.asarray(forecasters_preds, dtype=np.float64).flatten()
    prev_forecaster_weights = np.asarray(prev_forecaster_weights, dtype=np.float64).flatten()
    y_true = np.asarray(y_true, dtype=np.float64)
    
    agg_quantile_t = np.sum(forecasters_preds * prev_forecaster_weights)
    
    gradient_scalar = quantile_loss_gradient(y_true, agg_quantile_t, q)
    lks = gradient_scalar * forecasters_preds
    
    new_weights = prev_forecaster_weights - learning_rate * lks
    new_weights = project_to_simplex(new_weights)
    
    return new_weights, agg_quantile_t


def online_quantile_regression_update_multiple_lead_times(
    forecasters_preds: np.ndarray,
    prev_forecaster_weights: np.ndarray,
    y_true: np.ndarray,
    q: float,
    learning_rate: float = 0.01
) -> Tuple[np.ndarray, Union[float, np.ndarray]]:
    forecasters_preds = np.asarray(forecasters_preds, dtype=np.float64)
    prev_forecaster_weights = np.asarray(prev_forecaster_weights, dtype=np.float64).flatten()
    y_true = np.asarray(y_true, dtype=np.float64).flatten()
    
    if forecasters_preds.ndim == 1:
        lead_time = 1
        n_forecasters = len(forecasters_preds)
        forecasters_preds_2d = forecasters_preds.reshape(-1, 1)
    else:
        n_forecasters, lead_time = forecasters_preds.shape
        forecasters_preds_2d = forecasters_preds
    
    agg_quantile_t_summed = np.sum(forecasters_preds_2d * prev_forecaster_weights[:, np.newaxis], axis=0)
    
    if lead_time == 1:
        agg_quantile_t = float(agg_quantile_t_summed[0])
        y_true_scalar = float(y_true[0]) if y_true.ndim > 0 else float(y_true)
        gradient_loss = np.array([
            quantile_loss_gradient(y_true_scalar, agg_quantile_t, q)
        ], dtype=np.float64)
        lks = gradient_loss[0] * forecasters_preds
    else:
        agg_quantile_t = agg_quantile_t_summed
        gradient_loss = np.array([
            quantile_loss_gradient(float(y_true[lt]), float(agg_quantile_t[lt]), q)
            for lt in range(lead_time)
        ], dtype=np.float64)
        lks = np.array([
            np.mean(forecasters_preds_2d[f, :] * gradient_loss)
            for f in range(n_forecasters)
        ], dtype=np.float64)
    
    new_weights = prev_forecaster_weights - learning_rate * lks
    new_weights = project_to_simplex(new_weights)
    
    return new_weights, agg_quantile_t


def online_quantile_regression(
    forecasters_preds: dict,
    forecaster_weights: np.ndarray,
    y_true: np.ndarray,
    T: int,
    q: float,
    learning_rate: float = 0.01
) -> np.ndarray:
    forecasters_names = list(forecasters_preds.keys())
    n_forecasters = len(forecasters_names)
    
    weights_history = np.zeros((n_forecasters, T), dtype=np.float64)
    weights_history[:, 0] = forecaster_weights
    
    for t in range(1, T):
        forecasters_preds_t = np.array([
            forecasters_preds[name][t] for name in forecasters_names
        ], dtype=np.float64)
        
        weights_history[:, t], _ = online_quantile_regression_update(
            forecasters_preds_t,
            weights_history[:, t - 1],
            y_true[t],
            q,
            learning_rate
        )
    
    return weights_history
