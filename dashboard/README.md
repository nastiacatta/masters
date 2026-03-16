# Thesis Dashboard

Interactive dashboard for the thesis on **adaptive skill and stake in forecast markets**. It explains how one market round works, where the thesis contribution (online skill layer) enters, how state updates from \(t\) to \(t+1\), and how behaviour and DGP choices affect outcomes. The UI is a thesis-led walkthrough, not a generic KPI dashboard.

## What the dashboard is for

The dashboard supports a thesis on forecasting markets and wagering mechanisms. The research question is:

**Can combining stake with an online, time-varying skill layer improve aggregate forecasts under non-stationarity, strategic behaviour, and intermittent participation?**

It makes clear:

1. **How one round works** — Inputs → DGP → Core → Behaviour → Results → Next state.
2. **Where the thesis contribution enters** — The online skill update (EWMA loss → σ) and its interaction with stake in the effective wager and aggregation.
3. **How state updates from t to t+1** — Wealth, skill weights, eligibility, and any missingness correction state.
4. **How behaviour and DGP choices affect outcomes** — Via the Walkthrough (scenario/experiment/round selectors) and the Experiments page (cross-scenario comparison).

## Relation to the thesis

- **Core mechanism** follows Lambert (2008) and Raja–Pinson: skill-gated effective wager, aggregation by effective wager, Lambert settlement, and a skill weight. The **thesis extension** is the **online skill layer**: σ is updated each round from scoring-rule loss.
- **Behaviour** is kept separate from the deterministic core (participation, reporting, deposits, missingness, identity/attacks). The dashboard treats it as a first-class block in the walkthrough.
- **Validation** (invariants, tests, sanity checks, assumptions) supports thesis credibility and is available under the Validation route.

## Route structure

| Route | Purpose |
|-------|--------|
| `/` | **Default landing.** Thesis overview: research question, why static stake-only is not enough, Raja vs online extension, how to use the dashboard. |
| `/mechanism` | **Main walkthrough.** Step-by-step round walkthrough: Inputs → DGP → Core → Behaviour → Results → Next state. Scenario, experiment, and round selectors; central walkthrough area; explanation panel; summary metrics. |
| `/results` | Cross-scenario comparison and main result views. |
| `/robustness` | Invariants, tests, sanity checks, assumptions. Experiment selector and tabs (Main result, Round replay, Behaviour, Robustness checks). |
| `/appendix` | Legacy interactive lab / pipeline tools. |
| `/appendix/experiments` | Cross-scenario comparison with tabs: Core, Behaviour, DGP comparison, Robustness / adversaries, Ablations. |

Legacy redirects (so old links still work): `/overview` → `/`, `/walkthrough` → `/mechanism`, `/experiments` → `/appendix/experiments`, `/validation` → `/robustness`, `/lab` → `/appendix`, `/pipeline` → `/mechanism`, `/comparison` → `/results`, `/mechanism-explorer` → `/mechanism`.

## Data loading

- **Source:** The dashboard loads experiment metadata and static outputs from `public/data/`.
- **Index:** `public/data/index.json` lists all experiments (name, displayName, description, block, dgp, scoringMode, nAgents, rounds, dataFiles). Optional fields for the thesis walkthrough: `family`, `thesisTags`, `storyOrder`, `scenarioGroup`.
- **Per-experiment data:** Under `public/data/<block>/experiments/<name>/` or `public/data/experiments/<name>/` (depending on `block`). The adapters (`src/lib/adapters.ts`) fetch CSVs and JSON (e.g. timeseries, summary, calibration) from paths derived from the index.
- **Store:** `src/lib/store.tsx` holds the experiment list, selected experiment, block filter, current round, and data mode. The walkthrough uses the same store and derives round-level inputs, DGP meta, results, and next state via `src/lib/walkthroughSelectors.ts` from experiment meta and loaded series.
- **No simulation in the browser:** The dashboard does not run the Python simulation; it visualises pre-run experiment outputs. The in-browser pipeline (e.g. `runPipeline`) is for illustration only where used.

## How to run locally

```bash
cd dashboard
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). The app serves from `public/`; data is loaded from `/data/` (i.e. `public/data/`).

### Linking experiment data

If experiment data lives outside the repo (e.g. Python package outputs), symlink or copy it into `public/data/`:

- `public/data/index.json` — must exist (in repo).
- `public/data/core/`, `public/data/behaviour/`, `public/data/experiments/` — per-experiment outputs (CSVs, summaries).

From repo root you can use a helper script if available, e.g.:

```bash
./scripts/link-dashboard-data.sh
```

If no data is present, the app falls back to mock data where configured so the walkthrough and navigation still work.

## Main components

- **Overview** (`/overview`) — Thesis framing and “how to use”.
- **Walkthrough** (`/walkthrough`) — Stepper, step content (Inputs, DGP, Core with subtabs, Behaviour with subtabs, Results, Next state), explanation panel, summary metrics. Reuses Core and Behaviour concepts from existing pages where possible.
- **Experiments** (`/experiments`) — Tabbed comparison (Core, Behaviour, DGP, Robustness, Ablations) with experiment selector and Validation content.
- **Validation** (`/validation`) — Experiment selector and tabs for main result, round replay, behaviour, and robustness checks.

Core mechanism details (effective wager, aggregation, settlement, skill update, invariants) remain available under legacy routes and are reflected in the Walkthrough Core step and in the thesis README/docs.
