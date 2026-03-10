import numpy as np
from scipy.stats import norm
from typing import Dict, Tuple, List


def generate_time_invariant_data_multiple_lead_times(T: int, n: int, q: float) -> Tuple[List, Dict, np.ndarray]:
    forecasters_dict = {"f1": [], "f2": [], "f3": []}
    true_values = []
    true_weights = np.zeros((3, T), dtype=np.float64)

    for i in range(T):
        mu1 = np.random.randn(n) * 0.5
        mu2 = np.ones(n) + np.random.randn(n) * 0.5
        mu3 = np.full(n, 2.0) + np.random.randn(n) * 0.5
        sig1 = 1.0
        sig2 = 1.0
        sig3 = 1.0
        w = np.array([0.1, 0.6, 0.3], dtype=np.float64)

        mu_y = mu1 * w[0] + mu2 * w[1] + mu3 * w[2]
        sig_y = w[0] * sig1 + w[1] * sig2 + w[2] * sig3

        f1 = np.array([norm.ppf(q, loc=mu1[j], scale=sig1) for j in range(n)], dtype=np.float64)
        f2 = np.array([norm.ppf(q, loc=mu2[j], scale=sig2) for j in range(n)], dtype=np.float64)
        f3 = np.array([norm.ppf(q, loc=mu3[j], scale=sig3) for j in range(n)], dtype=np.float64)

        forecasters_dict["f1"].append(f1)
        forecasters_dict["f2"].append(f2)
        forecasters_dict["f3"].append(f3)

        y = np.array([norm.rvs(loc=mu_y[j], scale=sig_y) for j in range(n)], dtype=np.float64)
        true_values.append(y)
        true_weights[:, i] = w

    return true_values, forecasters_dict, true_weights


def generate_abrupt_data_multiple_lead_times(T: int, n: int, q: float) -> Tuple[List, Dict, np.ndarray]:
    forecasters_dict = {"f1": [], "f2": [], "f3": []}
    true_values = []
    true_weights = np.zeros((3, T), dtype=np.float64)
    w1 = np.array([0.1, 0.6, 0.3], dtype=np.float64)
    w2 = np.array([0.4, 0.2, 0.4], dtype=np.float64)

    for i in range(T):
        mu1 = np.random.randn(n) * 0.5
        mu2 = np.ones(n) + np.random.randn(n) * 0.5
        mu3 = np.full(n, 2.0) + np.random.randn(n) * 0.5
        sig1 = 1.0
        sig2 = 1.0
        sig3 = 1.0

        if i < T / 2:
            w = w1
        else:
            w = w2

        mu_y = mu1 * w[0] + mu2 * w[1] + mu3 * w[2]
        sig_y = w[0] * sig1 + w[1] * sig2 + w[2] * sig3

        f1 = np.array([norm.ppf(q, loc=mu1[j], scale=sig1) for j in range(n)], dtype=np.float64)
        f2 = np.array([norm.ppf(q, loc=mu2[j], scale=sig2) for j in range(n)], dtype=np.float64)
        f3 = np.array([norm.ppf(q, loc=mu3[j], scale=sig3) for j in range(n)], dtype=np.float64)

        forecasters_dict["f1"].append(f1)
        forecasters_dict["f2"].append(f2)
        forecasters_dict["f3"].append(f3)

        y = np.array([norm.rvs(loc=mu_y[j], scale=sig_y) for j in range(n)], dtype=np.float64)
        true_values.append(y)
        true_weights[:, i] = w

    return true_values, forecasters_dict, true_weights


def generate_dynamic_data_sin_multiple_lead_times(T: int, n: int, q: float) -> Tuple[List, Dict, np.ndarray]:
    forecasters_dict = {"f1": [], "f2": [], "f3": []}
    true_values = []
    true_weights = np.zeros((3, T), dtype=np.float64)
    w1 = np.array([0.1, 0.6, 0.3], dtype=np.float64)
    w2 = np.array([0.4, 0.2, 0.4], dtype=np.float64)
    lambda_val = 0.999
    w = np.array([1.0/3, 1.0/3, 1.0/3], dtype=np.float64)
    cycles = 1

    for i in range(T):
        mu1 = np.random.randn(n) * 0.5
        mu2 = np.ones(n) + np.random.randn(n) * 0.5
        mu3 = np.full(n, 2.0) + np.random.randn(n) * 0.5
        sig1 = 1.0
        sig2 = 1.0
        sig3 = 1.0

        alpha = 0.5 * (1.0 + np.sin(2 * np.pi * cycles * (i + 1) / T))
        w_target = (1.0 - alpha) * w1 + alpha * w2
        w = lambda_val * w + (1.0 - lambda_val) * w_target

        mu_y = mu1 * w[0] + mu2 * w[1] + mu3 * w[2]
        sig_y = w[0] * sig1 + w[1] * sig2 + w[2] * sig3

        f1 = np.array([norm.ppf(q, loc=mu1[j], scale=sig1) for j in range(n)], dtype=np.float64)
        f2 = np.array([norm.ppf(q, loc=mu2[j], scale=sig2) for j in range(n)], dtype=np.float64)
        f3 = np.array([norm.ppf(q, loc=mu3[j], scale=sig3) for j in range(n)], dtype=np.float64)

        forecasters_dict["f1"].append(f1)
        forecasters_dict["f2"].append(f2)
        forecasters_dict["f3"].append(f3)

        y = np.array([norm.rvs(loc=mu_y[j], scale=sig_y) for j in range(n)], dtype=np.float64)
        true_values.append(y)
        true_weights[:, i] = w

    return true_values, forecasters_dict, true_weights

