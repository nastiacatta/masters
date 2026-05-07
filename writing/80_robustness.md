# Results — robustness

Status: **[LOCKED]**. All numbers in this chapter come from
`onlinev2/outputs/behaviour/experiments/ANALYSIS.md` and the per-
experiment summary CSVs under `onlinev2/outputs/behaviour/experiments/
*/data/`. The earlier "18-preset" narrative from
`dashboard/docs/MECHANISM_ANALYSIS.md` §7 used a legacy behaviour
catalogue that has been superseded by the adversary-focused rebuild
(ANALYSIS.md §4 explains the changes). All numbers below are from the
current committed run unless flagged.

## Adversary-focused framing

The behaviour suite has been rebuilt around named threat models from
the wagering-mechanism literature. Every adversary has a cited
theoretical basis, runs across ≥ 10 seeds, and emits a paired
`*_summary.csv` plus a plot.

Adversary archetypes in the current catalogue [source:
`onlinev2/outputs/behaviour/experiments/ANALYSIS.md` §1]:

| Archetype | Theory basis |
|---|---|
| arbitrage_seeking | Chen et al. 2014 Thm 3.3 (MAE analogue); Chun & Shachter 2011 |
| coordinated_group | Chun & Shachter 2011 coalition; Chen et al. 2014 §3 |
| strategic_influence | Corner solution of manipulation utility |
| strategic_reporter | Soft manipulator that mixes anchor + target |
| privileged_information | Lambert et al. 2008; Johnstone 2007 (insiders) |
| detector_aware | Adaptive evader tracking detector scores |
| wash_trader | Parimutuel wash / multi-account activity gaming |
| sybil_arbitrage | Sybilproofness audit combining split + arbitrage |

Every F_{t−1}-compliant attacker uses only `RoundPublicState`. The only
boundary-violating attacker is `privileged_information` in
`leaked_future` mode, which requires an explicit `allow_leakage=True`
and is treated as an audit check rather than a realistic adversary.

## Arbitrage scan (Chen et al. 2014)

Arbitrageur profit over 20 seeds, T = 1000, versus floor parameter λ
[source: `onlinev2/outputs/behaviour/experiments/arbitrage_scan/
data/arbitrage_scan_by_lam.csv`]:

| λ | Mean profit ± SE | 95% CI | Mean found-rounds |
|---:|---:|---|---:|
| 0.0 | +11.68 ± 1.14 | [+9.46, +13.91] | 774 |
| 0.1 | +13.40 ± 1.24 | [+10.97, +15.82] | 773 |
| 0.3 | +16.22 ± 1.40 | [+13.49, +18.96] | 770 |
| 0.5 | +19.07 ± 1.50 | [+16.13, +22.00] | 765 |
| 0.8 | +22.46 ± 1.77 | [+18.99, +25.93] | 758 |
| 1.0 | +24.22 ± 1.97 | [+20.36, +28.08] | 753 |

**Finding.** Arbitrage profit increases monotonically with λ, as Chen
et al. 2014 predict for the MAE analogue. The earlier write-up (based
on a broken arbitrageur implementation that never triggered) reported
zero profit; the fixed `arbitrage_seeking` behaviour uses the actual
weighted-median arbitrage point with an F_{t−1} snapshot and fires on
~77% of rounds.

**Crowd-size scaling (new experiment, T = 500, 10 seeds)** [source:
`arbitrage_crowd_size/data/arbitrage_crowd_size_summary.csv`]:

| λ | n = 4 | n = 8 | n = 16 | n = 32 |
|---|---:|---:|---:|---:|
| 0.0 | +2.50 ± 0.46 | +6.13 ± 0.82 | +13.51 ± 1.22 | +23.49 ± 1.71 |
| 0.5 | +4.89 ± 0.93 | +10.46 ± 1.09 | +22.49 ± 2.05 | +38.27 ± 2.63 |
| 1.0 | +7.20 ± 1.42 | (see CSV) | (see CSV) | (see CSV) |

