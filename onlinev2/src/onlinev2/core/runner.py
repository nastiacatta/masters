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
from onlinev2.core.skill import (
    update_ewma_loss,
    loss_to_skill,
    default_initial_loss,
)
from onlinev2.core.staking import (
    effective_wager_bankroll,
    effective_wager_capped,
)
from onlinev2.core.intermittent import michael_predict, michael_update
from onlinev2.core.metrics import (
    compute_gini,
    compute_pit,
    compute_hhi,
    compute_n_eff,
    validate_quantile_monotonicity,
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

    init_L = default_initial_loss(
        sigma_min=params.sigma_min,
        gamma=params.gamma,
        sigma_init=params.sigma_init,
    )

    for a in actions:
        if a.account_id not in new_state.ewma_loss:
            new_state.ewma_loss[a.account_id] = float(init_L)
        if a.account_id not in new_state.wealth:
            new_state.wealth[a.account_id] = 0.0

    b = np.array([a.deposit for a in actions], dtype=np.float64)
    L_prev = np.array(
        [new_state.ewma_loss[a.account_id] for a in actions],
        dtype=np.float64,
    )

    sigma_t = loss_to_skill(
        L_prev, sigma_min=params.sigma_min, gamma=params.gamma
    )
    sigma_t = np.clip(sigma_t, params.sigma_min, 1.0)

    losses, scores, alpha = _score_actions(actions, y_t, params)

    m_raw = effective_wager_bankroll(b, sigma_t, params.lam, params.eta)
    m_used = effective_wager_capped(
        b_t=b,
        sigma_t=sigma_t,
        lam=params.lam,
        eta=params.eta,
        alpha_t=alpha,
        omega_max=params.omega_max,
        eps=params.eps,
    )

    # Build reports for aggregation (needed before settlement for michael_split)
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

    theta_for_settle = None
    # In quantile mode, Michael backend expects point forecasts. Use wager aggregation
    # for r_hat (full quantile report) to preserve PIT and CRPS. Michael runs only
    # for theta when michael_split allocation is used.
    use_michael_for_agg = (
        params.aggregation_mode == "michael_robust_lr"
        and params.scoring_mode != "quantiles_crps"
    )
    if params.aggregation_mode == "wager" or not use_michael_for_agg:
        r_hat = aggregate_forecast(
            reports_for_agg, m_used, alpha=alpha, eps=params.eps, fallback=None
        )
    else:
        agg = state.agg_state
        if "w" not in agg or "D" not in agg:
            w = np.ones(n, dtype=np.float64) / n
            D = np.zeros((n, n), dtype=np.float64)
        else:
            w = np.asarray(agg["w"], dtype=np.float64).ravel()
            D = np.asarray(agg["D"], dtype=np.float64)
            if w.size != n or D.shape != (n, n):
                w = np.ones(n, dtype=np.float64) / n
                D = np.zeros((n, n), dtype=np.float64)
        x_t = np.asarray(reports_for_agg, dtype=np.float64).ravel().copy()
        x_t[alpha == 1] = 0.0
        y_hat, aux = michael_predict(x_t, alpha, w, D)
        r_hat = float(y_hat)
        theta_for_settle = aux.get("theta")
        w_new, D_new, _ = michael_update(
            x_t, y_t, alpha, w, D,
            tau=params.delta_is,
            lr=params.michael_lr,
        )
        new_state.agg_state = {"w": w_new, "D": D_new}

    # quantiles_crps + michael_robust_lr: run Michael on median proxy for theta
    # (michael_split allocation) and agg_state; r_hat stays wager-based above.
    if (
        params.aggregation_mode == "michael_robust_lr"
        and params.scoring_mode == "quantiles_crps"
    ):
        agg = state.agg_state
        if "w" not in agg or "D" not in agg:
            w = np.ones(n, dtype=np.float64) / n
            D = np.zeros((n, n), dtype=np.float64)
        else:
            w = np.asarray(agg["w"], dtype=np.float64).ravel()
            D = np.asarray(agg["D"], dtype=np.float64)
            if w.size != n or D.shape != (n, n):
                w = np.ones(n, dtype=np.float64) / n
                D = np.zeros((n, n), dtype=np.float64)
        idx_mid = int(np.argmin(np.abs(params.taus - 0.5)))
        x_t = np.array(
            [reports_for_agg[i, idx_mid] if alpha[i] == 0 else 0.0 for i in range(n)],
            dtype=np.float64,
        )
        _, aux = michael_predict(x_t, alpha, w, D)
        theta_for_settle = aux.get("theta")
        w_new, D_new, _ = michael_update(
            x_t, y_t, alpha, w, D,
            tau=params.delta_is,
            lr=params.michael_lr,
        )
        new_state.agg_state = {"w": w_new, "D": D_new}

    # Settlement: use Michael theta for allocation when michael_split + michael_robust_lr
    M_t = float(np.sum(m_used))
    if (
        params.allocation_mode == "michael_split"
        and theta_for_settle is not None
        and M_t > params.eps
    ):
        theta = np.asarray(theta_for_settle, dtype=np.float64).ravel()
        if theta.size == n and np.all(theta >= -params.eps):
            theta = np.maximum(theta, 0.0)
            s = float(theta.sum())
            if s > params.eps:
                m_for_settle = (theta / s) * M_t
            else:
                m_for_settle = m_used.copy()
        else:
            m_for_settle = m_used.copy()
    else:
        m_for_settle = m_used.copy()

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
        m_pre=m_for_settle,
    )

    prof = sett["profit"]

    losses_norm = normalised_loss(losses, params.scoring_mode)
    L_new = update_ewma_loss(
        L_prev,
        losses_norm,
        alpha,
        rho=params.rho,
        kappa=params.kappa,
        L0=params.L0,
        m_t=m_used,
        m_ref=params.m_ref,
        use_exposure_weighting=params.use_exposure_weighted_skill,
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
            float(m_used[i]) / float(np.sum(m_used))
            if float(np.sum(m_used)) > params.eps
            else 0.0
        )
        new_state.profit_prev[a.account_id] = float(prof[i])

    new_state.agg_prev = r_hat
    new_state.t = state.t + 1

    M_t = float(np.sum(m_used))
    w_arr = m_used / M_t if M_t > params.eps else np.zeros(n)
    hhi = compute_hhi(w_arr)
    n_eff = compute_n_eff(w_arr)

    wealth_arr = np.array(
        [new_state.wealth[a.account_id] for a in actions], dtype=np.float64
    )
    gini = compute_gini(wealth_arr)

    pit_val = None
    if params.scoring_mode == "quantiles_crps" and params.taus is not None:
        q_hat = np.asarray(r_hat, dtype=np.float64).ravel()
        if q_hat.size == len(params.taus) and validate_quantile_monotonicity(
            q_hat, params.taus, eps=params.eps
        ):
            pit_val = compute_pit(y_t, q_hat, params.taus)

    logs = {
        "t": state.t,
        "y_t": y_t,
        "ids": ids,
        "deposits": b.tolist(),
        "sigma": sigma_t.tolist(),
        "m_raw": m_raw.tolist(),
        "m": m_used.tolist(),
        "m_agg": m_used.tolist(),
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
