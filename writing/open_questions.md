# Open questions — running list

Things that need to be resolved before / during writing. Kept as a
checklist so nothing slips between the results and the manuscript.

## Waiting on runs

- [ ] **Sensitivity sweep with held-out split** (B3 fix, Open #2 in
  `onlinev2/outputs/post_fix_deltas/SUMMARY.md`,
  `scripts/run_sensitivity_sweep.py`). Need the chosen (γ, ρ, λ)
  values and the 2-D sensitivity heatmap. Updates Chapter 3.5,
  Appendix B, and T18.
- [ ] **Full-pipeline re-run with `causal_normalize_expanding`** (Open #1
  in the post-fix SUMMARY). The current warmup-window normalisation
  clips ~33% of Elia wind evaluation observations to 0 or 1. Switching
  to the expanding variant will change absolute CRPS magnitudes
  without changing the comparative direction of any result.
- [ ] **Dashboard adapter rename** (Open #4) for `online_window_mean`,
  `online_block_mean`, `michael_ogd_centered_median_fan`.
- [ ] **Full 6.6 block-level summary table** once the renamed keys are
  extracted into a clean Markdown form.
- [ ] **Restart-per-season regime evaluation** (B13 follow-up spec). T17
  appendix.
- [ ] **Bankroll pipeline ablation re-run** under post-audit pipeline.
  T5. Numbers from the presentation slide are pre-audit.

## Numbers to double-check against sources

- [x] Mechanism CRPS 0.01874 on 3000-point audit slice — matches
  `comparison.json` to six decimals (0.01874371688219978).
- [x] Ratio mechanism / michael_ogd = 1.003 — 0.01874 / 0.01869 =
  1.0027 (4sf). Round to 1.003 in the thesis; state exact value in T6.
- [ ] DM statistic +15.92 on mechanism vs uniform (audit slice) —
  sourced from THESIS_CLAIMS.md Claim 4 body. Re-derive from the
  per-round crps series in comparison.json at write-time using
  `onlinev2/src/onlinev2/real_data/stats.py` so the SE is reproducible.
- [ ] DM statistic +13.95 on mechanism vs uniform (17 344-hour post-fix
  run). Same re-derivation at write-time.
- [ ] Synthetic skill recovery T = 20000, 6 forecasters — confirm
  this matches the current runner default, not a legacy number.
  Presentation slide 12 quotes σ_5 = 0.820 but the committed
  `skill_recovery` experiment may have slightly different settings.
- [ ] Sybil ratio 1.065 for diversified reports — confirm this is from
  the current dashboard preset, not the pre-refactor version.
- [x] η default value — runner hardcodes `eta=2.0`, not the `η = 1`
  the original draft said. Fixed in `30_mechanism_design.md`.
- [x] `best_single` semantics — it is a 100-step rolling CRPS
  selector, not a per-round oracle. Fixed in
  `60_results_real_data.md` §6.1.1; `oracle` is the per-round
  hindsight row.

## Conceptual points still to nail down

- [ ] **Truthfulness under the skill gate.** The informal argument is
  "σ_i is fixed pre-round, so Lambert's proof applies with m_i in
  place of the original wager". Write this out explicitly in
  Appendix A with the algebraic substitution. There is a subtlety:
  if the deposit b_i depends on the participant's own forecast (via
  the confidence proxy c_i), then even a pre-round σ_i does not
  save truthfulness because the forecast still affects m_i. The fix
  is to use a *lagged* confidence proxy (c_i derived from the
  previous round's forecast width). Confirm this is what the code
  does; if not, flag and fix, or document as a limitation.
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
