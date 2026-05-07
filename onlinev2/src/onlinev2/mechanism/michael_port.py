"""Pure-Python port of Michael's reference pipeline.

This module is a minimal translation of five symbols from the Julia
reference implementation under ``michael/`` used strictly by the audit
suite to evaluate bug conditions A and E.  It is **audit-only** —
production code must not import it.  A confinement test
(``onlinev2/tests/audit/test_michael_port_confinement.py``) enforces this.

Mapping from Julia → Python, keyed to ``design.md`` §"Python Port of
Michael's Reference Pipeline" / "In-Scope Julia Functions":

- ``online_quantile_regression_update_multiple_lead_times``
  (``michael/online_algorithms/quantile_regression.jl``)
  → ``ogd_update_multi_lead``
- ``online_adaptive_robust_quantile_regression_multiple_lead_times``
  (``michael/online_algorithms/adaptive_robust_quantile_regression.jl``)
  → ``adaptive_robust_qr_update_multi_lead``
- ``payoff_update`` (``michael/functions/functions_payoff.jl``)
  → ``payoff_update``
- Shapley + loss-rank inner loop from
  ``michael/payoff/shapley_values.jl`` + ``michael/main_rewards.jl``
  → ``shapley_allocation``
- Top-level ``main_rewards`` (``michael/main_rewards.jl``)
  → ``run_main_rewards``

All functions return ``np.ndarray``.  No file I/O, no side effects.
Floating-point conventions follow Julia ``Float64``; the port is
expected to match Julia outputs to ``atol=1e-8`` for the OGD / RQR
updates and ``atol=1e-6`` for the top-level rewards loop (per design.md
§"Numerical-Equivalence Strategy").
"""
from __future__ import annotations

from itertools import combinations
from math import factorial
from typing import Any, Mapping

import numpy as np


# ---------------------------------------------------------------------------
# Quantile loss + simplex projection (from ``michael/functions/functions.jl``)
# ---------------------------------------------------------------------------

def _quantile_loss_gradient(y_true: float, y_hat: float, q: float) -> float:
    """∂/∂y_hat of the pinball loss, matching the Julia sign convention.

    Julia source: ``functions/functions.jl::quantile_loss_gradient``
    - y_hat > y_true       →  (1 - q)
    - y_true >= y_hat      → -q
    """
    if y_hat > y_true:
        return 1.0 - float(q)
    return -float(q)


def _project_to_simplex(v: np.ndarray) -> np.ndarray:
    """Project v onto the probability simplex (L2-closest non-negative,
    sum-to-one vector).  Faithful port of ``project_to_simplex`` in
    ``michael/functions/functions.jl``.
    """
    v = np.asarray(v, dtype=np.float64).ravel()
    n = v.size
    u = np.sort(v)[::-1]
    cssv = np.cumsum(u) - 1.0
    k_arr = np.arange(1, n + 1, dtype=np.float64)
    mask = u > cssv / k_arr
    if not np.any(mask):
        # Fallback: uniform (should not happen for finite inputs).
        return np.full(n, 1.0 / n)
    rho = int(np.where(mask)[0].max() + 1)  # 1-indexed, last True position
    tau = cssv[rho - 1] / rho
    return np.maximum(v - tau, 0.0)


# ---------------------------------------------------------------------------
# OGD update — online quantile regression (multi-lead-time variant)
# ---------------------------------------------------------------------------

