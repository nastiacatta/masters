import pytest

from onlinev2.simulation import run_simulation


def test_current_round_confidence_emits_warning():
    """lag_confidence=False must emit a RuntimeWarning about deposits depending
    on the current report, so users know this is not theorem-safe."""
    with pytest.warns(RuntimeWarning, match="current report"):
        run_simulation(
            T=5,
            n_forecasters=3,
            scoring_mode="quantiles_crps",
            deposit_mode="bankroll",
            lag_confidence=False,
            seed=1,
        )
