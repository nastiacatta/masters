# Methodology

## Three-layer architecture

The simulation and analysis platform is split into three layers with
a strict interface. Each layer can be swapped without touching the
others. This separation is what lets us run the same mechanism against
synthetic DGPs, real data, honest forecasters, and adversaries, without
modifying any mechanism code.

```
┌─────────────────────────────────────────────────────────────────┐
│ Environment layer                                               │
│   synthetic DGPs (known-σ panel, latent-skill, exogenous)       │
│   real data (Elia wind 2024–25, Elia electricity imbalance)     │
└─────────────────────────────────────────────────────────────────┘
                               │   (y_t, contextual state)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Agent layer                                                     │
│   honest forecasters (Naive, EWMA, ARIMA, XGBoost, MLP, Theta,  │
│   ensemble)                                                     │
│   adversarial behaviours (sybil, arbitrageur, colluder,         │
│   wash-trader, reputation-gamer, sandbagger, ...)               │
│   interface: returns (participate?, report, deposit)            │
└─────────────────────────────────────────────────────────────────┘
                               │   (r, m)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Platform layer (core mechanism)                                 │
│   scoring · aggregation · settlement · skill update · weights · │
│   staking · metrics                                             │
│   deterministic, side-effect-free                               │
└─────────────────────────────────────────────────────────────────┘
```

Code locations:
- Environment: `onlinev2/src/onlinev2/dgps/`, `onlinev2/data/`.
- Agent: `onlinev2/src/onlinev2/behaviour/`,
  `onlinev2/src/onlinev2/real_data/forecasters.py`.
- Platform: `onlinev2/src/onlinev2/core/`.

The cleanness of this separation is how we can claim the mechanism is
agnostic to the panel and the data. Every experiment in Chapter 5
reuses the same platform layer.

## Datasets

### Synthetic DGPs (Chapter 5.1)

Three families, all committed in `onlinev2/src/onlinev2/dgps/`:

- **Known-σ panel.** Six forecasters with noise scales τ ∈
  {0.15, 0.22, 0.32, 0.46, 0.68, 1.00}. Used to verify skill recovery
  (Spearman σ vs true CRPS).
- **Latent-fixed.** Latent outcome with fixed forecaster biases and
  variances. Used for aggregation and weight-rule comparisons.
