"""
Auto-written experiment summary: summary.json and summary.md in every experiment folder.
"""
from __future__ import annotations

import json
import os
from typing import Any, Dict

EXPERIMENT_DESCRIPTIONS: Dict[str, str] = {
    "behaviour_matrix": (
        "Holds the mechanism fixed and varies only behaviour modules: benign baselines, "
        "realistic frictions (bursty, wealth shocks, risk aversion, discrete staking), "
        "and adversaries (sybils, arbitrageur, collusion, manipulator, insider)."
    ),
    "preference_stress_test": (
        "Holds signal quality fixed and compares truthful reporting vs hedged risk-averse "
        "reporting to evaluate bias and welfare."
    ),
    "intermittency_stress_test": (
        "Compares IID vs bursty vs edge-threshold vs avoid-skill-decay participation, "
        "and compares missingness handling settings."
    ),
    "arbitrage_scan": (
        "Runs arbitrageurs across a parameter grid to see when arbitrage appears "
        "and whether it dominates wealth."
    ),
    "detection_adaptation": (
        "Compares a fixed manipulator with an adaptive evader that balances manipulation "
        "with detector evasion."
    ),
    "collusion_stress": "Compares no collusion vs collusion group; measures within-group synchrony and impact.",
    "insider_advantage": "Compares no insider vs insider; measures insider profit advantage from privileged information.",
    "wash_activity_gaming": "Compares no wash vs wash trader; measures activity inflation from fake interactions.",
    "strategic_reporting": "Compares truthful vs strategic reporter; measures aggregate forecast impact.",
    "identity_attack_matrix": "Compares single account vs sybil split vs reputation reset vs collusive multi-account.",
    "drift_adaptation": "Compares fast vs slow adaptor to drift in the outcome process.",
    "stake_policy_matrix": "Compares fixed fraction vs Kelly-like vs house-money vs lumpy vs break-even vs volatility-sensitive staking.",
    "settlement_sanity": "Random wagers and scores — verify budget balance, non-negativity, equal-score zero profit.",
    "skill_wager": "How skill and wager evolve with intermittent participation.",
    "forecast_aggregation": "Mechanism | Bankroll-Confidence vs baselines.",
    "calibration": "Quantile reliability curve: empirical coverage vs nominal tau.",
    "parameter_sweep": "Grid over lambda and sigma_min. Heatmaps of CRPS, Gini.",
    "sybil": "Split one agent into k identities — verify Sybil resistance.",
    "scoring_validation": "Point/MAE vs quantiles/CRPS validation.",
    "fixed_deposit": "Fixed deposits — only skill drives wagers and profits.",
    "skill_recovery": "Latent truth + Bayes-consistent forecasters — verify skill recovery.",
    "baseline_dgp": "Visualise the baseline DGP: truth vs reports, noise levels.",
    "latent_fixed_dgp": "Visualise the latent-fixed DGP: shrinkage, calibration, fan charts.",
    "aggregation_dgp": "Diagnostic plots for aggregation DGPs (endogenous truth).",
    "dgp_comparison": "Side-by-side comparison of all distinct DGPs.",
    "weight_rule_comparison": "Compare five weight rules under two deposit policies.",
    "deposit_policy_comparison": "Compare four deposit policies under the Mechanism weight rule.",
    "selective_participation": "Strategic timing of absence vs random absence.",
    "weight_learning_comparison": "Compare weight learning across exogenous and endogenous DGPs.",
}


