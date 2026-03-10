"""
DGP: Truth from forecaster aggregation (endogenous).

y_latent = w @ x_latent + noise. Methods 1/2 same model; 3 adds mean shocks.
"""
from __future__ import annotations

import numpy as np
from scipy.stats import norm

from ..types import DGPInfo
from .protocol import DGPOutput
from .registry import register_dgp


def _ar1_mu(T: int, rng, rho: float, sigma_state: float, mu0: float) -> np.ndarray:
    mu = np.zeros(T, dtype=np.float64)
    mu[0] = float(mu0)
    for t in range(1, T):
        mu[t] = rho * mu[t - 1] + rng.normal(0.0, sigma_state)
    return mu


def _link_fwd(z: np.ndarray, link: str) -> np.ndarray:
    if link == "probit":
        return norm.cdf(z).astype(np.float64)
    if link == "identity":
        return np.clip(z, 0.0, 1.0).astype(np.float64)
    raise ValueError("link must be 'probit' or 'identity'")


def _link_inv(y: np.ndarray, link: str) -> np.ndarray:
    y = np.asarray(y, dtype=np.float64)
    if link == "probit":
        return norm.ppf(np.clip(y, 1e-12, 1.0 - 1e-12)).astype(np.float64)
    return y.astype(np.float64)


def _generate_core(
    T: int,
    n: int,
    rng: np.random.Generator,
    method: int,
    w: np.ndarray,
    sigmas: np.ndarray,
    normalise_w: bool,
    sigma_eps: float,
    rho_mu: float,
    sigma_state: float,
    mu0: float,
    sigma_mu_noise: float,
    link: str,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    if normalise_w:
        s = float(np.sum(np.abs(w)))
        w = w / s if s > 0 else np.ones(n, dtype=np.float64) / n

    mu_t = _ar1_mu(T, rng, rho_mu, sigma_state, mu0)
    xi = rng.normal(0.0, 1.0, size=(n, T)).astype(np.float64)
    eps_y = rng.normal(0.0, 1.0, size=T).astype(np.float64)
    eta = (
        rng.normal(0.0, sigma_mu_noise, size=(n, T)).astype(np.float64)
        if method == 3
        else np.zeros((n, T), dtype=np.float64)
    )

    centres = mu_t[None, :] + eta
    x_latent = centres + sigmas[:, None] * xi
    y_latent = (w[:, None] * x_latent).sum(axis=0) + sigma_eps * eps_y

    y = _link_fwd(y_latent, link)
    reports = _link_fwd(x_latent, link)
    return y, reports, sigmas


class _DGPAggregation:
    def __init__(self, method: int, name: str, description: str):
        self._method = method
        self.info = DGPInfo(
            name=name,
            output="point",
            support="[0,1]",
            link="probit",
            truth_source="endogenous",
            description=description,
        )

    def generate(
        self,
        *,
        seed: int,
        T: int,
        n_forecasters: int,
        sigmas: np.ndarray | None = None,
        w: np.ndarray | None = None,
        normalise_w: bool = True,
        sigma_eps: float = 0.25,
        rho_mu: float = 0.98,
        sigma_state: float = 0.35,
        mu0: float = 0.0,
        sigma_mu_noise: float = 1.0,
        link: str = "probit",
        quantiles: np.ndarray | None = None,
        **kwargs,
    ) -> DGPOutput:
        rng = np.random.default_rng(seed)
        sigmas = np.full(n_forecasters, 0.5, dtype=np.float64) if sigmas is None else np.asarray(sigmas).ravel()
        w = np.ones(n_forecasters, dtype=np.float64) / n_forecasters if w is None else np.asarray(w).ravel()

        y, reports, sigmas_out = _generate_core(
            T, n_forecasters, rng, self._method, w, sigmas, normalise_w,
            sigma_eps, rho_mu, sigma_state, mu0, sigma_mu_noise, link,
        )

        q_reports = None
        taus = None
        if quantiles is not None:
            taus = np.asarray(quantiles, dtype=np.float64).ravel()
            K = taus.size
            z_tau = norm.ppf(taus).astype(np.float64)
            point_latent = _link_inv(reports, link)
            q_reports = np.zeros((n_forecasters, T, K), dtype=np.float64)
            for i in range(n_forecasters):
                q_latent = point_latent[i : i + 1, :].T + float(sigmas_out[i]) * z_tau
                q_reports[i] = _link_fwd(q_latent, link)
            for i in range(n_forecasters):
                for t in range(T):
                    o = np.argsort(taus)
                    q_reports[i, t, o] = np.maximum.accumulate(q_reports[i, t, o].copy())

        return DGPOutput(
            y=y,
            reports=reports,
            q_reports=q_reports,
            tau_true=sigmas_out,
            taus=taus,
            meta={"method": self._method, "w": w},
        )


# Note: Methods 1 and 2 produce identical output (same generative model).
# Method 2 is registered as a named alias for future expansion.
# Only Method 3 differs: it adds per-forecaster mean shocks eta_i.
DGP_AGGREGATION_METHOD1 = register_dgp(_DGPAggregation(1, "aggregation_method1", "y = w@x_latent + noise; shared AR(1)"))
DGP_AGGREGATION_METHOD2 = register_dgp(_DGPAggregation(2, "aggregation_method2", "Same as method 1 (alias for future expansion)"))
DGP_AGGREGATION_METHOD3 = register_dgp(_DGPAggregation(3, "aggregation_method3", "Method 3: adds per-forecaster mean shocks eta"))
