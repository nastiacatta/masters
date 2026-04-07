"""
Real-data experiments: day-ahead, 4h-ahead at 15min, and regime-shift analysis.
"""
from __future__ import annotations

import json
import os
import time

import numpy as np
import pandas as pd

from .forecasters import BaseForecaster, get_all_forecasters
from .runner import normalize_series


def _run_horizon_comparison(
    series: np.ndarray,
    horizon: int,
    forecasters: list[BaseForecaster],
    warmup: int,
    taus: np.ndarray,
    label: str,
) -> dict:
    """Run forecasters with a given forecast horizon.

    At each round t, models see data up to t-horizon and predict t.
    This ensures strictly causal forecasting at the given horizon.
    """
    norm, s_min, s_max = normalize_series(series)
    T = len(norm)
    n = len(forecasters)

    # Reset forecasters
    for fc in forecasters:
        fc._residuals = []
        fc._fitted = False

    q_reports = np.zeros((n, T, len(taus)))
    reports = np.zeros((n, T))

    print(f"  Generating forecasts (horizon={horizon})...")
    t0 = time.time()
    for t in range(T):
        # Models see data up to t-horizon (strictly causal at given horizon)
        cutoff = max(0, t - horizon)
        history = norm[:cutoff] if cutoff > 0 else np.array([])

        for i, fc in enumerate(forecasters):
            if len(history) < 5:
                point = 0.5
            else:
                if t == 0 or (t % fc.retrain_every == 0 and len(history) > 20):
                    fc.fit(history)
                point = float(np.clip(fc.predict(), 0, 1))

            reports[i, t] = point
            q_reports[i, t, :] = np.clip(fc.predict_quantiles(taus), 0, 1) if len(history) >= 5 else np.full(len(taus), point)

            if cutoff > 0:
                fc.update_residuals(norm[cutoff - 1], point)
                if hasattr(fc, '_history'):
                    fc._history = norm[:cutoff]
                if hasattr(fc, '_last') and isinstance(fc._last, float):
                    fc._last = norm[cutoff - 1]

    print(f"    Done in {time.time()-t0:.1f}s")

    # Run mechanism
    from onlinev2.core.aggregation import aggregate_forecast
    from onlinev2.core.scoring import crps_hat_from_quantiles
    from onlinev2.simulation import run_simulation

    res = run_simulation(
        T=T, n_forecasters=n, missing_prob=0.0, seed=42,
        scoring_mode="quantiles_crps", taus=taus,
        y_pre=norm, q_reports_pre=q_reports,
        forecaster_noise_pre=np.ones(n), store_history=True,
        deposit_mode="fixed", fixed_deposit=1.0,
        eta=2.0, lam=0.05, omega_max=0.0,
    )

    eps = 1e-12
    rules = ["uniform", "skill", "mechanism", "best_single"]
    crps_per_rule = {r: [] for r in rules}
    per_round = []

    for t in range(warmup, T):
        y_t = float(norm[t])
        q_t = q_reports[:, t, :]

        agg_u = np.mean(q_t, axis=0)
        c_u = float(crps_hat_from_quantiles(y_t, agg_u.reshape(1, -1), taus)[0])
        crps_per_rule["uniform"].append(c_u)

        sigma_t = res["sigma_hist"][:, t]
        w_skill = sigma_t.copy()
        if w_skill.sum() > eps:
            agg_s = aggregate_forecast(q_t, w_skill, eps=eps)
            c_s = float(crps_hat_from_quantiles(y_t, agg_s.reshape(1, -1), taus)[0])
        else:
            c_s = c_u
        crps_per_rule["skill"].append(c_s)

        r_mech = np.asarray(res["r_hat_hist"][t], dtype=np.float64)
        c_m = float(crps_hat_from_quantiles(y_t, r_mech.reshape(1, -1), taus)[0]) if r_mech.size == len(taus) else c_u
        crps_per_rule["mechanism"].append(c_m)

        best_idx = int(np.argmin([np.var(reports[j, max(0, t-50):t] - norm[max(0, t-50):t]) for j in range(n)])) if t > 50 else 0
        c_best = float(crps_hat_from_quantiles(y_t, q_t[best_idx:best_idx+1], taus)[0])
        crps_per_rule["best_single"].append(c_best)

        per_round.append({
            "t": t, "y": y_t,
            "crps_uniform": c_u, "crps_skill": c_s,
            "crps_mechanism": c_m, "crps_best_single": c_best,
        })

    mean_u = float(np.mean(crps_per_rule["uniform"]))
    rows = []
    for rule in rules:
        mc = float(np.mean(crps_per_rule[rule]))
        rows.append({
            "experiment": label, "method": rule, "seed": 0,
            "DGP": label, "preset": "fixed_deposits",
            "mean_crps": mc, "delta_crps_vs_equal": mc - mean_u,
        })

    # Skill ranking
    final_sigma = res["sigma_hist"][:, -1]
    avg_sigma = np.mean(res["sigma_hist"][:, -1000:], axis=1) if T > 1000 else final_sigma

    return {
        "config": {
            "T": T, "n_forecasters": n, "warmup": warmup,
            "horizon": horizon, "label": label,
            "forecasters": [fc.name for fc in forecasters],
        },
        "rows": rows,
        "per_round": per_round,
        "skill_ranking": [
            {"model": forecasters[i].name, "final_sigma": float(final_sigma[i]),
             "avg_sigma": float(avg_sigma[i])}
            for i in range(n)
        ],
    }


