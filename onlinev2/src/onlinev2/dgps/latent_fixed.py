"""
DGP: Truth fixed first (exogenous). Forecasters observe noisy signals of Z_t.

Z_t ~ N(0, sigma_Z^2), y_t = Phi(Z_t)
X_{i,t} = Z_t + beta_i + eps_{i,t}, reports = Phi(mu_{i,t})

Symbol hygiene: beta_i = DGP bias (not deposit b_i),
mu_{i,t} = posterior mean (not wager m_i).
"""
from __future__ import annotations

import numpy as np
from scipy.stats import norm

from ..types import DGPInfo
from .protocol import DGPOutput
from .registry import register_dgp


def _phi(z: np.ndarray) -> np.ndarray:
    return norm.cdf(z).astype(np.float64)


class _DGPLatentFixed:
    info = DGPInfo(
        name="latent_fixed",
        output="point",
        support="[0,1]",
        link="probit",
        truth_source="exogenous",
        description="Truth Z_t ~ N(0,σ²) drawn first; forecasters see X_i = Z + β_i + eps_i.",
    )

    def generate(
        self,
        *,
        seed: int,
        T: int,
        n: int,
        tau_i: np.ndarray,
        sigma_z: float = 1.0,
        beta_i: np.ndarray | None = None,
        b_i: np.ndarray | None = None,
        quantiles: np.ndarray | None = None,
        **kwargs,
    ) -> DGPOutput:
        rng = np.random.default_rng(seed)
        tau_true = np.asarray(tau_i, dtype=np.float64).ravel()
        if tau_true.size != n:
            raise ValueError(f"tau_i must have length n (got {tau_true.size})")

        _beta = beta_i if beta_i is not None else b_i
        _beta = np.zeros(n, dtype=np.float64) if _beta is None else np.asarray(_beta, dtype=np.float64).ravel()

        Z = rng.normal(0.0, sigma_z, size=T).astype(np.float64)
        y = _phi(Z)

        Z_bc = np.broadcast_to(Z, (n, T))
        eps = rng.normal(0.0, 1.0, size=(n, T)).astype(np.float64)
        tau_bc = np.broadcast_to(tau_true[:, None], (n, T))
        X = Z_bc + _beta[:, None] + tau_bc * eps

        sig2 = float(sigma_z) ** 2
        denom = sig2 + tau_true**2
        mu = (sig2 / denom)[:, None] * (X - _beta[:, None])
        reports = _phi(mu)

        q_reports = None
        taus = None
        if quantiles is not None:
            taus = np.asarray(quantiles, dtype=np.float64).ravel()
            z_tau = norm.ppf(taus).astype(np.float64)
            v = (sig2 * tau_true**2 / denom)[:, None]
            kappa = kwargs.get("kappa_i", np.ones(n, dtype=np.float64))
            kappa = np.broadcast_to(np.asarray(kappa).ravel()[:n], (n,))[:, None, None]
            q_latent = mu[:, :, None] + (kappa * np.sqrt(v)[:, :, None] * z_tau[None, None, :])
            q_reports = _phi(q_latent)
            for i in range(n):
                for t in range(T):
                    o = np.argsort(taus)
                    row = q_reports[i, t, o].copy()
                    q_reports[i, t, o] = np.maximum.accumulate(row)

        return DGPOutput(
            y=y,
            reports=reports,
            q_reports=q_reports,
            tau_true=tau_true,
            taus=taus,
            meta={"sigma_z": sigma_z},
        )


DGP_LATENT_FIXED = register_dgp(_DGPLatentFixed())
