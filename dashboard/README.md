# Dashboard (optional)

This folder contains an **optional** React (Vite + TypeScript) frontend for viewing experiment outputs from the onlinev2 Python package. It is **not** required to run or develop the Python code.

## Status

- The dashboard is a separate app that reads data produced by the Python experiments (CSVs, summaries).
- It uses `public/data/index.json` to list experiments and their data files, and adapter code to load series, calibration, behaviour matrix, sweep, and settlement data.
- Mock data is available for development when real experiment outputs are not present.

## How to run

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (e.g. http://localhost:5173).

## Relation to the Python package

- Experiment outputs are written by the Python package under `outputs/` (or whatever `--outdir` is). To view real data in the dashboard, either copy/link those outputs into a path the dashboard can read, or point the app at your output directory as configured in the adapters.
- The Python package does not depend on this dashboard; the dashboard is for visualisation only.
