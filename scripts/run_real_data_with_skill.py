#!/usr/bin/env python3
"""Re-run the real-data experiment with per-agent skill history export.

Usage:
    cd onlinev2 && python ../scripts/run_real_data_with_skill.py
    cd onlinev2 && python ../scripts/run_real_data_with_skill.py --tuned
    cd onlinev2 && python ../scripts/run_real_data_with_skill.py --dataset wind --tuned

Outputs to dashboard/public/data/real_data/{elia_wind,elia_electricity}/data/comparison.json
"""
import os
import sys

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "onlinev2", "src"))

from onlinev2.real_data.runner import run_real_data_comparison
from onlinev2.real_data.loader import load_csv_series


def run_wind(gamma=4.0, rho=0.1, lam=0.05):
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "elia_offshore_wind_2024_2025.csv")
    if not os.path.isfile(csv_path):
        print(f"Wind data not found at {csv_path}")
        return
    df = pd.read_csv(csv_path)
    series = df["measured"].dropna().values.astype(np.float64)
    series_hourly = series[::4]
    print(f"Wind: {len(series)} raw points → {len(series_hourly)} hourly points")
    outdir = os.path.join(os.path.dirname(__file__), "..", "dashboard", "public", "data")
    run_real_data_comparison(
        series=series_hourly, warmup=200, outdir=outdir,
        series_name="elia_wind", gamma=gamma, rho=rho, lam=lam,
    )


def run_electricity(gamma=4.0, rho=0.1, lam=0.05):
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "elia_imbalance_prices_2024_2025.csv")
    if not os.path.isfile(csv_path):
        print(f"Electricity data not found at {csv_path}")
        return
    series = load_csv_series(csv_path)
    print(f"Electricity: {len(series)} points")
    outdir = os.path.join(os.path.dirname(__file__), "..", "dashboard", "public", "data")
    run_real_data_comparison(
        series=series, warmup=200, outdir=outdir,
        series_name="elia_electricity", gamma=gamma, rho=rho, lam=lam,
    )


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run real-data experiments")
    parser.add_argument("--dataset", choices=["wind", "electricity", "both"], default="both")
    parser.add_argument("--tuned", action="store_true",
                        help="Use tuned parameters (γ=16, ρ=0.5) instead of defaults")
    parser.add_argument("--gamma", type=float, default=None)
    parser.add_argument("--rho", type=float, default=None)
    parser.add_argument("--lam", type=float, default=None)
    args = parser.parse_args()

    if args.tuned:
        gamma = args.gamma or 16.0
        rho = args.rho or 0.5
        lam = args.lam or 0.05
    else:
        gamma = args.gamma or 4.0
        rho = args.rho or 0.1
        lam = args.lam or 0.05

    print(f"Parameters: γ={gamma}, ρ={rho}, λ={lam}")

    if args.dataset in ("wind", "both"):
        print("=" * 60)
        print("Running Elia Wind experiment...")
        print("=" * 60)
        run_wind(gamma=gamma, rho=rho, lam=lam)

    if args.dataset in ("electricity", "both"):
        print("\n" + "=" * 60)
        print("Running Elia Electricity experiment...")
        print("=" * 60)
        run_electricity(gamma=gamma, rho=rho, lam=lam)
