#!/usr/bin/env python3
"""Regenerate the two stale thesis figures.

Thesis figures currently in ``writing/figures/`` were produced from an earlier
data snapshot. Two of them are no longer consistent with the latest numbers:

* ``wind_master_comparison.png`` — the horizontal bar chart comparing ten
  aggregation rules on the Elia offshore-wind headline slice. Numbers have
  since been refreshed by the normalisation audit.
* ``arbitrage.png`` — the arbitrage scan. We now have a cleaner
  ``arbitrage_crowd_size`` run that covers both axes referenced in the
  thesis caption (λ and crowd size).

This script rebuilds both figures from the canonical data files and writes
them under ``writing/figures/``. It uses the same palette as the R
presentation plots so the thesis style stays consistent.

Run from the repository root::

    python3 scripts/gen_thesis_figures.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent
WIND_JSON = REPO_ROOT / "dashboard/public/data/real_data/elia_wind/data/comparison.json"
CROWD_CSV = REPO_ROOT / "onlinev2/outputs/behaviour/experiments/arbitrage_crowd_size/data/arbitrage_crowd_size_summary.csv"
FIG_DIR = REPO_ROOT / "writing/figures"

# Palette mirrors presentation/R/theme_thesis.R exactly so writing/ and
# presentation/ share a visual language.
PALETTE = {
    "navy": "#1B2A4A",
    "imperial": "#003E74",
    "teal": "#2E8B8B",
    "coral": "#E85D4A",
    "purple": "#7C3AED",
    "charcoal": "#2D3748",
    "slate": "#64748B",
    "border": "#CBD5E1",
    "lightBg": "#F1F5F9",
    "orange": "#E67E22",
}

# Semantic colours for the methods shown in the wind master comparison.
METHOD_COLOURS = {
    "oracle": PALETTE["navy"],
    "per_round_inv_crps_hindsight": "#B91C5C",
    "best_single": PALETTE["coral"],
    "inverse_variance": PALETTE["orange"],
    "michael_ogd_centered_median_fan": PALETTE["imperial"],
    "median": "#34495E",
    "trimmed_mean": "#95A5A6",
    "mechanism": PALETTE["teal"],
    "skill": PALETTE["purple"],
    "uniform": PALETTE["slate"],
}

METHOD_LABELS = {
    "oracle": "Per-round inv-var (oracle)",
    "per_round_inv_crps_hindsight": "Rolling best single",
    "best_single": "Best single forecaster",
    "inverse_variance": "Inverse variance (hindsight)",
    "michael_ogd_centered_median_fan": "Shifted-median fan",
    "median": "Median",
    "trimmed_mean": "Trimmed mean",
    "mechanism": "Mechanism (this project)",
    "skill": "Skill only",
    "uniform": "Equal weights (baseline)",
}


def apply_style() -> None:
    """Apply the shared matplotlib style used by all thesis figures."""
    mpl.rcParams.update(
        {
            "font.family": ["Avenir Next", "Helvetica Neue", "Arial", "sans-serif"],
            "font.size": 13,
            "axes.edgecolor": PALETTE["border"],
            "axes.linewidth": 0.8,
            "axes.titleweight": "bold",
            "axes.titlesize": 16,
            "axes.labelweight": "bold",
            "axes.labelsize": 14,
            "axes.labelcolor": PALETTE["charcoal"],
            "axes.spines.top": False,
            "axes.spines.right": False,
            "xtick.color": PALETTE["charcoal"],
            "ytick.color": PALETTE["charcoal"],
            "xtick.labelsize": 12,
            "ytick.labelsize": 12,
            "xtick.major.size": 0,
            "ytick.major.size": 0,
            "grid.color": PALETTE["border"],
            "grid.linestyle": "-",
            "grid.linewidth": 0.4,
            "grid.alpha": 0.9,
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "savefig.facecolor": "white",
        }
    )


def render_wind_master_comparison() -> Path:
    """Rebuild the 10-rule CRPS bar chart for the Elia wind headline slice."""
    with WIND_JSON.open() as fh:
        data = json.load(fh)

    rows = {r["method"]: r for r in data["rows"] if r["method"] in METHOD_COLOURS}

    # Sort methods best → worst by mean CRPS so the reader scans top-down.
    sorted_methods = sorted(rows.keys(), key=lambda m: rows[m]["mean_crps"])
    labels = [METHOD_LABELS[m] for m in sorted_methods]
    crps = np.array([rows[m]["mean_crps"] for m in sorted_methods])
    deltas = np.array([rows[m].get("delta_crps_vs_equal", 0.0) * 100 for m in sorted_methods])
    uniform_mean = next(r["mean_crps"] for r in data["rows"] if r["method"] == "uniform")
    pct_vs_uniform = (crps - uniform_mean) / uniform_mean * 100

    fig, ax = plt.subplots(figsize=(11, 6.5), dpi=300)
    ys = np.arange(len(sorted_methods))

    colours = [METHOD_COLOURS[m] for m in sorted_methods]
    bars = ax.barh(ys, crps, color=colours, height=0.68, edgecolor="white", linewidth=0.6)

    # Emphasise the mechanism bar with a navy outline.
    for bar, method in zip(bars, sorted_methods):
        if method == "mechanism":
            bar.set_edgecolor(PALETTE["navy"])
            bar.set_linewidth(1.6)

    # Vertical reference line at the uniform baseline value.
    ax.axvline(uniform_mean, color=PALETTE["slate"], linestyle="--", linewidth=0.9, alpha=0.8)
    ax.text(
        uniform_mean,
        len(sorted_methods) - 0.3,
        "  Equal weights baseline",
        color=PALETTE["slate"],
        fontsize=10,
        fontweight="bold",
        va="bottom",
        ha="left",
    )

    # Numeric annotations at bar ends.
    max_crps = float(crps.max())
    for y, value, pct in zip(ys, crps, pct_vs_uniform):
        label = f"{value:.4f}   ({pct:+.1f}%)"
        ax.text(
            value + max_crps * 0.01,
            y,
            label,
            va="center",
            ha="left",
            fontsize=11,
            color=PALETTE["charcoal"],
            fontweight="medium",
        )

    ax.set_yticks(ys)
    ax.set_yticklabels(labels)
    ax.invert_yaxis()
    ax.set_xlim(0, max_crps * 1.22)
    ax.set_xlabel("Mean CRPS  (↓ lower is better)")
    ax.xaxis.grid(True, which="major")
    ax.set_axisbelow(True)

    T_raw = data["config"]["T"]
    warmup = data["config"].get("warmup", 200)
    ax.set_title(
        f"Elia offshore-wind headline slice  ·  T = {T_raw - warmup:,} evaluation rounds",
        loc="left",
        pad=14,
    )

    fig.tight_layout()
    out = FIG_DIR / "wind_master_comparison.png"
    fig.savefig(out, bbox_inches="tight", dpi=300)
    plt.close(fig)
    return out


def _load_crowd_csv() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Return (lam, n_benign, profit, se) arrays from the arbitrage_crowd_size CSV."""
    import csv

    lam: list[float] = []
    n_benign: list[int] = []
    profit: list[float] = []
    se: list[float] = []
    with CROWD_CSV.open() as fh:
        for row in csv.DictReader(fh):
            lam.append(float(row["lam"]))
            n_benign.append(int(row["n_benign"]))
            profit.append(float(row["mean_profit"]))
            se.append(float(row["se_profit"]))
    return np.array(lam), np.array(n_benign), np.array(profit), np.array(se)


