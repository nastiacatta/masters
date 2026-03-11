"""
Deterministic round runner: single-round execution of the Lambert mechanism.

run_round is pure given (state, params, actions, y_t). All stochasticity sits
in the DGP and the behaviour layer. This module does not import behaviour;
actions satisfy the AgentInput protocol (see core.types).
"""

from __future__ import annotations

import copy
from typing import Any, Dict, List, Tuple

import numpy as np

from onlinev2.core.types import AgentInput, MechanismParams, MechanismState
from onlinev2.core.scoring import (
    mae_loss,
    score_mae,
    crps_hat_from_quantiles,
    score_crps_hat,
    normalised_loss,
)
from onlinev2.core.settlement import settle_round
from onlinev2.core.aggregation import aggregate_forecast
from onlinev2.core.skill import update_ewma_loss, loss_to_skill
from onlinev2.core.staking import cap_weight_shares
from onlinev2.core.metrics import (
    compute_gini,
    compute_pit,
    compute_hhi,
    compute_n_eff,
)


def _validate_actions(actions: List[AgentInput]) -> None:
    for a in actions:
        if a.deposit < 0.0:
            raise ValueError(
                f"Account {a.account_id}: deposit must be >= 0, got {a.deposit}"
            )
        if not a.participate:
            if a.deposit != 0.0:
                raise ValueError(
                    f"Account {a.account_id}: non-participating agent must have deposit=0"
                )
            if a.report is not None:
                raise ValueError(
                    f"Account {a.account_id}: non-participating agent must have report=None"
                )


def _score_actions(
    actions: List[AgentInput],
    y_t: float,
    params: MechanismParams,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Compute losses and scores for participating agents."""
    n = len(actions)
    losses = np.zeros(n, dtype=np.float64)
    scores = np.zeros(n, dtype=np.float64)
    alpha = np.ones(n, dtype=np.int32)

    for i, act in enumerate(actions):
        if not act.participate:
            continue
        alpha[i] = 0
        if params.scoring_mode == "quantiles_crps":
            q_i = np.asarray(act.report, dtype=np.float64).reshape(1, -1)
            losses[i] = float(crps_hat_from_quantiles(y_t, q_i, params.taus)[0])
            scores[i] = float(score_crps_hat(y_t, q_i, params.taus)[0])
        else:
            r_i = float(act.report)
            losses[i] = float(mae_loss(y_t, r_i))
            scores[i] = float(score_mae(y_t, r_i))

    return losses, scores, alpha


def run_round(
    *,
    state: MechanismState,
    params: MechanismParams,
    actions: List[AgentInput],
    y_t: float,
    s_client: float = 0.0,
) -> Tuple[MechanismState, Dict[str, Any]]:
    """
    Core deterministic round execution.

    Steps: validate actions → score → effective wagers → cap → aggregate →
    settle → update wealth → update EWMA/sigma → emit logs.
    Returns (new_state, logs).
    """
    _validate_actions(actions)

    n = len(actions)
    ids = [a.account_id for a in actions]

    new_state = copy.deepcopy(state)

    for a in actions:
        if a.account_id not in new_state.ewma_loss:
            new_state.ewma_loss[a.account_id] = 0.0
        if a.account_id not in new_state.wealth:
            new_state.wealth[a.account_id] = 0.0

    b = np.array([a.deposit for a in actions], dtype=np.float64)
    L_prev = np.array(
        [state.ewma_loss.get(a.account_id, 0.0) for a in actions],
        dtype=np.float64,
    )

    sigma_t = loss_to_skill(
        L_prev, sigma_min=params.sigma_min, gamma=params.gamma
    )
    sigma_t = np.clip(sigma_t, params.sigma_min, 1.0)

    losses, scores, alpha = _score_actions(actions, y_t, params)

    sett = settle_round(
        b=b,
        sigma=sigma_t,
        lam=params.lam,
        scores=scores,
        alpha=alpha,
        s_client=s_client,
        U=params.U,
        eps=params.eps,
        eta=params.eta,
    )

    m_t = sett["m"]

    if params.omega_max is not None and params.omega_max > 0.0:
        m_agg = cap_weight_shares(m_t.copy(), params.omega_max, eps=params.eps)
    else:
        m_agg = m_t

    if params.scoring_mode == "quantiles_crps":
        reports_for_agg = np.zeros((n, len(params.taus)), dtype=np.float64)
        for i, a in enumerate(actions):
            if a.participate and a.report is not None:
                reports_for_agg[i] = np.asarray(a.report, dtype=np.float64)
    else:
        reports_for_agg = np.zeros(n, dtype=np.float64)
        for i, a in enumerate(actions):
            if a.participate and a.report is not None:
                reports_for_agg[i] = float(a.report)

    r_hat = aggregate_forecast(
        reports_for_agg, m_agg, alpha=alpha, eps=params.eps, fallback=None
    )

    prof = sett["profit"]

    losses_norm = normalised_loss(losses, params.scoring_mode)
    L_new = update_ewma_loss(
        L_prev, losses_norm, alpha, rho=params.rho, kappa=params.kappa, L0=params.L0
    )

    sigma_new = loss_to_skill(
        L_new, sigma_min=params.sigma_min, gamma=params.gamma
    )
    sigma_new = np.clip(sigma_new, params.sigma_min, 1.0)

    for i, a in enumerate(actions):
        new_state.ewma_loss[a.account_id] = float(L_new[i])
        new_state.wealth[a.account_id] = max(
            0.0, new_state.wealth.get(a.account_id, 0.0) + float(prof[i])
        )
        new_state.sigma[a.account_id] = float(sigma_new[i])
        new_state.weights_prev[a.account_id] = (
            float(m_agg[i]) / float(np.sum(m_agg))
            if float(np.sum(m_agg)) > params.eps
            else 0.0
        )
        new_state.profit_prev[a.account_id] = float(prof[i])

    new_state.agg_prev = r_hat
    new_state.t = state.t + 1

    M_t = float(np.sum(m_t))
    w_arr = m_agg / M_t if M_t > params.eps else np.zeros(n)
    hhi = compute_hhi(w_arr)
    n_eff = compute_n_eff(w_arr)

    wealth_arr = np.array(
        [new_state.wealth[a.account_id] for a in actions], dtype=np.float64
    )
    gini = compute_gini(wealth_arr)

    pit_val = None
    if params.scoring_mode == "quantiles_crps" and params.taus is not None:
        q_hat = np.asarray(r_hat, dtype=np.float64).ravel()
        if q_hat.size == len(params.taus):
            pit_val = compute_pit(y_t, q_hat, params.taus)

    logs = {
        "t": state.t,
        "y_t": y_t,
        "ids": ids,
        "deposits": b.tolist(),
        "sigma": sigma_t.tolist(),
        "m": m_t.tolist(),
        "m_agg": m_agg.tolist(),
        "scores": scores.tolist(),
        "losses": losses.tolist(),
        "alpha": alpha.tolist(),
        "profit": prof.tolist(),
        "total_payoff": sett["total_payoff"].tolist(),
        "cashout": sett["cashout"].tolist(),
        "refund": sett["refund"].tolist(),
        "r_hat": r_hat if isinstance(r_hat, float) else r_hat.tolist(),
        "HHI": hhi,
        "N_eff": n_eff,
        "Gini": gini,
        "wealth": {a.account_id: new_state.wealth[a.account_id] for a in actions},
    }
    if pit_val is not None:
        logs["PIT"] = pit_val

    return new_state, logs
