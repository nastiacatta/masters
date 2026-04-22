#!/usr/bin/env python3
"""Head-to-head baseline comparison on Elia data.

Compares three prediction-market designs on the *same* set of quantile forecasts:

  1. Raja (history-free weighted-score wagering)
       Weights ∝ per-round deposits scaled by forecast-confidence only.
       No learning, no memory across rounds.  Matches Lambert/Raja exactly
       when the deposits are equal.

  2. Vitali-style OGD on the simplex
       Per-quantile weight vector updated with pinball-loss subgradient,
       projected onto the probability simplex.  Matches the learning rule
       from Vitali & Pinson (2025) modulo the Shapley reward layer.

  3. Ours (this thesis)
       Deposit × learned skill gate fed into the self-financed Lambert
       aggregator.  Same settlement as Raja but influence is weighted by
       accumulated evidence of forecasting performance.

Forecasts are cached in a .npz so re-running baselines is fast once the
full forecasting sweep has been done once per dataset.

Usage (from the repo root):
    onlinev2/.venv/bin/python scripts/run_baseline_comparison.py --dataset wind
    onlinev2/.venv/bin/python scripts/run_baseline_comparison.py --dataset electricity
    onlinev2/.venv/bin/python scripts/run_baseline_comparison.py --dataset both

Outputs JSON to `dashboard/public/data/real_data/<series>/data/baselines.json`
and a summary CSV to `presentation/plots/data/baseline_comparison_<series>.csv`.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import asdict, dataclass
from typing import Iterable

import numpy as np
import pandas as pd

# Make onlinev2 importable when called from repo root.
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "onlinev2", "src"))

from onlinev2.core.aggregation import aggregate_forecast  # noqa: E402
from onlinev2.core.scoring import crps_hat_from_quantiles  # noqa: E402
from onlinev2.real_data.forecasters import get_all_forecasters  # noqa: E402
from onlinev2.real_data.loader import load_csv_series  # noqa: E402
from onlinev2.simulation import run_simulation  # noqa: E402
from scipy.stats import norm  # noqa: E402


# ────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────


def normalize_series(series: np.ndarray) -> tuple[np.ndarray, float, float]:
    lo, hi = float(np.min(series)), float(np.max(series))
    if hi - lo < 1e-12:
        return np.full_like(series, 0.5), lo, hi
    return (series - lo) / (hi - lo), lo, hi


def confidence_from_quantiles(
    q_t: np.ndarray,
    taus: np.ndarray,
    *,
    tau_L: float = 0.1,
    tau_H: float = 0.9,
    beta_c: float = 1.0,
    c_min: float = 0.5,
    c_max: float = 1.0,
    eps: float = 1e-6,
) -> np.ndarray:
    """Replicates `core.staking.confidence_from_quantiles` for standalone use."""
    q_t = np.asarray(q_t, dtype=np.float64)
    taus = np.asarray(taus, dtype=np.float64).ravel()
    idx_L = int(np.argmin(np.abs(taus - tau_L)))
    idx_H = int(np.argmin(np.abs(taus - tau_H)))
    q_lo = np.clip(q_t[:, idx_L], eps, 1.0 - eps)
    q_hi = np.clip(q_t[:, idx_H], eps, 1.0 - eps)
    dz = np.maximum(norm.ppf(q_hi) - norm.ppf(q_lo), 0.0)
    c = np.exp(-float(beta_c) * dz)
    return np.clip(c, float(c_min), float(c_max))


def project_simplex(v: np.ndarray) -> np.ndarray:
    """Euclidean projection onto the probability simplex (Duchi et al. 2008)."""
    v = np.asarray(v, dtype=np.float64)
    n = v.size
    u = np.sort(v)[::-1]
    cssv = np.cumsum(u) - 1.0
    rho_idx = np.nonzero(u - cssv / (np.arange(1, n + 1)) > 0)[0]
    if rho_idx.size == 0:
        return np.full_like(v, 1.0 / n)
    rho = rho_idx[-1]
    theta = cssv[rho] / (rho + 1)
    return np.maximum(v - theta, 0.0)


# ────────────────────────────────────────────────────────────────────
# Forecast caching
# ────────────────────────────────────────────────────────────────────


def run_forecasters(
    series: np.ndarray, taus: np.ndarray
) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Run all forecasters causally; return y_all, q_reports, names."""
    forecasters = get_all_forecasters()
    n = len(forecasters)
    T = len(series)
    y_all = series.astype(np.float64)
    q_reports = np.zeros((n, T, len(taus)), dtype=np.float64)

    t0 = time.time()
    for t in range(T):
        y_t = y_all[t]
        history = y_all[:t]
        for i, fc in enumerate(forecasters):
            if t == 0 or (t % fc.retrain_every == 0 and len(history) > 20):
                fc.fit(history)
            point = float(np.clip(fc.predict(), 0.0, 1.0))
            q_reports[i, t, :] = fc.predict_quantiles(taus)
            fc.update_residuals(y_t, point)
            if hasattr(fc, "_history"):
                fc._history = y_all[: t + 1]
            if hasattr(fc, "_last") and isinstance(fc._last, float):
                fc._last = y_t
        if t % 2000 == 0 and t > 0:
            print(f"    forecasting step {t}/{T}  ({time.time() - t0:.1f}s elapsed)")
    print(f"    forecasting done in {time.time() - t0:.1f}s")
    return y_all, q_reports, [fc.name for fc in forecasters]


