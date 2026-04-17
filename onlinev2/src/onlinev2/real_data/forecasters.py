"""
Five forecasting models for the real-data mechanism comparison.

Each forecaster implements:
  - fit(history: np.ndarray) -> None   # train on past data
  - predict() -> float                 # point forecast for next step
  - predict_quantiles(taus) -> np.ndarray  # quantile forecasts

All models are strictly causal — they only see data up to t-1 when
forecasting t. Models retrain periodically on a rolling window.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import numpy as np
from scipy.optimize import isotonic_regression
from scipy.stats import norm


class BaseForecaster(ABC):
    """Base class for all forecasters."""

    def __init__(
        self,
        name: str,
        retrain_every: int = 50,
        window: int = 200,
        residual_window: int = 200,
        min_residuals: int = 10,
        default_scale: float = 0.05,
    ):
        self.name = name
        self.retrain_every = retrain_every
        self.window = window
        self.residual_window = residual_window
        self.min_residuals = min_residuals
        self.default_scale = default_scale
        self._residuals: list[float] = []
        self._fitted = False

    @abstractmethod
    def fit(self, history: np.ndarray) -> None:
        """Train on historical data (1D array)."""
        ...

    @abstractmethod
    def predict(self) -> float:
        """Point forecast for the next time step."""
        ...

    def predict_quantiles(self, taus: np.ndarray) -> np.ndarray:
        """Layered quantile pipeline: generate → clip → monotonize.

        This method is NOT overridden by subclasses. Subclasses override
        _generate_quantiles() instead.
        """
        # Step 1: Generate raw quantiles
        if len(self._residuals) < self.min_residuals:
            raw = self._fallback_quantiles(taus)
        else:
            raw = self._generate_quantiles(taus)

        # Step 2: Clip to [0, 1]
        clipped = np.clip(raw, 0.0, 1.0)

        # Step 3: Enforce monotonicity via isotonic regression
        return self._enforce_monotonicity(clipped)

    def _generate_quantiles(self, taus: np.ndarray) -> np.ndarray:
        """Default quantile generation via residual bootstrap.

        Computes quantiles as point forecast + empirical residual quantile
        for each tau level. Subclasses (ARIMA, XGBoost) override this to
        provide native distributional quantile estimates.
        """
        point = self.predict()
        resid = np.array(self._residuals[-self.residual_window:])
        quantiles = np.array([point + np.quantile(resid, tau) for tau in taus])
        return quantiles

    def _fallback_quantiles(self, taus: np.ndarray) -> np.ndarray:
        """Early-round fallback: point + default_scale * Φ⁻¹(tau).

        Used when len(self._residuals) < self.min_residuals to produce
        a well-spread quantile vector instead of collapsing to the point.
        """
        point = self.predict()
        return point + self.default_scale * norm.ppf(taus)

    @staticmethod
    def _enforce_monotonicity(q: np.ndarray) -> np.ndarray:
        """Enforce monotone non-decreasing order via isotonic regression.

        Uses scipy's pool-adjacent-violators algorithm with equal weights
        across quantile levels to preserve the median as closely as possible.

        Handles edge cases:
        - Single element: returned unchanged.
        - Already monotone: returned unchanged (PAV is a no-op).
        """
        if len(q) <= 1:
            return q
        result = isotonic_regression(q)
        return result.x

    def update_residuals(self, y_true: float, y_pred: float) -> None:
        """Track residuals for quantile estimation."""
        self._residuals.append(y_true - y_pred)
        if len(self._residuals) > self.residual_window:
            self._residuals = self._residuals[-self.residual_window:]


class NaiveForecaster(BaseForecaster):
    """Forecast = last observed value. Hard to beat on random walks."""

    def __init__(self, residual_window: int = 100):
        # Naive retrains every step, so a short residual window (100)
        # keeps the bootstrap responsive to recent regime changes.
        super().__init__(
            "Naive (last value)",
            retrain_every=1,
            window=100,
            residual_window=residual_window,
        )
        self._last = 0.5

    def fit(self, history: np.ndarray) -> None:
        if len(history) > 0:
            self._last = float(history[-1])
        self._fitted = True

    def predict(self) -> float:
        return self._last


class MovingAverageForecaster(BaseForecaster):
    """Forecast = exponentially weighted moving average (EWMA) of recent values.

    Uses a short effective window via exponential weighting, which adapts
    faster than a simple moving average and produces tighter residuals
    for autocorrelated series like wind power.
    """

    def __init__(self, span: int = 5, residual_window: int = 100):
        super().__init__(
            f"EWMA ({span})",
            retrain_every=1,
            window=200,
            residual_window=residual_window,
        )
        self.span = span
        self._alpha = 2.0 / (span + 1)
        self._ewma = 0.5
        self._history: np.ndarray = np.array([])

    def fit(self, history: np.ndarray) -> None:
        self._history = history
        if len(history) == 0:
            self._ewma = 0.5
        elif len(history) <= self.span:
            self._ewma = float(np.mean(history))
        else:
            # Compute EWMA over the tail
            val = float(history[-self.span])
            for v in history[-self.span + 1:]:
                val = self._alpha * float(v) + (1 - self._alpha) * val
            self._ewma = val
        self._fitted = True

    def predict(self) -> float:
        return self._ewma


class ARIMAForecaster(BaseForecaster):
    """ARIMA(p,d,q) model. Retrains periodically on rolling window."""

    def __init__(self, order: tuple[int, int, int] = (2, 1, 1), residual_window: int = 300):
        # ARIMA retrains every 50 steps on a 300-point window; a larger
        # residual_window=300 matches the training window so the bootstrap
        # covers the same horizon the model was fitted on.
        super().__init__(
            f"ARIMA{order}",
            retrain_every=50,
            window=300,
            residual_window=residual_window,
        )
        self.order = order
        self._model = None
        self._last_pred = 0.5

    def fit(self, history: np.ndarray) -> None:
        if len(history) < 30:
            self._last_pred = float(history[-1]) if len(history) > 0 else 0.5
            self._fitted = True
            return
        try:
            from statsmodels.tsa.arima.model import ARIMA
            tail = history[-self.window:]
            model = ARIMA(tail, order=self.order)
            self._model = model.fit(method_kwargs={"maxiter": 50})
            forecast = self._model.forecast(steps=1)
            self._last_pred = float(forecast.iloc[0]) if hasattr(forecast, 'iloc') else float(forecast[0])
        except Exception:
            self._last_pred = float(history[-1])
        self._fitted = True

    def predict(self) -> float:
        return self._last_pred


class XGBoostForecaster(BaseForecaster):
    """XGBoost with lag features. Retrains periodically."""

    def __init__(self, n_lags: int = 10, taus: np.ndarray | None = None, residual_window: int = 300):
        # XGBoost retrains every 50 steps on a 300-point window; a larger
        # residual_window=300 matches the training window so the fallback
        # bootstrap covers the same data horizon as the fitted model.
        super().__init__(
            "XGBoost",
            retrain_every=50,
            window=300,
            residual_window=residual_window,
        )
        self.n_lags = n_lags
        self._model = None
        self._last_pred = 0.5
        self._history: np.ndarray = np.array([])
        self._taus = taus
        self._quantile_models: dict[float, Any] = {}

    def _make_features(self, series: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        """Create lag features from a 1D series."""
        X, y = [], []
        for i in range(self.n_lags, len(series)):
            X.append(series[i - self.n_lags:i])
            y.append(series[i])
        return np.array(X), np.array(y)

    def fit(self, history: np.ndarray) -> None:
        self._history = history
        if len(history) < self.n_lags + 10:
            self._last_pred = float(history[-1]) if len(history) > 0 else 0.5
            self._fitted = True
            return
        try:
            import xgboost as xgb
            tail = history[-self.window:]
            X, y = self._make_features(tail)
            if len(X) < 5:
                self._last_pred = float(history[-1])
                self._fitted = True
                return
            self._model = xgb.XGBRegressor(
                n_estimators=50, max_depth=3, learning_rate=0.1,
                verbosity=0, n_jobs=1,
            )
            self._model.fit(X, y)
            last_features = history[-self.n_lags:].reshape(1, -1)
            self._last_pred = float(self._model.predict(last_features)[0])

            # Train per-tau quantile models
            if self._taus is not None:
                self._quantile_models = {}
                for tau in self._taus:
                    try:
                        q_model = xgb.XGBRegressor(
                            n_estimators=50, max_depth=3, learning_rate=0.1,
                            objective='reg:quantileerror', quantile_alpha=float(tau),
                            verbosity=0, n_jobs=1,
                        )
                        q_model.fit(X, y)
                        self._quantile_models[float(tau)] = q_model
                    except Exception:
                        self._quantile_models = {}
                        break
        except Exception:
            self._last_pred = float(history[-1])
            self._quantile_models = {}
        self._fitted = True

    def predict(self) -> float:
        if self._model is not None and len(self._history) >= self.n_lags:
            try:
                last_features = self._history[-self.n_lags:].reshape(1, -1)
                return float(self._model.predict(last_features)[0])
            except Exception:
                pass
        return self._last_pred

    def _generate_quantiles(self, taus: np.ndarray) -> np.ndarray:
        """Query per-tau XGBoost quantile models. Falls back to residual bootstrap."""
        if self._quantile_models and len(self._history) >= self.n_lags:
            try:
                features = self._history[-self.n_lags:].reshape(1, -1)
                return np.array([
                    float(self._quantile_models[float(tau)].predict(features)[0])
                    for tau in taus
                ])
            except Exception:
                pass
        return super()._generate_quantiles(taus)


class MLPForecaster(BaseForecaster):
    """Small MLP neural network with lag features. Retrains periodically."""

    def __init__(self, n_lags: int = 10, hidden: int = 16, residual_window: int = 300):
        # MLP retrains every 50 steps on a 300-point window; a larger
        # residual_window=300 matches the training window so the fallback
        # bootstrap covers the same data horizon as the fitted model.
        super().__init__(
            "Neural Net (MLP)",
            retrain_every=50,
            window=300,
            residual_window=residual_window,
        )
        self.n_lags = n_lags
        self.hidden = hidden
        self._model = None
        self._last_pred = 0.5
        self._history: np.ndarray = np.array([])

    def _make_features(self, series: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        X, y = [], []
        for i in range(self.n_lags, len(series)):
            X.append(series[i - self.n_lags:i])
            y.append(series[i])
        return np.array(X), np.array(y)

    def fit(self, history: np.ndarray) -> None:
        self._history = history
        if len(history) < self.n_lags + 10:
            self._last_pred = float(history[-1]) if len(history) > 0 else 0.5
            self._fitted = True
            return
        try:
            import torch
            import torch.nn as nn

            tail = history[-self.window:]
            X, y = self._make_features(tail)
            if len(X) < 10:
                self._last_pred = float(history[-1])
                self._fitted = True
                return

            X_t = torch.tensor(X, dtype=torch.float32)
            y_t = torch.tensor(y, dtype=torch.float32).unsqueeze(1)

            model = nn.Sequential(
                nn.Linear(self.n_lags, self.hidden),
                nn.ReLU(),
                nn.Linear(self.hidden, 1),
            )
            optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
            loss_fn = nn.MSELoss()

            model.train()
            for _ in range(100):
                pred = model(X_t)
                loss = loss_fn(pred, y_t)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            model.eval()
            with torch.no_grad():
                last_features = torch.tensor(
                    history[-self.n_lags:].reshape(1, -1), dtype=torch.float32
                )
                self._last_pred = float(model(last_features).item())
            self._model = model
        except Exception:
            self._last_pred = float(history[-1])
        self._fitted = True

    def predict(self) -> float:
        if self._model is not None and len(self._history) >= self.n_lags:
            try:
                import torch
                with torch.no_grad():
                    last_features = torch.tensor(
                        self._history[-self.n_lags:].reshape(1, -1), dtype=torch.float32
                    )
                    return float(self._model(last_features).item())
            except Exception:
                pass
        return self._last_pred


def get_all_forecasters() -> list[BaseForecaster]:
    """Return all 5 forecasters with documented residual window choices.

    Residual windows are set per-forecaster to balance the bias-variance
    trade-off in residual-bootstrap quantile estimation:

    - Naive (100): Retrains every step, so a short window keeps the
      bootstrap responsive to recent regime changes.
    - Moving Average (200): Moderate smoothing; the default window
      balances recency and stability for a simple averaging model.
    - ARIMA (300): Retrains every 50 steps on a 300-point training
      window; matching residual_window to the training window ensures
      the bootstrap covers the same data horizon as the fitted model.
    - XGBoost (300): Same rationale as ARIMA — the model retrains on
      a 300-point window, so the residual buffer should span the same
      horizon for consistent fallback quantile estimation.
    - MLP (300): Same rationale as ARIMA/XGBoost — periodic retraining
      on a 300-point window warrants a matching residual buffer.
    """
    return [
        NaiveForecaster(residual_window=100),           # fast-adapting, short buffer
        MovingAverageForecaster(span=5, residual_window=100),  # EWMA(5), fast-adapting
        ARIMAForecaster(order=(2, 1, 1), residual_window=300),       # matches training window
        XGBoostForecaster(n_lags=10, residual_window=300),           # matches training window
        MLPForecaster(n_lags=10, hidden=16, residual_window=300),    # matches training window
    ]
