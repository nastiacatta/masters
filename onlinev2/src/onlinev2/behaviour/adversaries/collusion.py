"""
Collusion group behaviours.

Implements:
  - Coordinated participation and staking
  - Report synchronisation
  - "Reputation grooming then deploy" pattern (conservative early, aggressive later)
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import numpy as np

from onlinev2.behaviour.protocol import AgentAction, RoundPublicState
from onlinev2.behaviour.traits import UserTraits


class CollusionGroupBehaviour:
    """
    A group of agents that collude: synchronise participation, reports,
    and staking to maximise joint profit.

    Phase 1 (grooming): behave conservatively to build reputation.
    Phase 2 (deploy): coordinate aggressively to extract profit.

    Implements BehaviourModel protocol.
    """

    def __init__(
        self,
        members: List[UserTraits],
        *,
        groom_rounds: int = 50,
        deploy_aggression: float = 0.8,
        sync_reports: bool = True,
        scoring_mode: str = "point_mae",
        taus: Optional[np.ndarray] = None,
        b_max: float = 10.0,
    ) -> None:
        self.members = members
        self.groom_rounds = groom_rounds
        self.deploy_aggression = deploy_aggression
        self.sync_reports = sync_reports
        self.scoring_mode = scoring_mode
        self.taus = taus or np.array([0.1, 0.25, 0.5, 0.75, 0.9])
        self.b_max = b_max
        self._rng: Optional[np.random.Generator] = None
        self.group_id = f"collusion_{members[0].user_id}" if members else "collusion"

    def reset(self, seed: int) -> None:
        self._rng = np.random.default_rng(seed)

    def _is_deploy_phase(self, t: int) -> bool:
        return t >= self.groom_rounds

    def act(self, state: RoundPublicState) -> List[AgentAction]:
        assert self._rng is not None

        deploying = self._is_deploy_phase(state.t)
        actions: List[AgentAction] = []

        leader = self.members[0]
        leader_wealth = state.wealth_prev.get(leader.user_id, leader.initial_wealth)

        if deploying and self.sync_reports:
            if len(state.agg_history) > 0:
                last_agg = state.agg_history[-1]
                if isinstance(last_agg, (int, float)):
                    leader_report_val = float(last_agg) + self._rng.normal(0, 0.01)
                elif hasattr(last_agg, '__len__') and len(last_agg) > 0:
                    leader_report_val = float(np.median(last_agg))
                else:
                    leader_report_val = 0.5
            else:
                leader_report_val = 0.5
            leader_report_val = float(np.clip(leader_report_val, 0.01, 0.99))
        else:
            leader_report_val = float(np.clip(self._rng.normal(0.5, 0.1), 0.01, 0.99))

        for member in self.members:
            wealth = state.wealth_prev.get(member.user_id, member.initial_wealth)

            if deploying:
                participate = True
                stake_fraction = min(self.deploy_aggression, 0.9)
            else:
                participate = bool(self._rng.random() < member.participation_prob)
                stake_fraction = member.stake_fraction * 0.5

            if not participate:
                actions.append(
                    AgentAction(
                        account_id=member.user_id,
                        participate=False,
                        meta={
                            "attacker": "collusion",
                            "group_id": self.group_id,
                            "phase": "deploy" if deploying else "groom",
                        },
                    )
                )
                continue

            deposit = min(wealth * stake_fraction, self.b_max, wealth)

            if deploying and self.sync_reports:
                report_val = leader_report_val + self._rng.normal(0, 0.005)
                report_val = float(np.clip(report_val, 0.01, 0.99))
            else:
                report_val = float(np.clip(
                    self._rng.normal(0.5, member.noise_level), 0.01, 0.99
                ))

            if self.scoring_mode == "quantiles_crps":
                from scipy.stats import norm
                report = np.clip(
                    norm.ppf(self.taus, loc=report_val, scale=member.noise_level),
                    0.0, 1.0,
                )
            else:
                report = report_val

            actions.append(
                AgentAction(
                    account_id=member.user_id,
                    participate=True,
                    report=report,
                    deposit=max(0.0, deposit),
                    meta={
                        "attacker": "collusion",
                        "group_id": self.group_id,
                        "phase": "deploy" if deploying else "groom",
                        "real_user_id": member.user_id,
                    },
                )
            )

        return actions

    def observe_round_result(
        self, *, t: int, y_t: float, logs_t: Dict[str, Any]
    ) -> None:
        pass
