"""
Staking policies: how much wealth to deposit each round.

Generic stake constraint: b_{u,t} = min(W_{u,t}, b_max, W_{u,t} * f_{u,t})

Provides four f_{u,t} options:
  1. Fixed fraction: f = f_u (constant)
  2. Kelly-like edge proportional: f = clip(k_u * Edge, f_min, f_max)
  3. House-money: f = f_u * (1 + delta * 1[pi_{u,t-1} > 0])
  4. Lumpy tiers: round b to a ladder {0.5, 1, 2, 5, 10, ...}
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, Optional

import numpy as np

from onlinev2.behaviour.protocol import RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class StakingPolicy(ABC):
    """Base class for staking decisions."""

    @abstractmethod
    def choose_stake(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
        *,
        b_max: float = 10.0,
    ) -> float:
        """Return the deposit amount."""
        ...


def _apply_constraint(
    wealth: float, fraction: float, b_max: float
) -> float:
    """Generic stake constraint: b = min(W, b_max, W * f)."""
    raw = wealth * fraction
    return max(0.0, min(wealth, b_max, raw))


class FixedFractionStaking(StakingPolicy):
    """f_{u,t} = f_u (constant fraction of wealth)."""

    def choose_stake(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
        *,
        b_max: float = 10.0,
    ) -> float:
        wealth = state.wealth_prev.get(user.user_id, user.initial_wealth)
        return _apply_constraint(wealth, user.stake_fraction, b_max)


class KellyLikeStaking(StakingPolicy):
    """
    Edge-proportional staking:
      f_{u,t} = clip(k_u * Edge_{u,t}, f_min, f_max)

    where Edge is the absolute distance between user's median forecast
    and the aggregate median.
    """

    def __init__(
        self,
        *,
        f_min: float = 0.05,
        f_max: float = 0.5,
    ) -> None:
        self.f_min = f_min
        self.f_max = f_max

    def choose_stake(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
        *,
        b_max: float = 10.0,
    ) -> float:
        wealth = state.wealth_prev.get(user.user_id, user.initial_wealth)

        user_median = context.get("user_median", 0.5)
        if len(state.agg_history) > 0:
            last_agg = state.agg_history[-1]
            if isinstance(last_agg, (int, float)):
                agg_median = float(last_agg)
            elif hasattr(last_agg, '__len__') and len(last_agg) > 0:
                agg_median = float(np.median(last_agg))
            else:
                agg_median = 0.5
        else:
            agg_median = 0.5

        edge = abs(user_median - agg_median)
        f = np.clip(user.kelly_coefficient * edge, self.f_min, self.f_max)
        return _apply_constraint(wealth, float(f), b_max)


class HouseMoneyStaking(StakingPolicy):
    """
    House-money effect: stake more after winning.

    f_{u,t} = f_u * (1 + delta * 1[pi_{u,t-1} > 0])

    Users bet more aggressively with "house money" (recent gains).
    """

    def __init__(self, delta: float = 0.5) -> None:
        self.delta = delta

    def choose_stake(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
        *,
        b_max: float = 10.0,
    ) -> float:
        wealth = state.wealth_prev.get(user.user_id, user.initial_wealth)
        prev_profit = state.profit_prev.get(user.user_id, 0.0)

        multiplier = 1.0 + self.delta * float(prev_profit > 0)
        f = user.stake_fraction * multiplier
        return _apply_constraint(wealth, f, b_max)


class LumpyTierStaking(StakingPolicy):
    """
    Lumpy tiers: round deposit to a discrete ladder.

    Default ladder: {0, 0.5, 1, 2, 5, 10, 20, 50, 100}

    Models users who don't stake arbitrary amounts.
    """

    def __init__(
        self,
        tiers: Optional[list] = None,
    ) -> None:
        self.tiers = (
            sorted(tiers)
            if tiers is not None
            else [0.0, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0]
        )

    def choose_stake(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
        *,
        b_max: float = 10.0,
    ) -> float:
        wealth = state.wealth_prev.get(user.user_id, user.initial_wealth)
        raw = _apply_constraint(wealth, user.stake_fraction, b_max)

        best = 0.0
        for tier in self.tiers:
            if tier <= raw:
                best = tier
            else:
                break
        return best
