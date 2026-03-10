# Behaviour block

User and adversary behaviour: everything that produces actions for the core.

- **`protocol.py`** — `RoundPublicState`, `AgentAction`, `BehaviourModel` (interface).
- **`traits.py`** — `UserTraits`, population generation.
- **`population.py`** — `UserConfig`, `build_population`.
- **`composite.py`** — `CompositeBehaviourModel` (orchestrates policies).
- **`factory.py`** — `make_behaviour(preset_name, ...)` — single entrypoint.
- **`baselines.py`** — Legacy adapters (exponential, fixed, bankroll deposit).
- **`config/`** — Presets: `get_preset_kwargs`, `PRESET_NAMES`.
- **`policies/`** — Participation, belief, reporting, staking, identity.
- **`adversaries/`** — Arbitrageur, manipulator, collusion, evader, insider, wash_trader.
- **`plotting/`** — `make_behaviour_dashboard` (7 plots + arbitrage heatmap).

**Boundary:** Behaviour gets only `RoundPublicState` (past history, no `y_t`) when choosing actions; it receives `y_t` and logs only in `observe_round_result` after the round.
