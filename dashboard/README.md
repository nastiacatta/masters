# Dashboard

Optional React (Vite + TypeScript) frontend for the online wagering mechanism. It visualises the **core mechanism** (Block A) and **user behaviour** (Block B) and loads experiment outputs produced by the Python package. The Python package does not depend on the dashboard.

## What the dashboard covers

### Clearly illustrated (data-backed or interactive)

- **Core mechanism**: Round contract, effective wager \(m_{i,t} = b_{i,t}\,g(\sigma_{i,t})\), aggregation, settlement, skill update, timing invariants (no double-counting). Dedicated routes: overview, round timeline, effective wager, aggregation, settlement, skill update, invariants.
- **Core vs behaviour split**: Block A (deterministic mechanism) vs Block B (policy outputting participation, report, stake, identity). Shown in Behaviour overview and sidebar.
- **Behaviour taxonomy**: Participation and timing, belief formation, reporting, staking, objectives, identity, learning, adversarial, operational frictions (see Behaviour families page).
- **Concrete behaviour experiments**: Wired in the app and listed in `public/data/index.json`: behaviour matrix, preference stress, intermittency stress, arbitrage scan, detection adaptation, collusion stress, insider advantage, wash activity gaming, strategic reporting, identity attack matrix, drift adaptation, stake policy matrix; plus core/experiment runs (settlement, skill_wager, parameter_sweep, calibration, etc.).

### Taxonomy only (no dedicated experiment view)

Many finer-grained behaviours from the slide deck appear in the **taxonomy** (Behaviour families) but do not have their own data-backed dashboard experiment or panel. See **Behaviour coverage** below.

## How to run

```bash
cd dashboard
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). The app serves from `public/`; experiment data is loaded from `/data/` (i.e. `public/data/`).

## Data: making the repo self-contained

The dashboard expects:

- `public/data/index.json` — list of experiments (this file is in the repo).
- `public/data/<block>/experiments/<name>/` — per-experiment outputs (CSVs, summaries) produced by the Python package.

**Problem:** If `public/data/core`, `public/data/behaviour`, or `public/data/experiments` are **absolute symlinks** to a machine-specific path (e.g. `/Users/.../onlinev2/outputs/...`), the repo is not portable: someone else cloning the repo will not have those paths.

**Solution:** Use **relative** symlinks from the dashboard data folder to the Python output directory, or copy outputs into `public/data/`. From the repo root:

1. Run some experiments so the Python package has written outputs, e.g.:
   ```bash
   cd onlinev2
   pip install -e .
   python experiments.py --exp settlement --block core --outdir outputs
   python experiments.py --exp behaviour_matrix --block behaviour --outdir outputs
   ```
2. Link (or copy) those outputs into the dashboard data directory. A helper script is provided:

   ```bash
   ./scripts/link-dashboard-data.sh
   ```

   Or manually, from the repo root:

   ```bash
   cd dashboard/public/data
   ln -sfn ../../onlinev2/outputs/core core
   ln -sfn ../../onlinev2/outputs/behaviour behaviour
   ```

   If your Python `--outdir` is not `onlinev2/outputs`, adjust the paths accordingly.

If no experiment data is present, the dashboard falls back to **mock data** so you can still use the core mechanism and behaviour overview pages.

See `public/data/README.md` for more detail on the expected directory layout.

## Behaviour coverage

A **behaviour coverage checklist** (what is taxonomy-only vs data-backed) is in `docs/BEHAVIOUR_COVERAGE.md`. Summary: the dashboard has **partial coverage** of all behaviours described in the slides; a substantial subset is implemented and illustrated with dedicated experiments, and the rest are listed in the taxonomy.

## Relation to the Python package

- Experiment outputs are written by the Python package under `onlinev2/outputs/` (or whatever `--outdir` is). To view real data, copy or symlink those outputs into `dashboard/public/data/` as above.
- The dashboard’s adapter code (`src/lib/adapters.ts`) loads series, calibration, behaviour CSVs, and summaries from paths under `/data/`.
- The **full list** of experiments the dashboard can display is in `public/data/index.json`, not only the subset listed in the top-level repo README’s “Dashboard” section.
