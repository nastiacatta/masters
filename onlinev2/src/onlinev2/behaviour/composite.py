"""
Composite behaviour model: combines population traits, policies,
and adversaries into a single BehaviourModel implementation.

This is the main entry point for behaviour-driven simulations.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, BehaviourModel, RoundPublicState
from onlinev2.behaviour.traits import UserTraits
from onlinev2.behaviour.population import UserConfig
from onlinev2.behaviour.policies.participation import ParticipationPolicy
from onlinev2.behaviour.policies.belief import BeliefPolicy, PrivateSignalBelief
from onlinev2.behaviour.policies.reporting import ReportingPolicy
from onlinev2.behaviour.policies.staking import StakingPolicy
from onlinev2.behaviour.policies.identity import IdentityPolicy


class CompositeBehaviourModel:
    """
    Full-featured behaviour model that orchestrates per-user policies.

    Combines:
      - Participation policies (baseline, bursty, edge-threshold, avoid-decay)
      - Belief formation (private signals with correlated errors + drift)
      - Reporting policies (truthful, miscalibrated, hedged, strategic)
      - Staking policies (fixed, Kelly, house-money, lumpy)
      - Identity policies (single, sybil split, reputation reset)

    Also supports plug-in adversary behaviours that override specific users.

    Implements BehaviourModel protocol.
    """

    def __init__(
        self,
        users: List[UserConfig],
        *,
        adversary_behaviours: Optional[Dict[str, Any]] = None,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
        b_max: float = 10.0,
    ) -> None:
        self.users = users
        self.adversary_behaviours = adversary_behaviours or {}
        self.scoring_mode = scoring_mode
        self.taus = taus or np.array([0.1, 0.25, 0.5, 0.75, 0.9])
        self.b_max = b_max
        self._rng: Optional[np.random.Generator] = None
        self._belief_engine: Optional[PrivateSignalBelief] = None

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)

        for user_cfg in self.users:
            belief = user_cfg.belief
            if isinstance(belief, PrivateSignalBelief):
                belief.reset(seed)
                self._belief_engine = belief
                break

        if self._belief_engine is None:
            self._belief_engine = PrivateSignalBelief(taus=self.taus)
            self._belief_engine.reset(seed)

        for adv in self.adversary_behaviours.values():
            if hasattr(adv, "reset"):
                adv.reset(seed)

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None

        if self._belief_engine is not None:
            self._belief_engine.update_drift(self._rng)
            self._belief_engine.generate_group_shocks(self._rng)

        all_actions: List[AgentAction] = []

        for user_cfg in self.users:
            user = user_cfg.traits

            if user.user_id in self.adversary_behaviours:
                adv = self.adversary_behaviours[user.user_id]
                adv_actions = adv.act(state)
                all_actions.extend(adv_actions)
                continue

            if self.scoring_mode == "quantiles_crps":
                belief = user_cfg.belief.form_belief(
                    user, state.t, list(state.y_history), self._rng, {}
                )
                user_median = float(belief[len(belief) // 2])
            else:
                if isinstance(user_cfg.belief, PrivateSignalBelief):
                    user_median = user_cfg.belief.form_point_belief(
                        user, state.t, list(state.y_history), self._rng, {}
                    )
                    belief = user_median
                else:
                    belief = user_cfg.belief.form_belief(
                        user, state.t, list(state.y_history), self._rng, {}
                    )
                    user_median = float(np.median(belief))

            context = {"user_median": user_median, "taus": self.taus}

            participate = user_cfg.participation.should_participate(
                user, state, self._rng, context
            )

            if not participate:
                identity_actions = user_cfg.identity.map_user_action(
                    user_id=user.user_id,
                    participate=False,
                    report=None,
                    deposit=0.0,
                    meta={"real_user_id": user.user_id},
                )
                all_actions.extend(identity_actions)
                continue

            if self.scoring_mode == "quantiles_crps":
                report = user_cfg.reporting.transform_report(
                    belief, user, self._rng, context
                )
            else:
                if hasattr(user_cfg.reporting, "transform_report"):
                    if isinstance(belief, (int, float)):
                        report = belief + user.bias
                        report = float(np.clip(report, 0.0, 1.0))
                    else:
                        report = user_cfg.reporting.transform_report(
                            belief, user, self._rng, context
                        )
                else:
                    report = belief

            deposit = user_cfg.staking.choose_stake(
                user, state, self._rng, context, b_max=self.b_max
            )

            identity_actions = user_cfg.identity.map_user_action(
                user_id=user.user_id,
                participate=True,
                report=report,
                deposit=deposit,
                meta={"real_user_id": user.user_id},
            )
            all_actions.extend(identity_actions)

        return all_actions

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        for adv in self.adversary_behaviours.values():
            if hasattr(adv, "observe_round_result"):
                adv.observe_round_result(t=t, y_t=y_t, logs_t=logs_t)
