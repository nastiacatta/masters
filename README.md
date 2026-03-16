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
- **Run one experiment**: `python experiments.py --exp settlement` or `python -m onlinev2.experiments.cli --exp settlement` (or `run-onlinev2-experiments --exp settlement` if installed). Outputs go under `outputs/<block>/experiments/<name>/`.
- **Run tests**: `pytest tests/` (or `pytest` with no args; `pyproject.toml` sets `testpaths = ["tests"]`).

## Project structure

- **`onlinev2/`** — Project root (where to run commands).
  - **`src/onlinev2/`** — Main package (single source of truth):
    - **`core/`** — Canonical deterministic mechanism (types, scoring, aggregation, settlement, skill, runner, metrics, staking, weights). No behaviour, no I/O.
    - **`behaviour/`** — Policies, adversaries, population, composite; depends only on public state and post-round observations.
    - **`mechanism/`** — Compatibility shim; re-exports from `core`. Prefer `core` in new code.
    - **`simulation/`** — Simulation harness and unit tests.
    - **`dgps/`**, **`legacy_dgps/`** — Data-generating processes.
    - **`experiments/`** — CLI, registry, helpers, summarise; **`experiments/runners/runner_module.py`** holds all `run_*` experiment functions.
    - **`io/`**, **`plotting/`** — Output paths, artifacts, style, plots.
  - **`experiments.py`** — Thin entry script; delegates to `onlinev2.experiments.cli.main()`. No path manipulation.
  - **`mvp.py`** — Short demo; delegates to `onlinev2.simulation`.
  - **`scripts/`** — `run_weight_learning.py`, and `r/` for optional R plotting scripts.
  - **`tests/`** — Pytest tests (smoke, behaviour boundary, metrics, arbitrageur, refactor regression).
- **`dashboard/`** — Optional React frontend; isolated from the research package. Deployed to GitHub Pages via the workflow in `.github/workflows/pages.yml`. If you get a 404 at the Pages URL, see [docs/GITHUB_PAGES_SETUP.md](docs/GITHUB_PAGES_SETUP.md).

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
- **Behaviour**: `behaviour_matrix`, `preference_stress`, `intermittency_stress`, `arbitrage_scan`, `detection_adaptation`, `collusion_stress`, `insider_advantage`, `wash_activity_gaming`, `strategic_reporting`, `identity_attack_matrix`, `drift_adaptation`, `stake_policy_matrix`
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

The **`dashboard/`** folder contains an optional React (Vite) frontend. It is **not** required to run or develop the Python package. It expects experiment outputs under `public/data/`: `index.json` (in repo) plus `core/` and `behaviour/` (populated by running experiments). **Portable data:** avoid absolute symlinks; from repo root run `./scripts/link-dashboard-data.sh` to link `dashboard/public/data/{core,behaviour}` to `onlinev2/outputs/{core,behaviour}`. To run: `cd dashboard && npm install && npm run dev`. See `dashboard/README.md` (status, data setup, behaviour coverage), `dashboard/public/data/README.md` (data layout), and `dashboard/docs/BEHAVIOUR_COVERAGE.md` (taxonomy vs data-backed experiments).

## Import surface

Prefer the **`onlinev2`** namespace:

- **Core (canonical mechanism)**: `onlinev2.core` (types, runner, scoring, aggregation, settlement, skill, weights, staking, metrics). Use for new code.
- **Compatibility**: `onlinev2.mechanism` re-exports from `core` for backward compatibility.
- **Behaviour**: `onlinev2.behaviour` (protocol, factory, population, composite, policies, adversaries).
- **Simulation**: `onlinev2.simulation` (run_simulation, run_all_tests, unit_*).
- **DGPs**: `onlinev2.dgps`, `onlinev2.legacy_dgps`.
- **I/O and plotting**: `onlinev2.io`, `onlinev2.plotting`.

The top-level `online_algorithms/` and `payoff/` directories are deprecated; use `onlinev2.core.*` (or `onlinev2.mechanism.*`) instead.
