"""
Statistical tests for forecast comparison on a single time series.

Diebold-Mariano test: compares two forecast methods using their per-round
loss differences, accounting for autocorrelation.
"""
from __future__ import annotations
import numpy as np


def diebold_mariano_test(
    losses_1: np.ndarray,
    losses_2: np.ndarray,
    h: int = 1,
) -> dict:
    """Diebold-Mariano test for equal predictive accuracy.

    Tests H0: E[d_t] = 0 where d_t = loss_1(t) - loss_2(t).
    Negative mean(d) means method 2 is better.

    Args:
        losses_1: per-round losses for method 1 (e.g., uniform)
        losses_2: per-round losses for method 2 (e.g., mechanism)
        h: forecast horizon (for HAC variance correction)

    Returns:
        dict with dm_stat, p_value, mean_diff, se, n
    """
    d = np.array(losses_1) - np.array(losses_2)
    n = len(d)
    if n < 10:
        return {"dm_stat": 0, "p_value": 1, "mean_diff": 0, "se": 0, "n": n}

    mean_d = float(np.mean(d))

    # Newey-West HAC variance estimator
    # Bandwidth = h - 1 for h-step-ahead forecasts (0 for 1-step)
    max_lag = max(0, h - 1)
    gamma_0 = float(np.mean((d - mean_d) ** 2))
    gamma_sum = 0.0
    for k in range(1, max_lag + 1):
        gamma_k = float(np.mean((d[k:] - mean_d) * (d[:-k] - mean_d)))
        gamma_sum += 2 * gamma_k

    var_d = (gamma_0 + gamma_sum) / n
    if var_d <= 0:
        var_d = gamma_0 / n

    se = float(np.sqrt(var_d))
    dm_stat = mean_d / se if se > 1e-15 else 0.0

    # Two-sided p-value (normal approximation, valid for large n)
    p_value = 2 * _norm_sf(abs(dm_stat))

    return {
        "dm_stat": float(dm_stat),
        "p_value": float(p_value),
        "mean_diff": float(mean_d),
        "se": float(se),
        "n": n,
        "significant_5pct": p_value < 0.05,
        "significant_1pct": p_value < 0.01,
    }


def _norm_sf(x: float) -> float:
    """Standard normal survival function (1 - Phi(x))."""
    # Abramowitz & Stegun 7.1.26 erf approximation
    sign = -1 if x < 0 else 1
    z = abs(x) / np.sqrt(2)
    t = 1 / (1 + 0.3275911 * z)
    a1, a2, a3, a4, a5 = 0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429
    erf_approx = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * np.exp(-z * z)
    cdf = 0.5 * (1 + sign * erf_approx)
    return 1 - cdf


def bootstrap_ci(
    losses_1: np.ndarray,
    losses_2: np.ndarray,
    n_bootstrap: int = 1000,
    block_size: int = 50,
    alpha: float = 0.05,
    seed: int = 42,
) -> dict:
    """Block bootstrap confidence interval for mean loss difference.

    Uses circular block bootstrap to preserve autocorrelation structure.

    Args:
        losses_1, losses_2: per-round losses
        n_bootstrap: number of bootstrap samples
        block_size: size of contiguous blocks
        alpha: significance level (default 5%)
        seed: random seed

    Returns:
        dict with ci_lower, ci_upper, mean_diff, bootstrap_se
    """
    d = np.array(losses_1) - np.array(losses_2)
    n = len(d)
    rng = np.random.default_rng(seed)

    n_blocks = max(1, n // block_size)
    boot_means = []

    for _ in range(n_bootstrap):
        # Circular block bootstrap
        starts = rng.integers(0, n, size=n_blocks)
        indices = np.concatenate([np.arange(s, s + block_size) % n for s in starts])[:n]
        boot_means.append(float(np.mean(d[indices])))

    boot_means = np.array(boot_means)
    ci_lower = float(np.percentile(boot_means, 100 * alpha / 2))
    ci_upper = float(np.percentile(boot_means, 100 * (1 - alpha / 2)))

    return {
        "mean_diff": float(np.mean(d)),
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "bootstrap_se": float(np.std(boot_means)),
        "n_bootstrap": n_bootstrap,
        "block_size": block_size,
        "alpha": alpha,
    }
