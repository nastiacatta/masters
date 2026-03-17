#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT/onlinev2"
python -m pip install --upgrade pip
pip install -e ".[dev]"

ruff check .
pytest -q

python -m onlinev2.experiments.cli --exp master_comparison --block core --outdir outputs
python -m onlinev2.experiments.cli --exp bankroll_ablation --block core --outdir outputs
python -m onlinev2.experiments.cli --exp calibration --block core --outdir outputs

cd "$ROOT"
./scripts/link-dashboard-data.sh || true

echo ""
echo "Reproduction complete."
echo "Core outputs: onlinev2/outputs/core/experiments"
