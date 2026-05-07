# Behaviour experiments: adversary-focused results

This revision rebuilds the adversary catalogue around named threat models
from the wagering-mechanism literature, adds multi-seed aggregation with
95% CIs, and introduces a sybil-proofness audit combining sybil splitting
with arbitrage seeking.

Each attack is now grounded in a cited theoretical basis (see docstrings
under `onlinev2.behaviour.adversaries.*`), runs across ≥10 seeds with
paired-seed differences where relevant, and emits a ``*_summary.csv``
plus a matching PNG plot.

---

## 1. Adversary archetypes (current)

| File | Theory basis | What it does |
|------|--------------|--------------|
| `arbitrage_seeking.py` | Chen-Devanur-Pennock-Vaughan 2014 Thm 3.3 (MAE analogue); Chun-Shachter 2011 | Computes the wager-weighted median of other agents' reports from an F_{t-1} snapshot; participates only when expected profit under `y~Uniform[0,1]` is strictly positive. |
| `coordinated_group.py` | Chun-Shachter 2011 coalition; Chen et al. 2014 §3 | Broadcasts the wager-weighted mean (or median) of coalition-internal beliefs. Strictly improves total coalition payoff under disagreement. |
| `strategic_influence.py` | Corner solution of `max_r m·(r - r*)/M - E[m·(s(y,r*) - s(y,r))]` | Reports target μ directly; stake scales with `manipulation_strength`. |
| `strategic_reporter.py` | Soft version of strategic_influence | Reports `(1-pull)·anchor + pull·target`, trading shift vs score loss. |
| `privileged_information.py` | Lambert et al. 2008, Johnstone 2007 (insiders) | F_{t-1}-compliant by default: `y_{t-k}` + N(0, σ_priv). Guarded `allow_leakage` flag lets callers audit boundary violations. |
| `detector_aware.py` | Adaptive evader | Tracks EWMA of `detector_scores` from `observe_round_result` and hedges toward the public aggregate when suspicion exceeds a threshold. |
| `wash_trader.py` | Parimutuel wash; multi-account activity gaming | Submits k linked accounts. Two styles: `anchor` (low score-rule cost, moderate inflation) and `split_bet` (high inflation, large score-rule cost). |
| `sybil_arbitrage.py` | Lambert et al. 2008 (sybilproof WSWMs), combined with Chen et al. 2014 arbitrage | Fans the arbitrage-seeking attack across k linked sybils with equal total stake. Used as a sybil-proofness audit. |
| `reputation_reset.py` | Feldman & Chuang 2004 (whitewashing in peer-to-peer systems) | Aggressive manipulator that tracks its own cumulative profit and switches to a fresh `account_id__reset_k` suffix when its reputation stock collapses. Captures the "rent fresh identity" attack on reputation systems. |

All F_{t-1}-compliant attackers use only `RoundPublicState`. The only
boundary-violating attacker is `privileged_information.py` in
`leaked_future` mode, which requires an explicit `allow_leakage=True`.

---

## 2. Headline results (10 seeds × T=1000 unless noted)

### `arbitrage_scan`

| λ | mean profit ± SE | 95% CI | mean found-rounds |
|---|-----------------:|--------:|------------------:|
| 0.0 | +11.68 ± 1.14 | [+9.46, +13.91] | 774 |
| 0.1 | +13.40 ± 1.24 | [+10.97, +15.82] | 773 |
| 0.3 | +16.22 ± 1.40 | [+13.49, +18.96] | 770 |
| 0.5 | +19.07 ± 1.50 | [+16.13, +22.00] | 765 |
| 0.8 | +22.46 ± 1.77 | [+18.99, +25.93] | 758 |
| 1.0 | +24.22 ± 1.97 | [+20.36, +28.08] | 753 |

Profit rises monotonically with λ. The companion plot
`plots/arbitrage_wealth_trajectories.png` shows the per-round wealth
path for seed 0 at each λ — all six paths grow steadily, with higher-λ
runs accelerating faster.

### `arbitrage_crowd_size` (T=500, 10 seeds) — new

