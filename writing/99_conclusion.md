# Conclusion and future work

## 10.1 Summary of contributions

Mapped to `THESIS_CLAIMS.md`:

1. **Mechanism correctness (Claim 1).** The `onlinev2` self-financed
   wagering mechanism satisfies all 13 Lambert combinatorial
   invariants. Budget balance holds to machine precision. Sybil-
   proofness (narrow Lambert case: identical reports, conserved total
   wager) holds with profit ratio 1.000000.

2. **Online skill layer tracks quality (Claim 2).** EWMA of
   probabilistic loss mapped through an exponential to a bounded
   σ ∈ [σ_min, 1]. Spearman(σ_learned, CRPS_truth) = 1.00 on the
   known-noise synthetic panel. All algebraic invariants (timing,
   monotonicity, missingness preservation, γ round-trip) hold.

3. **Forecasters train without silent failure (Claim 3).** The seven
   base forecasters (Naive, EWMA, ARIMA, XGBoost, MLP, Theta,
   Ensemble) are strictly causal, have exposed `fallback_counter`
   tracking, and cannot masquerade persistence as model output.

4. **Wind improvement, electricity null — both statistically clean
   (Claim 4).** On the full-length 17 344-hour Elia wind slice under
   strictly-causal expanding normalisation, the mechanism reduces CRPS
   by 7.1% vs uniform (DM t = 40.77, p ≈ 0). On the 3000-point audit
   slice used for all calibration work, the mechanism is within 0.3%
   of Vitali's pre-rename OGD port. On Elia electricity imbalance
   prices the mechanism is indistinguishable from uniform
   (t = 0.008, p = 0.994) — a cleanly-reported null. On both series
   Vitali's per-τ OGD baseline beats the mechanism; the gap
   quantifies the CRPS cost of keeping the Lambert budget-balance
   guarantee.

5. **Skill ranking matches forecaster quality on real data (Claim 5).**
   XGBoost dominates the panel on both wind slices and is identified
   as top-skill (σ = 0.808 on the full-length run, 0.910 on the audit
   slice; the level differs, the ranking is identical). On the audit
   slice, Spearman rank correlation between σ and per-forecaster CRPS
   is 1.00.

6. **Linear-pool miscalibration is small and systematic (Claim 6).**
   Mean tail deviation 0.017 on the wind slice; pattern of under-
   coverage in the lower tail and over-coverage in the mid-upper
   range, as predicted by Ranjan and Gneiting 2010.

7. **Post-hoc recalibration closes 59% of the tail gap (Claim 7).**
   Rolling isotonic recalibration (Kuleshov, Fenner and Ermon 2018) in
   a prequential buffer (Dawid 1984) reduces tail deviation 0.0171 →
   0.0070 at a 1.3% CRPS cost and 9% sharpness cost, on the
   calibration-sharpness tradeoff floor (Gneiting, Balabdaoui, Raftery
   2007).

8. **Economic structure preserved end-to-end (Claim 8).** The
   recalibration layer is orthogonal to the skill, wager, aggregation,
   and settlement layers. `recalibrate=False` gives byte-identical
   output to the pre-feature baseline.

9. **Elia operational-forecast comparison (new validation).** A simple
   online XGBoost trained on the observed series only beats Elia's
   published real-time forecast (`mostrecentforecast`) by ~15% in CRPS-
   MW-equivalent (62.6 vs 74.0 MW). Our mechanism is roughly on par
   with Elia's real-time forecast (76.2 vs 74.0 MW). Elia's interval
   forecasts are systematically miscalibrated (τ = 0.10 coverage is
   19.1%, τ = 0.90 coverage is 94.6%), motivating the recalibration
   layer as a generic operational tool.

## 10.2 Answer to the research question

> When predictive information is distributed across many actors, how
> should we combine their forecasts, and how should we decide whose
> forecast deserves more influence — while preserving the budget
> balance, truthfulness and sybil-proofness that make the market
> credible?

**Answer, conditionally yes on all three sub-questions.**

- *Can a market learn reliability online?* Yes. The EWMA-based skill
  layer recovers the true ordering on clean synthetic data (Spearman
  1.0) and reconstructs the forecaster CRPS ordering on Elia wind
  (Spearman 1.0).
