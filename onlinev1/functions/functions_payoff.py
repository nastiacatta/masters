import numpy as np
from typing import List, Tuple
from itertools import combinations


def payoff_update(prev_payoffs: np.ndarray, new_payoffs: np.ndarray, lambda_val: float) -> np.ndarray:
    prev_payoffs = np.asarray(prev_payoffs, dtype=np.float64)
    new_payoffs = np.asarray(new_payoffs, dtype=np.float64)
    return lambda_val * prev_payoffs + (1.0 - lambda_val) * new_payoffs


def get_subsets(coalition: List) -> List[Tuple]:
    subsets = []
    for r in range(1, len(coalition) + 1):
        for combo in combinations(coalition, r):
            subsets.append(combo)
    return subsets


def get_subsets_excluding_players(coalition: List, idx_player: int) -> List[Tuple]:
    idx_player_py = idx_player - 1
    coalition_no_player = [p for i, p in enumerate(coalition) if i != idx_player_py]
    return get_subsets(coalition_no_player)


def mean_squared_error(y_hat: np.ndarray, y_true: np.ndarray) -> np.ndarray:
    y_hat = np.asarray(y_hat, dtype=np.float64)
    y_true = np.asarray(y_true, dtype=np.float64)
    return (y_hat - y_true) ** 2