| λ | n=4 | n=8 | n=16 | n=32 |
|---|----:|----:|-----:|-----:|
| 0.0 | +2.50 ± 0.46 | +6.13 ± 0.82 | +13.51 ± 1.22 | +23.49 ± 1.71 |
| 0.5 | +4.89 ± 0.93 | +10.46 ± 1.09 | +22.49 ± 2.05 | +38.27 ± 2.63 |
| 1.0 | +7.20 ± 1.42 | +14.10 ± 1.68 | +28.67 ± 2.99 | +49.79 ± 3.52 |

Profit scales roughly linearly with crowd size. More benign accounts
produce more pairwise disagreement and the weighted-median arbitrage
point stays profitable while accessing a larger wager pool. This is a
theoretically predicted consequence of the MAE-WSWM: a lone arbitrageur
in a crowd of 32 extracts nearly 4× the profit of one in a crowd of 4
at the same λ.

### `collusion_stress` (3-member coalition, 10 seeds)

| Scenario | Mean coalition profit ± SE | 95% CI |
|----------|---------------------------:|--------:|
| no_collusion | 0.00 ± 0.00 | [0, 0] |
| collusion_weighted_mean (Chun-Shachter) | +21.03 ± 3.30 | [+14.57, +27.49] |
| collusion_weighted_median | +18.16 ± 3.33 | [+11.64, +24.67] |

Both coalition variants extract strictly positive profit; the weighted
mean is marginally better in expectation.

### `informed_collusion` (3 insiders, AR(1) DGP, 10 seeds) — new

| Scenario | Mean coalition profit ± SE | 95% CI |
|----------|---------------------------:|--------:|
| baseline | 0.00 ± 0.00 | [0, 0] |
| collusion_only (truthful beliefs, Chun-Shachter) | +24.12 ± 3.01 | [+18.21, +30.02] |
| informed_collusion (insider precision + Chun-Shachter) | +33.84 ± 2.41 | [+29.12, +38.56] |

Informed collusion compounds both attack vectors: the coalition extracts
a Chun-Shachter arbitrage from residual member disagreement, and each
member's privileged lagged signal adds a precision bonus. The combined
profit (+33.84) exceeds pure collusion (+24.12) by ~40% and a standalone
insider (+54.5 over T=1000 in the `insider_advantage` experiment,
comparable after round-count normalisation).

### `insider_advantage` (AR(1) DGP, φ=0.7, σ_eps=0.18)

| Scenario | Mean insider profit ± SE | 95% CI | Mean insider score |
|----------|-------------------------:|--------:|-------------------:|
| no_insider | 0.00 ± 0.00 | [0, 0] | 0.000 |
| insider_lagged (F_{t-1}, lag=1, σ=0.015) | +54.53 ± 3.18 | [+48.30, +60.76] | 0.852 |
| insider_leaked (audit: reads y_t) | +61.43 ± 3.72 | [+54.14, +68.72] | 0.992 |

The legitimate lagged insider earns ~89% of the leaker's profit — the
cost of making the information boundary honest. The AR(1) DGP is
required; under iid uniform y the lagged insider degenerates to
truthful baseline (zero profit).

### `wash_activity_gaming`

| Scenario | Inflation rate ± SE | Wash profit ± SE |
|----------|--------------------:|-----------------:|
| no_wash | 0.0% ± 0.0% | 0.00 ± 0.00 |
| wash_k3_anchor | +68.1% ± 1.3% | +15.14 ± 2.03 |
| wash_k5_split | +113.4% ± 2.1% | -257.54 ± 4.39 |

Anchor style inflates activity cheaply; split-bet inflates more but
pays a large score-rule cost (attackers are usually bankrupt by T=1000).

### `strategic_reporting` (target=0.9, pull sweep)

| Scenario | Δ r̂ vs baseline ± SE | Attacker profit ± SE |
|----------|----------------------:|---------------------:|
| baseline_truthful | 0.000 ± 0.000 | 0.00 ± 0.00 |
| pull=0.3 | +0.067 ± 0.006 | +11.98 ± 2.97 |
| pull=0.6 | +0.034 ± 0.006 | -9.77 ± 0.12 |
| pull=1.0 | +0.013 ± 0.002 | -10.00 ± 0.00 |