Profit scales roughly linearly with crowd size. A lone arbitrageur in
32 benign agents extracts ~4× the profit of one in 4 benign agents at
the same λ — more disagreement means more wager pool to access.

## Collusion (Chun & Shachter 2011)

Three-member coalition, 20 seeds [source:
`collusion_stress/data/collusion_stress_summary.csv`]:

| Scenario | Mean coalition profit ± SE | 95% CI |
|---|---:|---|
| no_collusion | 0.00 ± 0.00 | [0, 0] |
| collusion_weighted_mean (Chun–Shachter) | +19.87 ± 2.32 | [+15.32, +24.41] |
| collusion_weighted_median | +16.86 ± 2.37 | [+12.22, +21.50] |

Both coalition variants extract strictly positive profit. The weighted-
mean variant is marginally better in expectation than the weighted-
median variant.

## Informed collusion (new)

Three insiders with AR(1) DGP, 10 seeds [source:
`informed_collusion/data/informed_collusion_summary.csv`]:

| Scenario | Mean coalition profit ± SE | 95% CI |
|---|---:|---|
| baseline | 0.00 ± 0.00 | [0, 0] |
| collusion_only (Chun–Shachter, truthful beliefs) | +24.12 ± 3.01 | [+18.21, +30.02] |
| informed_collusion (insider precision + Chun–Shachter) | +33.84 ± 2.41 | [+29.12, +38.56] |

Informed collusion compounds both attack vectors: Chun–Shachter
arbitrage from residual member disagreement *plus* each member's
privileged lagged signal. Combined profit (+33.84) exceeds pure
collusion (+24.12) by ~40%.

## Insider advantage (Lambert et al. 2008; Johnstone 2007)

AR(1) DGP with φ = 0.7, σ_eps = 0.18, 20 seeds [source:
`insider_advantage/data/insider_advantage_summary.csv`]:

| Scenario | Mean profit ± SE | 95% CI | Mean score |
|---|---:|---|---:|
| no_insider | 0.00 ± 0.00 | [0, 0] | 0.000 |
| insider_lagged (F_{t−1}, lag = 1, σ = 0.015) | **+57.14 ± 2.15** | [+52.93, +61.36] | 0.852 |
| insider_leaked (audit: reads y_t) | +63.98 ± 2.65 | [+58.78, +69.19] | 0.992 |

The legitimate lagged insider earns ~89% of the leaker's profit — the
cost of making the information boundary honest. The effect requires an
AR(1) DGP; under IID uniform y the lagged insider degenerates to a
truthful baseline.

## Sybil-proofness (Lambert et al. 2008)

Two separate audits.

### Sybil split with identical reports (`onlinev2/outputs/core/experiments/sybil/`)

[source: `onlinev2/outputs/core/experiments/sybil/summary.md`].

| Regime | Mean profit ratio | Max \|Δ\| |
|---|---:|---:|
| identical reports, conserved total wager | **1.000000** | 2.07e-17 |
| diversified reports (small ε-perturbation) | **1.065** | 1.03e-3 |
| strategic deposit manipulation (identical reports) | **1.000000** | 2.64e-17 |

The **narrow Lambert invariance holds** (ratio = 1.000000 with max
delta at floating-point noise). Diversified-report sybils break the
invariance by ~6.5% — Lambert's proof requires r_i = r_j, so this
is not a defect but an honest scope limitation.

### Sybil-arbitrage audit (combined with Chen et al. 2014)

Sybilproofness *for the arbitrage attack*, k clones fanning the
arbitrage behaviour with equal total stake, 20 paired seeds [source:
`sybil_arbitrage/data/sybil_arbitrage_summary.csv`]:

| k | Mean profit ± SE | 95% CI | Mean N_eff |
|---:|---:|---|---:|
| 1 | +13.01 ± 1.05 | [+10.96, +15.06] | 3.21 |
| 3 | +13.01 ± 1.05 | [+10.96, +15.06] | 5.05 |
| 5 | +13.01 ± 1.05 | [+10.96, +15.06] | 5.97 |

