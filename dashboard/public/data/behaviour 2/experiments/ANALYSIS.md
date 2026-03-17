# Behaviour experiments: plots and results analysis

Generated after running all five behaviour experiments with `--write_summary true`. This document maps outputs to the **User behaviour models for an online self-financed forecasting and wagering mechanism** spec and compares with the pre–behaviour-block setup.

---

## 1. Generated plots and data (where to find them)

### behaviour_matrix
- **Location:** `outputs/behaviour/experiments/behaviour_matrix/`
- **Plots (7 standard dashboard):**
  - `plots/01_participation_over_time.png` — N_t (active accounts per round)
  - `plots/02_gap_distribution.png` — histogram of inter-arrival gaps
  - `plots/03_stake_distributions.png` — deposits b_{i,t} and effective wagers m_{i,t} (pooled)
  - `plots/06a_concentration_topk.png` — top-1 and top-5 weight share over time
  - `plots/06b_concentration_hhi_neff.png` — H_t and N^eff_t over time
  - `plots/07_wealth_health.png` — Gini(W_t) and ruin rate over time
- **Not produced in this run (data not collected):** 04 stake vs uncertainty, 05 calibration/sharpness (require `wagers_vs_width`, `coverage_80`, `sharpness_delta` in logs; can be added in a future run with quantile reports).
- **Data:** `data/behaviour_matrix.csv` — per-scenario total_profit, mean_round_profit, final_gini, final_n_eff
- **Summaries:** `summary.md`, `summary.json`

### preference_stress_test
- **Location:** `outputs/behaviour/experiments/preference_stress_test/`
- **Data:** `data/preference_stress.csv` (truthful vs hedged: total_profit, mean_profit, final_gini)
- **Summaries:** `summary.md`, `summary.json`
- **No dashboard plots** in current wiring (only summary written).

### intermittency_stress_test
- **Location:** `outputs/behaviour/experiments/intermittency_stress_test/`
- **Data:** `data/intermittency_stress.csv` — per mode (iid, bursty, edge_threshold, avoid_skill_decay): total_profit, participation_rate, final_n_eff
- **Summaries:** `summary.md`, `summary.json`
- **No dashboard plots** in current wiring.

### arbitrage_scan
- **Location:** `outputs/behaviour/experiments/arbitrage_scan/`
- **Plots:** `plots/08_arbitrage_margin_heatmap.png` — A(θ) by λ (1D bar in this run)
- **Data:** `data/arbitrage_scan.csv`, `data/arbitrage_A_theta.csv`
- **Summaries:** `summary.md`, `summary.json`

### detection_adaptation
- **Location:** `outputs/behaviour/experiments/detection_adaptation/`
- **Data:** `data/detection_adaptation.csv` — fixed_manipulator vs adaptive_evader (total_profit, final_wealth)
- **Summaries:** `summary.md`, `summary.json`
- **No dashboard plots** in current wiring.

---

## 2. Results analysis (numbers)

### behaviour_matrix (T=200, n_users=10, first scenario = benign_baseline for dashboard)

| Scenario              | Total profit | Final Gini | Final N_eff |
|-----------------------|-------------:|-----------:|------------:|
| benign_baseline       | ≈0           | 0.429      | 4.91        |
| bursty_kelly          | ≈0           | 0.374      | 4.88        |
| risk_averse_hedged    | ≈0           | 0.436      | 4.64        |
| lumpy_miscalibrated   | ≈0           | 0.424      | 5.05        |
| edge_threshold        | ≈0           | 0.398      | 5.78        |
| sybil_split (k=3)     | ≈0           | 0.503      | 14.98       |

- **Profit:** All ~0 (self-financed mechanism; small numerical noise). No exploitable arbitrage in these settings.
- **Gini:** Sybil split has highest inequality (0.50); edge_threshold and bursty_kelly are lower (0.37–0.40).
- **N_eff:** Sybil split inflates effective number of “accounts” (14.98) while others stay ~5–6. Concentration (HHI) is lowest under sybil in account count, but wealth Gini is higher.
- **Dashboard headline (benign_baseline):** mean N_t ≈ 7.15, mean HHI ≈ 0.22, mean N_eff ≈ 4.77, final ruin rate 0.

### intermittency_stress_test

| Mode              | Participation rate | Final N_eff |
|-------------------|-------------------:|------------:|
| iid               | 0.71               | 4.91        |
| bursty            | 0.60               | 5.06        |
| edge_threshold    | 0.95               | 5.78        |
| avoid_skill_decay | 0.58               | 2.13        |