def ogd_update_multi_lead(
    state: Mapping[str, Any],
    x: np.ndarray,
    y: float,
    alpha_vec: np.ndarray | None = None,
    eta: float = 0.01,
    tau: float = 0.5,
) -> dict:
    """Online projected-simplex pinball-OGD update for the multi-lead-time case.

    Port of ``online_quantile_regression_update_multiple_lead_times`` in
    ``michael/online_algorithms/quantile_regression.jl``.

    Parameters
    ----------
    state : mapping with key ``"w"`` — previous weight vector (N,).
    x : np.ndarray
        Forecaster predictions.  Either shape (N,) (single lead time) or
        (N, L) (multiple lead times).  In the multi-lead-time case the
        Julia code takes ``mean(row * gradient_loss)`` per row; with L=1
        that reduces to the single-lead case.
    y : float
        Realised outcome.
    alpha_vec : np.ndarray, optional
        Per-forecaster missingness indicator (1 = missing).  Currently
        ignored by this function — Julia ``online_quantile_regression``
        does not mask; masking is done by the RQR variant.  Argument
        kept for API symmetry.
    eta : float
        Learning rate (Julia default: 0.01).
    tau : float
        Quantile level in (0, 1).

    Returns
    -------
    dict with keys ``w`` (updated weights) and ``y_hat`` (aggregate
    prediction before the update — mirrors the Julia return tuple).
    """
    w_prev = np.asarray(state["w"], dtype=np.float64).ravel()
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x_row = x
        # aggregate: w^T x
        y_hat = float(np.dot(w_prev, x_row))
        grad = _quantile_loss_gradient(float(y), y_hat, float(tau))
        lks = grad * x_row
    else:
        # multi-lead: x shape (N, L); aggregate per lead then mean gradient.
        # Julia: agg = sum(preds .* w, dims=1)[1];  grad = mean(row * grad_vec).
        agg_per_lead = x.T @ w_prev  # shape (L,)
        y_arr = np.broadcast_to(np.float64(y), agg_per_lead.shape)
        grad_vec = np.array(
            [_quantile_loss_gradient(float(y_arr[j]), float(agg_per_lead[j]), float(tau))
             for j in range(agg_per_lead.size)],
            dtype=np.float64,
        )
        lks = np.array([float(np.mean(row * grad_vec)) for row in x], dtype=np.float64)
        y_hat = float(agg_per_lead[0])

    w_new = w_prev - float(eta) * lks
    w_new = _project_to_simplex(w_new)
    return {"w": w_new, "y_hat": y_hat}


# ---------------------------------------------------------------------------
# Adaptive-robust QR update (multi-lead-time variant)
# ---------------------------------------------------------------------------

def adaptive_robust_qr_update_multi_lead(
    state: Mapping[str, Any],
    x: np.ndarray,
    y: float,
    alpha_vec: np.ndarray,
    eta: float = 0.01,
    tau: float = 0.5,
    eps_robust: float = 0.0,  # kept for API symmetry; unused
) -> dict:
    """Port of ``online_adaptive_robust_quantile_regression_multiple_lead_times``.

    State contains ``w`` (N,) and ``D`` (N, N).  The update zeroes
    missing entries of x, forms the aggregate using (w + D @ α) · x, and
    applies a projected-gradient step to w and an unprojected gradient
    step to D.
    """
    w_prev = np.asarray(state["w"], dtype=np.float64).ravel()
    D_prev = np.asarray(state["D"], dtype=np.float64)
    alpha = np.asarray(alpha_vec, dtype=np.float64).ravel()
    x = np.asarray(x, dtype=np.float64)

    # x * (1 - alpha) — mask missing entries
    if x.ndim == 1:
        masked = x * (1.0 - alpha)
        theta = w_prev + D_prev @ alpha
        y_hat = float(np.sum(theta * masked))
        grad = _quantile_loss_gradient(float(y), y_hat, float(tau))
        grad_w = grad * masked
        grad_D = np.outer(grad * masked, alpha)
    else:
        # Multi-lead: shape (N, L).  alpha is still (N,) — rows masked.
        masked = x * (1.0 - alpha)[:, None]
        theta = w_prev + D_prev @ alpha
        agg_per_lead = masked.T @ theta  # (L,)
        grad_vec = np.array(
            [_quantile_loss_gradient(float(y), float(agg_per_lead[j]), float(tau))
             for j in range(agg_per_lead.size)],
            dtype=np.float64,
        )
        grad_w = np.array(
            [float(np.mean(row * grad_vec)) for row in masked], dtype=np.float64
        )
        # outer against alpha
        grad_D = np.outer(grad_w, alpha)
        y_hat = float(agg_per_lead[0])

    w_new = w_prev - float(eta) * grad_w
    w_new = _project_to_simplex(w_new)
    D_new = D_prev - float(eta) * grad_D
    return {"w": w_new, "D": D_new, "y_hat": y_hat}