def write_experiment_summary(
    paths: Any,
    config: Dict[str, Any],
    logs: Dict[str, Any],
) -> None:
    """
    Write summary.json and summary.md in the experiment folder.

    paths: object with .root (experiment root directory).
    config: DGP name, T, n_users/n_accounts, behaviour preset, mechanism params (lam, eta, sigma_min, omega_max), etc.
    logs: headline metrics (mean CRPS/MAE, participation, concentration, wealth, attacker stats if any).
    """
    root = getattr(paths, "root", None)
    if not root:
        return
    os.makedirs(root, exist_ok=True)

    exp_name = config.get("experiment_name", "experiment")
    description = EXPERIMENT_DESCRIPTIONS.get(exp_name, "No description available.")

    # Headline results from logs
    headline = {}
    if "mean_crps" in logs:
        headline["mean_crps"] = logs["mean_crps"]
    if "mean_mae" in logs:
        headline["mean_mae"] = logs["mean_mae"]
    if "final_rolling_score" in logs:
        headline["final_rolling_score"] = logs["final_rolling_score"]
    if "mean_N_t" in logs:
        headline["mean_N_t"] = logs["mean_N_t"]
    if "mean_gap" in logs:
        headline["mean_gap"] = logs["mean_gap"]
    if "mean_HHI" in logs:
        headline["mean_HHI"] = logs["mean_HHI"]
    if "mean_N_eff" in logs:
        headline["mean_N_eff"] = logs["mean_N_eff"]
    if "mean_top1_share" in logs:
        headline["mean_top1_share"] = logs["mean_top1_share"]
    if "final_gini" in logs:
        headline["final_gini"] = logs["final_gini"]
    if "final_ruin_rate" in logs:
        headline["final_ruin_rate"] = logs["final_ruin_rate"]
    if "max_wealth_share" in logs:
        headline["max_wealth_share"] = logs["max_wealth_share"]
    if "attacker_weight_share" in logs:
        headline["attacker_weight_share"] = logs["attacker_weight_share"]
    if "attacker_cumulative_profit" in logs:
        headline["attacker_cumulative_profit"] = logs["attacker_cumulative_profit"]
    if "distortion_vs_baseline" in logs:
        headline["distortion_vs_baseline"] = logs["distortion_vs_baseline"]

    summary_dict = {
        "experiment_name": exp_name,
        "description": description,
        "config": config,
        "headline_results": headline,
    }

    json_path = os.path.join(root, "summary.json")
    with open(json_path, "w") as f:
        json.dump(summary_dict, f, indent=2)

    md_lines = [
        "# Experiment summary",
        "",
        "## What this experiment is testing",
        "",
        description,
        "",
        "## Configuration",
        "",
        f"- DGP / setup: {config.get('dgp_name', config.get('experiment_name', 'N/A'))}",
        f"- Rounds: {config.get('T', 'N/A')}",
        f"- Users / accounts: {config.get('n_users', config.get('n_accounts', config.get('n_forecasters', 'N/A')))}",
        f"- Behaviour preset: {config.get('behaviour_preset', 'N/A')}",
        f"- Mechanism: λ={config.get('lam', 'N/A')}, η={config.get('eta', 'N/A')}, σ_min={config.get('sigma_min', 'N/A')}, ω_max={config.get('omega_max', 'N/A')}",
        "",
        "## Headline results (numbers)",
        "",
    ]
    for k, v in headline.items():
        if v is not None and isinstance(v, (int, float)):
            md_lines.append(f"- **{k}**: {v:.4g}")
        else:
            md_lines.append(f"- **{k}**: {v}")
    if not headline:
        md_lines.append("- (No headline metrics collected for this run.)")
    md_lines.extend([
        "",
        "## How to read the plots",
        "",
        "1. **Participation over time**: $N_t$ = number of active accounts per round. Drops indicate missingness.",
        "2. **Gap distribution**: Histogram of time between consecutive participations per account. Bursty behaviour shows larger gaps.",
        "3. **Stake distributions**: Pooled deposits $b_{i,t}$ and effective wagers $m_{i,t}$. Shape indicates staking policy.",
        "4. **Stake as a signal**: Scatter of $m_{i,t}$ vs forecast width. Negative relation suggests confidence-based staking.",
        "5. **Calibration + sharpness**: Empirical coverage of 80% intervals vs nominal; sharpness histogram (narrower = more confident).",
        "6. **Concentration over time**: Top-1/top-5 weight share and HHI / $N^{\\mathrm{eff}}_t$. High concentration means few agents dominate.",
        "7. **Wealth health**: Gini(wealth) and ruin rate over time. High Gini or rising ruin rate indicates inequality or distress.",
        "8. **Arbitrage heatmap** (arbitrage_scan only): $A(\\theta)$ = max_r min_y π(r,y;θ). Positive values indicate arbitrage.",
        "",
    ])

    md_path = os.path.join(root, "summary.md")
    with open(md_path, "w") as f:
        f.write("\n".join(md_lines))