def ensure_cache(
    cache_path: str,
    series_path: str,
    taus: np.ndarray,
    *,
    hourly: bool,
    force: bool = False,
) -> dict:
    if os.path.isfile(cache_path) and not force:
        print(f"  Using cached forecasts: {cache_path}")
        data = np.load(cache_path, allow_pickle=True)
        return {
            "y_norm": data["y_norm"],
            "q_reports": data["q_reports"],
            "names": list(data["names"]),
            "taus": data["taus"],
            "series_min": float(data["series_min"]),
            "series_max": float(data["series_max"]),
        }

    print(f"  Loading series from {series_path}")
    if hourly:
        df = pd.read_csv(series_path)
        raw = df["measured"].dropna().values.astype(np.float64)
        series = raw[::4]  # 15-min → hourly
    else:
        series = load_csv_series(series_path)
    print(f"  Series length = {len(series)}")

    norm_series, s_min, s_max = normalize_series(series)
    y_all, q_reports, names = run_forecasters(norm_series, taus)

    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    np.savez_compressed(
        cache_path,
        y_norm=y_all,
        q_reports=q_reports,
        names=np.array(names),
        taus=taus,
        series_min=s_min,
        series_max=s_max,
    )
    print(f"  Cached forecasts to {cache_path}")
    return {
        "y_norm": y_all,
        "q_reports": q_reports,
        "names": names,
        "taus": taus,
        "series_min": s_min,
        "series_max": s_max,
    }


# ────────────────────────────────────────────────────────────────────
# Baselines
# ────────────────────────────────────────────────────────────────────


@dataclass
class MethodResult:
    name: str
    mean_crps: float
    crps_series: np.ndarray
    weights_series: np.ndarray | None = None  # (T_eval, n) if available


def method_uniform(q_reports: np.ndarray, y_all: np.ndarray, taus: np.ndarray, warmup: int) -> MethodResult:
    T = q_reports.shape[1]
    crps = []
    for t in range(warmup, T):
        agg = np.mean(q_reports[:, t, :], axis=0, keepdims=True)
        crps.append(float(crps_hat_from_quantiles(float(y_all[t]), agg, taus)[0]))
    return MethodResult("uniform", float(np.mean(crps)), np.asarray(crps))