# ---------------------------------------------------------------------------
# payoff_update (EWMA on the Shapley payoff)
# ---------------------------------------------------------------------------

def payoff_update(
    phi_c_prev: np.ndarray,
    shapley: np.ndarray,
    oos: np.ndarray,  # kept for API; Julia payoff_update takes only prev + new
    delta: float = 0.999,  # Julia lambda default in main_rewards.jl
    rho: float = 0.0,  # unused in Julia payoff_update
) -> np.ndarray:
    """Port of ``payoff_update`` in ``michael/functions/functions_payoff.jl``.

    Julia signature:
        ``payoff_update(prev_payoffs, new_payoffs, lambda)
          = lambda * prev + (1 - lambda) * new``

    The ``oos`` and ``rho`` parameters are accepted for API symmetry with
    this project's other allocation layers; they are ignored in the
    faithful Julia port.
    """
    prev = np.asarray(phi_c_prev, dtype=np.float64).ravel()
    new = np.asarray(shapley, dtype=np.float64).ravel()
    return float(delta) * prev + (1.0 - float(delta)) * new


# ---------------------------------------------------------------------------
# Shapley allocation — direct translation of the inner loop
# ---------------------------------------------------------------------------

def _shapley_payoff_multi_lead(
    preds: np.ndarray,
    weights: np.ndarray,
    y_true: np.ndarray | float,
    q: float,
) -> np.ndarray:
    """Exact Shapley-value calculation matching
    ``shapley_payoff_multiple_lead_times`` in
    ``michael/payoff/shapley_values.jl``.

    ``preds`` has shape (N,) for single-lead or (N, L) for multi-lead.
    ``y_true`` is scalar or (L,).  ``weights`` is (N,).
    """
    preds = np.asarray(preds, dtype=np.float64)
    weights = np.asarray(weights, dtype=np.float64).ravel()
    n = preds.shape[0]
    if preds.ndim == 1:
        preds_2d = preds[:, None]
        y_arr = np.asarray([float(y_true)], dtype=np.float64)
    else:
        preds_2d = preds
        y_arr = np.broadcast_to(
            np.asarray(y_true, dtype=np.float64), preds.shape[1:]
        ).ravel()
    L = preds_2d.shape[1]

    def pinball(yhat_row: np.ndarray) -> float:
        losses = np.where(
            y_arr >= yhat_row,
            q * (y_arr - yhat_row),
            (1.0 - q) * (yhat_row - y_arr),
        )
        return float(np.mean(losses))

    def subset_forecast(idxs: tuple[int, ...]) -> np.ndarray:
        if not idxs:
            return np.zeros(L, dtype=np.float64)
        idxs_arr = np.asarray(idxs, dtype=int)
        sub_preds = preds_2d[idxs_arr]
        sub_weights = weights[idxs_arr]
        return np.sum(sub_preds * sub_weights[:, None], axis=0)

    shapley = np.zeros(n, dtype=np.float64)
    for f in range(n):
        others = [i for i in range(n) if i != f]
        total = 0.0
        # Non-empty subsets of others
        for w_size in range(0, len(others) + 1):
            factor = (
                factorial(w_size)
                * factorial(n - w_size - 1)
                / factorial(n)
            )
            if w_size == 0:
                # Empty-set contribution: loss(0) - loss(f alone).
                loss_empty = pinball(np.zeros(L, dtype=np.float64))
                loss_f = pinball(preds_2d[f] * weights[f])
                total += factor * (loss_empty - loss_f)
                continue
            for sub in combinations(others, w_size):
                yhat_sub = subset_forecast(sub)
                yhat_expanded = yhat_sub + preds_2d[f] * weights[f]
                loss_sub = pinball(yhat_sub)
                loss_exp = pinball(yhat_expanded)
                total += factor * (loss_sub - loss_exp)
        shapley[f] = total
    return shapley


