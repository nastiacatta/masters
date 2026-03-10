"""
Shared plot styling for all onlinev2 experiments.

Usage:
    from onlinev2.plotting.style import apply_style, COLORS, new_figure, save_fig

apply_style() sets global matplotlib defaults (call once at startup).
COLORS provides a named palette for consistent coloring across experiments.
new_figure() / save_fig() are thin wrappers that enforce the house style.
"""
from __future__ import annotations

import os
from typing import Any

import numpy as np

# ---------------------------------------------------------------------------
# Color palette — warm, readable, colorblind-friendly ordering
# ---------------------------------------------------------------------------
COLORS = {
    "pink": "#E91E8C",
    "blue": "#3B82F6",
    "green": "#10B981",
    "orange": "#F59E0B",
    "purple": "#8B5CF6",
    "red": "#EF4444",
    "teal": "#14B8A6",
    "slate": "#64748B",
    "truth": "#1E293B",        # near-black for ground truth
    "reference": "#94A3B8",    # grey for reference lines / diagonals
}

# Ordered list for cycling through forecasters / agents
PALETTE = [
    COLORS["pink"],
    COLORS["blue"],
    COLORS["green"],
    COLORS["orange"],
    COLORS["purple"],
    COLORS["red"],
    COLORS["teal"],
    COLORS["slate"],
]


def agent_color(i: int) -> str:
    """Return a palette color for agent index i (cycles)."""
    return PALETTE[i % len(PALETTE)]


# ---------------------------------------------------------------------------
# Style defaults
# ---------------------------------------------------------------------------

_STYLE_APPLIED = False


def apply_style() -> None:
    """Set matplotlib rcParams for clean, readable plots."""
    global _STYLE_APPLIED
    if _STYLE_APPLIED:
        return
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except Exception:
        return

    plt.rcParams.update({
        # Figure
        "figure.facecolor": "white",
        "figure.dpi": 120,
        "savefig.dpi": 150,
        "savefig.bbox": "tight",
        "savefig.pad_inches": 0.15,

        # Font
        "font.size": 11,
        "axes.titlesize": 13,
        "axes.labelsize": 11,
        "xtick.labelsize": 9,
        "ytick.labelsize": 9,
        "legend.fontsize": 9,

        # Grid
        "axes.grid": True,
        "grid.alpha": 0.25,
        "grid.linewidth": 0.5,

        # Axes
        "axes.spines.top": False,
        "axes.spines.right": False,
        "axes.linewidth": 0.8,

        # Lines
        "lines.linewidth": 1.5,
        "lines.markersize": 5,

        # Legend
        "legend.framealpha": 0.9,
        "legend.edgecolor": "0.85",
    })
    _STYLE_APPLIED = True


def new_figure(
    nrows: int = 1,
    ncols: int = 1,
    figsize: tuple[float, float] | None = None,
    **kwargs: Any,
):
    """Create a new figure with house style applied."""
    apply_style()
    import matplotlib.pyplot as plt

    if figsize is None:
        w = 6 * ncols
        h = 4.5 * nrows
        figsize = (min(w, 20), min(h, 16))

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize, **kwargs)
    return fig, axes


def save_fig(fig, path: str, close: bool = True) -> str:
    """Save figure to path, creating directories as needed. Returns the path."""
    import matplotlib.pyplot as plt

    os.makedirs(os.path.dirname(path), exist_ok=True)
    fig.savefig(path)
    if close:
        plt.close(fig)
    return path
