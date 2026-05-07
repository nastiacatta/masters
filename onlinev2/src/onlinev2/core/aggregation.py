"""Forecast aggregation by wager weights.

For point reports this is a weighted arithmetic mean.

For quantile reports this is pointwise weighted quantile averaging:
    q_hat(tau_k) = sum_i w_i * q_i(tau_k),
    w_i = m_i / sum_j m_j.

This is not quasi-arithmetic pooling and not a linear opinion pool over CDFs.
It is simply the weighted averaging rule implemented by the mechanism.

Note: pointwise weighted quantile averaging does not guarantee monotonicity
of the aggregate quantiles. When ``enforce_monotonicity=True`` (the default
for quantile mode), the output is projected onto the monotone cone via
isotonic regression (``np.maximum.accumulate``). This ensures downstream
PIT and CRPS computations receive valid quantile functions.
"""

import numpy as np


def _enforce_quantile_monotonicity(q: np.ndarray) -> np.ndarray:
    """Project quantile vector onto the monotone (non-decreasing) cone.

    Uses cumulative-maximum, which is the L∞ isotonic regression for
    non-decreasing sequences. Returns a new array; does not modify input.
    """
    q = np.asarray(q, dtype=np.float64).copy()
    return np.maximum.accumulate(q)


def aggregate_forecast(reports, m, alpha=None, eps=1e-12, fallback=None,
                       enforce_monotonicity=True, return_meta=False):
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
    enforce_monotonicity : bool
        If True (default) and reports are 2-D (quantile mode), enforce
        non-decreasing order on the aggregate quantiles via isotonic
        projection. Pointwise weighted averaging can produce crossings
        when individual quantile reports differ in shape; this flag
        prevents downstream PIT/CRPS failures.
    return_meta : bool
        If True, return ``(q_agg, meta)`` where ``meta`` is a dict with
        keys:
          - ``zero_wager_fallback: bool`` — True when ``sum(m) <= eps``
            and the fallback branch was taken. Downstream callers (e.g.
            ``real_data/runner.py``) can read this to exclude zero-wager
            rounds from PIT/CRPS aggregates. Added under bugfix spec
            ``mechanism-correctness-audit-fix`` clause 1.8.
        If False (default), return ``q_agg`` unchanged for backward
        compatibility with existing callers.

    Returns
    -------
    float or np.ndarray
        Weighted arithmetic mean in point mode, or pointwise weighted quantile
        average in quantile mode. When ``return_meta=True``, returns
        ``(q_agg, meta)``.
    """
    m = np.asarray(m, dtype=np.float64).flatten().copy()
    reports = np.asarray(reports, dtype=np.float64)

    if alpha is not None:
        alpha = np.asarray(alpha, dtype=np.int32).flatten()
        m[alpha == 1] = 0.0

    M = float(m.sum())
    meta: dict = {"zero_wager_fallback": False}
    if M <= float(eps):
        meta["zero_wager_fallback"] = True
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
            q_agg = out.item() if out.size == 1 else out
            return (q_agg, meta) if return_meta else q_agg
        q_agg = np.zeros_like(reports[0]) if reports.ndim > 1 else 0.0
        return (q_agg, meta) if return_meta else q_agg

    w = m / M
    if reports.ndim == 1:
        q_agg = float(np.sum(w * reports))
        return (q_agg, meta) if return_meta else q_agg

    q_hat = np.sum(w[:, None] * reports, axis=0)
    if enforce_monotonicity:
        q_hat = _enforce_quantile_monotonicity(q_hat)
    return (q_hat, meta) if return_meta else q_hat