- **Exogenous vs endogenous.** Signal is either exogenous (fixed
  process) or endogenous (a participant's report affects the signal);
  separates pure aggregation from feedback dynamics.

### Real data — Elia offshore wind (Chapter 5.2)

- Source: Elia public grid data, offshore wind measured, 2024–2025.
- Raw length: 17544 hourly points
  [source: `data/elia_offshore_wind_2024_2025.csv`, `measured` column].
- **Headline slice:** full length, 17 344 evaluation rounds after a
  200-round warmup, under strictly-causal **expanding** normalisation
  (`normalize_mode=expanding`, `causal_normalize_expanding`). Source:
  `dashboard/public/data/real_data/elia_wind/data/comparison.json`
  dated 2026-05-07.
- **Calibration anchor slice:** first 3000 points after a 200-point
  warmup under warmup-window normalisation (Apr 2026 audit run).
  Source: `onlinev2/outputs/real_data/elia_wind_audit_fresh/data/
  comparison.json` and `onlinev2/outputs/audit_per_quantile/
  coverage*.json`. Retained because it is the slice every per-τ
  calibration number uses and the recalibration layer was validated
  against.
- **Normalisation.** The expanding variant uses
  `(lo_t, hi_t) = (min series[:t+1], max series[:t+1])` so
  `series[t]` is always in [0, 1] for t ≥ 1 and no evaluation-window
  observation is clipped. The older warmup-window variant
  `causal_normalize(series, warmup_len=warmup)` used `[min, max]` from
  `series[:warmup]` only and clipped ~33% of evaluation-window
  observations on the full wind series. Both variants satisfy the
  no-future-leakage property test
  `test_B1_causal_normalize_excludes_future`.

### Real data — Elia electricity imbalance (Chapter 5.2)

- Source: Elia imbalance price data.
- T = 10 000 evaluation rounds after a 200-round warmup, seven
  forecasters, expanding causal normalisation
  [source: `dashboard/public/data/real_data/elia_electricity/data/
  comparison.json` dated 2026-05-07].
- Result is a clean statistical null — mechanism indistinguishable
  from uniform (DM t = 0.008, p = 0.994). Reported honestly in
  Chapter 5.2 §6.3.
- An earlier 10 000-point pre-fix run (pre-expanding) is retained for
  Appendix B as a before/after delta; we do not use it in the body.

### External validation — Elia operational forecast

- Source: Elia's published `mostrecentforecast`, `dayaheadforecast`,
  `dayahead11hforecast`, `weekaheadforecast` columns, extracted by
  `scripts/compute_elia_forecast_baseline.py`; output
  `onlinev2/outputs/elia_forecast_baseline.json`.
- CRPS-MW-equivalent scale for direct comparison with our
  normalised CRPS × (series_max − series_min).
- Used in Chapter 5.2 §6.1.4 as an external sanity check against a
  published operational forecast.

## Forecaster panel (real data)

Seven models. All strictly causal: they use only data up to time t−1 to
predict time t. Retrained on rolling windows every 50 steps (wind) or
every 200 steps (electricity).

| Model | Description | Quantile path |
|---|---|---|
| Naive | ŷ = y_{t−1} | Residual bootstrap with isotonic monotonicity |
| EWMA(5) | Exponential smoothing, span 5 | Residual bootstrap |
| ARIMA(2,1,1) | Classical linear time-series model | Residual bootstrap; `is_persistence` flag surfaces fallback |
| XGBoost | Gradient-boosted trees with lag features; expanding-window CV with `val_gap = 24` (Bergmeir, Hyndman and Koo 2018) | Residual bootstrap |
| MLP | Two-layer neural net with lag features; deterministic seed (B6 fix) | Residual bootstrap |
| Theta | Theta decomposition (Assimakopoulos and Nikolopoulos 2000) | Residual bootstrap |
| Ensemble | Equal-weighted mean of Naive and EWMA(5) | Residual bootstrap |

Source: `onlinev2/src/onlinev2/real_data/forecasters.py`. All
forecasters implement the `BaseForecaster` interface with
`fit(history) → None` and `predict(h) → (point, quantiles)`, expose a
`fallback_counter` (B7 fix), and are blocked from silently masquerading
persistence as their output.

Post-audit training protocol (bugfix spec
`.kiro/specs/model-training-testing-audit/`):

- Cache pipeline is versioned (`PIPELINE_VERSION = "v2-causal-norm"`);
  mismatched caches are regenerated rather than silently reused.
- `strict_no_fallback` runner flag raises on any forecaster-level
  fallback, so a clean comparison run is impossible to confuse with a
  run where one model quietly reduced to persistence.
- XGBoost validation uses expanding-window CV with a 24-step gap
  between train and validation (Bergmeir, Hyndman and Koo 2018 show
  this is the safe default when autocorrelated residuals cannot be
  ruled out); XGBoost `random_state` is propagated from the runner's
  `seed` kwarg (post-audit #A4 fix).
- MLP uses `torch.manual_seed(self.seed)` for cross-warmup
  reproducibility, z-score feature standardization on the training
  window, expanding-window validation split with gap = 24, early
  stopping with patience = 20 and best-weights restoration, and
  `weight_decay = 1e-4` (post-audit #A3 / #C1 fixes).
- `best_single` is defined uniformly across runners as
  `best_single_by_crps(agent_rolling_crps, lookback=100)`; the older
  variance-of-point-error definition in the horizon path is retired.
- The `michael_ogd` row is renamed `michael_ogd_centered_median_fan`
  to match what the shifted-median fan actually does; the per-τ real
  OGD implementation is listed as follow-up work.
- Normalisation has two causal variants: `causal_normalize(warmup_len)`
  (static) and `causal_normalize_expanding` (expanding window). The
  full-length wind and electricity runs use expanding; the 3000-point
  audit slice and older outputs use static. Both satisfy the no-
  future-leakage property.

## Experiment protocol — the validity ladder

Experiments follow the strict ladder from `NEXT_STEPS.md`. Each rung
must pass before the next is treated as meaningful.

### Rung 1 — Validity (Chapter 5.1)

- Mechanism invariants: budget balance, non-negative payouts, equal-
  score zero profit, score bounds, permutation invariance, score-shift
  invariance.
- 13/13 active Lambert combinatorial invariants pass (clause 1.35
  skipped pending Julia fixtures) [source:
  `onlinev2/tests/audit/test_bug_condition_e_payoff.py`].
- 80 golden-value snapshots across 16 payoff-module functions × 5
  seeds [source: `onlinev2/tests/audit/snapshots/`].

### Rung 2 — Pure forecasting gain (Chapter 5.2–5.3)

- Same seeds, DGPs, horizon, participation pattern, and agent panel for
  all methods in a batch.
- Mandatory baselines: uniform, stake-only, skill-only, mechanism,
  inverse-variance, trimmed-mean, median, best-single (regret oracle),
  oracle (hindsight inverse-variance), `michael_ogd` (published OGD
  reference).
- Paired deltas reported relative to uniform.

### Rung 3 — Dynamic robustness (Chapter 6)

- Drift (non-stationary noise scales over time).
- Missingness (IID, bursty, edge-threshold, avoid-skill-decay).
- Selective participation (strategic absence with κ > 0 vs κ = 0).

### Rung 4 — Strategic robustness (Chapter 6)

- Theory-grounded adversary suite (`onlinev2/outputs/behaviour/
  experiments/ANALYSIS.md`): arbitrage_seeking (Chen et al. 2014),
  coordinated_group (Chun & Shachter 2011), privileged_information
  (Lambert 2008; Johnstone 2007), wash_trader, strategic_reporter,
  detector_aware, sybil_arbitrage.
- Attack-gain frame: attacker profit ± SE and 95% CI, scaled per
  1000 rounds; attacker weight share where relevant.
- Multi-seed aggregation (≥ 10 seeds per experiment).

## Standard output format

Every experiment emits a canonical four-panel report:

1. **Primary outcome.** Paired Δ CRPS vs uniform, per seed and per
   method.
2. **Calibration.** PIT histogram or reliability diagram.
3. **Market structure.** Gini, HHI, N_eff of the wealth or influence
   distribution.
4. **Failure mode.** One plot showing where the method breaks.

Master comparison rows are keyed by
`(experiment, method, seed, DGP, preset)` and written to
`master_comparison.json` / `.csv`. This is what the dashboard and the
thesis both read.

## Statistical testing

- **Diebold–Mariano** (Diebold and Mariano 1995) for method vs method
  on per-round CRPS. HAC-corrected standard errors.
- **Bootstrap CIs** (stationary bootstrap) for mean CRPS where
  appropriate.
- **Paired sign test** as a robustness check where DM assumptions are
  marginal.

Headline DM numbers:

- Mechanism vs uniform, 17 344-hour Elia wind, expanding-mode:
  t = 40.77, p ≈ 0
  [source: `dashboard/public/data/real_data/elia_wind/data/
  comparison.json` `dm_test` block].
- Mechanism vs uniform, 10 000-round Elia electricity, expanding-mode:
  t = 0.008, p = 0.994
  [source: `onlinev2/outputs/post_fix_deltas/SUMMARY.md`].
- Mechanism vs uniform, 3000-point audit slice: t = +15.92, p < 1e-6
  [source: `THESIS_CLAIMS.md` Claim 4 body].

## Reproducibility

- `AUDIT_SEEDS = [0, 1, 2, 42, 2024]` — canonical set for property-based
  tests.
- `OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE` on macOS Darwin.
- Python 3.12, numpy, scipy, XGBoost, PyTorch.
- Fresh audit run:
  `cd onlinev2 && OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE \
     python scripts/audit_fresh_run.py`.
- Full audit suite:
  `cd onlinev2 && OMP_NUM_THREADS=1 KMP_DUPLICATE_LIB_OK=TRUE \
     python -m pytest -m audit tests/audit/`.

## Pre-fix snapshot

A pre-fix JSON snapshot is committed at
`onlinev2/outputs/pre_fix_snapshot/` so post-fix numbers remain
auditable. Every headline number in Chapter 5 is accompanied by a
pointer to the post-fix output and, where relevant, the Δ vs the
pre-fix baseline.

## Things still to document (pending runs)

- [DONE 2026-05-07] Hyperparameter sweep output with held-out split
  (B3 fix, Open #2 in `onlinev2/outputs/post_fix_deltas/SUMMARY.md`):
  see `writing/30_mechanism_design.md` sweep table and
  `writing/60_results_real_data.md` §"Sensitivity sweep and parameter
  provenance". Artefact: `onlinev2/outputs/sensitivity_sweep.json`.
- [PENDING] Horizon runs (`day_ahead`, `4h_ahead`, `regime_shift`)
  re-run under expanding normalisation. Current numbers are static
  mode.
- [PENDING] `baselines.json` Vitali OGD / Raja head-to-head re-run
  under expanding normalisation. Current numbers are static mode.
- [PENDING] Restart-per-season regime evaluation (B13.8 follow-up).
- [PENDING, optional] Expanding-mode headline at sweep-selected
  parameters (Task 17.1). Would resolve the residual inconsistency
  where the locked wind table uses expanding + (γ=16, ρ=0.5) and the
  sweep-provenance block uses static + (γ=32, ρ=0.7). Expected
  shift: sub-percent CRPS.
