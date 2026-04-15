"""Forecast aggregation by wager weights.

For point reports this is a weighted arithmetic mean.

For quantile reports this is pointwise weighted quantile averaging:
    q_hat(tau_k) = sum_i w_i * q_i(tau_k),
    w_i = m_i / sum_j m_j.

This is not quasi-arithmetic pooling and not a linear opinion pool over CDFs.
It is simply the weighted averaging rule implemented by the mechanism.
"""

import numpy as np


def aggregate_forecast(reports, m, alpha=None, eps=1e-12, fallback=None):
    """Aggregate reports using normalised wager weights.

    Parameters
    ----------
    reports : array-like
        Shape (n,) for point reports or (n, K) for quantile reports.
    m : array-like
        Effective wager weights.
    alpha : array-like, optional
        Missingness indicator, where alpha_i = 1 excludes forecaster i.
    eps : float
        Near-zero threshold for no-market fallback.
    fallback : scalar or array-like, optional
        Returned when sum(m) <= eps.

    Returns
    -------
    float or np.ndarray
        Weighted arithmetic mean in point mode, or pointwise weighted quantile
        average in quantile mode.
    """
    m = np.asarray(m, dtype=np.float64).flatten().copy()
    reports = np.asarray(reports, dtype=np.float64)

    if alpha is not None:
        alpha = np.asarray(alpha, dtype=np.int32).flatten()
        m[alpha == 1] = 0.0

    M = float(m.sum())
    if M <= float(eps):
        if fallback is not None:
            out = np.asarray(fallback, dtype=np.float64).ravel()
            if reports.ndim > 1:
                if out.shape != reports[0].shape:
                    raise ValueError(
                        f"fallback shape {out.shape} != reports[0].shape {reports[0].shape}"
                    )
            else:
                if out.size != 1:
                    raise ValueError(
                        f"fallback must be scalar for point mode, got size {out.size}"
                    )
            return out.item() if out.size == 1 else out
        return np.zeros_like(reports[0]) if reports.ndim > 1 else 0.0

    w = m / M
    if reports.ndim == 1:
        return float(np.sum(w * reports))
    return np.sum(w[:, None] * reports, axis=0)
