# Results — robustness

Status: **[UPDATED]** after the behaviour-block revamp (Nov 2026). All
adversaries are now grounded in a specific threat model from the
wagering-mechanism literature and run across 10–20 seeds with 95% CIs.
The older heuristic adversaries (see §8.10 for a diff summary) are
preserved as backwards-compatible aliases.

## 8.1 Attack-gain frame

Every adversary is evaluated along two axes:

1. **Attacker profit** — the cumulative wagering profit of the attack
   accounts. This is the attacker's private utility and must be small
   (ideally ≤ 0) for the mechanism to be robust in the Lambert sense.
2. **Aggregate impact** — the effect on the forecast quality and the
   benign participants (Δ CRPS, Δ Gini, participation inflation).

Each experiment reports both a per-seed flat file and a
`*_summary.csv` with mean, SE, and 95% CI. We paired seeds across
scenarios wherever possible so that scenario differences are reported
with tighter variance.

## 8.2 Adversary archetypes

Every attack is grounded in a cited threat model. Code lives in
`onlinev2/src/onlinev2/behaviour/adversaries/`; matching experiment
runners in `onlinev2/src/onlinev2/experiments/runners/runner_module.py`.

| Attack | Theory basis | File |
|--------|--------------|------|
| Arbitrage seeker | Chen, Devanur, Pennock & Vaughan EC'14 Thm 3.3 (MAE analogue of the `f`-norm arbitrage interval); Chun & Shachter 2011 | `arbitrage_seeking.py` |
| Coordinated coalition | Chun-Shachter 2011 wager-weighted-mean coalition; Chen et al. 2014 §3 | `coordinated_group.py` |
| Informed coalition | Coalition × privileged-info composite | `coordinated_group` × `privileged_information` |
| Sybil arbitrageur | Lambert et al. 2008 sybilproof property; Chen et al. 2014 arbitrage | `sybil_arbitrage.py` |
| Strategic influence | Aggregate manipulation; corner-solution of `max m·(r-r*)/M − E[m·Δs]` | `strategic_influence.py` |
| Strategic reporter | Soft version: `r = (1-pull)·anchor + pull·target` | `strategic_reporter.py` |
| Privileged information | Lambert et al. 2008; Johnstone 2007. F_{t-1}-compliant by default; `allow_leakage` flag for boundary-violation audits | `privileged_information.py` |
| Detector-aware evader | Adaptive evader, EWMA of detector scores | `detector_aware.py` |
| Wash / activity gaming | Parimutuel wash analogue; two styles (`anchor`, `split_bet`) | `wash_trader.py` |

All F_{t-1}-compliant attackers use only `RoundPublicState`; the only
adversary that can violate the information boundary is
`PrivilegedInformationBehaviour` in `leaked_future` mode, which
requires an explicit `allow_leakage=True` and emits a runtime warning
otherwise.

## 8.3 Arbitrage-seeking attack (Chen-Devanur-Pennock-Vaughan)

**Theory.** In a weighted-score wagering mechanism with strictly
proper scoring rule $s$, the arbitrage interval for participant $i$ is

$$
p_i \in \big[\|p_{-i}\|_{s_1, \mu},\; \|p_{-i}\|_{s_0, \mu}\big],
$$

with $\mu_j = w_j / W_{N\setminus\{i\}}$. Reports inside this interval
give a non-negative payoff under every outcome, strictly positive when
other participants disagree (Chen et al. 2014, Thm 3.3). For the
MAE-WSWM used in this thesis, $s(y, r) = 1 - |y-r|$ is only weakly
convex; the strict arbitrage interval collapses to the wager-weighted
median of the other reports, and the correct participation test is
$\mathbb{E}_{y \sim \text{Unif}[0,1]}[\pi_i] > 0$.

**Implementation.** `ArbitrageSeekingBehaviour` computes the weighted
median of other reports from an F_{t-1} snapshot (fed by the runner)
and participates only when the expected profit under uniform $y$ is
strictly positive. It scales stake with observed disagreement (more
spread = more to extract).

