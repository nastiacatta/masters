import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from functions.functions import initialize_weights
from functions.metrics import (
    calculate_instantaneous_errors,
    calculate_instantaneous_variance
)
from online_algorithms.quantile_regression import online_quantile_regression_update_multiple_lead_times
from online_algorithms.adaptive_robust_quantile_regression import online_adaptive_robust_quantile_regression_multiple_lead_times
from online_algorithms.robust_optimization_benchmark import (
    quantile_regression_mean_imputation_multiple_lead_times,
    quantile_regression_last_impute_multiple_lead_times
)
from data_generation.data_generation import generate_time_invariant_data_multiple_lead_times

n_experiments = 100
T = 20000
q = 0.1
n_forecasters = 3
algorithms = ["RQR"]
show_benchmarks = True
lead_time = 1
missing_rates = [0.05]

if show_benchmarks:
    algorithms.append("mean_impute")
    algorithms.append("last_impute")


def main():
    exp_weights = {algo: {f: np.zeros((n_experiments, T), dtype=np.float64) for f in range(1, n_forecasters + 1)} for algo in algorithms}
    miss_variance = {missing_rate: np.zeros((n_forecasters, T), dtype=np.float64) for missing_rate in missing_rates}
    miss_biass = {missing_rate: np.zeros((n_forecasters, T), dtype=np.float64) for missing_rate in missing_rates}
    true_weights = None

    for missing_rate in missing_rates:
        for i in range(n_experiments):
            weights_history = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
            for algo in algorithms:
                w_init = initialize_weights(n_forecasters)
                weights_history[algo][:, 0] = w_init
                for f in range(n_forecasters):
                    exp_weights[algo][f+1][i, 0] = w_init[f]

            realizations, forecasters_preds, w = generate_time_invariant_data_multiple_lead_times(T, lead_time, q)
            sorted_forecasters = sorted(forecasters_preds.keys())

            if i == 0:
                true_weights = w.T

            D_exp = None
            if "RQR" in algorithms:
                alpha = (np.random.rand(n_forecasters, T) < missing_rate).astype(np.int32)
                for t in range(T):
                    if np.sum(alpha[:, t]) == n_forecasters:
                        idx = np.random.randint(0, n_forecasters)
                        alpha[idx, t] = 0
                D_exp = np.zeros((n_forecasters, n_forecasters), dtype=np.float64)

            for t in range(1, T):
                forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters]
                y_true = realizations[t]

                if np.sum(alpha[:, t]) == n_forecasters:
                    idx = np.random.randint(0, n_forecasters)
                    alpha[idx, t] = 0

                for algo in algorithms:
                    if algo == "QR":
                        forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
                        if lead_time == 1:
                            forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)
                        weights_history[algo][:, t], _ = online_quantile_regression_update_multiple_lead_times(
                            forecasters_preds_t_matrix, weights_history[algo][:, t-1], y_true, q
                        )
                    elif algo == "RQR":
                        forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
                        if lead_time == 1:
                            forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)
                        weights_history[algo][:, t], new_D, _ = online_adaptive_robust_quantile_regression_multiple_lead_times(
                            forecasters_preds_t_matrix, y_true, weights_history[algo][:, t-1], D_exp, alpha[:, t], q
                        )
                        D_exp = new_D

                    for f in range(n_forecasters):
                        exp_weights[algo][f+1][i, t] = weights_history[algo][f, t]

            if show_benchmarks:
                forecasters_preds_matrix = np.zeros((n_forecasters, T, lead_time), dtype=np.float64)
                for f_idx, f_name in enumerate(sorted_forecasters):
                    for t in range(T):
                        if lead_time == 1:
                            forecasters_preds_matrix[f_idx, t, 0] = forecasters_preds[f_name][t][0]
                        else:
                            for lt in range(lead_time):
                                forecasters_preds_matrix[f_idx, t, lt] = forecasters_preds[f_name][t][lt]

                if "mean_impute" in algorithms:
                    w0 = weights_history["mean_impute"][:, 0]
                    results_w, results_f = quantile_regression_mean_imputation_multiple_lead_times(
                        forecasters_preds_matrix, realizations, w0, alpha, q
                    )
                    for f in range(n_forecasters):
                        exp_weights["mean_impute"][f+1][i, :] = results_w[f, :]

                if "last_impute" in algorithms:
                    w0 = weights_history["last_impute"][:, 0]
                    results_w, results_f = quantile_regression_last_impute_multiple_lead_times(
                        forecasters_preds_matrix, realizations, w0, alpha, q
                    )
                    for f in range(n_forecasters):
                        exp_weights["last_impute"][f+1][i, :] = results_w[f, :]

        errors = {algo: {f: np.zeros((n_experiments, T), dtype=np.float64) for f in range(1, n_forecasters + 1)} for algo in algorithms}
        for algo in algorithms:
            for f in range(1, n_forecasters + 1):
                for i in range(n_experiments):
                    errors[algo][f][i, :] = calculate_instantaneous_errors(exp_weights[algo][f][i, :], true_weights[:, f-1])

        weights_mc = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
        biasses_mc = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}

        for algo in algorithms:
            for f in range(1, n_forecasters + 1):
                weights_mc[algo][f-1, :] = np.mean(exp_weights[algo][f], axis=0)
                biasses_mc[algo][f-1, :] = np.mean(errors[algo][f], axis=0)

        variances = {algo: {f: np.zeros((n_experiments, T), dtype=np.float64) for f in range(1, n_forecasters + 1)} for algo in algorithms}
        variances_mc = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
        for algo in algorithms:
            for f in range(1, n_forecasters + 1):
                for i in range(n_experiments):
                    variances[algo][f][i, :] = calculate_instantaneous_variance(errors[algo][f][i, :], biasses_mc[algo][f-1, :])
                variances_mc[algo][f-1, :] = np.sum(variances[algo][f], axis=0) / (n_experiments - 1)

        miss_variance[missing_rate] = variances_mc["RQR"]
        miss_biass[missing_rate] = biasses_mc["RQR"]

    return exp_weights, miss_variance, miss_biass


if __name__ == "__main__":
    main()
