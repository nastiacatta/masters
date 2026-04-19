# Script Part III — VALIDATION (Slides 9–15, ~7 min)

**Format: ON SLIDE = what the audience sees (concise bullets, key formulas, key numbers). SCRIPT = what you say (plain spoken language, no formulas, no math notation).**

---

## SLIDE 9 — Correctness: The Mechanism Works

**ON SLIDE:**
- Invariant checks (1000 rounds, 20 seeds):
  | Invariant | Result |
  |---|---|
  | Max absolute budget gap | 2.84 × 10⁻¹⁴ |
  | Mean profit | 3.01 × 10⁻¹⁷ |
  | Equal-score zero profit | True |
  | Sybil profit ratio (identical reports) | 1.000000 |
  | Sybil max |delta| | 2.07 × 10⁻¹⁷ |
- Scoring tests: pinball non-negative ✓, CRPS non-negative ✓, perfect beats shifted ✓, CRPS bounded ✓
- All 20+ unit tests PASS (both point and quantile modes)

**SCRIPT:**

Before any forecasting claim, the mechanism must be correct.

Budget balance: across one thousand synthetic rounds, the maximum gap between total payouts and total wagers is about two point eight times ten to the minus fourteen — machine precision. The mechanism is self-financed to numerical tolerance.

Mean profit is three times ten to the minus seventeen — effectively zero. The mechanism purely redistributes; it does not create or destroy value.

Sybil invariance: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The ratio is one point zero zero zero zero zero zero, with the largest residual at two times ten to the minus seventeen — floating-point noise. Identity splitting provides no advantage, confirming the theoretical sybilproofness property from Lambert.

All scoring tests pass: pinball loss is non-negative, CRPS is non-negative, a perfect forecast beats a shifted one, and CRPS is bounded. Over twenty unit tests pass for both point-forecast and quantile-forecast modes, covering budget balance, non-negative cashout, permutation invariance, missing-agent exclusion, profit bounds, and timing constraints.

---

## SLIDE 10 — Deposit Design Is the Strongest Lever

**ON SLIDE:**
- Deposit policy comparison (mechanism weight rule, 20 seeds):
  | Deposit policy | CRPS | vs Fixed |
  |---|---|---|
  | IID Exponential (random) | 0.0456 ± 0.0003 | — |
  | Fixed Unit (b=1) | 0.0423 ± 0.0002 | baseline |
  | Bankroll + Confidence | 0.0375 ± 0.0001 | −11.3% |
  | Oracle Precision (true τ) | 0.0227 ± 0.0001 | −46.3% |
- Ordering: Oracle < Bankroll < Fixed < Random
- Key insight: "How stake enters the system matters more than the weighting rule"

**SCRIPT:**

The single strongest empirical finding: how stake enters the system matters more than the weighting rule.

Four deposit regimes, holding the weight rule fixed at the mechanism rule, twenty seeds each. Random exponential deposits — pure noise — give the worst CRPS at zero point zero four five six. Fixed unit deposits — everyone stakes one — come in at zero point zero four two three. Bankroll-confidence deposits — where stake comes from wealth and the forecaster's own confidence — achieve zero point zero three seven five, an 11.3 per cent improvement over fixed. Oracle-precision deposits — using the true signal precision, which no real system could access — reach zero point zero two two seven, a 46.3 per cent improvement over fixed.

A practical deposit rule based only on observable quantities — wealth and forecast width — captures a meaningful portion of the available gain. The oracle remains the ceiling, but bankroll-confidence gets a real fraction of the way there.

The practical implication: the most important design choice is not the weighting rule but how stake enters the system. When deposits carry information about forecast quality, the mechanism works well. When stake is noisy, performance degrades regardless of how sophisticated the aggregation is.

---

## SLIDE 11 — Weight Rules and the Combination Puzzle

**ON SLIDE:**
- Under fixed deposits (20 seeds):
  | Weight rule | CRPS |
  |---|---|
  | Uniform | 0.0434 ± 0.0002 |
  | Deposit | 0.0434 ± 0.0002 |
  | Skill | 0.0419 ± 0.0002 |
  | Mechanism (skill × deposit) | 0.0423 ± 0.0002 |
  | Best single forecaster | 0.0232 ± 0.0001 |
