#!/usr/bin/env python3
"""Re-run the real-data experiment with per-agent skill history export.

Usage:
    cd onlinev2 && python ../scripts/run_real_data_with_skill.py

Outputs to dashboard/public/data/real_data/{elia_wind,elia_electricity}/data/comparison.json
with added skill_history and steady_state fields.
"""
import os
import sys

import numpy as np
import pandas as pd

# Ensure onlinev2 package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "onlinev2", "src"))

from onlinev2.real_data.runner import run_real_data_comparison
from onlinev2.real_data.loader import load_csv_series


def run_wind():
    """Run on Elia offshore wind data."""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "elia_offshore_wind_2024_2025.csv")
    if not os.path.isfile(csv_path):
        print(f"Wind data not found at {csv_path}")
        return

    # Load the 'measured' column (actual wind power output)
    df = pd.read_csv(csv_path)
    series = df["measured"].dropna().values.astype(np.float64)

    # Resample to hourly (take every 4th point from 15-min data)
    series_hourly = series[::4]
    print(f"Wind: {len(series)} raw points → {len(series_hourly)} hourly points")

    outdir = os.path.join(os.path.dirname(__file__), "..", "dashboard", "public", "data")
    run_real_data_comparison(
        series=series_hourly,
        warmup=200,
        outdir=outdir,
        series_name="elia_wind",
    )


def run_electricity():
    """Run on Elia electricity imbalance prices."""
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "elia_imbalance_prices_2024_2025.csv")
    if not os.path.isfile(csv_path):
        print(f"Electricity data not found at {csv_path}")
        return

    series = load_csv_series(csv_path)
    print(f"Electricity: {len(series)} points")

    outdir = os.path.join(os.path.dirname(__file__), "..", "dashboard", "public", "data")
    run_real_data_comparison(
        series=series,
        warmup=200,
        outdir=outdir,
        series_name="elia_electricity",
    )


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run real-data experiments with skill history export")
    parser.add_argument("--dataset", choices=["wind", "electricity", "both"], default="both")
    args = parser.parse_args()

    if args.dataset in ("wind", "both"):
        print("=" * 60)
        print("Running Elia Wind experiment...")
        print("=" * 60)
        run_wind()

    if args.dataset in ("electricity", "both"):
        print("\n" + "=" * 60)
        print("Running Elia Electricity experiment...")
        print("=" * 60)
        run_electricity()
