"""Bug Condition A — Mechanism-vs-Michael parity (Property 1).

Encodes bugfix.md clauses 1.1–1.4 / expected 2.1–2.4 as 4 property-
based tests.  Three require Julia fixtures from sub-task 1.11 and are
skipped until those land.  The fourth (``michael_ogd`` baseline row
present in real_data runner output) is a deterministic scoped check —
the rule is absent on current code by inspection and the test is
expected to fail.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**
"""
from __future__ import annotations

import json
import os

import numpy as np
import pytest

pytestmark = [pytest.mark.audit]

_CE_DIR = os.path.join(os.path.dirname(__file__), "fixtures", "counterexamples", "a")
_FIXTURE_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


def _commit_counterexample(clause: str, name: str, payload: dict) -> None:
    os.makedirs(_CE_DIR, exist_ok=True)
    path = os.path.join(_CE_DIR, f"{clause}_{name}.json")
    if os.path.exists(path):
        return
    try:
        with open(path, "w") as f:
            json.dump(payload, f, indent=2, default=float, sort_keys=True)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Clause 1.1 / 2.1 — onlinev2 CRPS ≤ 1.10 × michael_ogd CRPS
# ---------------------------------------------------------------------------
@pytest.mark.skip(reason="pending michael_port from 1.11")
def test_onlinev2_crps_within_110pct_of_michael_ogd():
    """Requires Julia fixture julia_ogd_T300_N4.json."""
    ...


# ---------------------------------------------------------------------------
# Clause 1.2 / 2.2 — Spearman gap ≤ 0.10
# ---------------------------------------------------------------------------
@pytest.mark.skip(reason="pending michael_port from 1.11")
def test_spearman_gap_within_0_10():
    """Requires Julia fixture julia_main_rewards_T300.json."""
    ...


# ---------------------------------------------------------------------------
# Clause 1.3 / 2.3 — michael_robust_lr bit parity (1e-8)
# ---------------------------------------------------------------------------
@pytest.mark.skip(reason="pending michael_port from 1.11")
def test_michael_robust_lr_bit_parity():
    """Loads julia_adaptive_robust_T300.json and asserts
    ||python_port_aggregate − julia_aggregate||_∞ ≤ 1e-8."""
    ...


# ---------------------------------------------------------------------------
# Clause 1.4 / 2.4 — michael_ogd baseline row present in runner output
# ---------------------------------------------------------------------------
def test_michael_ogd_baseline_row_present():
    """Run a *tiny* real-data comparison and assert that the rules list
    includes ``michael_ogd``.  The rules list in current code is
    ``uniform, skill, mechanism, best_single, inverse_variance,
    trimmed_mean, median, oracle`` — no michael_ogd.  This is a
    deterministic counterexample.

    Rather than actually running forecasters (which is expensive and
    pulls in xgboost/torch), we source-read the runner to confirm the
    rule name is absent.  This matches the production reality that the
    rule is never emitted, and is cheap + deterministic.
    """
    from onlinev2.real_data import runner as rd_runner
    import inspect

    source = inspect.getsource(rd_runner.run_real_data_comparison)
    present = "michael_ogd" in source
    if not present:
        _commit_counterexample(
            "1_4",
            "michael_ogd_row_absent",
            {
                "runner_module": rd_runner.__name__,
                "rules_list_contains_michael_ogd": False,
                "note": (
                    "Source of run_real_data_comparison does not reference "
                    "'michael_ogd' — the baseline row is never emitted."
                ),
            },
        )
    assert present, (
        "real_data.runner.run_real_data_comparison does not emit a "
        "'michael_ogd' baseline row (clause 1.4)."
    )
