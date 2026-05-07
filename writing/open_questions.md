# Open questions — running list

Things that need to be resolved before / during writing. Kept as a
checklist so nothing slips between the results and the manuscript.

## Waiting on runs

- [ ] **Sensitivity sweep with held-out split** (B3 fix, Open #2 in
  `onlinev2/outputs/post_fix_deltas/SUMMARY.md`,
  `scripts/run_sensitivity_sweep.py`). Need the chosen (γ, ρ, λ)
  values and the 2-D sensitivity heatmap. Updates Chapter 3.5,
  Appendix B, and T18.
- [ ] **Horizon runs re-run under expanding normalisation.** Current
  `day_ahead.json`, `4h_ahead.json`, `regime_shift.json` are static-
  mode. The body of §6.4 uses them; the thesis should flag this
  honestly or wait for the refresh.
- [ ] **`baselines.json` re-run under expanding normalisation** for
  both wind and electricity. Current Vitali OGD / Raja head-to-head
  numbers in §6.5 are static-mode.
- [ ] **Restart-per-season regime evaluation** (B13.8 follow-up
  spec).
- [ ] **Re-confirm recalibration numbers under expanding
  normalisation.** The recalibration chapter uses the 3000-point
  audit slice (static-mode), which is fine for the current write-up
  but worth re-running on the full-length expanding slice to confirm
  the 59% tail reduction transfers.

## Numbers to double-check against sources

- [x] Full-length wind mechanism CRPS 0.03788 — matches
  `dashboard/public/data/real_data/elia_wind/data/comparison.json`
  to 5 decimals.
- [x] Full-length wind DM t = 40.77, p ≈ 0 — matches the `dm_test`
  block in the same file.
- [x] Electricity DM t = 0.008, p = 0.994 — matches
  `onlinev2/outputs/post_fix_deltas/SUMMARY.md`.
- [x] Electricity mechanism CRPS 0.09052 — matches
  `dashboard/public/data/real_data/elia_electricity/data/comparison.json`.
- [x] Mechanism CRPS 0.01874 on 3000-point audit slice — matches
  `audit_fresh/data/comparison.json` to six decimals.
- [x] Ratio mechanism / michael_ogd = 1.003 (audit slice).
- [ ] DM statistic +15.92 on the 3000-point audit slice — still in
  THESIS_CLAIMS.md Claim 4 body; re-derive from the per-round series
  in comparison.json using `onlinev2/src/onlinev2/real_data/stats.py`
  at write-time and confirm.
- [x] Synthetic skill recovery σ values — match `skill_recovery/data/
  quantiles_crps_summary.csv` to 3 decimals.
- [x] Deposit policy comparison means — match
  `deposit_policy_comparison.csv` exactly (bankroll_conf = 0.03796,
  oracle_precision = 0.02271).
- [x] Weight rule comparison means — match
  `weight_rule_comparison.csv` exactly.
- [x] Bankroll ablation means — computed directly from
  `bankroll_ablation.csv` (20 seeds per variant).
- [ ] Sybil ratio 1.065 for diversified reports — still quoted from
  the dashboard pre-refactor preset. Verify against
  `onlinev2/outputs/core/experiments/sybil/` after the next re-run.
- [x] η default value — runner hardcodes `eta=2.0`, not the `η = 1`
  the original draft said. Fixed in `30_mechanism_design.md`.
- [x] `best_single` semantics — it is a 100-step rolling CRPS
  selector, not a per-round oracle. Fixed throughout.
- [x] Elia operational forecast MW-eq numbers — match
  `onlinev2/outputs/elia_forecast_baseline.json` (best_single 62.6,
  mechanism 76.2, Elia real-time 74.0).

## Conceptual points still to nail down

- [x] **Truthfulness under the skill gate.** The informal argument is
  "σ_i is fixed pre-round, so Lambert's proof applies with m_i in
  place of the original wager". Written out explicitly in §3.3.1
  (skill-gate truthfulness lemma, proof sketch), citing Gneiting
  and Raftery 2007 Thm 3 for strict consistency of the pinball
  score and spelling out the three deposit-mode cases. The subtlety
  about c_i depending on the current forecast is addressed: the
  code uses `deposit_mode="fixed"` on the real-data runner
  (`runner.py:387`), and when `deposit_mode="bankroll"` is used,
  `staking.py` explicitly warns that `c_t` must be lagged for the
  theorem to apply. Scope limit (risk neutrality) is kept.
- [ ] **Diversified-report sybil leakage.** Is ~6.5% the
  equilibrium leakage or just what the current preset produces? An
  attacker who diversifies optimally might extract more. Worth
  stating as a hard scope limit.
- [ ] **Scope of "online" in the truthfulness argument.** Lambert's
  proof is per-round. Does adding a multi-round EWMA change the
  truthfulness argument? Not in the per-round sense (the EWMA is
  frozen for round t), but over multiple rounds there is a lagged
  incentive: distorting round t's report to hurt a competitor's
  future σ. This is typically second-order but worth acknowledging.
- [ ] **Confidence proxy specification.** Right now c_i is described
  generically as "a function of quantile width". Write the exact
  formula (`core/staking.py`), including the c_min / c_max clipping
  and the lag.

## Bibliography entries to verify

- [ ] Chen et al. 2014 — need to confirm the exact venue from
  `research/arbitrage copy.pdf`. The paper title in our references is
  "Gaming Prediction Markets" and the current entry in
  `bibliography.md` §A says EC '13 — verify.
- [ ] Lambert et al. 2008 two entries: the EC '08 paper is
  `lambert2008selffinanced`; the elicitability paper is
  `lambert2008eliciting`. DOIs: `10.1145/1386790.1386820` and
  `10.1145/1386790.1386813`. Confirm the elicitability paper is
  actually the EC '08 companion (it is on the same EC '08 programme).

## Final-sweep checks

- [ ] Every numeric claim has a `[source: ...]` tag.
- [ ] Every paper cited appears in `bibliography.md`.
- [ ] Every figure referenced in prose is in `figures_and_tables.md`.
- [ ] `[PENDING]` markers are all resolved or the section is rewritten
  to not depend on the pending run.
- [ ] Match the voice against `THESIS_CLAIMS.md` — direct, source-
  linked, scope-honest.

## Housekeeping

- [ ] Decide: thesis in British or American spelling? Presentation
  uses British. Keep British.
- [ ] Decide: "mechanism" vs "market". Thesis uses "mechanism" when
  referring to the algorithmic object, "market" when referring to the
  economic framing. Keep consistent.
- [ ] Decide: "σ" or "sigma". Use σ in math mode, "sigma" in prose.
- [ ] Figure / table numbering restarts per chapter in the LaTeX
  template. This index uses global IDs (T1..T18, F1..F22) for
  convenience; the final thesis will show them as T5.1, F5.4, etc.
