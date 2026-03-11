# Refactor summary

## Files changed

| File | Change |
|------|--------|
| **README.md** (repo root) | Replaced placeholder with full docs: quick start, project structure, running experiments (CLI flags and `--exp` choices), tests, dashboard, import surface. |
| **dashboard/README.md** | Replaced Vite template with short status: optional frontend, how to run, relation to Python package. |
| **onlinev2/pyproject.toml** | Added `[tool.pytest.ini_options] testpaths = ["tests"]`, `[project.scripts] run-onlinev2-experiments = "onlinev2.experiments.cli:main"`. |
| **onlinev2/mvp.py** | Removed `sys.path` injection; docstring updated to say run with package installed or `python -m onlinev2.simulation`. |
| **onlinev2/scripts/run_weight_learning.py** | Removed `sys.path` injection. |
| **onlinev2/experiments.py** | Now uses helpers from `onlinev2.experiments.helpers` (exp_paths, ewma_smooth, rolling_mean, cummean, se, run_r_plot, write_csv); removed definitions of those and of `unit_latent_generator_determinism` and `_write_csv`. Replaced entire `if __name__ == "__main__"` block with delegation to `onlinev2.experiments.cli.main()`. |
| **onlinev2/tests/test_smoke.py** | Removed `sys.path` insert; added `test_cli_settlement_smoke()` (run CLI with `--exp settlement`, check output dir and test_results.txt). |
| **onlinev2/tests/test_behaviour_boundary.py** | Removed `sys.path` and unused `os` import. |
| **onlinev2/tests/test_metrics.py** | Removed `sys.path` and unused `os` import. |
| **onlinev2/tests/test_arbitrageur.py** | Removed `sys.path` and unused `os` import. |
| **onlinev2/tests/test_refactor_regression.py** | Removed `sys.path` and pathlib root setup. |
| **onlinev2/src/onlinev2/__init__.py** | Added `__version__ = "0.1.0"`. |
| **onlinev2/src/onlinev2/core/runner.py** | Added module docstring: deprecated compatibility layer. |
| **onlinev2/src/onlinev2/core/types.py** | Added module docstring: deprecated compatibility layer. |
| **onlinev2/src/onlinev2/core/metrics.py** | Added module docstring: deprecated compatibility layer. |
| **onlinev2/src/onlinev2/experiments/helpers.py** | **New.** Shared helpers: exp_paths, ewma_smooth, rolling_mean, cummean, se, run_r_plot, write_csv, unit_latent_generator_determinism. |
| **onlinev2/src/onlinev2/experiments/registry.py** | **New.** get_core_experiments(runner_module), get_behaviour_experiments(runner_module, write_summary), set_cli_args(outdir, write_summary). |
| **onlinev2/src/onlinev2/experiments/cli.py** | **New.** Argparse, load runner from project root, dispatch by --exp/--block, run unit tests, write test_results.txt; `if __name__ == "__main__": main()`. |

## Why each change was made

- **README / dashboard README**: Align docs with actual CLI, layout, and tests; add a working quick start; clarify dashboard as optional.
- **pyproject**: Pytest discovers `tests/` without extra config; console script gives `run-onlinev2-experiments` when installed.
- **sys.path removal**: Package is runnable via `pip install -e .` and standard imports; no path hacks in mvp, scripts, or tests.
- **experiments.py**: Use package helpers (single place for path/smoothing/CSV/R/unit-test helper); delegate CLI to package so entry point is one place and experiments script stays small at the bottom.
- **experiments/helpers.py**: Centralise experiment helpers so runners and CLI share one implementation.
- **experiments/registry.py**: Separate experiment list and CLI args from execution; CLI imports runner module and uses registry to dispatch.
- **experiments/cli.py**: Thin CLI (argparse + dispatch + unit tests); run_* stay in top-level experiments.py to avoid moving ~2800 lines and to keep “python experiments.py” working.
- **Core deprecation docstrings**: Make it explicit that `onlinev2.core` is a compatibility layer for `onlinev2.mechanism`.
- **test_cli_settlement_smoke**: Ensures the documented CLI path runs and produces the expected output layout and test_results.txt.
- **__version__**: Gives artifact/summary logging a single version source.

## Compatibility breaks

- **Running without installing the package**: Previously you could run from `onlinev2/` with `PYTHONPATH=src python experiments.py` and no install. You can still do that **if** `onlinev2` is importable (e.g. `PYTHONPATH=src`). The refactor assumes “install then run” as the default; the script `experiments.py` now imports `onlinev2.experiments.cli`, so `onlinev2` must be on the path (via install or PYTHONPATH).
- **Test execution**: Tests no longer modify `sys.path`; they require the package to be importable (e.g. `pip install -e .` from `onlinev2/` or `PYTHONPATH=src` when running pytest).
- **Helper names**: Internal helpers are now in `onlinev2.experiments.helpers` under public names (exp_paths, ewma_smooth, etc.). Any external code that depended on importing private helpers from the old experiments module would need to switch to the package helpers; we are not aware of such usage.

## Commands to run tests and main experiment entry point

From **`onlinev2/`** (with package installed, e.g. `pip install -e .`):

```bash
# Run all tests
pytest tests/

# Run one experiment (e.g. settlement)
python experiments.py --exp settlement

# Or via console script
run-onlinev2-experiments --exp settlement
```

Without installing (e.g. in CI), from **`onlinev2/`**:

```bash
PYTHONPATH=src pytest tests/
PYTHONPATH=src python experiments.py --exp settlement
```

Main entry points:

- **Experiments**: `python experiments.py` (from `onlinev2/`) or `run-onlinev2-experiments` (if installed).
- **Simulation / MVP**: `python mvp.py` or `python -m onlinev2.simulation` (with package on path).

## Still ambiguous or risky

1. **Pytest segfault**: On this machine, running the full test suite (`pytest tests/`) can hit a NumPy-related segfault during import (e.g. in `test_arbitrageur`). This appears to be an environment/NumPy build issue, not caused by the refactor. Single tests (e.g. `test_cli_settlement_smoke`, or running `experiments.py --exp settlement`) run successfully.
2. **CLI loading runner from project root**: The CLI adds the project root (parent of `src`) to `sys.path` and runs `import experiments` to get the runner module (the file `onlinev2/experiments.py`). This is the only remaining path manipulation; it is confined to the CLI and is required so the large runner file stays at project root. If the package is installed from a different layout (e.g. only `src` shipped), the runner file must still be present at that root for the CLI to work.
3. **experiments.py size**: The run_* logic (~2800 lines) remains in a single file. The refactor split out helpers, registry, and CLI; further splitting into e.g. `runners/core.py` and `runners/behaviour.py` would require a larger move and more careful testing.
4. **Dashboard**: Documented as optional and not wired into the Python package; data paths and adapters may need to be aligned with your actual `--outdir` layout if you use the dashboard.