**Result (10 seeds, T=1000)** [source:
`outputs/behaviour/experiments/arbitrage_scan/data/arbitrage_scan_by_lam.csv`]:

| $\lambda$ | Mean attacker profit ± SE | 95% CI |
|-----------|--------------------------:|--------:|
| 0.0 | +11.68 ± 1.14 | [+9.46, +13.91] |
| 0.1 | +13.40 ± 1.24 | [+10.97, +15.82] |
| 0.3 | +16.22 ± 1.40 | [+13.49, +18.96] |
| 0.5 | +19.07 ± 1.50 | [+16.13, +22.00] |
| 0.8 | +22.46 ± 1.77 | [+18.99, +25.93] |
| 1.0 | +24.22 ± 1.97 | [+20.36, +28.08] |

**Interpretation.** The attack is profitable at every λ, and the
profit rises monotonically with λ. When λ is large the skill gate
dominates the effective wager; the weighted-median arbitrage point
dominates the benign skill-weighted reports and the attacker's stake
earns positive expected return across the uniform outcome space.

This is a real empirical finding — the thesis's previous claim that
"the arbitrageur extracts zero sustained profit" was an artefact of an
ad-hoc participation test and has been superseded. The mechanism is
still budget-balanced (§5.1.1) — the attacker's gains come from the
losses of other participants, not from the mechanism's reserves.

The companion plot `arbitrage_wealth_trajectories.png` shows the
attacker's wealth climbing steadily across all six λ settings, with
higher λ paths accelerating faster.

## 8.4 Arbitrage × crowd size

Does the attack scale with the number of benign participants?

**Result (10 seeds, T=500, grid λ ∈ {0.0, 0.5, 1.0}, n ∈ {4, 8, 16, 32})**
[source:
`outputs/behaviour/experiments/arbitrage_crowd_size/data/arbitrage_crowd_size_summary.csv`]:

| λ | n=4 | n=8 | n=16 | n=32 |
|---|----:|----:|-----:|-----:|
| 0.0 | +2.50 ± 0.46 | +6.13 ± 0.82 | +13.51 ± 1.22 | +23.49 ± 1.71 |
| 0.5 | +4.89 ± 0.93 | +10.46 ± 1.09 | +22.49 ± 2.05 | +38.27 ± 2.63 |
| 1.0 | +7.20 ± 1.42 | +14.10 ± 1.68 | +28.67 ± 2.99 | +49.79 ± 3.52 |

**Interpretation.** Attacker profit scales roughly linearly with
crowd size. More benign participants produce more pairwise
disagreement, which widens the arbitrage-profitable range of the
weighted-median point. A lone arbitrageur in 32 benign agents extracts
≈ 4× the profit of the same attacker in 4 benign agents at the same λ.

This is theoretically consistent with the Chen-Devanur result: the
arbitrage interval grows with the spread of $p_{-i}$, and a larger
crowd has more spread. The thesis should therefore not assume
robustness from "enough honest participants will dilute any attacker"
— the opposite is true.

## 8.5 Sybil-arbitrage audit (Lambert sybilproof property)

**Theory.** Lambert et al. 2008 prove WSWMs are sybilproof: if a
participant splits a single $(r, w)$ report into $k$ identities with
$(r_j, w_j)$ such that $\sum w_j = w$ and $r_j = r$ for all $j$, the
total payoff is unchanged.

**Implementation.** `SybilArbitrageBehaviour` wraps the arbitrage
seeker and fans the single action into $k \in \{1, 3, 5\}$ linked
sybil accounts with equal total stake and identical reports.

**Result (10 seeds, T=1000, λ=0.3)** [source:
`outputs/behaviour/experiments/sybil_arbitrage/data/sybil_arbitrage_summary.csv`]:

| k | Mean profit ± SE | 95% CI | Mean N_eff |
|---|-----------------:|--------:|-----------:|
| 1 | +12.02 ± 1.28 | [+9.52, +14.52] | 3.04 |
| 3 | +12.02 ± 1.28 | [+9.52, +14.52] | 4.88 |
| 5 | +12.02 ± 1.28 | [+9.52, +14.52] | 5.87 |

