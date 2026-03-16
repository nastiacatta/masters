"""
Optional Michael-style intermittent aggregation backend.

Model: y_hat = (w + D @ alpha)^T x(alpha), with x_i(alpha) = 0 when alpha_i = 1.
Updates (w, D) online under pinball loss. Deterministic and side-effect free.
Do not combine with wager weights in the same aggregate.
"""

import numpy as np


def project_simplex_nonnegative(w):
    """Project vector onto non-negative simplex (sum = 1)."""
    w = np.maximum(np.asarray(w, dtype=np.float64).ravel(), 0.0)
    s = float(w.sum())
    if s <= 0.0:
        return np.full_like(w, 1.0 / w.size)
    return w / s


def michael_predict(x_t, alpha_t, w_t, D_t):
    """
    Predict: y_hat = (w + D @ alpha)^T x(alpha), with x(alpha) zero at missing.
    Returns (y_hat, aux) with aux containing theta and alpha for downstream use.
    """
    x = np.asarray(x_t, dtype=np.float64).ravel().copy()
    alpha = np.asarray(alpha_t, dtype=np.int32).ravel()

    x[alpha == 1] = 0.0
    w = np.asarray(w_t, dtype=np.float64).ravel()
    D = np.asarray(D_t, dtype=np.float64)

    theta = w + D @ alpha.astype(np.float64)
    theta = project_simplex_nonnegative(theta)

    y_hat = float(theta @ x)
    return y_hat, {"theta": theta, "alpha": alpha}


def michael_update(x_t, y_t, alpha_t, w_t, D_t, tau, lr):
    """
    Update (w, D) from observation (x_t, y_t) under pinball loss.
    Only update base weights for present forecasts; only update correction
    columns associated with missing forecasts. Project w back to non-negative
    simplex after update. Returns (w_new, D_new, y_hat).
    """
    y_hat, aux = michael_predict(x_t, alpha_t, w_t, D_t)
    alpha = aux["alpha"]

    x = np.asarray(x_t, dtype=np.float64).ravel().copy()
    x[alpha == 1] = 0.0

    grad_scalar = -float(tau) if float(y_t) > y_hat else (1.0 - float(tau))

    w_new = np.asarray(w_t, dtype=np.float64).copy()
    present = alpha == 0
    w_new[present] -= float(lr) * grad_scalar * x[present]
    w_new = project_simplex_nonnegative(w_new)

    D_new = np.asarray(D_t, dtype=np.float64).copy()
    missing_idx = np.where(alpha == 1)[0]
    for j in missing_idx:
        D_new[:, j] -= float(lr) * grad_scalar * x

    return w_new, D_new, y_hat
