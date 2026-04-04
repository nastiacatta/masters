"""
Runner: connect real-data forecasters to the wagering mechanism.

Takes a 1D time series, runs 5 forecasters in a rolling fashion,
feeds their forecasts into the mechanism, and compares weighting rules.

Output format matches master_comparison for dashboard compatibility.
"""
from __future__ import annotations
import json
import os
import time
import numpy as np
from .forecasters import BaseForecaster, get_all_forecasters


def normalize_series(series: np.ndarray) -> tuple[np.ndarray, float, float]:
    """Normalize to [0, 1] range. Returns (normalized, min, max)."""
    lo, hi = float(np.min(series)), float(np.max(series))
    if hi - lo < 1e-12:
        return np.full_like(series, 0.5), lo, hi
    return (series - lo) / (hi - lo), lo, hi


def run_real_data_comparison(
    series: np.ndarray,
    forecasters: list[BaseForecaster] | None = None,
    warmup: int = 100,
    taus: np.ndarray | None = None,
    outdir: str = "outputs",
    series_name: str = "real_data",
) -> dict:
    """Run all forecasters on a real time series and compare weighting rules.

    Args:
        series: 1D array of observed values (raw, will be normalized)
        forecasters: list of forecaster objects (default: all 5)
        warmup: number of initial rounds used only for training (no scoring)
        taus: quantile levels for CRPS (default: [0.1, 0.25, 0.5, 0.75, 0.9])
        outdir: output directory
        series_name: name for the output files

    Returns:
        dict with 'config', 'rows' (master_comparison format), 'per_round'
    """
    if taus is None:
        taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    if forecasters is None:
        forecasters = get_all_forecasters()

    n_forecasters = len(forecasters)
    T = len(series)

    # Normalize
    norm_series, s_min, s_max = normalize_series(series)

    print(f"Running {n_forecasters} forecasters on {T} data points "
          f"(warmup={warmup}, series={series_name})")

    # Storage
    y_all = np.zeros(T)
    reports = np.zeros((n_forecasters, T))  # point forecasts
    q_reports = np.zeros((n_forecasters, T, len(taus)))  # quantile forecasts

    t0 = time.time()

    for t in range(T):
        y_t = norm_series[t]
        y_all[t] = y_t
        history = norm_series[:t]  # strictly causal

        for i, fc in enumerate(forecasters):
            # Retrain if needed
            if t == 0 or (t % fc.retrain_every == 0 and len(history) > 20):
                fc.fit(history)

            # Predict
            point = fc.predict()
            point = float(np.clip(point, 0, 1))
            reports[i, t] = point
            q_reports[i, t, :] = np.clip(fc.predict_quantiles(taus), 0, 1)

            # Update residuals for quantile estimation
            fc.update_residuals(y_t, point)

            # Update history for models that track it
            if hasattr(fc, '_history'):
                fc._history = norm_series[:t + 1]
            if hasattr(fc, '_last') and isinstance(fc._last, float):
                fc._last = y_t

    elapsed = time.time() - t0
    print(f"  Forecasting done in {elapsed:.1f}s")

    # Now run the mechanism comparison
    from onlinev2.simulation import run_simulation
    from onlinev2.core.scoring import crps_hat_from_quantiles
    from onlinev2.core.aggregation import aggregate_forecast

    # Run simulation with the mechanism
    print("  Running mechanism simulation...")
    res = run_simulation(
        T=T,
        n_forecasters=n_forecasters,
        missing_prob=0.0,  # all forecasters always present
        seed=42,
        scoring_mode="quantiles_crps",
        taus=taus,
        y_pre=y_all,
        q_reports_pre=q_reports,
        forecaster_noise_pre=np.ones(n_forecasters),
        store_history=True,
        deposit_mode="fixed",
        fixed_deposit=1.0,
        eta=2.0,
        lam=0.05,
        omega_max=0.0,
    )

    # Compute CRPS for each weighting rule (post-warmup)
    eps = 1e-12
    rules = ["uniform", "skill", "mechanism", "best_single"]
    crps_per_rule: dict[str, list[float]] = {r: [] for r in rules}
    per_round: list[dict] = []

    for t in range(warmup, T):
        y_t = float(y_all[t])
        q_t = q_reports[:, t, :]

        # Uniform
        agg_u = np.mean(q_t, axis=0)
        c_u = float(crps_hat_from_quantiles(y_t, agg_u.reshape(1, -1), taus)[0])
        crps_per_rule["uniform"].append(c_u)

        # Skill-only
        sigma_t = res["sigma_hist"][:, t]
        w_skill = sigma_t.copy()
        if w_skill.sum() > eps:
            agg_s = aggregate_forecast(q_t, w_skill, eps=eps)
            c_s = float(crps_hat_from_quantiles(y_t, agg_s.reshape(1, -1), taus)[0])
        else:
            c_s = c_u
        crps_per_rule["skill"].append(c_s)

        # Mechanism (from simulation)
        r_mech = np.asarray(res["r_hat_hist"][t], dtype=np.float64)
        if r_mech.size == len(taus):
            c_m = float(crps_hat_from_quantiles(y_t, r_mech.reshape(1, -1), taus)[0])
        else:
            c_m = c_u
        crps_per_rule["mechanism"].append(c_m)

        # Best single (lowest residual variance)
        best_idx = int(np.argmin([
            np.var([reports[j, max(0, t-50):t] - y_all[max(0, t-50):t]])
            for j in range(n_forecasters)
        ])) if t > 50 else 0
        c_best = float(crps_hat_from_quantiles(y_t, q_t[best_idx:best_idx+1], taus)[0])
        crps_per_rule["best_single"].append(c_best)

        per_round.append({
            "t": t,
            "y": y_t,
            "crps_uniform": c_u,
            "crps_skill": c_s,
            "crps_mechanism": c_m,
            "crps_best_single": c_best,
        })

    # Summary
    mean_uniform = float(np.mean(crps_per_rule["uniform"]))
    rows = []
    for rule in rules:
        mean_crps = float(np.mean(crps_per_rule[rule]))
        rows.append({
            "experiment": f"real_data_{series_name}",
            "method": rule,
            "seed": 0,
            "DGP": series_name,
            "preset": "fixed_deposits",
            "mean_crps": mean_crps,
            "delta_crps_vs_equal": mean_crps - mean_uniform,
        })

    result = {
        "config": {
            "T": T,
            "n_forecasters": n_forecasters,
            "warmup": warmup,
            "series_name": series_name,
            "series_min": s_min,
            "series_max": s_max,
            "forecasters": [fc.name for fc in forecasters],
        },
        "rows": rows,
        "per_round": per_round,
    }

    # Write output
    out_path = os.path.join(outdir, "real_data", series_name)
    os.makedirs(os.path.join(out_path, "data"), exist_ok=True)
    with open(os.path.join(out_path, "data", "comparison.json"), "w") as f:
        json.dump(result, f, indent=2)

    # Print summary
    print(f"\n  Results (post-warmup, {T - warmup} rounds):")
    print(f"  {'Method':15s} {'Mean CRPS':>12s} {'Delta':>12s}")
    print(f"  {'-'*40}")
    for r in rows:
        d = r['delta_crps_vs_equal']
        print(f"  {r['method']:15s} {r['mean_crps']:12.6f} {d:+12.6f}")

    return result
