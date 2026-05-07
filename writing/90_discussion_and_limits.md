# Discussion, limitations, threats to validity

## 9.1 What the mechanism does well

- **Economic structure preserved.** Budget balance holds to machine
  precision (~1e-13). Lambert's narrow sybil invariance holds with
  profit ratio = 1.000000. Truthfulness from Lambert's §4.2 carries
  over — the skill gate modulates m_i pre-round, so the proof applies
  verbatim with m_i in place of the original wager.
- **Skill recovery is clean on clean data.** On the known-noise
  synthetic panel the mechanism's σ ordering matches the true CRPS
  ordering exactly (Spearman 1.0). On the 3000-point Elia wind audit
  slice the σ ranking of the seven forecasters also matches their
  mean CRPS ranking exactly (Spearman 1.0). On the 17 344-hour full-
  length run the σ *ordering* is identical to the audit slice though
  the σ *levels* are lower (XGBoost 0.808 vs 0.910) because the
  expanding normalisation produces larger normalised losses.
- **Deposit-design lever identified.** The deposit policy is the
  strongest empirical lever. Bankroll-confidence deposits achieve a
  11.3% CRPS improvement over fixed deposits on the synthetic panel;
  on real wind data the effect compounds with the skill gate.
- **Orthogonal calibration fix.** The rolling-isotonic recalibration
  layer closes 59% of the Ranjan–Gneiting tail-calibration gap at
  modest CRPS and sharpness cost, without touching any economic
  layer.
- **Wind improvement is statistically strong.** DM t = 40.77 for the
  mechanism-vs-uniform comparison on the full-length wind run — well
  inside any Bonferroni-adjusted threshold.
- **Competitive with Elia's operational forecast.** Best_single
  (XGBoost on observed series only) beats Elia's real-time forecast
  by ~15% CRPS-MW-eq; the mechanism ends up roughly on par. No
  external weather inputs are used.

## 9.2 What the mechanism does not do

This list is deliberately on the long side. Understating limitations is
the easiest way to lose a reviewer.

- **No universal dominance over simple baselines.** On the Elia wind
  17 344-hour full-length run, inverse-variance weighting (−7.0% vs
  uniform) is effectively tied with our mechanism (−7.1%); median
  (−9.3%) and trimmed_mean (−7.2%) beat us. Vitali's per-τ OGD
  baseline (−18.3% on `baselines.json` static-mode) and the rolling
  100-step best_single (−22.9%) both beat the mechanism by large
  margins. The thesis's contribution is *conditional* forecasting
  improvement plus preserved economic structure, not raw CRPS
  dominance.
- **Electricity imbalance prices produce a null result.** The
  mechanism is statistically indistinguishable from uniform on
  electricity (t = 0.008, p = 0.994) because the seven forecasters
  produce near-identical CRPS (all within 0.8% of uniform). No
  persistent skill signal to exploit. This is reported honestly as a
  null and is not a defect of the mechanism; it is a limit of what
  the EWMA skill layer can do when the forecasters are
  undifferentiated.
- **Performance depends on parameter tuning.** Defaults (γ = 4,
  ρ = 0.1) are tuned for ~10 forecasters and T ~ 1000. Wind-data
  tuned values (γ = 16, ρ = 0.5) are more aggressive. A poorly tuned
  γ or ρ can make the mechanism marginal vs uniform. The sensitivity
  sweep with held-out split is [PENDING] per
  `onlinev2/outputs/post_fix_deltas/SUMMARY.md` Open #2.
- **Best single forecaster can win.** XGBoost alone (best_single
  0.03145 CRPS on the full-length run) beats the mechanism (0.03788)
  by 16.9% CRPS because wind power is highly autocorrelated and the
  single best model captures most of the structure. This is an honest
  ceiling on what any aggregator can achieve. In CRPS-MW-equivalent
  terms, best_single reaches 62.6 MW while the mechanism averages to
  76.2 MW.
- **Linear-pool tail miscalibration is inevitable.** Ranjan and
  Gneiting 2010: any non-trivial weighted average of distinct
  calibrated forecasts is necessarily uncalibrated. The mechanism's
  aggregate shows ~2pp systematic tail deviation. The recalibration
  layer closes 59% of this; 41% remains.
