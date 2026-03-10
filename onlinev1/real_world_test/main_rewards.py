import numpy as np
import sys
import os
import random
from collections import OrderedDict

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.functions import initialize_weights
from functions.functions_payoff import payoff_update
from functions.quantile_loss_func import QuantileLoss
from online_algorithms.quantile_regression import online_quantile_regression_update_multiple_lead_times
from online_algorithms.adaptive_robust_quantile_regression import online_adaptive_robust_quantile_regression_multiple_lead_times
from payoff.shapley_values import shapley_payoff_multiple_lead_times
from real_world_test.data_preprop import preprocessing_forecasts, denormalize
import random

random.seed(42)
np.random.seed(42)

n_experiments = 10
T = 31
lead_time = 96
quantiles = [0.1, 0.5, 0.9]
total_reward = 100
delta = 0.7
n_forecasters = 2
algorithms = ["QR", "RQR"]
payoff_function = "Shapley"
path_ecmwf = "real_world_test/data/forecasts_ecmwf_ifs_paper.parquet"
path_noaa = "real_world_test/data/forecasts_noaa_gfs_paper.parquet"
path_elia = "real_world_test/data/historical_load_data_predico_2025_08_15.csv"

realizations = {q: [] for q in quantiles}
algo_forecasts = {q: {"ecmwf": [], "noaa": []} for q in quantiles}
elia_forecasts = {q: [] for q in quantiles}
payoffs = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
rewards = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
weights = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
rewards_in_sample = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
rewards_out_sample = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
losses_rqr = {q: np.zeros(T, dtype=np.float64) for q in quantiles}
losses_qr = {q: np.zeros(T, dtype=np.float64) for q in quantiles}

algo = "QR"

for q in quantiles:
    quantile_step_reward = total_reward / len(quantiles)
    
    for exp in range(n_experiments):
        weights_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        payoffs_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        rewards_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        rewards_in_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        rewards_out_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        
        weights_exp[:, 0] = initialize_weights(n_forecasters)
        
        true_prod, forecasters_preds, forecasts_elia, scaler_ecmwf, scaler_noaa, scaler_target, scaler_elia = preprocessing_forecasts(path_ecmwf, path_noaa, path_elia, q)
        sorted_f = sorted(forecasters_preds.items(), key=lambda x: x[0])
        sorted_forecasters = OrderedDict(sorted_f)
        
        for t in range(1, T):
            forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters.keys()]
            y_true = true_prod[t]
            
            if exp == 0:
                realizations[q].append(denormalize(y_true, scaler_target))
                elia_forecasts[q].append(denormalize(forecasts_elia[t], scaler_elia))
                
                for f in forecasters_preds.keys():
                    if f == "ecmwf":
                        algo_forecasts[q][f].append(denormalize(forecasters_preds[f][t], scaler_ecmwf))
                    else:
                        algo_forecasts[q][f].append(denormalize(forecasters_preds[f][t], scaler_noaa))
            
            forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
            if forecasters_preds_t_matrix.ndim == 1:
                forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)
            
            weights_exp[:, t], aggregated_forecast_t = online_quantile_regression_update_multiple_lead_times(
                forecasters_preds_t_matrix, weights_exp[:, t-1], y_true, q, 0.01
            )
            
            y_true_denorm = denormalize(y_true, scaler_target)
            agg_forecast_denorm = denormalize(aggregated_forecast_t, scaler_target)
            quantile_loss_fn = QuantileLoss(q)
            loss_t = np.mean(quantile_loss_fn(y_true_denorm, agg_forecast_denorm))
            losses_qr[q][t] += loss_t
            
            temp_payoffs = shapley_payoff_multiple_lead_times(forecasters_preds_t, [float(w) for w in weights_exp[:, t-1]], y_true, q)
            forecasters_losses = [
                np.mean(quantile_loss_fn(forecasters_preds_t[i], y_true))
                for i in range(len(forecasters_preds_t))
            ]
            temp_scores = 1.0 - (np.array(forecasters_losses, dtype=np.float64) / max(np.sum(forecasters_losses), np.finfo(np.float64).eps))
            payoffs_exp[:, t] = payoff_update(payoffs_exp[:, t-1], temp_payoffs, 0.999)
            
            payoffs_positive = np.maximum(0, payoffs_exp[:, t])
            rewards_in = delta * quantile_step_reward * (payoffs_positive / max(np.sum(payoffs_positive), np.finfo(np.float64).eps))
            rewards_out = (1 - delta) * quantile_step_reward * (temp_scores / np.sum(temp_scores))
            
            rewards_in_exp[:, t] = rewards_in
            rewards_out_exp[:, t] = rewards_out
            rewards_exp[:, t] = rewards_in + rewards_out
        
        payoffs[q][algo] += payoffs_exp
        weights[q][algo] += weights_exp
        rewards[q][algo] += rewards_exp
        rewards_in_sample[q][algo] += rewards_in_exp
        rewards_out_sample[q][algo] += rewards_out_exp

