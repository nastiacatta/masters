"""Unit tests for XGBoost expanding-window CV with temporal gap.

Spec: .kiro/specs/model-training-testing-audit/bugfix.md clauses 1.7 / 2.7.
"""
# Feature: model-training-testing-audit, Property 1: Bug Condition
from __future__ import annotations

import numpy as np
import pytest


def _make_series(T: int = 800, seed: int = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    return np.clip(0.5 + 0.05 * np.cumsum(rng.standard_normal(T)), 0.0, 1.0)


def test_xgboost_val_gap_attribute():
    pytest.importorskip("xgboost")
    from onlinev2.real_data.forecasters import XGBoostForecaster

    fc = XGBoostForecaster(n_lags=6)
    assert fc.val_gap == 24

    fc2 = XGBoostForecaster(n_lags=6, val_gap=48)
    assert fc2.val_gap == 48


def test_xgboost_cv_split_respects_gap():
    pytest.importorskip("xgboost")
    from onlinev2.real_data.forecasters import XGBoostForecaster

    fc = XGBoostForecaster(n_lags=6, val_gap=24)
    series = _make_series(T=800)
    fc.fit(series)

    assert fc._last_cv_split is not None
    train_end, val_start = fc._last_cv_split
    gap = val_start - train_end
    assert gap >= fc.val_gap, f"gap={gap} < val_gap={fc.val_gap}"


def test_xgboost_cv_falls_back_on_short_history():
    """When training history is too small for the gap layout, the
    forecaster falls back to the legacy 80/20 tail split (gap = 0)
    and still produces a fitted model."""
    pytest.importorskip("xgboost")
    from onlinev2.real_data.forecasters import XGBoostForecaster

    fc = XGBoostForecaster(n_lags=6, val_gap=24)
    # Need len(history) >= max(n_lags, 50) + 20 = 70 for XGBoost to
    # even attempt a fit, but keep the feature matrix below the
    # expanding-window CV's `val_gap + 60` threshold (= 84 rows of
    # features). With n_lags=6 features start at max(n_lags, 50)=50;
    # history length 130 gives ~80 feature rows, below the threshold.
    series = _make_series(T=130)
    fc.fit(series)
    assert fc._last_cv_split is not None
    train_end, val_start = fc._last_cv_split
    # Legacy fallback: gap=0
    assert val_start - train_end == 0


def test_xgboost_val_gap_custom_value():
    pytest.importorskip("xgboost")
    from onlinev2.real_data.forecasters import XGBoostForecaster

    fc = XGBoostForecaster(n_lags=6, val_gap=48)
    series = _make_series(T=1000)
    fc.fit(series)
    train_end, val_start = fc._last_cv_split
    assert val_start - train_end >= 48