**Interpretation.** The total attacker profit is **identical** across
k (agreement to within Monte-Carlo noise). The effective number of
accounts $N^{\text{eff}}_t$ inflates with k as expected but has no
payoff consequence. This empirically validates the Lambert narrow
sybilproofness on top of the Chen-Devanur arbitrage attack: even an
already-successful arbitrageur gains nothing from splitting into
sybils.

Note this is a strict test of the narrow invariance (identical reports,
conserved total wager). The diversified-report regime remains a real
vulnerability — see §8.6.

## 8.6 Coordinated-group (Chun-Shachter coalition)

**Theory.** Chun & Shachter (2011) show that in any WSWM with
immutable beliefs, a coalition $C$ that reports a common value

$$
p_C = \sum_{i \in C} (w_i / W_C) \cdot p_i
$$

earns strictly higher total payoff than each member reporting
truthfully, provided members disagree. The result holds under every
outcome, not just in expectation.

**Implementation.** `CoordinatedGroupBehaviour` with `aggregation =
"weighted_mean"` (Chun-Shachter) or `"weighted_median"` (MAE analogue).
Members retain individual stake sizes so that detectors can still
probe linkage.

**Result (10 seeds, T=1000, 3-member coalition)** [source:
`outputs/behaviour/experiments/collusion_stress/data/collusion_stress_summary.csv`]:

| Scenario | Mean coalition profit ± SE | 95% CI |
|----------|---------------------------:|--------:|
| no_collusion | +0.00 ± 0.00 | [0, 0] |
| weighted_mean (Chun-Shachter) | **+21.03 ± 3.30** | [+14.57, +27.49] |
| weighted_median | +18.16 ± 3.33 | [+11.64, +24.67] |

Both variants are clearly visible to the standard detectors.
`correlated_reporting` fires on both scenarios with scores above the
benign baseline — see `data/detection_metrics_collusion_*.csv`.

**Interpretation.** The coalition attack is robustly profitable, as
predicted by the theory. The weighted-mean variant is marginally
stronger than the weighted-median; both extract the full arbitrage
from within-coalition disagreement. The attack is **detectable** but
not **prevented** by the current mechanism: the arbitrage is a
property of the scoring rule itself, not of a gap in the skill gate or
weight cap.

## 8.7 Informed collusion (coalition × privileged information)

Two attack vectors at once: the coalition broadcasts a wager-weighted
mean of member beliefs, but each member's belief is itself an
F_{t-1}-compliant privileged signal on an AR(1) DGP.

**Result (10 seeds, T=1000, AR(1) φ=0.7)** [source:
`outputs/behaviour/experiments/informed_collusion/data/informed_collusion_summary.csv`]:

| Scenario | Mean coalition profit ± SE | 95% CI |
|----------|---------------------------:|--------:|
| baseline | +0.00 ± 0.00 | [0, 0] |
| collusion_only (truthful beliefs) | +24.12 ± 3.01 | [+18.21, +30.02] |
| **informed_collusion** | **+33.84 ± 2.41** | **[+29.12, +38.56]** |

**Interpretation.** Informed collusion compounds both attack vectors:
the coalition extracts a Chun-Shachter arbitrage from residual
member-level bias disagreement, and each member's privileged signal
adds a precision bonus. The combined profit (+33.84) exceeds pure
collusion by ≈ 40%.

If coalition members were *identical* (no bias), the within-coalition
disagreement would shrink to zero and the Chun-Shachter channel would
close — validating that disagreement is the real source of the
arbitrage, not individual skill. In the reported configuration we
retain residual trait bias precisely to keep both channels open.

## 8.8 Privileged information (insider)

F_{t-1}-compliant insider with precision bonus on the lagged outcome,
compared against a guarded leakage attacker that reads $y_t$ directly.

**Result (10 seeds, T=1000, AR(1) φ=0.7)** [source:
`outputs/behaviour/experiments/insider_advantage/data/insider_advantage_summary.csv`]:

