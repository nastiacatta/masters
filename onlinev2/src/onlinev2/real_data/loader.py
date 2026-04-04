"""
Data loader for real time series.

Expects a CSV with at least a 'value' column (or a single numeric column).
Optionally has a 'date' column for time indexing.
"""
from __future__ import annotations
import numpy as np
import os


def load_csv_series(path: str, column: str | None = None) -> np.ndarray:
    """Load a 1D time series from a CSV file.

    Args:
        path: path to CSV file
        column: column name to use (default: first numeric column)

    Returns:
        1D numpy array of float values
    """
    import pandas as pd

    df = pd.read_csv(path)

    if column and column in df.columns:
        series = df[column].values
    elif 'value' in df.columns:
        series = df['value'].values
    elif 'close' in df.columns:
        series = df['close'].values
    elif 'Close' in df.columns:
        series = df['Close'].values
    elif 'price' in df.columns:
        series = df['price'].values
    else:
        # Use first numeric column
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            raise ValueError(f"No numeric columns found in {path}")
        series = df[numeric_cols[0]].values

    # Drop NaN
    series = np.array(series, dtype=np.float64)
    series = series[~np.isnan(series)]

    if len(series) < 100:
        raise ValueError(f"Series too short ({len(series)} points). Need at least 100.")

    print(f"Loaded {len(series)} data points from {os.path.basename(path)}")
    print(f"  Range: [{series.min():.4f}, {series.max():.4f}], Mean: {series.mean():.4f}")

    return series
