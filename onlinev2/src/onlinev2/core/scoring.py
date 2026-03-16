"""Scoring rules used by the mechanism.

Point mode (`point_mae`) uses absolute loss, so it elicits a median-type point
forecast. Absolute loss is proper for the median, and strictly proper only when
the predictive median is unique.

Quantile mode (`quantiles_crps`) uses a finite-grid quantile score (CRPS-hat):
    C_hat = (2 / K) * sum_k L^{tau_k}(y, q_k),
i.e. average pinball loss over reported quantiles. This is a quantile-grid
approximation to CRPS, not exact CRPS. The standard CRPS approximation argument
assumes an equidistant probability grid; the default grid (0.1, 0.25, 0.5, 0.75, 0.9)
is not equidistant, so describe this as "finite quantile score" or "CRPS-hat"
rather than exact CRPS.

Settlement uses bounded affine score maps that land in [0, 1]:
    score_mae      = 1 - |y - r|
    score_crps_hat = 1 - C_hat / 2

This module is pure: no I/O, no plotting, no subprocess.
Used only by core.runner.
"""

import numpy as np

_DEBUG = __debug__


def mae_loss(outcome, report):
    """Mean absolute error: |report - outcome|."""
    outcome = np.asarray(outcome, dtype=np.float64)
    report = np.asarray(report, dtype=np.float64)
    return float(np.mean(np.abs(report - outcome)))


def score_mae(outcome, report):
    """Bounded score induced by absolute loss on [0, 1].

    s = 1 - |y - r|.

    This is proper for median-type point forecasts. Use stricter wording only
    when the predictive median is known to be unique.
    """
    outcome = np.asarray(outcome, dtype=np.float64)
    report = np.asarray(report, dtype=np.float64)
    s = 1.0 - np.abs(outcome - report)
    if _DEBUG:
        s_flat = np.asarray(s).ravel()
        assert np.all(s_flat >= -1e-12) and np.all(s_flat <= 1.0 + 1e-12), (
            f"score_mae out of [0,1]: min={s_flat.min()}, max={s_flat.max()}"
        )
    return float(np.mean(s))


def mae_score(outcome, report, c=1.0, eps=1e-12):
    """Legacy API: s = clip(1 - MAE/c, 0, 1). Kept for backward compat only."""
    c = float(c)
    if c <= 0.0:
        raise ValueError("c must be > 0")
    loss = mae_loss(outcome, report)
    return float(np.clip(1.0 - loss / (c + float(eps)), 0.0, 1.0))


def pinball_loss(y, q, tau):
    """Pinball loss L^(tau)(y,q). tau in (0,1)."""
    y = np.asarray(y, dtype=np.float64)
    q = np.asarray(q, dtype=np.float64)
    tau = float(tau)
    if not (0 < tau < 1):
        raise ValueError("tau must be in (0,1)")
    err = y - q
    return np.where(err >= 0, tau * err, (tau - 1.0) * err)


def crps_hat_from_quantiles(y, q_matrix, taus):
    """Finite-grid CRPS surrogate: average pinball loss over reported quantiles.

    C_hat = (2 / K) * sum_k pinball(y, q_k, tau_k).

    This is a quantile-grid approximation to CRPS, not exact CRPS (equidistant
    tau would give a closer approximation). Returns per-agent loss; with y, q
    in [0, 1], C_hat lies in [0, 2].
    """
    y = np.asarray(y, dtype=np.float64)
    q_matrix = np.asarray(q_matrix, dtype=np.float64)
    taus = np.asarray(taus, dtype=np.float64)
    if q_matrix.ndim == 1:
        q_matrix = q_matrix.reshape(1, -1)
    n, K = q_matrix.shape
    if len(taus) != K:
        raise ValueError("taus length must match q_matrix columns")
    losses = np.zeros(n, dtype=np.float64)
    for k, tau in enumerate(taus):
        losses += pinball_loss(y, q_matrix[:, k], tau)
    return 2.0 * losses / K


def score_crps_hat(y, q_matrix, taus):
    """Bounded score induced by the finite-grid CRPS surrogate (CRPS-hat).

    s = 1 - C_hat / 2, where C_hat is the average pinball loss over quantiles.
    Used by settlement; describe as CRPS-hat or finite quantile score, not exact CRPS.
    """
    crps = crps_hat_from_quantiles(y, q_matrix, taus)
    s = 1.0 - crps / 2.0
    if _DEBUG:
        assert np.all(s >= -1e-12) and np.all(s <= 1.0 + 1e-12), (
            f"score_crps_hat out of [0,1]: min={s.min()}, max={s.max()}"
        )
    return s


def score_from_loss(loss, c, eps=1e-12):
    """Legacy affine map: s = 1 - loss/c, clamped to [0,1]. Prefer score_mae/score_crps_hat."""
    loss = np.asarray(loss, dtype=np.float64)
    c = float(c)
    if c <= 0.0:
        raise ValueError("c must be > 0")
    return np.clip(1.0 - loss / (c + float(eps)), 0.0, 1.0)


def normalised_loss(loss, scoring_mode):
    """Normalise loss to [0,1]. MAE: as-is; CRPS-hat: loss/2."""
    loss = np.asarray(loss, dtype=np.float64)
    if scoring_mode == "quantiles_crps":
        return loss / 2.0
    return loss