def render_arbitrage() -> Path:
    """Rebuild the arbitrage profit figure (λ × crowd size)."""
    lam, n_benign, profit, se = _load_crowd_csv()

    lam_levels = sorted(set(lam.tolist()))
    n_levels = sorted(set(n_benign.tolist()))

    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)

    # Colour gradient over crowd size so the reader can read both axes.
    cmap = plt.get_cmap("viridis", len(n_levels))
    for i, n in enumerate(n_levels):
        mask = n_benign == n
        order = np.argsort(lam[mask])
        xs = lam[mask][order]
        ys = profit[mask][order]
        errs = se[mask][order]
        colour = cmap(i)
        ax.errorbar(
            xs,
            ys,
            yerr=errs,
            marker="o",
            markersize=6,
            linewidth=1.6,
            capsize=3,
            color=colour,
            label=f"n = {n}",
        )

    ax.axhline(0, color=PALETTE["slate"], linewidth=0.8, alpha=0.7)
    ax.set_xlabel("Skill-gate floor  λ")
    ax.set_ylabel("Mean arbitrageur profit  (±1 SE)")
    ax.yaxis.grid(True, which="major")
    ax.set_axisbelow(True)
    ax.set_xticks(lam_levels)
    ax.set_title(
        "Arbitrage profit rises with λ and with the benign crowd size",
        loc="left",
        pad=14,
    )

    legend = ax.legend(
        title="Benign crowd size",
        loc="upper left",
        frameon=False,
        fontsize=11,
        title_fontsize=11,
    )
    legend.get_title().set_fontweight("bold")

    fig.tight_layout()
    out = FIG_DIR / "arbitrage.png"
    fig.savefig(out, bbox_inches="tight", dpi=300)
    plt.close(fig)
    return out


def main() -> int:
    if not WIND_JSON.exists():
        print(f"missing: {WIND_JSON}", file=sys.stderr)
        return 1
    if not CROWD_CSV.exists():
        print(f"missing: {CROWD_CSV}", file=sys.stderr)
        return 1

    FIG_DIR.mkdir(parents=True, exist_ok=True)
    apply_style()

    wrote_wind = render_wind_master_comparison()
    print(f"wrote: {wrote_wind}")
    wrote_arb = render_arbitrage()
    print(f"wrote: {wrote_arb}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