for q in quantiles:
    payoffs[q][algo] = payoffs[q][algo] / n_experiments
    weights[q][algo] = weights[q][algo] / n_experiments
    rewards[q][algo] = rewards[q][algo] / n_experiments
    rewards_in_sample[q][algo] = rewards_in_sample[q][algo] / n_experiments
    rewards_out_sample[q][algo] = rewards_out_sample[q][algo] / n_experiments

algo = "RQR"
missing_rate = 0.05

for q in quantiles:
    quantile_step_reward = total_reward / len(quantiles)
    
    for exp in range(n_experiments):
        weights_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        payoffs_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        rewards_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        rewards_in_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        rewards_out_exp = np.zeros((n_forecasters, T), dtype=np.float64)
        
        weights_exp[:, 0] = initialize_weights(n_forecasters)
        
        true_prod, forecasters_preds, forecasts_elia, scaler_ecmwf, scaler_noaa, scaler_target, scaler_elia = preprocessing_forecasts(path_ecmwf, path_noaa, path_elia, q)
        sorted_f = sorted(forecasters_preds.items(), key=lambda x: x[0])
        sorted_forecasters = OrderedDict(sorted_f)
        
        D_exp = np.zeros((n_forecasters, n_forecasters), dtype=np.float64)
        alpha = (np.random.rand(n_forecasters, T) < missing_rate).astype(np.int32)
        for t in range(T):
            if np.sum(alpha[:, t]) == n_forecasters:
                idx = np.random.randint(0, n_forecasters)
                alpha[idx, t] = 0
        
        for t in range(1, T):
            forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters.keys()]
            y_true = true_prod[t]
            
            forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
            if forecasters_preds_t_matrix.ndim == 1:
                forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)
            elif forecasters_preds_t_matrix.ndim == 2 and forecasters_preds_t_matrix.shape[0] == lead_time:
                forecasters_preds_t_matrix = forecasters_preds_t_matrix.T
            
            weights_exp[:, t], new_D, aggregated_forecast_t = online_adaptive_robust_quantile_regression_multiple_lead_times(
                forecasters_preds_t_matrix, y_true, weights_exp[:, t-1], D_exp, alpha[:, t], q, 0.01
            )
            prev_D = D_exp
            D_exp = new_D
            
            y_true_denorm = denormalize(y_true, scaler_target)
            agg_forecast_denorm = denormalize(aggregated_forecast_t, scaler_target)
            quantile_loss_fn = QuantileLoss(q)
            loss_t = np.mean(quantile_loss_fn(y_true_denorm, agg_forecast_denorm))
            losses_rqr[q][t] += loss_t
            
            temp_forecasts_t = [forecasters_preds_t[j] for j in range(len(forecasters_preds_t)) if alpha[j, t] == 0]
            temp_weights_t = weights_exp[:, t-1] + prev_D @ alpha[:, t].astype(np.float64)
            temp_weights_t_filtered = [temp_weights_t[j] for j in range(len(forecasters_preds_t)) if alpha[j, t] == 0]
            
            if len(temp_forecasts_t) > 0:
                temp_payoffs = shapley_payoff_multiple_lead_times(temp_forecasts_t, temp_weights_t_filtered, y_true, q)
                forecasters_losses = [
                    np.mean(quantile_loss_fn(temp_forecasts_t[i], y_true))
                    for i in range(len(temp_forecasts_t))
                ]
                temp_scores = [max(1.0 - (forecasters_losses[i] / np.sum(forecasters_losses)), np.finfo(np.float64).eps) for i in range(len(forecasters_losses))]
            else:
                temp_payoffs = np.zeros(n_forecasters, dtype=np.float64)
                forecasters_losses = np.ones(n_forecasters, dtype=np.float64)
                temp_scores = np.zeros(n_forecasters, dtype=np.float64)
            
            if len(temp_payoffs) < n_forecasters:
                temp_payoffs_full = np.zeros(n_forecasters, dtype=np.float64)
                temp_scores_full = np.zeros(n_forecasters, dtype=np.float64)
                idx_available = [j for j in range(len(forecasters_preds_t)) if alpha[j, t] == 0]
                for i, idx in enumerate(idx_available):
                    if i < len(temp_payoffs):
                        temp_payoffs_full[idx] = temp_payoffs[i]
                    if i < len(temp_scores):
                        temp_scores_full[idx] = temp_scores[i]
                temp_payoffs = temp_payoffs_full
                temp_scores = temp_scores_full
            
            payoffs_exp[:, t] = payoff_update(payoffs_exp[:, t-1], temp_payoffs, 0.999)
            
            payoffs_for_rewards_in = [max(0, payoffs_exp[j, t]) for j in range(len(forecasters_preds_t)) if alpha[j, t] == 0]
            rewards_in = np.zeros(n_forecasters, dtype=np.float64)
            rewards_in[[j for j in range(n_forecasters) if alpha[j, t] == 1]] = np.finfo(np.float64).eps
            if len(payoffs_for_rewards_in) > 0:
                rewards_in[[j for j in range(n_forecasters) if alpha[j, t] == 0]] = delta * quantile_step_reward * (np.array(payoffs_for_rewards_in, dtype=np.float64) / max(np.sum(payoffs_for_rewards_in), np.finfo(np.float64).eps))
            
            scores_for_rewards_out = [temp_scores[j] for j in range(len(forecasters_preds_t)) if alpha[j, t] == 0]
            rewards_out = np.zeros(n_forecasters, dtype=np.float64)
            rewards_out[[j for j in range(n_forecasters) if alpha[j, t] == 1]] = np.finfo(np.float64).eps
            if len(scores_for_rewards_out) > 0:
                rewards_out[[j for j in range(n_forecasters) if alpha[j, t] == 0]] = (1 - delta) * quantile_step_reward * (np.array(scores_for_rewards_out, dtype=np.float64) / np.sum(scores_for_rewards_out))
            
            rewards_in_exp[:, t] = rewards_in
            rewards_out_exp[:, t] = rewards_out
            rewards_exp[:, t] = rewards_in + rewards_out
        
        payoffs[q][algo] += payoffs_exp
        weights[q][algo] += weights_exp
        rewards[q][algo] += rewards_exp
        rewards_in_sample[q][algo] += rewards_in_exp
        rewards_out_sample[q][algo] += rewards_out_exp

