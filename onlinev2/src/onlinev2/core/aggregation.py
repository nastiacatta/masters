"""
Forecast aggregation: quantile averaging (QA) by effective wager weights.

Single canonical function: aggregate_forecast. Pure computation only; no I/O.
Used by core.runner to produce the round aggregate from reports and weights.
"""

import numpy as np


def aggregate_forecast(reports, m, alpha=None, eps=1e-12, fallback=None):
    """
    Quantile averaging (QA): q_hat(tau) = sum_i w_i * q_i(tau), w_i = m_i / sum_j m_j.

    For point mode: reports (n,); for quantile mode: reports (n, K).
    Returns r_hat. Falls back to `fallback` when no market (sum m ~ 0).
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
            return float(out) if out.size == 1 else out
        return np.zeros_like(reports[0]) if reports.ndim > 1 else 0.0

    m_hat = m / M
    if reports.ndim == 1:
        return float(np.sum(m_hat * reports))
    return np.sum(m_hat[:, None] * reports, axis=0)
