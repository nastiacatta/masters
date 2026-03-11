"""
Deterministic staking: bankroll-based deposits, confidence proxy, skill-gated
effective wagers, and dominance cap.

Replaces random exponential deposits with a controlled pipeline:
  A) confidence proxy c_t from quantile width (probit space)
  B) deposit b_t from wealth W_t and confidence
  C) effective wager m_t = b_t * g(sigma_t) with power-law skill gate
  D) dominance cap on per-round weight shares
  E) wealth update W_{t+1} = max(0, W_t + profit_t)
"""
import numpy as np
from scipy.stats import norm


# -----------------------------------------------------------------------
# A) Confidence proxy from reported quantiles
# -----------------------------------------------------------------------

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
    Compute bounded confidence multiplier c_i from quantile width in probit space.

    Narrower quantile spread => higher confidence => higher c.

    Parameters
    ----------
    q_t : (n, K) quantile reports for this round
    taus : (K,) quantile levels
    tau_L, tau_H : lower/upper quantile levels for width
    eps : clip margin for probit transform
    beta_c : steepness of exp(-beta_c * width)
    c_min, c_max : bounds on the multiplier

    Returns
    -------
    c : (n,) confidence multiplier in [c_min, c_max]
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


# -----------------------------------------------------------------------
# B) Deposit from wealth and confidence
# -----------------------------------------------------------------------

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

    Parameters
    ----------
    W_t : (n,) current wealth / bankroll
    c_t : (n,) confidence multiplier from Step A
    alpha_t : (n,) missingness (0=present, 1=absent)
    f : base fraction of wealth to stake
    b_max : hard cap on any single deposit

    Returns
    -------
    b_t : (n,) deposits, 0 for absent agents
    """
    W_t = np.asarray(W_t, dtype=np.float64).ravel()
    c_t = np.asarray(c_t, dtype=np.float64).ravel()
    alpha_t = np.asarray(alpha_t, dtype=np.int32).ravel()

    raw = float(f) * W_t * c_t
    b_t = np.minimum(np.minimum(raw, W_t), float(b_max))
    b_t = np.maximum(b_t, 0.0)
    b_t[alpha_t == 1] = 0.0
    return b_t


# -----------------------------------------------------------------------
# C) Power-law skill gate
# -----------------------------------------------------------------------

def skill_gate(sigma: np.ndarray, lam: float, eta: float = 1.0) -> np.ndarray:
    """
    Skill gate function: g(sigma) = lam + (1 - lam) * sigma^eta.

    With eta > 1, low-skill agents' wagers shrink more sharply.
    g(sigma) in [lam, 1] for sigma in [0, 1].

    Parameters
    ----------
    sigma : (n,) learned skill scores in [sigma_min, 1]
    lam : floor fraction in [0, 1]
    eta : power-law exponent (1 = linear, 2-4 recommended)

    Returns
    -------
    g : (n,) gate values in [lam, 1]
    """
    sigma = np.asarray(sigma, dtype=np.float64)
    return float(lam) + (1.0 - float(lam)) * np.power(np.clip(sigma, 0.0, 1.0), float(eta))


def effective_wager_bankroll(
    b_t: np.ndarray,
    sigma_t: np.ndarray,
    lam: float,
    eta: float = 1.0,
) -> np.ndarray:
    """
    Effective wager with power-law skill gate: m_i = b_i * g(sigma_i).

    Parameters
    ----------
    b_t : (n,) deposits
    sigma_t : (n,) learned skill
    lam : floor fraction
    eta : power-law exponent

    Returns
    -------
    m_t : (n,) effective wagers, m_i <= b_i always
    """
    b_t = np.asarray(b_t, dtype=np.float64)
    g = skill_gate(sigma_t, lam, eta)
    return b_t * g


# -----------------------------------------------------------------------
# D) Dominance cap on weight shares
# -----------------------------------------------------------------------

def cap_weight_shares(
    m_t: np.ndarray,
    omega_max: float = 0.25,
    eps: float = 1e-12,
) -> np.ndarray:
    """
    Project weight shares onto the simplex with upper bound omega_max.

    Returns w such that sum(w)=1, 0 <= w_i <= omega_max, and w is the
    Euclidean projection of m_t/sum(m_t) onto that set (up to scaling).
    Preserves total mass: sum(m_cap) == sum(m_original).

    Parameters
    ----------
    m_t : (n,) effective wagers
    omega_max : max share any single agent may hold
    eps : numerical guard

    Returns
    -------
    m_cap : (n,) capped wagers (shares sum to 1, each <= omega_max; then scaled by M)
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
    # Iteratively project: set violators to omega_max, redistribute remainder.
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


# -----------------------------------------------------------------------
# E) Wealth update
# -----------------------------------------------------------------------

def update_wealth(
    W_t: np.ndarray,
    profit_t: np.ndarray,
) -> np.ndarray:
    """
    W_{t+1} = max(0, W_t + profit_t).
    """
    W_t = np.asarray(W_t, dtype=np.float64).ravel()
    profit_t = np.asarray(profit_t, dtype=np.float64).ravel()
    return np.maximum(0.0, W_t + profit_t)