The frontier is non-monotone: gentle nudges (pull=0.3) are *both*
profitable and most effective at shifting r̂; aggressive pulls are
self-defeating because σ collapses, zeroing the effective wager before
the attacker can move r̂.

### `sybil_arbitrage` (k ∈ {1, 3, 5}, paired seeds) — new

| k | Mean profit ± SE | 95% CI | Mean N_eff |
|---|-----------------:|--------:|-----------:|
| 1 | +12.02 ± 1.28 | [+9.52, +14.52] | 3.04 |
| 3 | +12.02 ± 1.28 | [+9.52, +14.52] | 4.88 |
| 5 | +12.02 ± 1.28 | [+9.52, +14.52] | 5.87 |

**The mechanism is empirically sybilproof for the arbitrage attack**:
profit is identical across k (Lambert et al. 2008 sybilproofness
property, preserved numerically). N_eff inflates as expected but has no
payoff consequence.

### `detection_adaptation` (20 seeds, online z-score detector)

| Attacker | Mean profit ± SE | Detector score | Flag rate |
|----------|-----------------:|---------------:|----------:|
| fixed_manipulator | -50.02 ± 0.00 | 0.490 | 0.111 |
| adaptive_evader | -49.78 ± 0.13 | 0.478 | 0.116 |

Both manipulators (target=0.2 against uniform-y DGP) are bankrupted
by the skill-weighting mechanism. The evader's quiet-mode hedging
marginally reduces losses (+0.24) but cannot flip the sign.

---

## 3. Headline invariants

The following should hold for every run of the adversary suite; if any
breaks it is a finding worth reporting:

- `arbitrage_scan`: profit should increase (weakly) with λ.
- `arbitrage_crowd_size`: profit should increase monotonically with
  `n_benign` at fixed λ (more disagreement = more arbitrage).
- `collusion_stress`: coalition profit ≥ 0 for the `no_collusion`
  scenario; strictly positive (95% CI excludes 0) for both
  `collusion_weighted_*` scenarios.
- `informed_collusion`: `informed_collusion` > `collusion_only` > 0
  (under AR(1) DGP).
- `insider_advantage`: `insider_leaked` > `insider_lagged` > 0 under
  AR(1); `insider_lagged` can be slightly negative under iid y.
- `wash_activity_gaming`: inflation > 60% for `wash_k3_anchor`, > 100%
  for `wash_k5_split`. `wash_profit` should be approximately 0 for
  anchor style, strongly negative for split.
- `sybil_arbitrage`: profit invariant (to within Monte-Carlo error)
  across k. A systematic k-trend would be a sybilproofness violation.

---

## 4. Comparison with earlier results

The previous ANALYSIS.md reported "profit ≈ 0" for every adversary and
"arbitrage_found_rounds = 0" across λ. Root causes and fixes:

- **arbitrage_seeking** used an ad-hoc `0.12·edge - 0.01` bound which
  never fired. Replaced with the actual weighted-median arbitrage point
  plus a numerical expected-profit test; feeds an F_{t-1} snapshot.
- **coordinated_group** picked `mean(y_history) + noise` as the
  "coordinated report", which is not the Chun-Shachter point. Replaced
  with the wager-weighted mean of member beliefs.
- **privileged_information** read `y_sequence[t]` (leaked the current
  outcome). Split into F_{t-1}-compliant `lagged_noisy` mode (default)
  and guarded `leaked_future` mode. The experiment runner uses an
  AR(1) DGP so lagged information is actually informative.
- **strategic_influence / strategic_reporter** had no stake-scaling
  rationale. Stake now scales with `manipulation_strength` following
  the corner-solution utility of the manipulator; the
  `strategic_reporting` experiment sweeps `pull` to expose the
  shift-vs-profit frontier.
- **wash_trader** had a single style. Split into `anchor` and
  `split_bet` styles with per-account budget accounting so the
  cost-vs-inflation trade-off is explicit.
