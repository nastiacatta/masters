# Results — robustness

Status: **[LOCKED]** on committed behaviour outputs (current
`dashboard/docs/MECHANISM_ANALYSIS.md` §7 is the source of truth for
these numbers); a final pass re-running the presets against the
post-audit pipeline is [PENDING]. Update this chapter once that run
lands; the pattern of results should stay stable but individual Δ CRPS
values may shift by a percentage point or two.

## 8.1 Attack-gain frame

Every behaviour preset is evaluated against the same benign baseline
(honest forecasters, same panel, same seeds). The metric is Δ CRPS of
the aggregate forecast when the attack is present vs when it is not —
this is the attack gain, which is what matters for the mechanism's
robustness claim. We also track attacker weight share and concentration
measures (Gini, HHI, N_eff) to quantify the collateral cost of defences.

This framing follows the rung-4 protocol in `NEXT_STEPS.md`.

## 8.2 Taxonomy — 18 behaviour presets

Full list in `dashboard/docs/BEHAVIOUR_COVERAGE.md`. Grouped by family:

- **Honest variants:** honest, noisy reporter, risk-averse, bias,
  miscalibrated.
- **Identity attacks:** sybil (identical reports), sybil (diversified
  reports), strategic deposit manipulation.
- **Wealth attacks:** arbitrageur, kelly sizer, wash-trader.
- **Reputation attacks:** reputation gamer, reputation reset,
  sandbagger.
- **Strategic reporting:** manipulator, evader, insider, collusion,
  latency exploiter.
- **Participation attacks:** bursty (strategic absence), budget-
  constrained, house-money, rug.

## 8.3 Critical threats (Δ CRPS > 10%)

[source: `dashboard/docs/MECHANISM_ANALYSIS.md` §7]

| Preset | Δ CRPS | Mechanism of attack | Mechanism response |
|---|---:|---|---|
| Bursty (54% attendance) | +934% | Missing agents = missing information | Staleness decay caps influence of on-off reputation |
| Reputation gamer | +28% | Aggregate anchoring inflates σ | No full defence; EWMA of loss tracks eventually |
| Sandbagger | +22% | Deliberate noise in quantile forecasts | σ degrades, but propagates into aggregate before it does |
| Noisy reporter | +18% | Random noise propagates to aggregate | σ reduces weight within ~7 rounds |
| Bias | +17% | Persistent directional bias | σ reduces weight; recalibration layer partly corrects |
| Kelly sizing | +14% | Overconfident staking amplifies errors | Wealth dynamics correct slowly (pipeline step E) |
| Miscalibrated | +13% | Overconfidence distorts quantile spread | Not detected by CRPS-based σ directly |
| Sybil (diversified reports) | +10% | Identity splitting with heterogeneous reports | Invariance broken (see 8.5) |

**Dominant vulnerability.** Participation, specifically the bursty
preset with 54% attendance, inflates aggregate CRPS by ~10×. Missing
forecasters directly reduce the quality of the aggregate; no weighting
rule can recover information that is not there. The mitigation is
κ > 0 staleness decay, which makes strategic absence costly for the
absent agent's future earnings but does not help the current round.

**Quantile-level attacks are systematically worse than point-level
attacks.** The EWMA tracks aggregate CRPS-hat, which averages pinball
losses across the quantile grid. A strategy that distorts a single τ
level (bias, noise) hides in the average and is detected slowly. A
strategy that distorts the point forecast (manipulator) shifts all
quantiles uniformly and is detected fast.

## 8.4 Contained threats (Δ CRPS < 2%)

| Preset | Δ CRPS | Why contained |
|---|---:|---|
| Reputation reset | +1.3% | Build-then-exploit caught by EWMA after reset |
| Risk-averse | +1.3% | Hedged reports lose informativeness but the σ gate pulls their weight down |
| Manipulator | +1.1% | Point-forecast manipulation is detected fast |
| Budget-constrained | +0.5% | No ruin in 300 rounds; wealth dynamics absorb |
| Evader | +0.3% | Stealth evasion slows but does not escape EWMA |

## 8.5 Beneficial presets

