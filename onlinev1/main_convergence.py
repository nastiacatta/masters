import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from functions.functions import initialize_weights
from online_algorithms.quantile_regression import online_quantile_regression_update_multiple_lead_times
from online_algorithms.adaptive_robust_quantile_regression import online_adaptive_robust_quantile_regression_multiple_lead_times
from data_generation.data_generation import (
    generate_time_invariant_data_multiple_lead_times,
    generate_abrupt_data_multiple_lead_times,
    generate_dynamic_data_sin_multiple_lead_times
)

n_experiments = 200
T = 20000
lead_time = 1
quantiles = [0.1, 0.5, 0.9]
n_forecasters = 3
algorithms = ["QR", "RQR"]
environment = "invariant"


def main():
    exp_weights = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
    true_weights = {}

    for q in quantiles:
        for i in range(n_experiments):
            weights_history = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
            for algo in algorithms:
                weights_history[algo][:, 0] = initialize_weights(n_forecasters)
                exp_weights[q][algo][:, 0] += weights_history[algo][:, 0]

            if environment == "invariant":
                realizations, forecasters_preds, w = generate_time_invariant_data_multiple_lead_times(T, lead_time, q)
            elif environment == "abrupt":
                realizations, forecasters_preds, w = generate_abrupt_data_multiple_lead_times(T, lead_time, q)
            elif environment == "variant":
                realizations, forecasters_preds, w = generate_dynamic_data_sin_multiple_lead_times(T, lead_time, q)
            else:
                raise ValueError(f"The defined environment is not yet implemented: {environment}")

            true_weights[q] = w
            sorted_forecasters = sorted(forecasters_preds.keys())

            if "RQR" in algorithms:
                alpha = (np.random.rand(n_forecasters, T) < 0.05).astype(np.int32)
                D_exp = np.zeros((n_forecasters, n_forecasters), dtype=np.float64)
                for t in range(T):
                    if np.sum(alpha[:, t]) == len(alpha[:, t]):
                        idx = np.random.randint(0, len(alpha[:, t]))
                        alpha[idx, t] = 0

            for t in range(1, T):
                forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters]
                y_true = realizations[t]

                forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
                if lead_time == 1:
                    forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)

                for algo in algorithms:
                    if algo == "RQR":
                        weights_history[algo][:, t], new_D, _ = online_adaptive_robust_quantile_regression_multiple_lead_times(
                            forecasters_preds_t_matrix,
                            y_true,
                            weights_history[algo][:, t-1],
                            D_exp,
                            alpha[:, t],
                            q,
                            0.01
                        )
                        prev_D = D_exp
                        D_exp = new_D
                        exp_weights[q][algo][:, t] += weights_history[algo][:, t]
                    elif algo == "QR":
                        weights_history[algo][:, t], _ = online_quantile_regression_update_multiple_lead_times(
                            forecasters_preds_t_matrix,
                            weights_history[algo][:, t-1],
                            y_true,
                            q,
                            0.01
                        )
                        exp_weights[q][algo][:, t] += weights_history[algo][:, t]

    for algo in algorithms:
        for q in quantiles:
            exp_weights[q][algo] = exp_weights[q][algo] / n_experiments

    return exp_weights, true_weights


if __name__ == "__main__":
    main()
