"""
Deterministic staking: bankroll-based deposits, confidence proxy, skill-gated
effective wagers, and dominance cap.

Pipeline: confidence from quantile width → deposit from wealth → effective wager
→ dominance cap → wealth update. Pure mechanism logic only; no I/O.
"""

from typing import Optional

import numpy as np
from scipy.stats import norm


def confidence_from_quantiles(
    q_t: np.ndarray,
    taus: np.ndarray,
    *,
    tau_L: float = 0.1,
    tau_H: float = 0.9,
    eps: float = 1e-6,
    beta_c: float = 1.0,
    c_min: float = 0.8,
    c_max: float = 1.3,
) -> np.ndarray:
    """
    Bounded confidence multiplier c_i from quantile width in probit space.
    Narrower spread => higher confidence. Returns (n,) in [c_min, c_max].
    """
    q_t = np.asarray(q_t, dtype=np.float64)
    taus = np.asarray(taus, dtype=np.float64).ravel()

    if q_t.ndim == 1:
        q_t = q_t.reshape(1, -1)
    n, K = q_t.shape

    idx_L = int(np.argmin(np.abs(taus - tau_L)))
    idx_H = int(np.argmin(np.abs(taus - tau_H)))

    q_lo = np.clip(q_t[:, idx_L], eps, 1.0 - eps)
    q_hi = np.clip(q_t[:, idx_H], eps, 1.0 - eps)

    z_lo = norm.ppf(q_lo)
    z_hi = norm.ppf(q_hi)

    delta_z = np.maximum(z_hi - z_lo, 0.0)

    c = np.exp(-float(beta_c) * delta_z)
    return np.clip(c, float(c_min), float(c_max))


def choose_deposits(
    W_t: np.ndarray,
    c_t: np.ndarray,
    alpha_t: np.ndarray,
    *,
    f: float = 0.3,
    b_max: float = 10.0,
) -> np.ndarray:
    """
    Deterministic deposit: b_i = min(W_i, b_max, f * W_i * c_i) for active agents.
    Returns (n,) deposits, 0 for absent.
    """
    W_t = np.asarray(W_t, dtype=np.float64).ravel()
    c_t = np.asarray(c_t, dtype=np.float64).ravel()
    alpha_t = np.asarray(alpha_t, dtype=np.int32).ravel()

    raw = float(f) * W_t * c_t
    b_t = np.minimum(np.minimum(raw, W_t), float(b_max))
    b_t = np.maximum(b_t, 0.0)
    b_t[alpha_t == 1] = 0.0
    return b_t


def skill_gate(sigma: np.ndarray, lam: float, eta: float = 1.0) -> np.ndarray:
    """g(sigma) = lam + (1 - lam) * sigma^eta. Returns (n,) in [lam, 1]."""
    sigma = np.asarray(sigma, dtype=np.float64)
    return float(lam) + (1.0 - float(lam)) * np.power(np.clip(sigma, 0.0, 1.0), float(eta))


def effective_wager_bankroll(
    b_t: np.ndarray,
    sigma_t: np.ndarray,
    lam: float,
    eta: float = 1.0,
) -> np.ndarray:
    """Effective wager m_i = b_i * g(sigma_i). Returns (n,) with m_i <= b_i."""
    b_t = np.asarray(b_t, dtype=np.float64)
    g = skill_gate(sigma_t, lam, eta)
    return b_t * g


def effective_wager_capped(
    b_t: np.ndarray,
    sigma_t: np.ndarray,
    lam: float,
    eta: float = 1.0,
    alpha_t: Optional[np.ndarray] = None,
    omega_max: Optional[float] = None,
    eps: float = 1e-12,
) -> np.ndarray:
    """
    Single wager vector for both settlement and aggregation: raw effective wager
    from b, sigma, lam, eta; zero out absent if alpha_t given; apply cap if
    omega_max active. Returns (n,) to be used as m_pre and for aggregation.
    """
    m_t = effective_wager_bankroll(b_t, sigma_t, lam, eta)

    if alpha_t is not None:
        alpha_t = np.asarray(alpha_t, dtype=np.int32).ravel()
        m_t = np.asarray(m_t, dtype=np.float64).ravel().copy()
        m_t[alpha_t == 1] = 0.0

    if omega_max is not None and omega_max > 0.0:
        m_t = cap_weight_shares(m_t, omega_max=omega_max, eps=eps)

    return m_t


def cap_weight_shares(
    m_t: np.ndarray,
    omega_max: float = 0.25,
    eps: float = 1e-12,
) -> np.ndarray:
    """
    Project weight shares onto simplex with upper bound omega_max.
    Returns m_cap with sum(m_cap)==sum(m_t), each share <= omega_max.
    """
    m_t = np.asarray(m_t, dtype=np.float64).ravel().copy()
    if np.any(m_t < -eps):
        raise ValueError("cap_weight_shares requires non-negative wagers")
    m_t = np.maximum(m_t, 0.0)
    M = float(m_t.sum())
    if M <= eps:
        return m_t

    n = m_t.size
    om = float(omega_max)
    if om >= 1.0:
        return m_t
    if om < 1.0 / n - eps:
        raise ValueError(
            f"omega_max={om} must be >= 1/n={1.0/n} for feasible capped simplex"
        )

    shares = m_t / M
    max_iter = n + 5
    for _ in range(max_iter):
        over = shares > om + eps
        if not np.any(over):
            break
        shares[over] = om
        remainder = 1.0 - np.sum(shares)
        free = ~over
        n_free = int(np.sum(free))
        if n_free <= 0:
            break
        fill = remainder / n_free
        if fill <= om + eps:
            shares[free] = fill
            break
        shares[free] = om
    else:
        shares = np.minimum(shares, om)
        s = float(shares.sum())
        if s > eps:
            shares = shares / s

    return shares * M


def update_wealth(
    W_t: np.ndarray,
    profit_t: np.ndarray,
) -> np.ndarray:
    """W_{t+1} = max(0, W_t + profit_t)."""
    W_t = np.asarray(W_t, dtype=np.float64).ravel()
    profit_t = np.asarray(profit_t, dtype=np.float64).ravel()
    return np.maximum(0.0, W_t + profit_t)