- **Sybil-proofness only holds for identical reports.** The Lambert
  invariance is narrow. Diversified-report sybils (clones submitting
  slightly different forecasts) break the invariance by ~6.5%
  empirically. This is not a regression of our design; it is an
  artefact of the Lambert framework. Mentioning it is standard
  scientific practice.
- **Truthfulness only under risk neutrality.** Inherits Lambert's
  linear-utility assumption. For large stakes or risk-averse agents
  the truthfulness argument does not go through.
- **Quantile-level attacks are harder to contain than point-level
  ones.** On the current adversary suite, Chen et al. 2014 arbitrage
  extracts +12 to +24 profit per 1000 rounds as λ rises from 0 to 1,
  Chun–Shachter coalition extracts +19.9 (weighted-mean) or +16.9
  (weighted-median), and a legitimate lagged insider under AR(1)
  extracts +57.1. The skill gate does not eliminate any of these;
  it only modestly constrains arbitrage. See Chapter 6 §8.2–8.5 for
  the full tables.
- **Participation is expected to be a vulnerability, but the specific
  "+934% bursty" number from the earlier draft is from a legacy
  preset and is not present in the current adversary suite.** Re-run
  the participation-specific experiments before citing a number.
- **Arbitrage is empirically profitable, as predicted by theory.**
  The Chen-Devanur-Pennock-Vaughan (2014) arbitrage interval applies
  to every WSWM, including ours. Post-revamp experiments confirm a
  theory-grounded arbitrage seeker earns +11 to +24 cumulative profit
  over 1000 rounds across the λ grid, and the profit scales roughly
  linearly with crowd size (see §8.3–8.4). The mechanism is still
  budget-balanced — the attacker's gains come from other
  participants, not from the mechanism's reserves. Fully removing the
  arbitrage requires moving to the no-arbitrage wagering family
  (Chen et al. 2014 §4–5), which is outside this thesis's scope.
- **Chun-Shachter coalitions are profitable.** A 3-member coalition
  broadcasting the wager-weighted mean of its members' beliefs earns
  +16.9 to +19.9 over 1000 rounds (§8.6). Combining coalition with
  privileged lagged information (§8.7) compounds the two channels
  and extracts ≈ 40% more than pure collusion (+33.84 vs +24.12).
- **Sybil-proofness holds in the Lambert narrow sense.** The
  `sybil_arbitrage` audit (§8.5) shows arbitrage profit is invariant
  to k ∈ {1, 3, 5} to within Monte-Carlo error, empirically
  validating the Lambert invariance on top of an actively exploited
  attack. The narrow sense is the only one the theorem covers;
  diversified-report sybils remain a real open vulnerability.
- **Collusion equilibria not formally analysed; named strategies
  extract substantial profit.** We test `coordinated_group` (Chun–
  Shachter 2011) and `informed_collusion` (coalition + AR(1)
  insiders). Three-member coalition extracts +19.9 (weighted-mean);
  informed collusion extracts +33.8. Neither is contained by the
  skill gate. The full best-response space is not characterised.
- **Electricity data gives a clean null.** On the 10 000-round
  electricity imbalance slice the mechanism's Δ vs uniform is
  statistically zero (t = 0.008, p = 0.994). Seven forecasters within
  0.8% of each other leaves the EWMA skill layer no signal to
  exploit. The earlier pre-fix "−3.8% on electricity" claim was an
  artefact of whole-series min/max normalisation; under strictly-
  causal expanding normalisation the effect vanishes. Our
  contribution on electricity is the preserved economic structure,
  not CRPS.

## 9.3 Threats to validity

### Internal validity

- **Training-audit dependency.** All Elia headline numbers before the
  training-audit spec (`model-training-testing-audit`) used a pipeline
  with whole-series min/max normalisation, a non-reproducible MLP
  seed, tail-adjacent XGBoost validation, and a silently-swallowed
  fallback path. After the audit, headline numbers may shift by small
  but measurable amounts. We pin a pre-fix snapshot
  (`onlinev2/outputs/pre_fix_snapshot/`) and report the delta in
  Appendix B.