**Profit is invariant to k** (to within Monte-Carlo error). The
Lambert sybilproofness property carries over to the arbitrage attack:
splitting the arbitrageur into k identities with equal total stake
gives the same profit. N_eff inflates (which is an artefact of
counting identities, not influence) but has no payoff consequence.

## Wash trading / activity gaming (parimutuel wash)

10 seeds [source:
`wash_activity_gaming/data/wash_activity_gaming_summary.csv`,
inflation reported as ratio so 0.67 ≈ +67%]:

| Scenario | Inflation rate ± SE | Wash profit ± SE |
|---|---:|---:|
| no_wash | 0.00 ± 0.00 | 0.00 ± 0.00 |
| wash_k3_anchor | 0.67 ± 0.01 (≈ +67%) | +14.71 ± 1.36 |
| wash_k5_split | 1.12 ± 0.02 (≈ +112%) | −261.51 ± 2.71 |

**Anchor style** inflates activity cheaply (small positive profit +
60% inflation). **Split-bet style** inflates more but pays a large
score-rule cost — attackers are usually bankrupt by T = 1000.

## Strategic reporting frontier

Pull sweep towards target = 0.9, 20 seeds [source:
`strategic_reporting/data/strategic_reporting_summary.csv`]:

| Scenario | Δ r̂ vs baseline | Attacker profit ± SE |
|---|---:|---:|
| baseline_truthful | 0.000 ± 0.000 | 0.00 ± 0.00 |
| pull = 0.3 | +0.056 ± 0.004 | **+10.49 ± 2.29** |
| pull = 0.6 | +0.027 ± 0.003 | −9.81 ± 0.07 |
| pull = 1.0 | +0.011 ± 0.001 | −10.00 ± 1e-7 |

**Non-monotone frontier.** Gentle nudges (pull = 0.3) are *both*
profitable *and* most effective at shifting the aggregate report.
Aggressive pulls are self-defeating: σ collapses, the effective wager
goes to zero before the attacker can move r̂. The mechanism
automatically punishes extreme strategic reporting.

## Detection adaptation

20 seeds, online z-score detector, target μ = 0.2 against uniform-y
DGP [source:
`detection_adaptation/data/summary.json`]:

| Attacker | Mean profit ± SE | Detector score | Flag rate |
|---|---:|---:|---:|
| fixed_manipulator | −50.02 ± 0.003 | 0.490 | 0.111 |
| adaptive_evader | −49.78 ± 0.129 | 0.478 | 0.116 |

Both manipulators are **bankrupted** by the skill-weighting
mechanism. The adaptive evader's quiet-mode hedging marginally reduces
losses (+0.24) but cannot flip the sign. The result is decisive: on a
uniform-y DGP where the manipulator has no information edge, neither
fixed nor adaptive manipulation is economically viable.

## 8.9a Whitewashing / reputation reset (Feldman-Chuang 2004)

**Theory.** Feldman and Chuang (2004) catalogue the *whitewashing*
attack on reputation systems: a participant who has accumulated a
degraded reputation abandons the identity and re-joins as a newcomer.
In our skill layer this maps to an agent with a collapsed σ dropping
the current `account_id` and creating a new one, which the mechanism's
`default_initial_loss` restarts from the prior L0.

**Implementation.** `ReputationResetBehaviour` plays an aggressive
manipulation (target = 0.9) and tracks its cumulative profit. When
the profit falls below `reset_threshold`, it increments an identity
counter so the parent's next action carries a fresh
`account_id__reset_k` suffix. Cooldown and warmup parameters prevent
pathological churn and let fresh identities build a reputation stock
before manipulating.

**Result (5 seeds, T = 1000, κ = 0.05, warmup = 20, cooldown = 50)**
[source:
`outputs/behaviour/experiments/reputation_reset/data/reputation_reset_summary.csv`]:

| Scenario | Mean attacker profit ± SE | Mean resets |
|---|---:|---:|
| baseline | +0.00 ± 0.00 | 0.0 |
| manipulator_no_reset (fixed identity) | −20.00 ± 0.00 | 0.0 |
| reputation_reset (whitewashing) | **−3.49 ± 0.14** | 1.0 |

