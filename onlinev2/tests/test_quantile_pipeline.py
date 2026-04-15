"""
Unit tests for the quantile forecast pipeline.

Tests cover ARIMA native intervals, XGBoost quantile regression,
BaseForecaster defaults, runner invariants, transition behaviour,
and isotonic monotonicity enforcement.
"""
from __future__ import annotations

import inspect
from unittest.mock import MagicMock, call, patch

import numpy as np
import pytest

from onlinev2.real_data.forecasters import (
    ARIMAForecaster,
    BaseForecaster,
    NaiveForecaster,
    XGBoostForecaster,
)


# ---------------------------------------------------------------------------
# 1. test_arima_uses_native_intervals
# ---------------------------------------------------------------------------
def test_arima_uses_native_intervals():
    """Req 2.1 — When ARIMA has a fitted model, _generate_quantiles uses
    get_forecast().summary_frame() rather than residual bootstrap."""
    fc = ARIMAForecaster(order=(2, 1, 1))
    fc._fitted = True
    fc._last_pred = 0.5

    # Build a mock model whose get_forecast().summary_frame() returns a
    # DataFrame-like object with mean_ci_lower / mean_ci_upper columns.
    mock_sf = MagicMock()
    mock_sf.__getitem__ = lambda self, key: MagicMock(iloc=[0.4 if "lower" in key else 0.6])

    mock_fcast = MagicMock()
    mock_fcast.summary_frame.return_value = mock_sf

    mock_model = MagicMock()
    mock_model.get_forecast.return_value = mock_fcast

    fc._model = mock_model

    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    # Add enough residuals so predict_quantiles takes the normal path
    fc._residuals = [0.01] * 20

    fc.predict_quantiles(taus)

    # summary_frame should have been called (once per non-median tau)
    mock_fcast.summary_frame.assert_called()


# ---------------------------------------------------------------------------
# 2. test_arima_fallback_on_failure
# ---------------------------------------------------------------------------
def test_arima_fallback_on_failure():
    """Req 2.2 — When ARIMA native intervals raise, fall back to residual
    bootstrap (result based on residuals, not on the model)."""
    fc = ARIMAForecaster(order=(2, 1, 1))
    fc._fitted = True
    fc._last_pred = 0.5

    # Model whose get_forecast() raises
    mock_model = MagicMock()
    mock_model.get_forecast.side_effect = RuntimeError("boom")
    fc._model = mock_model

    # Provide residuals so the bootstrap path has data to work with
    fc._residuals = [0.02 * (i - 10) for i in range(20)]

    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    q = fc.predict_quantiles(taus)

    # Should still return a valid quantile vector (from residual bootstrap)
    assert len(q) == len(taus)
    assert np.all(np.isfinite(q))
    # Spread should be > 0 because residuals have variance
    assert q[-1] - q[0] > 0


# ---------------------------------------------------------------------------
# 3. test_xgboost_fits_per_tau_models
# ---------------------------------------------------------------------------
def test_xgboost_fits_per_tau_models():
    """Req 3.1 — After fit(), XGBoost has one quantile model per tau."""
    try:
        import xgboost as xgb  # noqa: F401
    except Exception:
        pytest.skip("xgboost not available")

    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    fc = XGBoostForecaster(n_lags=5, taus=taus)

    # Synthetic data long enough for lag features
    np.random.seed(42)
    history = np.cumsum(np.random.randn(200)) * 0.01 + 0.5
    history = np.clip(history, 0, 1)

    fc.fit(history)

    assert len(fc._quantile_models) == len(taus)
    for tau in taus:
        assert float(tau) in fc._quantile_models


# ---------------------------------------------------------------------------
# 4. test_xgboost_fallback_on_failure
# ---------------------------------------------------------------------------
def test_xgboost_fallback_on_failure():
    """Req 3.3 — When XGBoost quantile models are empty, _generate_quantiles
    falls back to residual bootstrap."""
    fc = XGBoostForecaster(n_lags=5)
    fc._fitted = True
    fc._last_pred = 0.5
    fc._history = np.linspace(0.3, 0.7, 50)
    fc._quantile_models = {}  # empty — no per-tau models

    # Provide residuals for the bootstrap path
    fc._residuals = [0.02 * (i - 10) for i in range(20)]

    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])
    q = fc.predict_quantiles(taus)

    assert len(q) == len(taus)
    assert np.all(np.isfinite(q))
    # Spread should be > 0 from residual bootstrap
    assert q[-1] - q[0] > 0


# ---------------------------------------------------------------------------
# 5. test_xgboost_same_features
# ---------------------------------------------------------------------------
def test_xgboost_same_features():
    """Req 3.5 — XGBoost quantile models use the same n_lags as the point model."""
    try:
        import xgboost as xgb  # noqa: F401
    except Exception:
        pytest.skip("xgboost not available")

    taus = np.array([0.1, 0.5, 0.9])
    n_lags = 7
    fc = XGBoostForecaster(n_lags=n_lags, taus=taus)

    np.random.seed(0)
    history = np.cumsum(np.random.randn(200)) * 0.01 + 0.5
    history = np.clip(history, 0, 1)
    fc.fit(history)

    # The point model and every quantile model should expect n_lags features
    assert fc._model is not None
    assert fc._model.n_features_in_ == n_lags
    for tau, qm in fc._quantile_models.items():
        assert qm.n_features_in_ == n_lags, (
            f"Quantile model for tau={tau} has {qm.n_features_in_} features, "
            f"expected {n_lags}"
        )


