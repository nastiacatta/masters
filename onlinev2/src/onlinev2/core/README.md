# Core (mechanism only)

Deterministic forecasting mechanism: no user behaviour, no DGP.

- **`types.py`** — `MechanismParams`, `MechanismState`, `AgentInput` (protocol for actions).
- **`runner.py`** — `run_round(state, params, actions, y_t)` — pure round execution.
- **`metrics.py`** — PIT, sharpness, HHI, N_eff, Gini, network export.

**Boundary:** Core does **not** import `onlinev2.behaviour`. All stochasticity and behaviour live outside; the simulator passes actions from the behaviour layer into `run_round`.