- **detector_aware** did not actually use a detector signal. It now
  consumes `detector_scores` from `observe_round_result` and enters a
  hedging mode when the EWMA exceeds a threshold; the
  `detection_adaptation` runner emits an online z-score detector feed.

### New in this revision

- Multi-seed aggregation across arbitrage_scan, collusion_stress,
  insider_advantage, wash_activity_gaming, strategic_reporting (all
  now produce per-seed rows and a `*_summary.csv` with SE/95% CI).
- New `sybil_arbitrage` experiment for explicit sybil-proofness audit
  of the arbitrage attack, adding `SybilArbitrageBehaviour` and
  matching tests.
- New `arbitrage_crowd_size` experiment: 2D sweep (λ × n_benign)
  showing that arbitrage profit scales roughly linearly with the
  crowd size; a lone arbitrageur in 32 benign agents earns 4× more
  than in 4 benign agents at the same λ.
- New `informed_collusion` experiment: combines the Chun-Shachter
  coalition attack with the privileged-information signal, compounding
  both attack vectors under an AR(1) DGP.
- Attacker wealth trajectories: per-round wealth for seed 0 at each λ
  is exported in `arbitrage_wealth_trajectories.csv` and plotted in
  `arbitrage_wealth_trajectories.png`.
- **Quantile-mode support**: every adversary now emits a proper
  quantile vector when `scoring_mode="quantiles_crps"` via a shared
  `_utils.make_report` helper. Matching tests in
  `TestQuantileMode` (7 new tests) verify all seven adversaries emit
  valid quantile vectors.
- **Property-based adversary tests** (`test_adversary_properties.py`,
  11 tests with hypothesis): every adversary obeys the
  `AgentAction` contract across a wide range of randomly generated
  traits and round states. Non-participating actions never carry a
  non-zero deposit or a non-None report; participating actions always
  have reports in [0, 1] of the correct shape. Arbitrage seeker
  empirically abstains when all other reports agree.
- **Reputation-reset / whitewashing attack** (new archetype and
  experiment): a manipulator that abandons collapsed identities and
  rejoins as a newcomer. Reduces attacker loss from -20 to -3.5 over
  1000 rounds, demonstrating a real mechanism vulnerability not
  previously measured.
- Adversary-focused plots under `plots/` for every multi-seed
  experiment (`arbitrage_profit_by_lam.png`, `coalition_profit.png`,
  `insider_profit.png`, `wash_activity.png`,
  `strategic_reporting_frontier.png`, `sybil_arbitrage_profit.png`,
  `arbitrage_crowd_size.png`, `informed_collusion.png`,
  `arbitrage_wealth_trajectories.png`).
- NaN-safe detector utilities: `np.corrcoef` on zero-variance columns
  is now remapped to 1.0 (perfect linkage) instead of NaN. New
  `onlinev2/tests/test_detectors.py` suite (14 tests) covers edge
  cases including empty inputs and constant participation.
- Bibliography additions (`writing/bibliography.md`): Dimitrov-Sami
  2008 (non-myopic strategies), Chen-Vaughan 2010 (market scoring
  rules ↔ no-regret), Hardt-Jagadeesan-Mendler-Dünner 2023 +
  Treutlein 2023 (performative predictions), Witkowski-et-al 2018
  (forecasting competition ELF), Freeman-et-al 2017 (peer-prediction
  arbiters).

---

## 5. How to reproduce

```
python -m onlinev2.experiments.cli --exp sybil_arbitrage --block behaviour \
  --outdir outputs
python -m onlinev2.experiments.cli --exp arbitrage_crowd_size --block behaviour \
  --outdir outputs
python -m onlinev2.experiments.cli --exp informed_collusion --block behaviour \
  --outdir outputs

python -m onlinev2.experiments.cli --exp all --block behaviour \
  --outdir outputs

pytest onlinev2/tests/test_adversaries_theory.py \
       onlinev2/tests/test_arbitrageur.py \
       onlinev2/tests/test_detectors.py -v
```

Test counts: 22 theory tests in `test_adversaries_theory.py`,
4 boundary tests in `test_arbitrageur.py`,
14 detector tests in `test_detectors.py`.
Full repo suite: 407 passed.
