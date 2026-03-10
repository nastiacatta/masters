import numpy as np
from typing import List, Tuple, Union


def quantile_loss_gradient(y_true: float, y_hat: float, q: float) -> float:
    if y_hat > y_true:
        return 1.0 - q
    elif y_true >= y_hat:
        return -q
    else:
        return -q


def quantile_loss(y_hat: Union[float, np.ndarray], y_true: Union[float, np.ndarray], q: float) -> Union[float, np.ndarray]:
    y_hat = np.asarray(y_hat, dtype=np.float64)
    y_true = np.asarray(y_true, dtype=np.float64)
    
    mask = y_true >= y_hat
    result = np.where(mask, q * (y_true - y_hat), (1.0 - q) * (y_hat - y_true))
    return result


def initialize_weights(n_experts: int) -> np.ndarray:
    return np.full(n_experts, 1.0 / n_experts, dtype=np.float64)


def project_to_simplex(v: np.ndarray) -> np.ndarray:
    v = np.asarray(v, dtype=np.float64).flatten()
    assert v.ndim == 1, "project_to_simplex expects 1D vector after flattening"
    n = len(v)
    u = np.sort(v)[::-1]
    cssv = np.cumsum(u) - 1.0
    rho = None
    for k in range(1, n + 1):
        idx = k - 1
        if u[idx] > cssv[idx] / k:
            rho = k
    if rho is None:
        rho = n
    tau = cssv[rho - 1] / rho
    w = np.maximum(v - tau, 0.0)
    return w


def calculate_quantile_loss_dataframe(y_true, y_preds, quantiles: List[float]) -> float:
    if isinstance(y_true, float):
        y_true = np.array([y_true], dtype=np.float64)
    
    y_true = np.asarray(y_true, dtype=np.float64)
    losses = []
    
    for q in quantiles:
        q_name = f"q{int(q * 100)}"
        if isinstance(y_preds, dict):
            y_pred_q = y_preds[q_name]
        else:
            y_pred_q = y_preds[q_name]
        
        loss = np.mean(quantile_loss(y_pred_q, y_true, q))
        losses.append(loss)
    
    return np.mean(losses) if losses else 0.0
