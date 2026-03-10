import numpy as np
import sys
import os
import random
from collections import OrderedDict

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
except ImportError:
    raise ImportError("matplotlib is required for main_plot_single_day. Install with: pip install matplotlib")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from functions.functions import initialize_weights
from functions.quantile_loss_func import QuantileLoss
from online_algorithms.quantile_regression import online_quantile_regression_update_multiple_lead_times
from online_algorithms.adaptive_robust_quantile_regression import online_adaptive_robust_quantile_regression_multiple_lead_times
from real_world_test.data_preprop import preprocessing_forecasts, denormalize

random.seed(42)
np.random.seed(42)

n_experiments = 1
T = 31
lead_time = 96
quantiles = [0.1, 0.5, 0.9]
n_forecasters = 2
algorithms = ["QR"]
path_ecmwf = "real_world_test/data/forecasts_ecmwf_ifs_paper.parquet"
path_noaa = "real_world_test/data/forecasts_noaa_gfs_paper.parquet"
path_elia = "real_world_test/data/historical_load_data_predico_2025_08_15.csv"

exp_weights = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
realizations = {q: [] for q in quantiles}
aggregated_forecasts = {q: {algo: [] for algo in algorithms} for q in quantiles}
algo_forecasts = {q: {"ecmwf": [], "noaa": []} for q in quantiles}
elia_forecasts = {q: [] for q in quantiles}

for q in quantiles:
    weights_history = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
    for algo in algorithms:
        weights_history[algo][:, 0] = initialize_weights(n_forecasters)
        exp_weights[q][algo][:, 0] += weights_history[algo][:, 0]
    
    true_prod, forecasters_preds, forecasts_elia, scaler_ecmwf, scaler_noaa, scaler_target, scaler_elia = preprocessing_forecasts(path_ecmwf, path_noaa, path_elia, q)
    sorted_f = sorted(forecasters_preds.items(), key=lambda x: x[0])
    sorted_forecasters = OrderedDict(sorted_f)
    
    if "QR" in algorithms:
        alpha = (np.random.rand(n_forecasters, T) < 0.1).astype(np.int32)
        D_exp = np.zeros((n_forecasters, n_forecasters), dtype=np.float64)
    
    for t in range(1, T):
        forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters.keys()]
        y_true = true_prod[t]
        realizations[q].append(denormalize(y_true, scaler_target))
        elia_forecasts[q].append(denormalize(forecasts_elia[t], scaler_elia))
        
        for f in forecasters_preds.keys():
            if f == "ecmwf":
                algo_forecasts[q][f].append(denormalize(forecasters_preds[f][t], scaler_ecmwf))
            else:
                algo_forecasts[q][f].append(denormalize(forecasters_preds[f][t], scaler_noaa))
        
        for algo in algorithms:
            forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
            if forecasters_preds_t_matrix.ndim == 1:
                forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)
            elif forecasters_preds_t_matrix.ndim == 2 and forecasters_preds_t_matrix.shape[0] == lead_time:
                forecasters_preds_t_matrix = forecasters_preds_t_matrix.T
            
            if algo == "RQR":
                weights_history[algo][:, t], new_D, aggregated_forecast_t = online_adaptive_robust_quantile_regression_multiple_lead_times(
                    forecasters_preds_t_matrix, y_true, weights_history[algo][:, t-1], D_exp, alpha[:, t], q, 0.01
                )
                prev_D = D_exp
                D_exp = new_D
                exp_weights[q][algo][:, t] += weights_history[algo][:, t]
            elif algo == "QR":
                weights_history[algo][:, t], aggregated_forecast_t = online_quantile_regression_update_multiple_lead_times(
                    forecasters_preds_t_matrix, weights_history[algo][:, t-1], y_true, q, 0.01
                )
                exp_weights[q][algo][:, t] += weights_history[algo][:, t]
            aggregated_forecasts[q][algo].append(denormalize(aggregated_forecast_t, scaler_target))

for algo in algorithms:
    for q in quantiles:
        exp_weights[q][algo] = exp_weights[q][algo] / n_experiments

fig, ax = plt.subplots(figsize=(12, 5))
ax.plot(realizations[0.5][19], label="True Value", linewidth=4, color='black', linestyle='-')
ax.plot(aggregated_forecasts[0.5]["QR"][19], label="Combination", linewidth=2, color='blue', linestyle='-')
ax.plot(algo_forecasts[0.5]["ecmwf"][19], label="ECMWF", linewidth=2, color='red', linestyle='--')
ax.plot(algo_forecasts[0.5]["noaa"][19], label="NOAA", linewidth=2, color='orange', linestyle=':')
ax.set_xlabel("Lead Time [15-minutes]")
ax.set_ylabel("MW")
ax.legend(fontsize=12)
os.makedirs("plots/real_test", exist_ok=True)
plt.savefig("plots/real_test/plot_elia_q50.pdf")
plt.close()

algo = "QR"
for q in quantiles:
    losses_aggregated = []
    losses_ecmwf = []
    losses_noaa = []
    
    for t in range(T - 1):
        if q == 0.5:
            loss_t = np.sqrt(np.mean((realizations[q][t] - aggregated_forecasts[q][algo][t]) ** 2))
            loss_t_ecmwf = np.sqrt(np.mean((realizations[q][t] - algo_forecasts[q]["ecmwf"][t]) ** 2))
            loss_t_noaa = np.sqrt(np.mean((realizations[q][t] - algo_forecasts[q]["noaa"][t]) ** 2))
        else:
            quantile_loss_fn = QuantileLoss(q)
            loss_t = np.mean(quantile_loss_fn(realizations[q][t], aggregated_forecasts[q][algo][t]))
            loss_t_ecmwf = np.mean(quantile_loss_fn(realizations[q][t], algo_forecasts[q]["ecmwf"][t]))
            loss_t_noaa = np.mean(quantile_loss_fn(realizations[q][t], algo_forecasts[q]["noaa"][t]))
        losses_aggregated.append(loss_t)
        losses_ecmwf.append(loss_t_ecmwf)
        losses_noaa.append(loss_t_noaa)
    
    print(f"RESULTS {q}")
    print(f"Loss aggregated: {np.mean(losses_aggregated)}")
    print(f"Loss ECWMF: {np.mean(losses_ecmwf)}")
    print(f"Loss NOAA: {np.mean(losses_noaa)}")

