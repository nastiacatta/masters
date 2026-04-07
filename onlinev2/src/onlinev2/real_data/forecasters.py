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

import numpy as np


class BaseForecaster(ABC):
    """Base class for all forecasters."""

    def __init__(self, name: str, retrain_every: int = 50, window: int = 200):
        self.name = name
        self.retrain_every = retrain_every
        self.window = window
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
        """Quantile forecasts from point forecast + residual distribution."""
        point = self.predict()
        if len(self._residuals) < 5:
            # Not enough residuals yet — return point for all quantiles
            return np.full(len(taus), point)
        resid = np.array(self._residuals[-self.window:])
        quantiles = np.array([point + np.quantile(resid, tau) for tau in taus])
        return quantiles

    def update_residuals(self, y_true: float, y_pred: float) -> None:
        """Track residuals for quantile estimation."""
        self._residuals.append(y_true - y_pred)
        if len(self._residuals) > self.window * 2:
            self._residuals = self._residuals[-self.window:]


class NaiveForecaster(BaseForecaster):
    """Forecast = last observed value. Hard to beat on random walks."""

    def __init__(self):
        super().__init__("Naive (last value)", retrain_every=1, window=100)
        self._last = 0.5

    def fit(self, history: np.ndarray) -> None:
        if len(history) > 0:
            self._last = float(history[-1])
        self._fitted = True

    def predict(self) -> float:
        return self._last


class MovingAverageForecaster(BaseForecaster):
    """Forecast = mean of last `ma_window` values."""

    def __init__(self, ma_window: int = 20):
        super().__init__(f"Moving Average ({ma_window})", retrain_every=1, window=200)
        self.ma_window = ma_window
        self._history: np.ndarray = np.array([])

    def fit(self, history: np.ndarray) -> None:
        self._history = history
        self._fitted = True

    def predict(self) -> float:
        if len(self._history) == 0:
            return 0.5
        tail = self._history[-self.ma_window:]
        return float(np.mean(tail))


class ARIMAForecaster(BaseForecaster):
    """ARIMA(p,d,q) model. Retrains periodically on rolling window."""

    def __init__(self, order: tuple[int, int, int] = (2, 1, 1)):
        super().__init__(f"ARIMA{order}", retrain_every=50, window=300)
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

    def __init__(self, n_lags: int = 10):
        super().__init__("XGBoost", retrain_every=50, window=300)
        self.n_lags = n_lags
        self._model = None
        self._last_pred = 0.5
        self._history: np.ndarray = np.array([])

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
        except Exception:
            self._last_pred = float(history[-1])
        self._fitted = True

    def predict(self) -> float:
        if self._model is not None and len(self._history) >= self.n_lags:
            try:
                last_features = self._history[-self.n_lags:].reshape(1, -1)
                return float(self._model.predict(last_features)[0])
            except Exception:
                pass
        return self._last_pred


class MLPForecaster(BaseForecaster):
    """Small MLP neural network with lag features. Retrains periodically."""

    def __init__(self, n_lags: int = 10, hidden: int = 16):
        super().__init__("Neural Net (MLP)", retrain_every=50, window=300)
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
    """Return all 5 forecasters with default settings."""
    return [
        NaiveForecaster(),
        MovingAverageForecaster(ma_window=20),
        ARIMAForecaster(order=(2, 1, 1)),
        XGBoostForecaster(n_lags=10),
        MLPForecaster(n_lags=10, hidden=16),
    ]
