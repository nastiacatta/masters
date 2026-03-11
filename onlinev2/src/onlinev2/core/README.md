# Core (mechanism only)

Deterministic forecasting mechanism: no user behaviour, no DGP.

- **`types.py`** — Compatibility wrapper; re-exports `onlinev2.mechanism.models` (`MechanismParams`, `MechanismState`, `AgentInput`).
- **`runner.py`** — Compatibility wrapper; re-exports `onlinev2.mechanism.runner` (`run_round(state, params, actions, y_t)`).
- **`metrics.py`** — PIT, sharpness, HHI, N_eff, Gini, network export.

**Source of truth:** Mechanism implementation lives in `onlinev2.mechanism` (runner, models, scoring, settlement, aggregation, etc.). Prefer importing from `onlinev2.mechanism` in new code.

**Boundary:** Core does **not** import `onlinev2.behaviour`. All stochasticity and behaviour live outside; the simulator passes actions from the behaviour layer into `run_round`.