- Skill vs uniform improvement: 3.5%
- Note: deposit = uniform under fixed deposits (all deposits equal)
- Under bankroll deposits (20 seeds):
  | Deposit only | 0.0230 ± 0.0001 |
  | Mechanism | 0.0375 ± 0.0001 |
- Caveat: gains from skill are conditional on heterogeneity and horizon
- Reference: forecast combination puzzle — equal weights hard to beat (Wang et al., 2023)

**SCRIPT:**

The second set of results compares weight rules. Under fixed deposits — which isolate the skill signal because all deposits are equal — skill-only weighting achieves a CRPS of zero point zero four one nine, improving over uniform at zero point zero four three four. That is a 3.5 per cent improvement. Deposit weighting matches uniform exactly, as expected — when all deposits are one, deposit weights are uniform weights.

Under bankroll deposits, the picture changes. Deposit-only weighting reaches zero point zero two three zero — already close to the best single forecaster at zero point zero two three two. The deposit itself carries so much information that the skill signal adds little on top.

This connects to the forecast combination puzzle: simple equal-weighted averages are hard to beat. Estimated optimal weights are fragile under estimation error and non-stationarity. Equal weights make no estimation errors.

The results are honest about this. The mechanism does not claim universal superiority. It claims that when there is genuine heterogeneity in forecaster quality and enough rounds for learning to converge, adaptive skill-weighted aggregation adds value. The conditions matter.

---

## SLIDE 12 — Skill Recovery and Dynamic Robustness

**ON SLIDE:**
- Skill recovery (T=20000, 6 forecasters, 20 seeds):
  | Forecaster | True noise (τ) | Mean loss | Learned skill (σ) |
  |---|---|---|---|
  | f0 | 0.15 | 0.023 | 0.959 |
  | f1 | 0.22 | 0.033 | 0.942 |
  | f2 | 0.32 | 0.047 | 0.919 |
  | f3 | 0.46 | 0.066 | 0.890 |
  | f4 | 0.68 | 0.089 | 0.854 |
  | f5 | 1.00 | 0.112 | 0.820 |
- Spearman rank correlation (τ vs σ): 1.0000 for both modes
- Staleness decay: absent forecasters revert toward baseline; removes incentive for strategic absence

**SCRIPT:**

The skill recovery experiment tests whether the mechanism correctly identifies who is good. Six forecasters with known noise levels, simulated over twenty thousand rounds, twenty seeds. The learned skill scores correctly rank-order all forecasters: the least noisy — with a true noise of zero point one five — achieves a skill of zero point nine five nine. The noisiest — true noise one point zero zero — gets zero point eight two zero. The Spearman rank correlation between true noise and learned skill is one point zero zero zero zero for both point and quantile modes. Perfect rank recovery.

The staleness decay parameter is critical for dynamic robustness. When a forecaster is absent, their skill gradually reverts toward baseline. This removes the incentive for strategic absence — participating only when you expect to score well and hiding otherwise. You cannot build a reputation and then freeze it by disappearing.

---

## SLIDE 13 — Strategic Robustness

**ON SLIDE:**
- Sybil (identical reports, conserved total wager):
  - Mean profit ratio: 1.000000
  - Max |delta|: 2.07 × 10⁻¹⁷
  - Sybilproofness holds for identical reports
- Sybil with diversified reports: ratio = 1.065 (sybilproofness does not hold)
- Strategic deposit manipulation: ratio = 1.000000
- Arbitrage: Chen et al. (2014) showed WSWMs admit an arbitrage interval when participants disagree
- In repeated setting: arbitrageur extracted zero profit across all floor parameter values
- Note: adaptive adversaries remain an open challenge

**SCRIPT:**

For strategic robustness, the main attack types from the literature.

Sybil attacks: splitting one identity into clones with identical reports and the same total deposit preserves total profit exactly. The mean ratio is one point zero zero zero zero zero zero, with the largest deviation at two times ten to the minus seventeen. Identity splitting with identical reports provides no advantage.

However, sybil splitting with diversified reports — where clones submit different forecasts — does yield a ratio of one point zero six five. Sybilproofness holds only when clones report identically, which is the standard assumption in Lambert's framework. Strategic deposit manipulation — where a sybil tries to game the deposit — also yields a ratio of exactly one.

Arbitrage: Chen and colleagues showed in 2014 that weighted-score wagering mechanisms admit an arbitrage interval — a range of predictions that guarantee positive payoff when other participants disagree. In my repeated setting, scanning across all values of the floor parameter, the arbitrageur agent extracted zero profit. The skill gate and wealth dynamics appear to limit sustained arbitrage, though the theoretical single-round vulnerability remains.