def run_all_real_experiments(data_path: str, outdir: str = "outputs") -> dict:
    """Run day-ahead, 4h-ahead, and regime-shift experiments."""

    df = pd.read_csv(data_path)
    df["datetime"] = pd.to_datetime(df["datetime"], utc=True)
    df = df.set_index("datetime")

    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    results = {}

    # === 1. Day-ahead (daily resolution, horizon=1 day) ===
    print("=== Experiment 1: Day-ahead ===")
    daily = df["measured"].resample("1D").mean().dropna().values
    print(f"  Daily series: {len(daily)} points")
    forecasters_daily = get_all_forecasters()
    results["day_ahead"] = _run_horizon_comparison(
        daily, horizon=1, forecasters=forecasters_daily,
        warmup=30, taus=taus, label="day_ahead",
    )

    # === 2. 4h-ahead at 15-min resolution ===
    print("\n=== Experiment 2: 4h-ahead (15-min resolution) ===")
    raw_15min = df["measured"].dropna().values
    # Subsample to keep it manageable (every 4th point = hourly-ish)
    # Actually use full 15-min but horizon=16 (4 hours)
    # Limit to first 20k points to keep runtime reasonable
    series_15min = raw_15min[:20000]
    print(f"  15-min series: {len(series_15min)} points (horizon=16 = 4 hours)")
    forecasters_15min = get_all_forecasters()
    results["4h_ahead"] = _run_horizon_comparison(
        series_15min, horizon=16, forecasters=forecasters_15min,
        warmup=200, taus=taus, label="4h_ahead_15min",
    )

    # === 3. Regime-shift test (seasonal) ===
    print("\n=== Experiment 3: Regime-shift (seasonal) ===")
    hourly = df["measured"].resample("1h").mean().dropna()
    hourly_df = hourly.to_frame("value")
    hourly_df["month"] = hourly_df.index.month

    # Split into seasons
    {
        "winter": hourly_df[hourly_df["month"].isin([12, 1, 2])]["value"].values,
        "spring": hourly_df[hourly_df["month"].isin([3, 4, 5])]["value"].values,
        "summer": hourly_df[hourly_df["month"].isin([6, 7, 8])]["value"].values,
        "autumn": hourly_df[hourly_df["month"].isin([9, 10, 11])]["value"].values,
    }

    # Run on full series but track per-season performance
    full_hourly = hourly.values
    norm_full, _, _ = normalize_series(full_hourly)

    # Get month for each hourly point
    months = hourly.index.month.values

    forecasters_regime = get_all_forecasters()
    full_result = _run_horizon_comparison(
        full_hourly, horizon=1, forecasters=forecasters_regime,
        warmup=200, taus=taus, label="regime_shift",
    )

    # Compute per-season CRPS from per_round data
    season_map = {12: "winter", 1: "winter", 2: "winter",
                  3: "spring", 4: "spring", 5: "spring",
                  6: "summer", 7: "summer", 8: "summer",
                  9: "autumn", 10: "autumn", 11: "autumn"}

    season_crps = {s: {"uniform": [], "mechanism": [], "skill": []} for s in ["winter", "spring", "summer", "autumn"]}
    for pr in full_result["per_round"]:
        t = pr["t"]
        if t < len(months):
            season = season_map.get(int(months[t]), "unknown")
            if season in season_crps:
                season_crps[season]["uniform"].append(pr["crps_uniform"])
                season_crps[season]["mechanism"].append(pr["crps_mechanism"])
                season_crps[season]["skill"].append(pr["crps_skill"])

    regime_summary = {}
    for season, data in season_crps.items():
        if data["uniform"]:
            mu = np.mean(data["uniform"])
            mm = np.mean(data["mechanism"])
            ms = np.mean(data["skill"])
            regime_summary[season] = {
                "n_rounds": len(data["uniform"]),
                "uniform": float(mu),
                "mechanism": float(mm),
                "skill": float(ms),
                "delta_mechanism": float(mm - mu),
                "pct_mechanism": float(-(mm - mu) / mu * 100) if mu > 1e-12 else 0,
                "delta_skill": float(ms - mu),
                "pct_skill": float(-(ms - mu) / mu * 100) if mu > 1e-12 else 0,
            }

    results["regime_shift"] = {
        **full_result,
        "regime_summary": regime_summary,
    }

    # Save all results
    out_path = os.path.join(outdir, "real_data", "elia_wind", "data")
    os.makedirs(out_path, exist_ok=True)

    for key, res in results.items():
        with open(os.path.join(out_path, f"{key}.json"), "w") as f:
            json.dump(res, f, indent=2)
        print(f"\n  Saved {key}.json")

    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for key, res in results.items():
        print(f"\n{key}:")
        for r in res["rows"]:
            d = r["delta_crps_vs_equal"]
            mu = res["rows"][0]["mean_crps"]
            pct = -d / mu * 100 if mu > 1e-12 else 0
            print(f"  {r['method']:15s}: CRPS={r['mean_crps']:.6f} Δ={d:+.6f} ({pct:+.1f}%)")

    if "regime_shift" in results and "regime_summary" in results["regime_shift"]:
        print("\nRegime shift (per-season mechanism improvement):")
        for season, data in results["regime_shift"]["regime_summary"].items():
            print(f"  {season:8s}: {data['n_rounds']:5d} rounds, mechanism {data['pct_mechanism']:+.1f}%, skill {data['pct_skill']:+.1f}%")

    return results