def method_raja_history_free(
    q_reports: np.ndarray,
    y_all: np.ndarray,
    taus: np.ndarray,
    warmup: int,
    *,
    beta_c: float = 1.0,
    c_min: float = 0.5,
    c_max: float = 1.0,
) -> MethodResult:
    """Lambert/Raja with per-round confidence-scaled wagers and no history."""
    n, T, _ = q_reports.shape
    crps = []
    weights = []
    for t in range(warmup, T):
        q_t = q_reports[:, t, :]
        c = confidence_from_quantiles(
            q_t, taus, beta_c=beta_c, c_min=c_min, c_max=c_max
        )
        if c.sum() < 1e-12:
            w = np.full(n, 1.0 / n)
        else:
            w = c / c.sum()
        agg = aggregate_forecast(q_t, w).reshape(1, -1)
        crps.append(float(crps_hat_from_quantiles(float(y_all[t]), agg, taus)[0]))
        weights.append(w)
    return MethodResult("raja_history_free", float(np.mean(crps)), np.asarray(crps), np.asarray(weights))


def method_vitali_ogd(
    q_reports: np.ndarray,
    y_all: np.ndarray,
    taus: np.ndarray,
    warmup: int,
    *,
    lr: float = 0.05,
    mode: str = "per_quantile",
) -> MethodResult:
    """Vitali & Pinson (2025)-style OGD on the probability simplex.

    Modes:
      - ``"per_quantile"``: one weight vector per quantile level (matches the
        paper's III.A "For any quantile τ ... a different LR is learned").
        Aggregate forecast at level k uses ``W[k]``.
      - ``"shared"``: single weight vector updated with mean pinball subgradient
        across quantiles.  Cheaper and very close in practice.
    """
    if mode not in {"per_quantile", "shared"}:
        raise ValueError(f"unknown mode {mode}")

    n, T, K = q_reports.shape
    if mode == "shared":
        w = np.full(n, 1.0 / n)
    else:
        W = np.full((K, n), 1.0 / n)

    crps = []
    weights_series = []
    for t in range(T):
        q_t = q_reports[:, t, :]
        y_t = float(y_all[t])

        if mode == "shared":
            y_hat = w @ q_t  # (K,)
        else:
            y_hat = np.sum(W * q_t.T, axis=1)  # (K,)

        if t >= warmup:
            crps.append(float(crps_hat_from_quantiles(y_t, y_hat.reshape(1, -1), taus)[0]))
            weights_series.append(w.copy() if mode == "shared" else W.mean(axis=0).copy())

        if mode == "shared":
            grad = np.zeros(n)
            for k, tau in enumerate(taus):
                s = -float(tau) if y_t >= y_hat[k] else (1.0 - float(tau))
                grad += s * q_t[:, k]
            grad /= K
            w = project_simplex(w - lr * grad)
        else:
            for k, tau in enumerate(taus):
                s = -float(tau) if y_t >= y_hat[k] else (1.0 - float(tau))
                grad = s * q_t[:, k]
                W[k] = project_simplex(W[k] - lr * grad)

    return MethodResult(
        f"vitali_ogd_{mode}",
        float(np.mean(crps)),
        np.asarray(crps),
        np.asarray(weights_series),
    )