- **Edge-threshold** participates most (0.95) and maintains highest N_eff (5.78).
- **Avoid-skill-decay** has low N_eff (2.13): selective participation concentrates weight in fewer agents.
- **Bursty** has lower participation (0.60) and similar N_eff to iid; gap distribution plot (in behaviour_matrix) would show longer inter-arrival gaps.

### preference_stress_test

- Truthful and hedged both: profit ≈ 0, final Gini ≈ 0.429. With point-MAE and this DGP, the two reporting policies yield similar aggregate outcomes in this run.

### arbitrage_scan

- For λ ∈ {0, 0.1, 0.3, 0.5, 0.8, 1.0}: arb_total_profit = 0, arb_final_wealth = 10, arbitrage_found_rounds = 0. No arbitrage opportunities detected; A(θ) = 0 in the exported table.

### detection_adaptation

- fixed_manipulator and adaptive_evader both: total_profit = 0, final_wealth = 10. With the current setup (point-MAE, no volume rewards), neither attacker gains; evader’s anomaly-based throttling doesn’t change the outcome in this run.

---

## 3. Alignment with “User behaviour models” spec (PDF)

The implementation follows the spec as follows:

- **Participation:** Baseline (IID), bursty (Markov), edge-threshold entry, avoid-skill-decay — all exercised in behaviour_matrix and intermittency_stress_test. Plots: participation over time (N_t), gap distribution.
- **Staking:** Fixed fraction, Kelly-like, house-money, lumpy tiers — used in behaviour_matrix (e.g. bursty_kelly, lumpy_miscalibrated). Plots: stake distributions (deposits and effective wagers).
- **Reporting:** Truthful, hedged (risk-averse), miscalibrated — used in behaviour_matrix and preference_stress_test. Calibration/sharpness plot (05) is in the dashboard code but needs quantile logs to be filled.
- **Identity:** Single, split (sybil), reputation reset — sybil_split in behaviour_matrix; N_eff and Gini capture the effect.
- **Concentration & wealth:** HHI, N_eff, Gini, ruin rate — in runner logs and dashboard (06a, 06b, 07).
- **Adversaries:** Arbitrageur (arbitrage_scan + heatmap), manipulator, evader (detection_adaptation), collusion, insider, wash-trading analogue — implemented; arbitrage heatmap and A(θ) CSV produced for arbitrage_scan.

What’s not yet wired for plots in every experiment: stake-vs-uncertainty (04) and calibration/sharpness (05) need per-round quantile/width and coverage data in the logs for the experiments that use quantile reports.

---

## 4. Before vs after (vs “before all the changes”)

**Before (original code):**

- **Deposit/participation:** Handled inside `mvp.run_simulation` via `deposit_mode`: `"exponential"`, `"fixed"`, `"bankroll"`. No separate behaviour layer; no RoundPublicState / AgentAction; no policy or adversary classes.
- **Outputs:** Single root `outputs/experiments/<name>/`; no core vs behaviour split; no summary.md/summary.json; no standard behaviour dashboard.
- **Plots:** Per-experiment ad hoc (e.g. CRPS, calibration) in core experiments; no N_t, gap distribution, stake distributions, concentration time series, or arbitrage heatmap.

**After (current code):**

- **Behaviour block:** Protocol (RoundPublicState, AgentAction, BehaviourModel); policies (participation, belief, reporting, staking, identity); adversaries (arbitrageur, manipulator, collusion, evader, insider, wash_trader); baselines adapting legacy deposit modes; factory + presets under `behaviour/config`.
- **Core block:** Only mechanism (run_round, types, metrics); no import of behaviour; actions consumed via AgentInput protocol.
- **Outputs:** `outputs/core/experiments/` vs `outputs/behaviour/experiments/`; each behaviour run can write summary.md, summary.json, and dashboard plots (when logs are collected).
- **Plots:** Standard behaviour dashboard (7 + optional arbitrage heatmap) in `behaviour/plotting/`; behaviour_matrix generates 01, 02, 03, 06a, 06b, 07; arbitrage_scan generates 08 and A(θ) CSV.

So the current repo clearly separates mechanism (core) from behaviour, adds the full behaviour model set from the spec, and produces the behaviour plots and summaries described above; the only gap is populating logs for plots 04 and 05 in experiments that use quantile reports.
