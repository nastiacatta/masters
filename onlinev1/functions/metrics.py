import numpy as np


def calculate_instantaneous_errors(weights_history, target_w):
    n_steps = len(weights_history)
    bias = np.zeros(n_steps, dtype=np.float64)
    for t in range(n_steps):
        bias[t] = weights_history[t] - target_w[t]
    return bias


def calculate_instantaneous_variance(errors, biasses):
    n_steps = len(errors)
    variance = np.zeros(n_steps, dtype=np.float64)
    for t in range(n_steps):
        variance[t] = (errors[t] - biasses[t]) ** 2
    return variance


def calculate_instantaneous_quantile_loss(y_hat, y_true, q):
    from functions.quantile_loss_func import QuantileLoss
    quantile_loss_fn = QuantileLoss(q)
    losses = quantile_loss_fn(y_hat, y_true)
    return losses

