# Online mechanism / prediction market (onlinev2)

Research code for an online wagering mechanism and forecasting aggregation. The package provides simulation, settlement, skill updates, behaviour models, and experiment runners.

## Quick start

```bash
cd onlinev2
pip install -e .
python experiments.py --exp settlement
pytest tests/
```

- **Install**: From the `onlinev2` directory, `pip install -e .` installs the package in editable mode. No `PYTHONPATH` or `sys.path` changes are required.
- **Run one experiment**: `python experiments.py --exp settlement` (or any `--exp` name below). Outputs go under `outputs/<block>/experiments/<name>/`.
- **Run tests**: `pytest tests/` (or `pytest` with no args; `pyproject.toml` sets `testpaths = ["tests"]`).

## Project structure

- **`onlinev2/`** — Project root (where to run commands).
  - **`src/onlinev2/`** — Main package: `mechanism` (scoring, settlement, aggregation, runner, metrics), `behaviour` (policies, adversaries, population), `simulation`, `dgps`, `io`, `plotting`, `experiments` (helpers, registry, CLI).
  - **`experiments.py`** — Entry script for running experiments; delegates to `onlinev2.experiments.cli`.
  - **`mvp.py`** — Short script to run a single simulation and tests (optional).
  - **`scripts/`** — `run_weight_learning.py`, and `r/` for optional R plotting scripts.
  - **`tests/`** — Pytest tests (smoke, behaviour boundary, metrics, arbitrageur, refactor regression).
- **`dashboard/`** — Optional React frontend for viewing experiment outputs; see Dashboard below.

## Running experiments

From `onlinev2/` (with the package installed):

```bash
python experiments.py --exp <name> [--block core|behaviour|all] [--outdir outputs] [--write_summary true|false]
```

Or use the console script (if installed):

```bash
run-onlinev2-experiments --exp <name> [--block ...] [--outdir ...] [--write_summary ...]
```

**`--exp` choices** (default: `all`):

- **Core**: `settlement`, `skill_wager`, `aggregation`, `calibration`, `parameter_sweep`, `sybil`, `scoring`, `fixed_deposit`, `skill_recovery`, `baseline_dgp`, `latent_fixed_dgp`, `aggregation_dgp`, `dgp_comparison`, `weight_comparison`, `weight_rules`, `deposit_policies`, `selective_participation`
- **Behaviour**: `behaviour_matrix`, `preference_stress`, `intermittency_stress`, `arbitrage_scan`, `detection_adaptation`
- **All**: `all`

**`--block`**: `core` | `behaviour` | `all` (default: `all`). Outputs are under `outdir/core/experiments/` or `outdir/behaviour/experiments/`.

**`--outdir`**: Base directory for outputs (default: `outputs`).

**`--write_summary`**: For behaviour experiments, write `summary.md` and `summary.json` (default: `true`).

## Tests

From `onlinev2/`:

```bash
pytest tests/
# or
pytest tests/ -v
```

Tests cover: DGP registry and generation, weight-learning smoke, behaviour–mechanism boundary (no behaviour in core, determinism, action validation, identity invariants, reproducibility), metrics (HHI, N_eff, Gini, PIT, sharpness), arbitrageur (no nonzero deposit when not participating, “arbitrage found” only when appropriate), and refactor regressions (adversary integration, sigma/PIT, cap_weight_shares). No manual path setup is required when the package is installed.

## Dashboard

The **`dashboard/`** folder contains an optional React (Vite) frontend. It is **not** required to run or develop the Python package. It expects experiment outputs (e.g. CSVs and summaries under `outputs/`) and uses `public/data/index.json` and adapters to load them. To run it: `cd dashboard && npm install && npm run dev`. See `dashboard/README.md` for current status and usage.

## Import surface

Prefer the **`onlinev2`** namespace:

- **Mechanism**: `onlinev2.mechanism` (models, runner, scoring, settlement, aggregation, skill, staking, weights, metrics).
- **Behaviour**: `onlinev2.behaviour` (protocol, factory, population, composite, policies, adversaries).
- **Simulation**: `onlinev2.simulation` (run_simulation, run_all_tests, unit_*).
- **DGPs**: `onlinev2.dgps`, `onlinev2.legacy_dgps`.
- **I/O and plotting**: `onlinev2.io`, `onlinev2.plotting`.

The modules under `onlinev2.core` and the top-level `online_algorithms/` and `payoff/` directories are deprecated compatibility layers; use `onlinev2.mechanism.*` instead.