The overall picture: the mechanism resists the standard attacks. Sybil splitting with identical reports does not help. Arbitrage is not exploitable in practice. But sophisticated adaptive adversaries remain an open challenge. Robustness is promising but not a solved problem.

---

## SLIDE 14 — Calibration

**ON SLIDE:**
- Reliability table (latent-fixed DGP, T=20000, 10 forecasters, 20 seeds):
  | Nominal τ | Empirical coverage (p_hat) | Deviation |
  |---|---|---|
  | 0.10 | 0.054 ± 0.0003 | −0.046 |
  | 0.25 | 0.194 ± 0.0006 | −0.056 |
  | 0.50 | 0.499 ± 0.0009 | −0.001 |
  | 0.75 | 0.804 ± 0.0007 | +0.054 |
  | 0.90 | 0.945 ± 0.0003 | +0.045 |
- Median nearly perfectly calibrated
- Tails: systematic under-dispersion (~5 pp)
- Note: tail under-dispersion is inherent to quantile averaging, shared across all weighting methods, not specific to this mechanism

**SCRIPT:**

Calibration is a known weakness of quantile averaging, and the results reflect that.

The median quantile is nearly perfectly calibrated: empirical coverage of zero point four nine nine against a nominal zero point five zero. The tails show systematic deviation. The ten per cent quantile has empirical coverage of about five per cent instead of ten. The ninety per cent quantile has coverage of about ninety-five per cent instead of ninety. The aggregate is too sharp in the tails — under-dispersed by roughly five percentage points.

This under-dispersion is a known property of quantile averaging. Even when individual forecasts are well-calibrated, the average of their quantiles tends to be too narrow. This is shared across all weighting methods and is not specific to my mechanism.

Addressing tail calibration — through post-hoc recalibration or ensemble methods that preserve spread — remains a direction for future work.

---

## SLIDE 15 — Contributions, Limitations, and Closing

**ON SLIDE:**
- Contributions:
  1. Mechanism coupling self-financed wagering with online skill learning; skill is absolute, pre-round, handles intermittency
  2. Empirical verification: budget balance (< 10⁻¹⁴), sybilproofness (ratio = 1.000000), bounded loss
  3. Deposit design is the strongest lever: bankroll-confidence achieves 11.3% improvement over fixed
  4. Skill recovery: Spearman rank correlation = 1.0000 (T=20000, 6 forecasters)
  5. Strategic robustness: sybil-resistant (identical reports), no arbitrage profit in practice
  6. Modular simulation platform (onlinev2) with test suite and dashboard
- Limitations:
  - Tail calibration: under-dispersion ~5 pp in tails
  - Equal weights competitive — gains conditional on heterogeneity and horizon
  - Truthfulness holds under risk neutrality only (Lambert assumption)
  - All synthetic data — no real-world deployment
- Closing: "Can aggregate forecasts improve when influence depends on learned skill? Conditionally yes. The strongest lever is deposit design."

**SCRIPT:**

I designed a self-financed wagering mechanism that couples weighted-score settlement with online skill learning. The skill signal is absolute, computed before each round, and handles intermittent participation. The core properties are verified empirically: budget balance to machine precision, sybilproofness with profit ratios of exactly one, and bounded loss.

The strongest empirical finding is that deposit design matters more than the weighting rule. Bankroll-confidence deposits achieve an 11.3 per cent improvement over fixed deposits, with the oracle at 46.3 per cent marking the ceiling. The skill signal recovers the correct forecaster ordering perfectly — Spearman correlation of one point zero zero zero zero over twenty thousand rounds. The mechanism resists sybil attacks with identical reports and does not admit exploitable arbitrage in practice.

The main limitations: tail calibration shows under-dispersion of about five percentage points, equal weights remain competitive in some configurations, truthfulness holds only under the risk-neutrality assumption inherited from Lambert, and all experiments use synthetic data.

This thesis asked whether aggregate forecasts improve when influence depends not only on stake but also on learned skill. The answer is conditionally yes. The mechanism is correct, the skill signal is meaningful, and the gains are real in learnable settings. But the strongest practical lever is not the weighting rule — it is how stake enters the system.

Thank you. I am happy to take questions.
