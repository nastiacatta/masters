"""
Runner: connect real-data forecasters to the wagering mechanism.

Takes a 1D time series, runs 7 forecasters in a rolling fashion,
feeds their forecasts into the mechanism, and compares weighting rules.

Output format matches master_comparison for dashboard compatibility.
"""
from __future__ import annotations

import json
import os
import time

import numpy as np

from .forecasters import BaseForecaster, get_all_forecasters
from .stats import diebold_mariano_test


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

        # Causality invariant: predict() and predict_quantiles() use data up to t-1.
        # update_residuals() incorporates the round-t outcome AFTER predictions are made.
        for i, fc in enumerate(forecasters):
            # Retrain if needed
            if t == 0 or (t % fc.retrain_every == 0 and len(history) > 20):
                fc.fit(history)

            # Predict
            point = fc.predict()
            point = float(np.clip(point, 0, 1))
            reports[i, t] = point
            q_reports[i, t, :] = fc.predict_quantiles(taus)

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
    from onlinev2.core.aggregation import aggregate_forecast
    from onlinev2.core.scoring import crps_hat_from_quantiles
    from onlinev2.simulation import run_simulation

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
    rules = ["uniform", "skill", "mechanism", "best_single",
             "inverse_variance", "trimmed_mean", "median"]
    crps_per_rule: dict[str, list[float]] = {r: [] for r in rules}
    per_round: list[dict] = []

    # Track per-agent rolling CRPS for inverse-variance weights
    agent_rolling_crps: list[list[float]] = [[] for _ in range(n_forecasters)]

    for t in range(warmup, T):
        y_t = float(y_all[t])
        q_t = q_reports[:, t, :]

        # Per-agent CRPS this round (vectorised — pass full matrix at once)
        agent_crps_t = crps_hat_from_quantiles(y_t, q_t, taus)
        for i in range(n_forecasters):
            agent_rolling_crps[i].append(agent_crps_t[i])
            if len(agent_rolling_crps[i]) > 500:
                agent_rolling_crps[i] = agent_rolling_crps[i][-500:]

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

        # Best single (lowest recent CRPS — uses quantile quality, not just point accuracy)
        if t - warmup >= 20:
            recent_agent_crps = [np.mean(agent_rolling_crps[j][-100:]) for j in range(n_forecasters)]
            best_idx = int(np.argmin(recent_agent_crps))
        else:
            best_idx = 0
        c_best = float(crps_hat_from_quantiles(y_t, q_t[best_idx:best_idx+1], taus)[0])
        crps_per_rule["best_single"].append(c_best)

        # --- NEW: Inverse-variance weighting (Bates-Granger style) ---
        # Weights proportional to 1/mean(recent CRPS) — better agents get more weight
        if t - warmup >= 20:
            inv_var_w = np.zeros(n_forecasters)
            for i in range(n_forecasters):
                recent = agent_rolling_crps[i][-100:]
                mean_crps_i = np.mean(recent) + eps
                inv_var_w[i] = 1.0 / mean_crps_i
            inv_var_w /= inv_var_w.sum()
            agg_iv = np.sum(inv_var_w[:, None] * q_t, axis=0)
        else:
            agg_iv = agg_u
        c_iv = float(crps_hat_from_quantiles(y_t, agg_iv.reshape(1, -1), taus)[0])
        crps_per_rule["inverse_variance"].append(c_iv)

        # --- NEW: Trimmed mean (drop worst, average rest) ---
        # Drop the forecaster with highest recent CRPS
        if t - warmup >= 20:
            recent_means = [np.mean(agent_rolling_crps[i][-100:]) for i in range(n_forecasters)]
            worst_idx = int(np.argmax(recent_means))
            keep_mask = np.ones(n_forecasters, dtype=bool)
            keep_mask[worst_idx] = False
            agg_trim = np.mean(q_t[keep_mask], axis=0)
        else:
            agg_trim = agg_u
        c_trim = float(crps_hat_from_quantiles(y_t, agg_trim.reshape(1, -1), taus)[0])
        crps_per_rule["trimmed_mean"].append(c_trim)

        # --- NEW: Median forecast (per-quantile median across forecasters) ---
        agg_med = np.median(q_t, axis=0)
        c_med = float(crps_hat_from_quantiles(y_t, agg_med.reshape(1, -1), taus)[0])
        crps_per_rule["median"].append(c_med)

        per_round.append({
            "t": t,
            "y": y_t,
            "crps_uniform": c_u,
            "crps_skill": c_s,
            "crps_mechanism": c_m,
            "crps_best_single": c_best,
            "crps_inverse_variance": c_iv,
            "crps_trimmed_mean": c_trim,
            "crps_median": c_med,
        })

    # --- Oracle comparison (uses agent_crps_t already computed in main loop) ---
    # Re-compute oracle in a fast vectorised pass
    print("  Computing oracle...")
    crps_oracle = []
    for idx in range(len(per_round)):
        t = warmup + idx
        y_t = float(y_all[t])
        q_t = q_reports[:, t, :]
        agent_crps = crps_hat_from_quantiles(y_t, q_t, taus)
        inv_crps = np.where(agent_crps > 1e-12, 1.0 / agent_crps, 0.0)
        if inv_crps.sum() > 1e-12:
            oracle_weights = inv_crps / inv_crps.sum()
            agg_oracle = np.sum(oracle_weights[:, None] * q_t, axis=0)
        else:
            agg_oracle = np.mean(q_t, axis=0)
        c_oracle = float(crps_hat_from_quantiles(y_t, agg_oracle.reshape(1, -1), taus)[0])
        crps_oracle.append(c_oracle)
        per_round[idx]["crps_oracle"] = c_oracle

    mean_oracle = float(np.mean(crps_oracle))
    crps_per_rule["oracle"] = crps_oracle

    # Summary
    mean_uniform = float(np.mean(crps_per_rule["uniform"]))
    mean_mechanism = float(np.mean(crps_per_rule["mechanism"]))
    rows = []
    for rule in rules + ["oracle"]:
        if rule not in crps_per_rule:
            continue
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

    # --- Rolling window analysis (1000-round windows) ---
    window_size = min(1000, (T - warmup) // 4)
    rolling_improvement = []
    crps_u_arr = np.array(crps_per_rule["uniform"])
    crps_m_arr = np.array(crps_per_rule["mechanism"])
    crps_best_arr = np.array(crps_per_rule["best_single"])
    step_roll = max(1, len(crps_u_arr) // 200)
    for start in range(0, len(crps_u_arr) - window_size, step_roll):
        end = start + window_size
        u_window = np.mean(crps_u_arr[start:end])
        m_window = np.mean(crps_m_arr[start:end])
        b_window = np.mean(crps_best_arr[start:end])
        pct_vs_uniform = (m_window - u_window) / u_window * 100 if u_window > 0 else 0
        pct_vs_best = (m_window - b_window) / b_window * 100 if b_window > 0 else 0
        rolling_improvement.append({
            "t_start": warmup + start,
            "t_end": warmup + end,
            "pct_improvement": round(pct_vs_uniform, 2),
            "pct_vs_best_single": round(pct_vs_best, 2),
        })
    result["rolling_improvement"] = rolling_improvement

    # --- Train/test split analysis ---
    half = len(crps_u_arr) // 2
    train_test = {}
    for method_name in crps_per_rule:
        arr = np.array(crps_per_rule[method_name])
        train_mean = float(np.mean(arr[:half]))
        test_mean = float(np.mean(arr[half:]))
        train_test[method_name] = {
            "train_crps": round(train_mean, 6),
            "test_crps": round(test_mean, 6),
            "train_delta_vs_uniform": round(train_mean - float(np.mean(crps_u_arr[:half])), 6),
            "test_delta_vs_uniform": round(test_mean - float(np.mean(crps_u_arr[half:])), 6),
        }
    result["train_test_split"] = {
        "train_rounds": half,
        "test_rounds": len(crps_u_arr) - half,
        "methods": train_test,
    }

    # --- Aggregate calibration (PIT for mechanism's quantile forecast) ---
    # For each round, check if y falls below each quantile level
    pit_counts = {float(tau): 0 for tau in taus}
    n_scored = 0
    for t in range(warmup, T):
        y_t = float(y_all[t])
        r_mech = np.asarray(res["r_hat_hist"][t], dtype=np.float64)
        if r_mech.size == len(taus):
            n_scored += 1
            for k, tau in enumerate(taus):
                if y_t <= r_mech[k]:
                    pit_counts[float(tau)] += 1
    calibration = []
    if n_scored > 0:
        for tau in taus:
            empirical = pit_counts[float(tau)] / n_scored
            calibration.append({
                "tau": float(tau),
                "nominal": float(tau),
                "empirical": round(empirical, 4),
                "gap": round(abs(empirical - float(tau)), 4),
            })
    result["calibration"] = calibration

    # --- Sensitivity summary (pre-computed, added to output) ---
    result["sensitivity"] = {
        "note": "Run scripts/run_sensitivity_experiments.py for full results",
        "default_params": {"gamma": 4, "rho": 0.1, "lam": 0.05, "eta": 2.0},
        "optimal_params": {"gamma": 16, "rho": 0.5},
        "optimal_improvement_pct": -27.2,
        "default_improvement_pct": round((mean_mechanism - mean_uniform) / mean_uniform * 100, 1) if mean_uniform > 0 else 0,
    }

    # --- Diebold-Mariano tests ---
    crps_uniform_arr = np.array(crps_per_rule["uniform"])
    crps_mechanism_arr = np.array(crps_per_rule["mechanism"])
    dm_mech = diebold_mariano_test(crps_uniform_arr, crps_mechanism_arr, h=1)
    result["dm_test"] = {
        "statistic": round(dm_mech["dm_stat"], 4),
        "p_value": round(dm_mech["p_value"], 6),
        "significant_at_001": dm_mech["p_value"] < 0.001,
        "significant_at_005": dm_mech["p_value"] < 0.05,
        "comparison": "uniform vs mechanism",
    }

    crps_skill_arr = np.array(crps_per_rule["skill"])
    dm_skill = diebold_mariano_test(crps_uniform_arr, crps_skill_arr, h=1)
    result["dm_test_skill"] = {
        "statistic": round(dm_skill["dm_stat"], 4),
        "p_value": round(dm_skill["p_value"], 6),
        "significant_at_001": dm_skill["p_value"] < 0.001,
        "significant_at_005": dm_skill["p_value"] < 0.05,
        "comparison": "uniform vs skill",
    }

    # --- Per-agent CRPS time series (downsampled) ---
    per_agent_crps_history = []
    step_agent = max(1, (T - warmup) // 600)
    for t in range(warmup, T, step_agent):
        entry = {"t": t}
        for i in range(n_forecasters):
            c = float(crps_hat_from_quantiles(float(y_all[t]), q_reports[i:i+1, t, :], taus)[0])
            entry[f"crps_{i}"] = round(c, 6)
        per_agent_crps_history.append(entry)
    result["per_agent_crps"] = per_agent_crps_history

    # --- Per-agent skill history (for dashboard skill recognition chart) ---
    # Downsample to ~600 points for reasonable JSON size
    sigma_hist = res["sigma_hist"]  # (n_forecasters, T)
    L_hist = res.get("L_hist")      # (n_forecasters, T+1) if store_history
    score_hist = res.get("score_hist")  # (n_forecasters, T) if store_history
    wager_hist = res["wager_hist"]  # (n_forecasters, T)

    step = max(1, (T - warmup) // 600)
    skill_history = []
    for t in range(warmup, T, step):
        entry: dict = {"t": t}
        for i in range(n_forecasters):
            name = forecasters[i].name
            entry[f"sigma_{i}"] = round(float(sigma_hist[i, t]), 6)
            entry[f"weight_{i}"] = round(float(wager_hist[i, t]), 6)
            if score_hist is not None:
                entry[f"score_{i}"] = round(float(score_hist[i, t]), 6)
        skill_history.append(entry)

    # Steady-state σ (average of last 20% of rounds)
    tail_start = warmup + int(0.8 * (T - warmup))
    steady_state = []
    for i in range(n_forecasters):
        tail_sigma = sigma_hist[i, tail_start:T]
        tail_wager = wager_hist[i, tail_start:T]
        avg_score = float(np.mean(score_hist[i, tail_start:T])) if score_hist is not None else None
        steady_state.append({
            "forecaster": forecasters[i].name,
            "index": i,
            "mean_sigma": round(float(np.mean(tail_sigma)), 6),
            "mean_weight": round(float(np.mean(tail_wager)), 6),
            "mean_score": round(avg_score, 6) if avg_score is not None else None,
        })
    # Sort by mean_sigma descending (best forecaster first)
    steady_state.sort(key=lambda x: x["mean_sigma"], reverse=True)

    result["skill_history"] = skill_history
    result["steady_state"] = steady_state
    result["forecaster_names"] = [fc.name for fc in forecasters]

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

    print(f"\n  Skill ranking (steady-state σ, last 20% of rounds):")
    print(f"  {'Forecaster':25s} {'σ':>8s} {'Weight':>8s} {'Score':>8s}")
    print(f"  {'-'*52}")
    for ss in steady_state:
        score_str = f"{ss['mean_score']:.4f}" if ss['mean_score'] is not None else "N/A"
        print(f"  {ss['forecaster']:25s} {ss['mean_sigma']:8.4f} {ss['mean_weight']:8.4f} {score_str:>8s}")

    print(f"\n  Diebold-Mariano tests (H0: equal predictive accuracy):")
    dm_m = result["dm_test"]
    sig_m = "***" if dm_m["significant_at_001"] else ("*" if dm_m["significant_at_005"] else "")
    print(f"  Uniform vs Mechanism: DM={dm_m['statistic']:+.4f}, p={dm_m['p_value']:.6f} {sig_m}")
    dm_s = result["dm_test_skill"]
    sig_s = "***" if dm_s["significant_at_001"] else ("*" if dm_s["significant_at_005"] else "")
    print(f"  Uniform vs Skill:     DM={dm_s['statistic']:+.4f}, p={dm_s['p_value']:.6f} {sig_s}")

    return result
