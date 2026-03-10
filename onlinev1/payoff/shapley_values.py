import numpy as np
from typing import List, Union
import sys
import os
import math

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.functions_payoff import get_subsets_excluding_players
from functions.quantile_loss_func import QuantileLoss


def shapley_payoff(
    forecasters_preds: List[float],
    weights_combination: List[float],
    y_true: float,
    q: float
) -> np.ndarray:
    forecasters_preds = list(forecasters_preds)
    weights_combination = list(weights_combination)
    n_forecasters = len(forecasters_preds)
    
    shapley_values = np.zeros(n_forecasters, dtype=np.float64)
    quantile_loss_fn = QuantileLoss(q)
    
    for f in range(1, n_forecasters + 1):
        value = 0.0
        
        subsets = get_subsets_excluding_players(forecasters_preds, f)
        subsets_weights = get_subsets_excluding_players(weights_combination, f)
        
        for i, sub in enumerate(subsets):
            w = len(sub)
            factor = (math.factorial(w) * math.factorial(n_forecasters - w - 1)) / math.factorial(n_forecasters)
            sub_weights = subsets_weights[i]
            
            subset_forecast = sum(sp * sw for sp, sw in zip(sub, sub_weights))
            loss_subset = quantile_loss_fn(subset_forecast, y_true)
            
            expanded_subset = list(sub) + [forecasters_preds[f - 1]]
            expanded_weights = list(sub_weights) + [weights_combination[f - 1]]
            expanded_forecast = sum(esp * esw for esp, esw in zip(expanded_subset, expanded_weights))
            loss_expanded = quantile_loss_fn(expanded_forecast, y_true)
            
            value += factor * (loss_subset - loss_expanded)
        
        w = 0
        factor = (math.factorial(w) * math.factorial(n_forecasters - w - 1)) / math.factorial(n_forecasters)
        
        subset_forecast = 0.0
        loss_subset = quantile_loss_fn(subset_forecast, y_true)
        expanded_forecast = forecasters_preds[f - 1] * weights_combination[f - 1]
        loss_expanded = quantile_loss_fn(expanded_forecast, y_true)
        value += factor * (loss_subset - loss_expanded)
        
        shapley_values[f - 1] = value
    
    return shapley_values


def shapley_payoff_multiple_lead_times(
    forecasters_preds: List,
    weights_combination: List[float],
    y_true,
    q: float
) -> np.ndarray:
    weights_combination = [float(w) for w in weights_combination]
    
    y_true_arr = np.asarray(y_true, dtype=np.float64)
    if y_true_arr.ndim == 0:
        y_true_arr = np.array([float(y_true_arr)], dtype=np.float64)
    
    n_forecasters = len(forecasters_preds)
    shapley_values = np.zeros(n_forecasters, dtype=np.float64)
    quantile_loss_fn = QuantileLoss(q)
    
    for f in range(1, n_forecasters + 1):
        value = 0.0
        
        subsets = get_subsets_excluding_players(forecasters_preds, f)
        subsets_weights = get_subsets_excluding_players(weights_combination, f)
        
        for i, sub in enumerate(subsets):
            w = len(sub)
            factor = (math.factorial(w) * math.factorial(n_forecasters - w - 1)) / math.factorial(n_forecasters)
            sub_weights = subsets_weights[i]
            
            if len(sub) == 0:
                subset_forecast = 0.0
            else:
                first_el = sub[0]
                if isinstance(first_el, (int, float)):
                    subset_forecast = sum(float(sp) * sw for sp, sw in zip(sub, sub_weights))
                else:
                    first_arr = np.asarray(first_el, dtype=np.float64)
                    subset_forecast = np.zeros_like(first_arr, dtype=np.float64)
                    for sp, sw in zip(sub, sub_weights):
                        sp_arr = np.asarray(sp, dtype=np.float64)
                        subset_forecast = subset_forecast + sp_arr * sw
                    if isinstance(subset_forecast, np.ndarray) and subset_forecast.ndim > 0 and len(subset_forecast) == 1:
                        subset_forecast = float(subset_forecast[0])
            
            loss_subset_val = quantile_loss_fn(subset_forecast, y_true_arr)
            loss_subset = float(np.mean(loss_subset_val)) if isinstance(loss_subset_val, np.ndarray) else float(loss_subset_val)
            
            expanded_subset = list(sub) + [forecasters_preds[f - 1]]
            expanded_weights = list(sub_weights) + [weights_combination[f - 1]]
            
            if len(expanded_subset) == 0:
                expanded_forecast = 0.0
            else:
                first_el = expanded_subset[0]
                if isinstance(first_el, (int, float)):
                    expanded_forecast = sum(float(esp) * esw for esp, esw in zip(expanded_subset, expanded_weights))
                else:
                    first_arr = np.asarray(first_el, dtype=np.float64)
                    expanded_forecast = np.zeros_like(first_arr, dtype=np.float64)
                    for esp, esw in zip(expanded_subset, expanded_weights):
                        esp_arr = np.asarray(esp, dtype=np.float64)
                        expanded_forecast = expanded_forecast + esp_arr * esw
                    if isinstance(expanded_forecast, np.ndarray) and expanded_forecast.ndim > 0 and len(expanded_forecast) == 1:
                        expanded_forecast = float(expanded_forecast[0])
            
            loss_expanded_val = quantile_loss_fn(expanded_forecast, y_true_arr)
            loss_expanded = float(np.mean(loss_expanded_val)) if isinstance(loss_expanded_val, np.ndarray) else float(loss_expanded_val)
            
            value += factor * (loss_subset - loss_expanded)
        
        w = 0
        factor = (math.factorial(w) * math.factorial(n_forecasters - w - 1)) / math.factorial(n_forecasters)
        
        subset_forecast = 0.0
        loss_subset_val = quantile_loss_fn(subset_forecast, y_true_arr)
        loss_subset = float(np.mean(loss_subset_val)) if isinstance(loss_subset_val, np.ndarray) else float(loss_subset_val)
        
        expanded_raw = forecasters_preds[f - 1]
        if isinstance(expanded_raw, (int, float)):
            expanded_forecast = float(expanded_raw) * weights_combination[f - 1]
        else:
            expanded_arr = np.asarray(expanded_raw, dtype=np.float64)
            expanded_forecast = expanded_arr * weights_combination[f - 1]
            if isinstance(expanded_forecast, np.ndarray):
                if expanded_forecast.ndim == 0:
                    expanded_forecast = float(expanded_forecast)
                elif expanded_forecast.ndim > 0 and len(expanded_forecast) == 1:
                    expanded_forecast = float(expanded_forecast[0])
        
        loss_expanded_val = quantile_loss_fn(expanded_forecast, y_true_arr)
        loss_expanded = float(np.mean(loss_expanded_val)) if isinstance(loss_expanded_val, np.ndarray) else float(loss_expanded_val)
        value += factor * (loss_subset - loss_expanded)
        
        shapley_values[f - 1] = value
    
    return shapley_values