def method_mechanism(
    q_reports: np.ndarray,
    y_all: np.ndarray,
    taus: np.ndarray,
    warmup: int,
    *,
    gamma: float,
    rho: float,
    lam: float,
    eta: float,
    seed: int = 42,
) -> MethodResult:
    """Runs the repo's mechanism via `run_simulation` and returns per-round CRPS."""
    n, T, _ = q_reports.shape
    res = run_simulation(
        T=T,
        n_forecasters=n,
        missing_prob=0.0,
        seed=seed,
        scoring_mode="quantiles_crps",
        taus=taus,
        y_pre=y_all,
        q_reports_pre=q_reports,
        forecaster_noise_pre=np.ones(n),
        store_history=True,
        deposit_mode="fixed",
        fixed_deposit=1.0,
        eta=eta,
        lam=lam,
        gamma=gamma,
        rho=rho,
        omega_max=0.0,
    )
    crps = []
    weights = []
    for t in range(warmup, T):
        r_mech = np.asarray(res["r_hat_hist"][t], dtype=np.float64)
        if r_mech.size != len(taus):
            continue
        crps.append(float(crps_hat_from_quantiles(float(y_all[t]), r_mech.reshape(1, -1), taus)[0]))
        w = res["wager_hist"][:, t]
        w = w / w.sum() if w.sum() > 1e-12 else np.full_like(w, 1.0 / len(w))
        weights.append(w)
    return MethodResult(
        "mechanism",
        float(np.mean(crps)),
        np.asarray(crps),
        np.asarray(weights),
    )


# ────────────────────────────────────────────────────────────────────
# Driver
# ────────────────────────────────────────────────────────────────────


def rolling_mean(x: np.ndarray, window: int) -> np.ndarray:
    if window <= 1:
        return x.copy()
    kernel = np.ones(window, dtype=np.float64) / window
    return np.convolve(x, kernel, mode="valid")


