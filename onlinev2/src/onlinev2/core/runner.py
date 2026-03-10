"""
Deterministic round runner.

run_round is pure given (state, params, actions, y_t).
All stochasticity sits in the DGP and the behaviour block.
"""
from __future__ import annotations

import copy
from typing import Any, Dict, List, Tuple

import numpy as np

from onlinev2.core.types import AgentInput, MechanismParams, MechanismState


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
    from payoff.scoring import (
        mae_loss,
        score_mae,
        crps_hat_from_quantiles,
        score_crps_hat,
    )

    n = len(actions)
    losses = np.zeros(n, dtype=np.float64)
    scores = np.zeros(n, dtype=np.float64)
    alpha = np.ones(n, dtype=np.int32)  # 1 = absent by default

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

    Steps:
      1. Validate actions (deposit >= 0; non-participant has deposit=0, report=None)
      2. Compute scores for participating reports
      3. Compute effective wagers m_i from b_i and sigma_i
      4. Apply weight cap omega_max if enabled
      5. Aggregate forecast from m_i weights
      6. Lambert settlement and profits
      7. Update wealth
      8. Update EWMA loss and sigma mapping
      9. Emit logs

    Returns (new_state, logs).
    """
    from online_algorithms.online_skill import update_ewma_loss, loss_to_skill
    from online_algorithms.staking import cap_weight_shares
    from payoff.payoff import settle_round, aggregate_forecast
    from payoff.scoring import normalised_loss

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

    for i, a in enumerate(actions):
        new_state.ewma_loss[a.account_id] = float(L_new[i])
        new_state.wealth[a.account_id] = max(
            0.0, new_state.wealth.get(a.account_id, 0.0) + float(prof[i])
        )
        new_state.sigma[a.account_id] = float(sigma_t[i])
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
    hhi = float(np.sum(w_arr ** 2))
    n_eff = 1.0 / hhi if hhi > params.eps else float(n)

    wealth_arr = np.array(
        [new_state.wealth[a.account_id] for a in actions], dtype=np.float64
    )
    gini = _gini(wealth_arr)

    pit = None
    if params.scoring_mode == "quantiles_crps" and params.taus is not None:
        agg_cdf_values = []
        for i, a in enumerate(actions):
            if a.participate and a.report is not None:
                q_arr = np.asarray(a.report, dtype=np.float64)
                idx = np.searchsorted(q_arr, y_t)
                if idx == 0:
                    agg_cdf_values.append(float(params.taus[0]))
                elif idx >= len(params.taus):
                    agg_cdf_values.append(float(params.taus[-1]))
                else:
                    frac = (y_t - q_arr[idx - 1]) / max(
                        q_arr[idx] - q_arr[idx - 1], 1e-12
                    )
                    agg_cdf_values.append(
                        float(params.taus[idx - 1])
                        + frac * float(params.taus[idx] - params.taus[idx - 1])
                    )

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

    return new_state, logs


def _gini(x: np.ndarray) -> float:
    """Gini coefficient of array x."""
    x = np.asarray(x, dtype=np.float64).ravel()
    x = x[x >= 0]
    if x.size == 0:
        return 0.0
    x_sorted = np.sort(x)
    n = x.size
    total = float(x_sorted.sum())
    if total <= 0.0:
        return 0.0
    index = np.arange(1, n + 1, dtype=np.float64)
    return float((2.0 * np.sum(index * x_sorted) - (n + 1) * total) / (n * total))
