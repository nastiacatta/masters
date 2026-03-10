"""
Scoring rules: loss functions and loss-to-score mappings.

Point scoring: MAE loss / score.
Quantile scoring: pinball loss and CRPS-hat approximation (strictly proper).

Score mappings use affine bounded transforms guaranteed to land in [0,1]
when inputs are in range, with no np.clip on the settlement path
(Lambert's mechanism requires s in [0,1] strictly proper).
"""
import numpy as np

_DEBUG = __debug__

# --- Point scoring: MAE ---


def mae_loss(outcome, report):
    """Mean absolute error: |report - outcome|."""
    outcome = np.asarray(outcome, dtype=np.float64)
    report = np.asarray(report, dtype=np.float64)
    return float(np.mean(np.abs(report - outcome)))


def score_mae(outcome, report):
    """
    Strictly proper score for MAE with y, r in [0,1].

    s = 1 - |y - r|.  Since |y - r| in [0,1], s in [0,1] by construction.
    No clip needed for settlement.
    """
    outcome = np.asarray(outcome, dtype=np.float64)
    report = np.asarray(report, dtype=np.float64)
    s = 1.0 - np.abs(outcome - report)
    if _DEBUG:
        s_flat = np.asarray(s).ravel()
        assert np.all(s_flat >= -1e-12) and np.all(s_flat <= 1.0 + 1e-12), \
            f"score_mae out of [0,1]: min={s_flat.min()}, max={s_flat.max()}"
    return float(np.mean(s))


def mae_score(outcome, report, c=1.0, eps=1e-12):
    """Legacy API: s = clip(1 - MAE/c, 0, 1). Kept for backward compat only."""
    c = float(c)
    if c <= 0.0:
        raise ValueError("c must be > 0")
    loss = mae_loss(outcome, report)
    return float(np.clip(1.0 - loss / (c + float(eps)), 0.0, 1.0))


# --- Strictly proper: pinball + CRPS approximation ---

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
    """
    CRPS approximation: C_hat = (2/K) * sum_k pinball(y, q_k, tau_k).

    Returns per-agent loss array.  With y, q in [0,1], each pinball term
    is in [0, max(tau, 1-tau)] <= 1, so C_hat in [0, 2].
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
    """
    Strictly proper score for CRPS-hat with y, q in [0,1].

    s = 1 - C_hat / 2.  Since C_hat in [0,2], s in [0,1] by construction.
    No clip needed for settlement.  Returns per-agent scores.
    """
    crps = crps_hat_from_quantiles(y, q_matrix, taus)
    s = 1.0 - crps / 2.0
    if _DEBUG:
        assert np.all(s >= -1e-12) and np.all(s <= 1.0 + 1e-12), \
            f"score_crps_hat out of [0,1]: min={s.min()}, max={s.max()}"
    return s


def score_from_loss(loss, c, eps=1e-12):
    """
    Legacy affine map: s = 1 - loss/c, clamped to [0,1].

    For new code prefer score_mae() or score_crps_hat() which are
    guaranteed bounded without clipping.
    """
    loss = np.asarray(loss, dtype=np.float64)
    c = float(c)
    if c <= 0.0:
        raise ValueError("c must be > 0")
    return np.clip(1.0 - loss / (c + float(eps)), 0.0, 1.0)


def normalised_loss(loss, scoring_mode):
    """
    Normalise loss to [0,1] regardless of scoring mode.

    MAE mode:  loss already in [0,1] for y,r in [0,1].
    CRPS-hat mode: loss in [0,2], so normalised = loss / 2.
    """
    loss = np.asarray(loss, dtype=np.float64)
    if scoring_mode == "quantiles_crps":
        return loss / 2.0
    return loss
