import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from functions.functions import initialize_weights
from functions.functions_payoff import payoff_update
from functions.quantile_loss_func import QuantileLoss
from online_algorithms.quantile_regression import online_quantile_regression_update_multiple_lead_times
from online_algorithms.adaptive_robust_quantile_regression import online_adaptive_robust_quantile_regression_multiple_lead_times
from payoff.shapley_values import shapley_payoff_multiple_lead_times
from data_generation.data_generation import (
    generate_time_invariant_data_multiple_lead_times,
    generate_abrupt_data_multiple_lead_times,
    generate_dynamic_data_sin_multiple_lead_times
)

quantiles = [0.1, 0.5, 0.9]
n_forecasters = 3
algorithms = ["QR", "RQR"]
payoff_functions = "Shapley"
total_reward = 100
T = 20000
n_experiments = 200
lead_time = 12
delta = 0.7
environment = "invariant"


def main():
    payoffs = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
    rewards = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
    weights = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
    rewards_in_sample = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}
    rewards_out_sample = {q: {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms} for q in quantiles}

    for algo in algorithms:
        for q in quantiles:
            weights[q][algo][:, 0] = initialize_weights(n_forecasters)

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

            if environment == "invariant":
                realizations, forecasters_preds, w = generate_time_invariant_data_multiple_lead_times(T, lead_time, q)
            elif environment == "abrupt":
                realizations, forecasters_preds, w = generate_abrupt_data_multiple_lead_times(T, lead_time, q)
            elif environment == "variant":
                realizations, forecasters_preds, w = generate_dynamic_data_sin_multiple_lead_times(T, lead_time, q)
            else:
                raise ValueError(f"The defined environment is not yet implemented: {environment}")

            sorted_forecasters = sorted(forecasters_preds.keys())

            for t in range(1, T):
                forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters]
                y_true = realizations[t]

                forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
                if lead_time == 1:
                    forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)

                weights_exp[:, t], _ = online_quantile_regression_update_multiple_lead_times(
                    forecasters_preds_t_matrix,
                    weights_exp[:, t-1],
                    y_true,
                    q,
                    0.01
                )
                temp_payoffs = shapley_payoff_multiple_lead_times(
                    forecasters_preds_t,
                    weights_exp[:, t-1].tolist(),
                    y_true,
                    q
                )
                quantile_loss_fn = QuantileLoss(q)
                forecasters_losses = [
                    np.mean(quantile_loss_fn(forecasters_preds_t[i], y_true))
                    for i in range(len(sorted_forecasters))
                ]
                temp_scores = 1.0 - (np.array(forecasters_losses, dtype=np.float64) / np.sum(forecasters_losses))
                payoffs_exp[:, t] = payoff_update(payoffs_exp[:, t-1], temp_payoffs, 0.999)

                rewards_in = delta * quantile_step_reward * (np.maximum(0, payoffs_exp[:, t]) / max(np.sum(np.maximum(0, payoffs_exp[:, t])), np.finfo(np.float64).eps))
                rewards_out = (1-delta) * quantile_step_reward * (temp_scores / np.sum(temp_scores))

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

    for q in quantiles:
        quantile_step_reward = total_reward / len(quantiles)

        for exp in range(n_experiments):
            weights_exp = np.zeros((n_forecasters, T), dtype=np.float64)
            payoffs_exp = np.zeros((n_forecasters, T), dtype=np.float64)
            rewards_exp = np.zeros((n_forecasters, T), dtype=np.float64)
            rewards_in_exp = np.zeros((n_forecasters, T), dtype=np.float64)
            rewards_out_exp = np.zeros((n_forecasters, T), dtype=np.float64)

            weights_exp[:, 0] = initialize_weights(n_forecasters)
            D_exp = np.zeros((n_forecasters, n_forecasters), dtype=np.float64)

            if environment == "invariant":
                realizations, forecasters_preds, w = generate_time_invariant_data_multiple_lead_times(T, lead_time, q)
            elif environment == "abrupt":
                realizations, forecasters_preds, w = generate_abrupt_data_multiple_lead_times(T, lead_time, q)
            elif environment == "variant":
                realizations, forecasters_preds, w = generate_dynamic_data_sin_multiple_lead_times(T, lead_time, q)
            else:
                raise ValueError(f"The defined environment is not yet implemented: {environment}")

            sorted_forecasters = sorted(forecasters_preds.keys())

            alpha = (np.random.rand(n_forecasters, T) < 0.05).astype(np.int32)
            for t in range(T):
                if np.sum(alpha[:, t]) == n_forecasters:
                    idx = np.random.randint(0, n_forecasters)
                    alpha[idx, t] = 0

            for t in range(1, T):
                forecasters_preds_t = [forecasters_preds[f][t] for f in sorted_forecasters]
                y_true = realizations[t]

                forecasters_preds_t_matrix = np.array(forecasters_preds_t, dtype=np.float64)
                if lead_time == 1:
                    forecasters_preds_t_matrix = forecasters_preds_t_matrix.reshape(-1, 1)

                prev_w = weights_exp[:, t-1].copy()
                prev_D = D_exp.copy()

                weights_exp[:, t], D_exp, _ = online_adaptive_robust_quantile_regression_multiple_lead_times(
                    forecasters_preds_t_matrix,
                    y_true,
                    weights_exp[:, t-1],
                    D_exp,
                    alpha[:, t],
                    q,
                    0.01
                )

                available_forecasters = [i for i in range(n_forecasters) if alpha[i, t] == 0]
                temp_forecasts_t = [forecasters_preds_t[i] for i in available_forecasters]
                temp_weights_t = prev_w[available_forecasters] + prev_D[available_forecasters, :][:, available_forecasters] @ alpha[available_forecasters, t].astype(np.float64)
                temp_weights_t_filtered = temp_weights_t[temp_weights_t > 0]

                if len(temp_forecasts_t) > 0 and len(temp_weights_t_filtered) > 0:
                    temp_payoffs = shapley_payoff_multiple_lead_times(
                        temp_forecasts_t,
                        temp_weights_t_filtered.tolist(),
                        y_true,
                        q
                    )
                    full_temp_payoffs = np.zeros(n_forecasters, dtype=np.float64)
                    for idx, i in enumerate(available_forecasters):
                        full_temp_payoffs[i] = temp_payoffs[idx]
                    temp_payoffs = full_temp_payoffs
                else:
                    temp_payoffs = np.zeros(n_forecasters, dtype=np.float64)

                quantile_loss_fn = QuantileLoss(q)
                forecasters_losses = [
                    np.mean(quantile_loss_fn(forecasters_preds_t[i], y_true))
                    for i in range(len(sorted_forecasters))
                ]
                temp_scores = 1.0 - (np.array(forecasters_losses, dtype=np.float64) / np.sum(forecasters_losses))
                payoffs_exp[:, t] = payoff_update(payoffs_exp[:, t-1], temp_payoffs, 0.999)

                rewards_in = delta * quantile_step_reward * (np.maximum(0, payoffs_exp[:, t]) / max(np.sum(np.maximum(0, payoffs_exp[:, t])), np.finfo(np.float64).eps))
                rewards_out = (1-delta) * quantile_step_reward * (temp_scores / np.sum(temp_scores))

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

    total_rewards_forecasters = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
    total_in_rewards_forecasters = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
    total_out_rewards_forecasters = {algo: np.zeros((n_forecasters, T), dtype=np.float64) for algo in algorithms}
    for algo in algorithms:
        for i in range(n_forecasters):
            for q in quantiles:
                total_rewards_forecasters[algo][i, :] += rewards[q][algo][i, :]
                total_in_rewards_forecasters[algo][i, :] += rewards_in_sample[q][algo][i, :]
                total_out_rewards_forecasters[algo][i, :] += rewards_out_sample[q][algo][i, :]

    return payoffs, rewards, weights, rewards_in_sample, rewards_out_sample, total_rewards_forecasters, total_in_rewards_forecasters, total_out_rewards_forecasters


if __name__ == "__main__":
    main()
