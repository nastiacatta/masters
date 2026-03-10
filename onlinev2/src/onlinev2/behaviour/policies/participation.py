"""
Participation policies: decide whether a user participates in a given round.

Four required policies plus a logistic variant:
  1. Baseline availability: Bernoulli(p_u)
  2. Bursty sessions: 2-state Markov chain
  3. Edge-threshold entry: participate when perceived edge > epsilon
  4. Avoid skill decay: participate when expected score >= s_min
  5. Logistic variant: combines edge + wealth shock in logit model
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, Optional

import numpy as np

from onlinev2.behaviour.protocol import RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class ParticipationPolicy(ABC):
    """Base class for participation decisions."""

    @abstractmethod
    def should_participate(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
    ) -> bool:
        ...


class BaselineParticipation(ParticipationPolicy):
    """
    a_{u,t} ~ Bernoulli(p_u)

    Simple IID participation with user-specific probability.
    """

    def should_participate(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
    ) -> bool:
        return bool(rng.random() < user.participation_prob)


class BurstyParticipation(ParticipationPolicy):
    """
    2-state Markov chain: Active <-> Inactive.

    P(A -> A) = alpha,  P(I -> A) = beta.

    Models users who participate in bursts rather than uniformly.
    """

    def __init__(self) -> None:
        self._user_states: Dict[str, bool] = {}

    def should_participate(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
    ) -> bool:
        was_active = self._user_states.get(user.user_id, True)

        if was_active:
            active = bool(rng.random() < user.burst_alpha)
        else:
            active = bool(rng.random() < user.burst_beta)

        self._user_states[user.user_id] = active
        return active


class EdgeThresholdParticipation(ParticipationPolicy):
    """
    a_{u,t} = 1[Edge_{u,t} > epsilon_u]

    Edge_{u,t} = |median(F_{u,t}) - median(F_hat_t)|

    User participates only when they believe they have informational edge
    over the current aggregate.
    """

    def should_participate(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
    ) -> bool:
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
        return edge > user.edge_threshold


class AvoidSkillDecayParticipation(ParticipationPolicy):
    """
    a_{u,t} = 1[E_hat(s_{u,t} | state) >= s_min_u]

    Cheap proxy for expected score: inverse distance to aggregate
    adjusted by the user's noise level.
    Selective participation to avoid rounds where score would be low.
    """

    def __init__(self, s_min: float = 0.5) -> None:
        self.s_min = s_min

    def should_participate(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
    ) -> bool:
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

        expected_error = abs(user_median - agg_median) + user.noise_level
        expected_score = max(0.0, 1.0 - expected_error)
        return expected_score >= self.s_min


class LogisticParticipation(ParticipationPolicy):
    """
    Logistic participation model combining edge and wealth shock:

    log(p/(1-p)) = alpha_u + beta_u * Edge_{u,t} + gamma_u * WealthShock_{u,t}

    WealthShock = (W_t - W_{t-1}) / W_{t-1}
    """

    def __init__(
        self,
        *,
        alpha_base: float = 0.5,
        beta_edge: float = 5.0,
        gamma_wealth: float = 1.0,
    ) -> None:
        self.alpha_base = alpha_base
        self.beta_edge = beta_edge
        self.gamma_wealth = gamma_wealth
        self._prev_wealth: Dict[str, float] = {}

    def should_participate(
        self,
        user: UserTraits,
        state: RoundPublicState,
        rng: np.random.Generator,
        context: Dict,
    ) -> bool:
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

        current_wealth = state.wealth_prev.get(user.user_id, user.initial_wealth)
        prev_w = self._prev_wealth.get(user.user_id, user.initial_wealth)
        wealth_shock = (current_wealth - prev_w) / max(prev_w, 1e-12)
        self._prev_wealth[user.user_id] = current_wealth

        logit = self.alpha_base + self.beta_edge * edge + self.gamma_wealth * wealth_shock
        prob = 1.0 / (1.0 + np.exp(-logit))
        return bool(rng.random() < prob)