def run_dataset(
    series_name: str,
    csv_path: str,
    *,
    hourly: bool,
    warmup: int,
    gamma: float,
    rho: float,
    lam: float,
    eta: float,
    vitali_lr: float,
    force_cache: bool,
    outdir_dashboard: str,
    outdir_presentation: str,
) -> dict:
    print(f"\n[{series_name}] Running baseline comparison")
    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    cache_path = os.path.join(REPO_ROOT, "onlinev2", "outputs_cache", f"{series_name}_forecasts.npz")

    cache = ensure_cache(cache_path, csv_path, taus, hourly=hourly, force=force_cache)
    y_all = cache["y_norm"]
    q_reports = cache["q_reports"]
    names: list[str] = list(cache["names"])

    results: list[MethodResult] = [
        method_uniform(q_reports, y_all, taus, warmup),
        method_raja_history_free(q_reports, y_all, taus, warmup),
        method_vitali_ogd(q_reports, y_all, taus, warmup, lr=vitali_lr, mode="per_quantile"),
        method_mechanism(
            q_reports, y_all, taus, warmup,
            gamma=gamma, rho=rho, lam=lam, eta=eta,
        ),
    ]

    T_eval = results[0].crps_series.size
    uniform_mean = float(results[0].mean_crps)

    summary_rows = []
    for r in results:
        delta = r.mean_crps - uniform_mean
        pct = (r.mean_crps / uniform_mean - 1.0) * 100.0 if uniform_mean > 0 else 0.0
        summary_rows.append(
            {
                "series": series_name,
                "method": r.name,
                "mean_crps": round(r.mean_crps, 6),
                "delta_vs_uniform": round(delta, 6),
                "pct_vs_uniform": round(pct, 2),
            }
        )

    print(f"\n  Summary ({T_eval} evaluation rounds):")
    print(f"  {'Method':22s} {'CRPS':>10s}  {'Δ':>10s}  {'%':>7s}")
    for row in summary_rows:
        print(
            f"  {row['method']:22s} {row['mean_crps']:10.6f}"
            f"  {row['delta_vs_uniform']:+10.6f}  {row['pct_vs_uniform']:+6.1f}%"
        )

    # Rolling CRPS (for time-series comparison plot).
    window = max(100, T_eval // 100)
    t_index = np.arange(warmup, warmup + T_eval)
    rolling: dict[str, Iterable[float]] = {"t": t_index[window - 1 :].tolist()}
    for r in results:
        rolling[r.name] = [round(float(v), 6) for v in rolling_mean(r.crps_series, window)]

    # Per-method summary payload for the dashboard + R plots.
    output = {
        "config": {
            "series": series_name,
            "T": int(len(y_all)),
            "warmup": int(warmup),
            "T_eval": int(T_eval),
            "n_forecasters": int(q_reports.shape[0]),
            "forecaster_names": names,
            "mechanism_params": {"gamma": gamma, "rho": rho, "lam": lam, "eta": eta},
            "vitali_lr": vitali_lr,
            "taus": taus.tolist(),
        },
        "summary": summary_rows,
        "rolling_crps": rolling,
        "rolling_window": int(window),
    }

    # Write dashboard JSON.
    dash_dir = os.path.join(outdir_dashboard, "real_data", series_name, "data")
    os.makedirs(dash_dir, exist_ok=True)
    dash_path = os.path.join(dash_dir, "baselines.json")
    with open(dash_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"  Wrote {dash_path}")

    # Write CSV for R plotting.
    csv_dir = os.path.join(outdir_presentation, "data")
    os.makedirs(csv_dir, exist_ok=True)
    csv_summary = os.path.join(csv_dir, f"baseline_comparison_{series_name}.csv")
    pd.DataFrame(summary_rows).to_csv(csv_summary, index=False)
    print(f"  Wrote {csv_summary}")

    # Rolling CSV (long format).
    rolling_rows = []
    methods = [r.name for r in results]
    for i, t in enumerate(rolling["t"]):
        for m in methods:
            rolling_rows.append({"t": int(t), "method": m, "crps": float(rolling[m][i])})
    csv_rolling = os.path.join(csv_dir, f"baseline_rolling_{series_name}.csv")
    pd.DataFrame(rolling_rows).to_csv(csv_rolling, index=False)
    print(f"  Wrote {csv_rolling}")

    return output


def main() -> None:
    p = argparse.ArgumentParser(description="Raja vs Vitali vs Ours baseline comparison")
    p.add_argument("--dataset", choices=["wind", "electricity", "both"], default="both")
    p.add_argument("--warmup", type=int, default=200)
    p.add_argument("--gamma", type=float, default=16.0)
    p.add_argument("--rho", type=float, default=0.5)
    p.add_argument("--lam", type=float, default=0.05)
    p.add_argument("--eta", type=float, default=2.0)
    p.add_argument("--vitali-lr", type=float, default=0.05)
    p.add_argument("--force-cache", action="store_true", help="Regenerate forecast cache")
    args = p.parse_args()

    dashboard_dir = os.path.join(REPO_ROOT, "dashboard", "public", "data")
    presentation_dir = os.path.join(REPO_ROOT, "presentation", "plots")

    datasets: list[tuple[str, str, bool]] = []
    if args.dataset in ("wind", "both"):
        datasets.append((
            "elia_wind",
            os.path.join(REPO_ROOT, "data", "elia_offshore_wind_2024_2025.csv"),
            True,  # 15-min → hourly
        ))
    if args.dataset in ("electricity", "both"):
        datasets.append((
            "elia_electricity",
            os.path.join(REPO_ROOT, "data", "elia_imbalance_prices_2024_2025.csv"),
            False,
        ))

    combined_rows = []
    for name, path, hourly in datasets:
        out = run_dataset(
            name, path,
            hourly=hourly,
            warmup=args.warmup,
            gamma=args.gamma,
            rho=args.rho,
            lam=args.lam,
            eta=args.eta,
            vitali_lr=args.vitali_lr,
            force_cache=args.force_cache,
            outdir_dashboard=dashboard_dir,
            outdir_presentation=presentation_dir,
        )
        combined_rows.extend(out["summary"])

    if combined_rows:
        csv_dir = os.path.join(presentation_dir, "data")
        os.makedirs(csv_dir, exist_ok=True)
        combined_path = os.path.join(csv_dir, "baseline_comparison_all.csv")
        pd.DataFrame(combined_rows).to_csv(combined_path, index=False)
        print(f"\nWrote combined summary to {combined_path}")


if __name__ == "__main__":
    main()