def shapley_allocation(
    preds: np.ndarray,
    weights: np.ndarray,
    y_true: float,
    q: float,
    alpha: np.ndarray | None = None,
) -> np.ndarray:
    """Shapley allocation for the RQR/QR inner loop.

    Wraps ``_shapley_payoff_multi_lead``; agents with ``alpha[i] == 1``
    receive zero allocation (matching the Julia handling in
    ``main_rewards.jl``).
    """
    preds = np.asarray(preds, dtype=np.float64)
    weights = np.asarray(weights, dtype=np.float64).ravel()
    n = preds.shape[0]
    if alpha is None:
        alpha = np.zeros(n, dtype=np.int32)
    alpha = np.asarray(alpha, dtype=np.int32).ravel()
    present_idx = np.where(alpha == 0)[0]
    if present_idx.size == 0:
        return np.zeros(n, dtype=np.float64)
    sub_preds = preds[present_idx]
    sub_weights = weights[present_idx]
    sub_shapley = _shapley_payoff_multi_lead(sub_preds, sub_weights, y_true, q)
    out = np.zeros(n, dtype=np.float64)
    out[present_idx] = sub_shapley
    return out


# ---------------------------------------------------------------------------
# Top-level main_rewards loop
# ---------------------------------------------------------------------------

def run_main_rewards(
    panel: np.ndarray,
    y: np.ndarray,
    config: Mapping[str, Any],
) -> dict[str, np.ndarray]:
    """Top-level pipeline matching ``michael/main_rewards.jl``.

    Parameters
    ----------
    panel : np.ndarray
        Shape (T, N) of per-round forecaster predictions (point forecasts
        at the resolved quantile level).  For quantile panels of shape
        (T, N, K) the caller should loop over K and invoke this function
        per τ.
    y : np.ndarray
        Outcomes of shape (T,).
    config : mapping
        ``quantile`` (float, default 0.5), ``eta`` (float, default 0.01),
        ``delta`` (float, default 0.7), ``rho`` (float, default 0.999),
        ``total_reward`` (float, default 100.0).

    Returns
    -------
    dict with keys ``weights`` (T, N), ``payoffs`` (T, N), ``rewards``
    (T, N), ``y_hat`` (T,).
    """
    panel = np.asarray(panel, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64).ravel()
    T, N = panel.shape
    q = float(config.get("quantile", 0.5))
    eta = float(config.get("eta", 0.01))
    delta = float(config.get("delta", 0.7))
    rho = float(config.get("rho", 0.999))
    total_reward = float(config.get("total_reward", 100.0))

    weights = np.zeros((T, N), dtype=np.float64)
    weights[0] = 1.0 / N
    payoffs = np.zeros((T, N), dtype=np.float64)
    rewards = np.zeros((T, N), dtype=np.float64)
    y_hat = np.zeros(T, dtype=np.float64)

    for t in range(1, T):
        x_t = panel[t]
        y_t = float(y[t])
        state = {"w": weights[t - 1]}
        out = ogd_update_multi_lead(state, x_t, y_t, eta=eta, tau=q)
        weights[t] = out["w"]
        y_hat[t] = out["y_hat"]

        # Shapley payoff on the previous weights.
        phi_s = _shapley_payoff_multi_lead(x_t, weights[t - 1], y_t, q)
        # Loss-rank (oos) scores.
        losses = np.array(
            [
                max(q, 1.0 - q) * abs(y_t - float(x_t[i]))  # bounded surrogate
                for i in range(N)
            ],
            dtype=np.float64,
        )
        total_L = float(losses.sum())
        if total_L <= 0.0:
            scores = np.full(N, 1.0 / N)
        else:
            scores = 1.0 - (losses / total_L)

        payoffs[t] = payoff_update(payoffs[t - 1], phi_s, None, delta=rho)

        # In/out-sample split, matching main_rewards.jl lines 75–80.
        q_step_reward = total_reward
        rew_in = (
            delta
            * q_step_reward
            * (np.maximum(0.0, payoffs[t]) / max(float(np.maximum(0.0, payoffs[t]).sum()), 1e-12))
        )
        rew_out = (1.0 - delta) * q_step_reward * (scores / max(float(scores.sum()), 1e-12))
        rewards[t] = rew_in + rew_out

    return {
        "weights": weights,
        "payoffs": payoffs,
        "rewards": rewards,
        "y_hat": y_hat,
    }