| Preset | Δ CRPS | Why |
|---|---:|---|
| House-money | −1.1% | Winners get more influence, aligns incentives |
| Latency exploiter | −2.9% | Partial outcome information improves the aggregate |

These are not attacks; they are behaviours that are individually
rational and that happen to help the aggregate. Listed for
completeness.

## 8.6 Sybil analysis (Claim 1 + scope extension)

Two sybil regimes distinguish the Lambert narrow case from practice.

### 8.6.1 Identical reports, conserved total wager (Lambert invariance)

Preset: `sybil_identical`. Split one participant into k clones with
identical reports r' = r and b_1 + ... + b_k = b.

- Profit ratio = 1.000000
- Max \|Δ profit\| = 2.07 × 10⁻¹⁷ (floating-point noise)

The mechanism is sybil-proof as Lambert defined it.

### 8.6.2 Diversified reports (Lambert assumption violated)

Preset: `sybil_diversified`. Clones submit slightly different reports
(random ε-perturbation).

- Profit ratio ≈ 1.065

The invariance breaks because Lambert's sybil-proofness proof requires
r_i = r_j for i, j ∈ S. In practice a sybil attacker may submit
correlated-but-different reports to diversify their exposure. This is
an honest scope limitation and belongs in the discussion chapter.

### 8.6.3 Strategic deposit manipulation

Preset: `deposit_manipulation`. Sybil clones attempt to game the deposit
policy with non-conserved totals.

- Profit ratio = 1.000000 (under identical reports)

The deposit policy itself is invariant to the redistribution; combined
with identical reports, Lambert's invariance holds.

## 8.7 Arbitrage (Chen et al. 2014 context)

Chen et al. 2014 showed weighted-score wagering mechanisms admit an
arbitrage interval — a range of predictions that guarantee positive
payoff when other participants disagree — in the single-round setting.

In our repeated setting with wealth dynamics and the skill gate, we
scan λ ∈ [0, 0.5] (skill gate floor) and γ ∈ [2, 32] (skill
sensitivity) and measure arbitrageur profit. The arbitrageur extracts
zero sustained profit across all tested (γ, λ) points.

Mechanisms limiting the arbitrage:

- The skill gate flattens weights when λ → 0, which shrinks the
  arbitrage interval.
- Wealth dynamics punish repeated failed arbitrage attempts.
- Staleness decay prevents the arbitrageur from rebuilding reputation
  cheaply after a failed attempt.

Source: `presentation/script_part3_validation.md` Slide 13;
`experiments.py --exp arbitrage_scan`.

## 8.8 Detection-adaptation arms race

Preset family: `detection_adaptation`. Tests a fixed manipulator
against an adaptive evader that updates its strategy to avoid being
detected by the EWMA.

Key questions:

1. Does the adaptive evader beat the fixed manipulator?
2. What is the collateral cost — how much do honest agents lose
   influence when the mechanism responds?

[PENDING] Full table. Current qualitative finding from the committed
behaviour outputs: the adaptive evader modestly outperforms the fixed
manipulator but at the cost of accepting lower per-round expected
payoffs, so the attack is less economically attractive than it looks.
The collateral cost on honest agents is < 2% influence reallocation.

## 8.9 Headline summary

The mechanism is:

- **Robust** to point-forecast manipulation (EWMA detects within ~7
  rounds).
- **Moderately vulnerable** to quantile-level distortions (bias, noise,
  reputation gaming).
- **Clearly vulnerable** to participation-based attacks, specifically
  bursty absence; this is the dominant empirical vulnerability.
- **Not** sybil-proof under diversified reports — the Lambert narrow
  invariance does not extend.

Standard attacks from the literature (sybil with identical reports,
strategic deposit manipulation, single-round arbitrage) are either
formally invariant or empirically neutralised in the repeated setting.
Sophisticated adaptive adversaries and full collusion equilibria
remain open.

## Notes for the write-up

- Figure to include: `dashboard/public/presentation-plots/sybil.png`
  (sybil identical vs diversified); `arbitrage_heatmap.png`.
- The full 18-preset table goes in Appendix C; the three summary
  tables (8.3, 8.4, 8.5) go in the main text.
- Do not oversell containment. The bursty result is the honest
  upper bound on what participation-based attacks can do to the
  aggregate.