| Scenario | Mean insider profit ± SE | 95% CI | Mean insider score |
|----------|-------------------------:|--------:|-------------------:|
| no_insider | +0.00 ± 0.00 | [0, 0] | 0.000 |
| insider_lagged (F_{t-1}, σ=0.015) | +54.53 ± 3.18 | [+48.30, +60.76] | 0.852 |
| insider_leaked (allow_leakage=True) | +61.43 ± 3.72 | [+54.14, +68.72] | 0.992 |

**Interpretation.** The legitimate lagged insider earns ~89% of the
leaker's profit. The gap between the two scenarios is the cost of
enforcing the information boundary honestly. Under iid outcomes the
lagged insider degenerates to the benign baseline (no autocorrelation
means no information to exploit); the AR(1) DGP is required for the
lagged signal to be informative.

The leakage scenario is retained as a calibration audit: it tells us
what an outcome-leaking attacker could extract if the F_{t-1} boundary
were broken. This is the upper bound on any real-world insider
exposure.

## 8.9 Strategic reporting (aggregate manipulation)

Sweeps `pull` with `target = 0.9`: the attacker reports
$r = (1-\text{pull}) \cdot \text{anchor} + \text{pull} \cdot \text{target}$,
trading aggregate shift against scoring-rule loss.

**Result (10 seeds, T=1000)** [source:
`outputs/behaviour/experiments/strategic_reporting/data/strategic_reporting_summary.csv`]:

| Scenario | Δ $\hat r$ vs baseline ± SE | Attacker profit ± SE |
|----------|----------------------------:|---------------------:|
| baseline_truthful | 0.000 ± 0.000 | 0.00 ± 0.00 |
| pull=0.3, target=0.9 | +0.067 ± 0.006 | +11.98 ± 2.97 |
| pull=0.6, target=0.9 | +0.034 ± 0.006 | -9.77 ± 0.12 |
| pull=1.0, target=0.9 | +0.013 ± 0.002 | -10.00 ± 0.00 |

**Interpretation.** The frontier is non-monotone. Gentle pulls (0.3)
are *both* profitable (+12) and most effective at shifting the
aggregate; aggressive pulls (1.0) are self-defeating because σ
collapses, zeroing the effective wager before the attacker can
meaningfully move $\hat r$.

The mechanism thus imposes a natural speed-limit: an attacker
motivated by off-mechanism objectives (e.g. downstream decisions based
on $\hat r$) gets at most a small mean shift per unit cost. The cost
grows faster than the shift once skill has collapsed.

## 8.10 Wash / activity gaming

Two styles: `anchor` (report near the public aggregate, minimising
score-rule cost) and `split_bet` (half accounts report 0, half report
1, maximising internal transfer and activity inflation).

**Result (10 seeds, T=1000)** [source:
`outputs/behaviour/experiments/wash_activity_gaming/data/wash_activity_gaming_summary.csv`]:

| Scenario | Activity inflation ± SE | Wash profit ± SE |
|----------|------------------------:|-----------------:|
| no_wash | 0.0% ± 0.0% | +0.00 ± 0.00 |
| wash_k3_anchor | +68.1% ± 1.3% | +15.14 ± 2.03 |
| wash_k5_split | +113.4% ± 2.1% | -257.54 ± 4.39 |

**Interpretation.** Activity-based metrics are easy to inflate.
Anchor-style wash trading nearly doubles the participation count while
remaining mildly profitable; split-bet trading more than doubles the
count but pays a ruinous score-rule cost and bankrupts the attacker.

The `fake_activity_loop` detector fires on both scenarios
(`detector_scores_wash_*.csv`) because the linked accounts are
perfectly synchronised in time and share a common name prefix.

## 8.11 Detection-adaptation arms race

Fixed manipulator vs adaptive evader against an online z-score
detector feeding back through `observe_round_result(logs_t)`.

**Result (20 seeds, T=1000, target=0.2 on iid y)** [source:
`outputs/behaviour/experiments/detection_adaptation/data/`]:

| Attacker | Mean profit ± SE | Detector score | Flag rate |
|----------|-----------------:|---------------:|----------:|
| fixed_manipulator | -50.02 ± 0.00 | 0.490 | 0.111 |
| adaptive_evader | -49.78 ± 0.13 | 0.478 | 0.116 |