for q in quantiles:
    payoffs[q][algo] = payoffs[q][algo] / n_experiments
    weights[q][algo] = weights[q][algo] / n_experiments
    rewards[q][algo] = rewards[q][algo] / n_experiments
    rewards_in_sample[q][algo] = rewards_in_sample[q][algo] / n_experiments
    rewards_out_sample[q][algo] = rewards_out_sample[q][algo] / n_experiments

for q in quantiles:
    losses_rqr[q] = losses_rqr[q] / n_experiments
    losses_qr[q] = losses_qr[q] / n_experiments
    
    losses_ecmwf = []
    losses_noaa = []
    
    for t in range(T - 1):
        loss_t_ecmwf = np.mean(QuantileLoss(q)(realizations[q][t], algo_forecasts[q]["ecmwf"][t]))
        loss_t_noaa = np.mean(QuantileLoss(q)(realizations[q][t], algo_forecasts[q]["noaa"][t]))
        losses_ecmwf.append(loss_t_ecmwf)
        losses_noaa.append(loss_t_noaa)
    
    print(f"############ RESULTS {q} ############")
    print(f"Loss aggregated QR: {np.mean(losses_qr[q])}")
    print(f"Loss aggregated RQR: {np.mean(losses_rqr[q])}")
    print(f"Loss ECWMF: {np.mean(losses_ecmwf)}")
    print(f"Loss NOAA: {np.mean(losses_noaa)}")

total_rewards_forecasters = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
total_in_rewards_forecasters = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
total_out_rewards_forecasters = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}

for algo in algorithms:
    for i in range(n_forecasters):
        for q in quantiles:
            total_rewards_forecasters[algo][i, :] += rewards[q][algo][i, :]
            total_in_rewards_forecasters[algo][i, :] += rewards_in_sample[q][algo][i, :]
            total_out_rewards_forecasters[algo][i, :] += rewards_out_sample[q][algo][i, :]

print("############ REWARDS SINGLE QUANTILES ############")
for q in quantiles:
    for algo in algorithms:
        print(f"REWARDS {q}")
        print(f"Total reward ECMWF {algo}: {np.sum(rewards[q][algo][0, :])}")
        print(f"Total reward NOAA {algo}: {np.sum(rewards[q][algo][1, :])}")
        print(f"In-sample reward ECMWF {algo}: {np.sum(rewards_in_sample[q][algo][0, :])}")
        print(f"In-sample reward NOAA {algo}: {np.sum(rewards_in_sample[q][algo][1, :])}")
        print(f"Out-of-sample reward ECMWF {algo}: {np.sum(rewards_out_sample[q][algo][0, :])}")
        print(f"Out-of-sample reward NOAA {algo}: {np.sum(rewards_out_sample[q][algo][1, :])}")

print("############ TOTAL REWARDS ############")
for algo in algorithms:
    print(f"Total reward ECMWF {algo}: {np.sum(total_rewards_forecasters[algo][0, :])}")
    print(f"Total reward NOAA {algo}: {np.sum(total_rewards_forecasters[algo][1, :])}")
    print(f"In-sample reward ECMWF {algo}: {np.sum(total_in_rewards_forecasters[algo][0, :])}")
    print(f"In-sample reward NOAA {algo}: {np.sum(total_in_rewards_forecasters[algo][1, :])}")
    print(f"Out-of-sample reward ECMWF {algo}: {np.sum(total_out_rewards_forecasters[algo][0, :])}")
    print(f"Out-of-sample reward NOAA {algo}: {np.sum(total_out_rewards_forecasters[algo][1, :])}")

