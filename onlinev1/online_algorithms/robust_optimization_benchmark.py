import numpy as np
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.functions import (
    quantile_loss_gradient,
    project_to_simplex
)


def quantile_regression_mean_imputation_multiple_lead_times(forecasters_preds, y, w, alpha, q, learning_rate=0.01):
    if forecasters_preds.ndim == 3:
        n_forecasters, T, n = forecasters_preds.shape
        forecasters_preds_2d = forecasters_preds
    else:
        n_forecasters, T = forecasters_preds.shape[:2]
        n = 1
        forecasters_preds_2d = forecasters_preds.reshape(n_forecasters, T, 1)
    
    warmup_len = min(100, T)
    received_f = {i: [forecasters_preds_2d[i, t, :].copy() for t in range(warmup_len)] for i in range(n_forecasters)}
    forecasts_history = np.zeros((T, n), dtype=np.float64) if n > 1 else np.zeros(T, dtype=np.float64)
    weights_history = np.zeros((n_forecasters, T), dtype=np.float64)
    
    for t in range(warmup_len):
        weights_history[:, t] = w
        if n > 1:
            forecasts_history[t, :] = 0.0
        else:
            forecasts_history[t] = 0.0
    
    for t in range(warmup_len, T):
        forecasters_preds_t = np.zeros((n_forecasters, n), dtype=np.float64)
        prev_w = weights_history[:, t-1]
        y_t = y[t]
        
        for i in range(n_forecasters):
            if alpha[i, t] == 1:
                if n == 1:
                    forecasters_preds_t[i, 0] = np.mean([rf[0] for rf in received_f[i]])
                else:
                    forecasters_preds_t[i, :] = np.mean([rf for rf in received_f[i]], axis=0)
            else:
                forecasters_preds_t[i, :] = forecasters_preds_2d[i, t, :].copy()
                received_f[i].append(forecasters_preds_2d[i, t, :].copy())
        
        if n == 1:
            combined_quantile = float(np.sum(forecasters_preds_t[:, 0] * prev_w))
            y_t_scalar = y_t[0] if isinstance(y_t, np.ndarray) and y_t.ndim > 0 else y_t
            gradient_w = quantile_loss_gradient(y_t_scalar, combined_quantile, q) * forecasters_preds_t[:, 0]
        else:
            combined_quantile = np.sum(forecasters_preds_t * prev_w[:, np.newaxis], axis=0)
            gradient_loss = np.array([
                quantile_loss_gradient(float(y_t[lt]), float(combined_quantile[lt]), q)
                for lt in range(n)
            ], dtype=np.float64)
            gradient_w = np.array([
                np.mean(forecasters_preds_t[f, :] * gradient_loss)
                for f in range(n_forecasters)
            ], dtype=np.float64)
        
        weights_history[:, t] = prev_w - learning_rate * gradient_w
        weights_history[:, t] = project_to_simplex(weights_history[:, t])
        if n > 1:
            forecasts_history[t, :] = combined_quantile
        else:
            forecasts_history[t] = combined_quantile
    
    return weights_history, forecasts_history


def quantile_regression_last_impute_multiple_lead_times(forecasters_preds, y, w, alpha, q, learning_rate=0.01):
    if forecasters_preds.ndim == 3:
        n_forecasters, T, n = forecasters_preds.shape
        forecasters_preds_2d = forecasters_preds
    else:
        n_forecasters, T = forecasters_preds.shape[:2]
        n = 1
        forecasters_preds_2d = forecasters_preds.reshape(n_forecasters, T, 1)
    
    last_forecasts = {i: forecasters_preds_2d[i, 0, :].copy() for i in range(n_forecasters)}
    forecasts_history = np.zeros((T, n), dtype=np.float64) if n > 1 else np.zeros(T, dtype=np.float64)
    weights_history = np.zeros((n_forecasters, T), dtype=np.float64)
    weights_history[:, 0] = w
    
    for t in range(1, T):
        forecasters_preds_t = np.zeros((n_forecasters, n), dtype=np.float64)
        prev_w = weights_history[:, t-1]
        y_t = y[t]
        
        for i in range(n_forecasters):
            if alpha[i, t] == 1:
                forecasters_preds_t[i, :] = last_forecasts[i].copy()
            else:
                forecasters_preds_t[i, :] = forecasters_preds_2d[i, t, :].copy()
                last_forecasts[i] = forecasters_preds_2d[i, t, :].copy()
        
        if n == 1:
            combined_quantile = float(np.sum(forecasters_preds_t[:, 0] * prev_w))
            y_t_scalar = y_t[0] if isinstance(y_t, np.ndarray) and y_t.ndim > 0 else y_t
            gradient_w = quantile_loss_gradient(y_t_scalar, combined_quantile, q) * forecasters_preds_t[:, 0]
        else:
            combined_quantile = np.sum(forecasters_preds_t * prev_w[:, np.newaxis], axis=0)
            gradient_loss = np.array([
                quantile_loss_gradient(float(y_t[lt]), float(combined_quantile[lt]), q)
                for lt in range(n)
            ], dtype=np.float64)
            gradient_w = np.array([
                np.mean(forecasters_preds_t[f, :] * gradient_loss)
                for f in range(n_forecasters)
            ], dtype=np.float64)
        
        weights_history[:, t] = prev_w - learning_rate * gradient_w
        weights_history[:, t] = project_to_simplex(weights_history[:, t])
        if n > 1:
            forecasts_history[t, :] = combined_quantile
        else:
            forecasts_history[t] = combined_quantile
    
    return weights_history, forecasts_history

