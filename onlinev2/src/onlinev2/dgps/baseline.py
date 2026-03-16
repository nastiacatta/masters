"""
DGP: Baseline (legacy / sanity only).

Truth y ~ Uniform[0,1]; reports = clip(y + forecaster noise, 0, 1).
Acceptable for sanity checks, but clipping distorts loss geometry near the
boundaries. Do not use for strong claims about recovering intrinsic skill;
use the latent Bayes-consistent generator for main evaluation.
"""
from __future__ import annotations

import numpy as np
from scipy.stats import norm

from ..types import DGPInfo
from .protocol import DGPOutput
from .registry import register_dgp


class _DGPBaseline:
    info = DGPInfo(
        name="baseline",
        output="point",
        support="[0,1]",
        link="identity",
        truth_source="exogenous",
        description="[Legacy/sanity only] y ~ U(0,1); reports_i = clip(y + noise_i, 0, 1).",
    )

    def generate(
        self,
        *,
        seed: int,
        T: int,
        n_forecasters: int,
        quantiles: np.ndarray | None = None,
        **kwargs,
    ) -> DGPOutput:
        rng = np.random.default_rng(seed)
        noise = rng.lognormal(mean=-2.5, sigma=0.4, size=n_forecasters)
        noise = np.maximum(noise, 0.01)

        y = rng.uniform(0.0, 1.0, size=T).astype(np.float64)
        reports = np.zeros((n_forecasters, T), dtype=np.float64)
        for i in range(n_forecasters):
            reports[i] = np.clip(y + rng.normal(0.0, noise[i], size=T), 0.0, 1.0)

        q_reports = None
        taus = None
        if quantiles is not None:
            taus = np.asarray(quantiles, dtype=np.float64).ravel()
            K = taus.size
            sigma_i = np.maximum(noise, 0.02)
            q_reports = np.zeros((n_forecasters, T, K), dtype=np.float64)
            for i in range(n_forecasters):
                for k, tau in enumerate(taus):
                    q_reports[i, :, k] = np.clip(
                        reports[i] + sigma_i[i] * norm.ppf(tau), 0.0, 1.0
                    )
            for i in range(n_forecasters):
                o = np.argsort(taus)
                for t in range(T):
                    q_reports[i, t, o] = np.maximum.accumulate(q_reports[i, t, o].copy())

        return DGPOutput(
            y=y,
            reports=reports,
            q_reports=q_reports,
            tau_true=noise,
            taus=taus,
            meta={},
        )


DGP_BASELINE = register_dgp(_DGPBaseline())