- *Does using that reliability improve the aggregate forecast?*
  Conditionally yes. On the 17 344-hour full-length Elia wind run the
  mechanism reduces CRPS by 7.1% vs uniform (DM t = 40.77, p ≈ 0);
  on Elia electricity imbalance prices the mechanism is statistically
  indistinguishable from uniform (t = 0.008, p = 0.994) — an honest
  null. Vitali's per-τ OGD baseline beats the mechanism on both
  series because it drops the Lambert budget-balance constraint.
  Forecast-combination-puzzle conditions apply.
- *Can it happen while preserving Lambert's economic guarantees?* Yes.
  Budget balance is a construction property; sybil-proofness holds
  under Lambert's scope (identical reports, conserved total wager);
  truthfulness holds under Lambert's risk-neutrality assumption. All
  three survive because the skill layer modulates m_i pre-round using
  only information from rounds < t.

The honest headline: the skill layer buys a small forecasting
improvement and adds online adaptivity; the economic structure comes
essentially for free, which is the real contribution.

## 10.3 Future work

Ordered by estimated value and effort.

### Near-term (weeks)

- **Switch the runners from `causal_normalize` to
  `causal_normalize_expanding`.** The current warmup-window
  normalisation clips ~33% of Elia wind evaluation observations to 0
  or 1 (Open #1 in the training-audit summary). The expanding variant
  is implemented and tested but not wired in. Will change absolute
  CRPS magnitudes without changing comparative directions.
- **Per-forecaster conformal wrappers.** Calibrate each forecaster's
  own quantile reports before aggregation. Currently the linear pool
  receives uncalibrated base members; a per-forecaster conformal pass
  would mean the pool starts from calibrated input, reducing the
  magnitude of the Ranjan–Gneiting gap we have to close post-hoc.
- **Sensitivity sweep** with held-out split (Open #2). Run
  `scripts/run_sensitivity_sweep.py` on the full series to populate
  `onlinev2/outputs/sensitivity_sweep.json` with a real optimum-
  parameter artefact; the runner already reads from that path when
  the file exists and otherwise flags a missing sweep (the legacy
  hardcoded `-27.2` constant was removed by the training-audit spec).

### Medium-term (months)

- **Beta-transformed linear pool (Gneiting and Ranjan 2013).**
  Parametric cousin of the isotonic recalibration layer. May preserve
  sharpness better than the isotonic map by fitting a Beta CDF
  transformation rather than a monotone step function.
- **Real per-quantile OGD aggregation.** Replace the
  `michael_ogd_centered_median_fan` baseline with a true per-τ OGD
  port of Vitali and Pinson 2025. Currently the baseline is a
  centered-median fan because the Julia code targets point forecasts;
  the per-τ variant would give a stronger comparison point.
- **Restart-per-season regime-shift evaluation.** The current
  `within_run_seasonal_slice` evaluation is a single pass; a proper
  regime-shift test would restart the mechanism at each seasonal
  boundary.
- **Extend the sybil invariance argument to the diversified-report
  case.** Identify conditions under which sybil profit can be capped
  even when clones submit slightly different reports.

### Long-term (research agenda)

- **Collusion-resistant scoring rules.** Lambert's framework treats
  participants as individual; formal analysis of collusion equilibria
  is open. A scoring rule that penalises correlated reports
  (mechanism-design direction) would address this but break the
  truthfulness argument; the tradeoff space is unmapped.
- **Continuous-outcome scoring beyond quantiles.** Native density
  scoring (log score, energy score) rather than a finite-grid CRPS
  approximation. Raises questions about the economic algebra; not
  obviously compatible with the Lambert settlement form.
- **Multi-horizon joint calibration.** Current recalibration is per
  horizon. Joint PIT over (h = 1, 4, 24) would enable coherent
  multi-step probabilistic forecasts.
- **Mechanism on a decentralised substrate.** The current
  implementation is centralised; the settlement algebra would
  translate to a smart-contract-style decentralised implementation,
  with additional latency and reporting-round concerns.

## 10.4 Closing

The skill layer is a small addition — one function per round — on top
of a well-understood mechanism. The value is not in the size of the
addition but in what it does not break. Budget balance, truthfulness
in Lambert's sense, sybil-proofness in Lambert's sense, and the
settlement algebra all survive. The price is a sub-percent CRPS
penalty relative to the best simple aggregator, which is paid for by
the economic structure.

If a reader remembers one sentence from this thesis, it should be
this: *the effective wager determines both influence and exposure,
and that single design choice is what lets online skill learning and
self-financed market discipline coexist*.