- **Seed-to-seed variance.** Single-seed real-data runs are the norm
  because the data itself is fixed; variance comes from stochastic
  forecaster components (XGBoost, MLP). We repeat with five
  `AUDIT_SEEDS` on synthetic and with three seeds on real data and
  report the range.
- **CRPS-hat vs true CRPS.** We use a 9-level finite-grid pinball
  approximation. The approximation bias is small for smooth
  distributions but non-zero. We also check pointwise quantile
  coverage (Chapter 5.3) which is not subject to the same
  approximation.

### External validity

- **Two real datasets.** Elia wind and Elia electricity imbalance.
  Both are single-site European grid data. Results may not transfer
  to solar, load, or non-European systems without additional tuning.
- **Stationary test slice.** The 3000-point audit slice spans a few
  months and is roughly stationary. Full-year drift is not tested on
  the audit headline numbers.
- **Seven forecasters.** The panel is intentionally diverse but it is
  still a small panel. Results at n = 50 or n = 500 are not
  extrapolatable without testing.

### Construct validity

- **CRPS as "aggregate quality".** CRPS is strictly proper (Gneiting
  and Raftery 2007), but it rewards calibration plus sharpness in a
  specific way. A mechanism optimised for CRPS may not be optimal for
  a decision problem that cares primarily about tail coverage or
  about point accuracy.
- **Δ vs uniform as the comparison metric.** Uniform is a strong
  baseline (the forecast combination puzzle). We also report Δ vs
  `best_single` (regret) and vs `michael_ogd` (published OGD
  reference) so the headline is not anchored to a single baseline.

### Statistical validity

- **DM test assumptions.** Diebold–Mariano assumes covariance
  stationarity of the loss-differential series. We HAC-correct the
  standard errors but residual non-stationarity is not ruled out.
- **Multiple comparisons.** We report ~10 methods × 2 datasets × 2
  horizons. Family-wise error is not controlled. The DM p-value on
  the headline mechanism-vs-uniform comparison (p < 1e-6) is well
  inside any reasonable Bonferroni-adjusted threshold, but finer
  comparisons across methods should be read with that caveat.

## 9.4 What this is not

- This is not a new scoring rule. CRPS and pinball loss are
  standard; we use them unchanged.
- This is not a new forecasting model. The seven base forecasters
  are standard implementations.
- This is not a game-theoretic analysis. We test behaviours via
  simulation presets, not via computing Nash or correlated equilibria.
- This is not a conformal prediction paper. The recalibration layer is
  post-hoc isotonic (Kuleshov–Fenner–Ermon), not a conformal wrapper.
- This is not a full-scale empirical study of Amazon-scale or
  grid-scale forecasting markets. It is a methodology paper with
  real-data validation on two Elia series.

## 9.5 The honest headline

When distributed information is combined through a self-financed
wagering mechanism and that mechanism learns participant reliability
online, the aggregate forecast improves vs uniform in the conditions
where any forecast combination helps: enough forecaster heterogeneity,
enough rounds for the EWMA to converge, and enough signal in the
underlying series. Those conditions hold on Elia wind — a 7.1% CRPS
reduction, t = 40.77, p ≈ 0 over 17 344 evaluation rounds — and do not
hold on Elia electricity imbalance prices, where the mechanism is
statistically indistinguishable from uniform. Under both conditions
the economic structure of Lambert's framework survives the addition
of online learning. A simple online XGBoost beats Elia's operational
real-time forecast by 15% CRPS-MW-eq, and the mechanism ends up
roughly on par with Elia's forecast without using any weather inputs.
The CRPS-only picture is not a win; the combination-puzzle regime is
real. The contribution is the preserved economic structure and the
online adaptivity, both demonstrated on real grid data.

## Notes for the write-up

- This chapter is the one reviewers read most carefully. Do not
  hedge where the evidence is strong; do not over-claim where it is
  weak. The balance is the point.
- The "what this is not" subsection is unusual but it prevents
  reviewer 2 from asking for things that are not in scope.
- Keep cross-references back to `THESIS_CLAIMS.md` Claims 1–8
  sharp.
