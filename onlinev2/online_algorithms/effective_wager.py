"""
Effective wager computation.

m_i = b_i * g(sigma_i), where g is the skill gate:
  g(sigma) = lam + (1 - lam) * sigma^eta

With eta=1 (default), this reduces to the original linear formula:
  m_i = b_i * (lam + (1 - lam) * sigma_i)

With eta > 1, low-skill agents' wagers shrink more sharply, preventing
rich-but-bad agents from dominating the wager pool.
"""
import numpy as np


def effective_wager(deposits, sigma, lam, eta=1.0):
    """
    Effective wager: m_i = b_i * (lam + (1-lam) * sigma_i^eta).

    Parameters
    ----------
    deposits : (n,) cash deposits b_i
    sigma : (n,) learned skill in [sigma_min, 1]
    lam : floor fraction in [0, 1]
    eta : power-law exponent (default 1.0 = linear, >1 for steeper gating)

    Returns
    -------
    m : (n,) effective wagers, always m_i <= b_i
    """
    deposits = np.asarray(deposits, dtype=np.float64)
    sigma = np.asarray(sigma, dtype=np.float64)
    g = float(lam) + (1.0 - float(lam)) * np.power(np.clip(sigma, 0.0, 1.0), float(eta))
    return deposits * g


def refund(deposits, m):
    """Refund: b_i - m_i (portion of deposit not placed at risk)."""
    deposits = np.asarray(deposits, dtype=np.float64)
    m = np.asarray(m, dtype=np.float64)
    return deposits - m