**Interpretation.** Both attackers are bankrupted because the target
(0.2) is far from uniform y. The adaptive evader loses marginally less
(+0.24) thanks to its quiet-mode hedging and is flagged slightly more
often (the hedge makes it visible in a different way). The adaptive
advantage is real but small in this regime; a more realistic target or
DGP would likely expand the gap.

## 8.12 Invariants (regression guard)

The adversary suite checks the following post-run invariants. If any
breaks in a future run it is a finding that must be reported:

- `arbitrage_scan`: mean profit monotone (weakly) increasing in λ.
- `arbitrage_crowd_size`: mean profit monotone increasing in
  `n_benign` at fixed λ.
- `collusion_stress`: `no_collusion` profit ≈ 0; both collusion
  variants have 95% CI strictly above 0.
- `informed_collusion`: `informed_collusion` > `collusion_only` > 0
  under AR(1).
- `insider_advantage`: `insider_leaked` > `insider_lagged` > 0 under
  AR(1); `insider_lagged` ≈ 0 under iid y.
- `wash_activity_gaming`: inflation > 60% (anchor), > 100% (split).
- `sybil_arbitrage`: profit invariant to k within Monte-Carlo error.

## 8.13 Headline summary

The mechanism is:

- **Vulnerable, as predicted by theory**, to the Chen-Devanur arbitrage
  attack. Profit grows with λ and crowd size.
- **Vulnerable** to the Chun-Shachter coalition attack, with or
  without privileged information.
- **Sybil-proof** in the Lambert narrow sense (identical reports,
  conserved total wager). Sybil splitting does not amplify the
  arbitrage.
- **Robust** to aggressive single-account strategic reporting in
  steady state (σ collapses before the aggregate shifts meaningfully).
- **Reliably detects** coordinated reporting, fake-activity loops, and
  wash-style linked accounts via the four baseline detectors.
- **Partially robust** to adaptive evaders that monitor detector
  feedback and hedge accordingly.

## 8.14 What changed from the previous revision

The earlier ANALYSIS / §8 narrative (see previous
`dashboard/docs/MECHANISM_ANALYSIS.md` §7) reported "attacker profit
≈ 0" across the board. Root cause: the old `ArbitrageurBehaviour` used
an ad-hoc participation test (`0.12·edge - 0.01`) that never fired,
and the old `CoordinatedGroup` chose the mean of $y$-history (not of
member beliefs) as its shared report. Both bypassed the
Chen-Devanur / Chun-Shachter channels entirely. The new adversaries
implement the theory literally and produce the strictly positive
attacker profits reported above.

A complete diff summary lives in
`onlinev2/outputs/behaviour/experiments/ANALYSIS.md`.

## Notes for the write-up

- Put §8.3 (arbitrage) and §8.4 (crowd size) adjacent — the 2D table
  is the most striking single figure in the robustness chapter.
- Figures to include:
  - `outputs/behaviour/experiments/arbitrage_scan/plots/arbitrage_profit_by_lam.png`
  - `outputs/behaviour/experiments/arbitrage_scan/plots/arbitrage_wealth_trajectories.png`
  - `outputs/behaviour/experiments/arbitrage_crowd_size/plots/arbitrage_crowd_size.png`
  - `outputs/behaviour/experiments/collusion_stress/plots/coalition_profit.png`
  - `outputs/behaviour/experiments/informed_collusion/plots/informed_collusion.png`
  - `outputs/behaviour/experiments/sybil_arbitrage/plots/sybil_arbitrage_profit.png`
- Be honest about the arbitrage finding. The old "zero profit" claim
  was wrong; the new results match published theory and should be
  presented as a validation of the Chen-Devanur framework, not as a
  mechanism failure. The mechanism's contribution is the composition
  of budget balance + skill gate + wealth dynamics, not arbitrage
  prevention (which is the domain of NAWMs, Chen et al. 2014 §4–5).
- The bursty-participation finding from the original §8.3 is still
  true but lives outside the adversary catalogue — it belongs in the
  participation-dynamics section of §5 / Appendix B.