**Interpretation.** The whitewashing attack dramatically reduces the
attacker's loss. A fixed-identity manipulator bankrupts itself to
zero (−20 ≈ full loss of its initial wealth). A reset-capable
attacker abandons the collapsed identity after the first deep loss
and restarts from the prior, cutting its cumulative loss to −3.49.
The κ > 0 staleness decay partly discounts newcomers but does not
fully offset the whitewash. This is a real measurable vulnerability
that the current mechanism does not close.

**Mitigations not currently implemented:** a mandatory hold-out
period for new accounts (newcomer penalty — Feldman & Chuang 2004
Section 4), or proof-of-identity gating to make identity creation
costly.

## Headline invariants (ANALYSIS.md §3)

Invariants the adversary suite is expected to satisfy:

- `arbitrage_scan`: profit increases (weakly) with λ. ✓
- `arbitrage_crowd_size`: profit monotone in n_benign at fixed λ. ✓
- `collusion_stress`: coalition profit ≥ 0 at baseline; strictly
  positive for both weighted-mean / weighted-median variants. ✓
- `informed_collusion`: `informed_collusion` > `collusion_only` > 0
  under AR(1). ✓ (33.84 > 24.12 > 0).
- `insider_advantage`: `insider_leaked` > `insider_lagged` > 0 under
  AR(1). ✓ (63.98 > 57.14 > 0).
- `wash_activity_gaming`: inflation > 60% anchor, > 100% split; wash
  profit ≈ 0 anchor, strongly negative split. ✓
- `sybil_arbitrage`: profit invariant across k. ✓

All invariants hold on current code.

## Headline summary

What the mechanism does **well**:

- Sybil-proofness for identical reports holds to machine precision;
  extends to the arbitrage attack (k-invariance).
- Strategic reporting frontier is non-monotone: aggressive attacks
  are self-defeating because σ collapses.
- Fixed manipulators against a no-information DGP are bankrupted.
- Narrow strategic reporting (pull = 0.3) gives the attacker
  +10.49 profit (20 seeds, T = 1000) — the only profitable small-
  perturbation attack in the suite.

What the mechanism is **vulnerable to**:

- **Arbitrage.** Chen et al. 2014 arbitrage extracts +12 to +24 profit
  per 1000 rounds as λ scales. The skill gate does not eliminate
  arbitrage; it modestly constrains it.
- **Collusion.** Three-member coalition extracts +19.9 weighted-mean
  profit; informed collusion (AR(1) DGP) extracts +33.8. Neither is
  contained by the skill gate.
- **Insiders** with legitimate lagged signals under AR(1) extract
  +57.1 profit, about 89% of what a full leakage adversary gets.
- **Sybil splitting with diversified reports** breaks the Lambert
  narrow invariance by ~6.5%.
- **Wash trading (anchor style)** inflates activity and extracts small
  positive profit at modest cost.

What remains **open**:

- Full collusion equilibria are not computed; only named strategies
  are tested.
- Adaptive detection — the detector is a simple online z-score. A
  richer multi-feature detector would change both attack and defence
  curves.
- Participation-attack experiments (bursty, strategic absence,
  edge-threshold). The earlier narrative's "+934% bursty" number is
  from a legacy preset not present in the current adversary suite and
  should be regenerated before citing.

## Notes for the write-up

- Include the three headline tables: arbitrage_scan (§8.2),
  sybil-arbitrage audit (§8.6.2), and strategic reporting frontier
  (§8.8). These are the most consequential for the "does the
  mechanism survive strategic behaviour" question.
- Reference figures under `onlinev2/outputs/behaviour/experiments/
  */plots/` — one per experiment, all PNGs already rendered.
- Drop the legacy "18-preset" table from the earlier draft; the
  current adversary catalogue is 8 named archetypes with cited
  theory bases.
- The old `MECHANISM_ANALYSIS.md` §7 "critical threats" / "contained
  threats" / "beneficial" tripartite table is superseded.