# ---------------------------------------------------------------------------
# 6. test_default_residual_window
# ---------------------------------------------------------------------------
def test_default_residual_window():
    """Req 5.2 — BaseForecaster default residual_window is 200."""

    class _Stub(BaseForecaster):
        def fit(self, history):
            pass

        def predict(self):
            return 0.5

    fc = _Stub("stub")
    assert fc.residual_window == 200


# ---------------------------------------------------------------------------
# 7. test_runner_no_external_clip
# ---------------------------------------------------------------------------
def test_runner_no_external_clip():
    """Req 6.3 — The runner must NOT externally clip predict_quantiles output.
    Clipping is now internal to the pipeline."""
    from onlinev2.real_data import runner

    source = inspect.getsource(runner.run_real_data_comparison)
    # Should not contain patterns like np.clip(fc.predict_quantiles(...), ...)
    # or np.clip(... predict_quantiles ...)
    assert "np.clip(fc.predict_quantiles" not in source
    assert "clip(fc.predict_quantiles" not in source
    # Also check there's no clip wrapping the quantile assignment
    # The current code should just be: q_reports[i, t, :] = fc.predict_quantiles(taus)
    assert "predict_quantiles" in source, "predict_quantiles should still be called"


# ---------------------------------------------------------------------------
# 8. test_runner_call_order
# ---------------------------------------------------------------------------
def test_runner_call_order():
    """Req 7.1, 7.2 — The runner calls predict() before predict_quantiles()
    before update_residuals() for each forecaster within a round."""
    from onlinev2.real_data import runner

    source = inspect.getsource(runner.run_real_data_comparison)

    # Find the positions of the key calls in the source
    pos_predict = source.find("fc.predict()")
    pos_quantiles = source.find("fc.predict_quantiles(")
    pos_residuals = source.find("fc.update_residuals(")

    assert pos_predict != -1, "fc.predict() not found in runner source"
    assert pos_quantiles != -1, "fc.predict_quantiles() not found in runner source"
    assert pos_residuals != -1, "fc.update_residuals() not found in runner source"

    # Verify ordering: predict < predict_quantiles < update_residuals
    assert pos_predict < pos_quantiles, (
        "predict() should appear before predict_quantiles() in the runner"
    )
    assert pos_quantiles < pos_residuals, (
        "predict_quantiles() should appear before update_residuals() in the runner"
    )


# ---------------------------------------------------------------------------
# 9. test_smooth_transition_at_threshold
# ---------------------------------------------------------------------------
def test_smooth_transition_at_threshold():
    """Req 4.4 — At the min_residuals boundary, both fallback and bootstrap
    produce spread > 0 (no discontinuity to zero spread)."""
    fc = NaiveForecaster()
    fc._last = 0.5
    fc._fitted = True

    taus = np.array([0.1, 0.25, 0.5, 0.75, 0.9])

    # Just below threshold: min_residuals - 1 residuals → fallback path
    fc._residuals = [0.01 * i for i in range(fc.min_residuals - 1)]
    q_below = fc.predict_quantiles(taus)
    spread_below = float(q_below[-1] - q_below[0])
    assert spread_below > 0, "Fallback path should produce non-zero spread"

    # Add one more residual to reach threshold → bootstrap path
    fc._residuals.append(0.05)
    assert len(fc._residuals) == fc.min_residuals
    q_at = fc.predict_quantiles(taus)
    spread_at = float(q_at[-1] - q_at[0])
    assert spread_at > 0, "Bootstrap path at threshold should produce non-zero spread"


# ---------------------------------------------------------------------------
# 10. test_isotonic_preserves_median
# ---------------------------------------------------------------------------
def test_isotonic_preserves_median():
    """Req 1.4 — Isotonic regression with equal weights preserves the median
    as closely as possible, and the result is monotone non-decreasing."""
    # Quantile vector with known crossings (indices 1 and 2 are swapped)
    q_crossed = np.array([0.30, 0.50, 0.40, 0.55, 0.70])
    median_idx = 2  # tau=0.5 position (middle element)
    original_median = q_crossed[median_idx]

    result = BaseForecaster._enforce_monotonicity(q_crossed)

    # Must be monotone non-decreasing
    for i in range(len(result) - 1):
        assert result[i] <= result[i + 1] + 1e-12, (
            f"Not monotone at index {i}: {result[i]} > {result[i+1]}"
        )

    # Median should be preserved as closely as possible
    # With equal-weight PAV, the crossed pair [0.50, 0.40] averages to 0.45
    # so the median moves only slightly
    assert abs(result[median_idx] - original_median) < 0.15, (
        f"Median shifted too much: {original_median} -> {result[median_idx]}"
    )
