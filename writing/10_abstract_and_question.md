# Abstract and research question

## Working research question

> When predictive information is distributed across many actors, how should
> we combine their forecasts, and how should we decide whose forecast
> deserves more influence — while preserving the budget balance,
> truthfulness and sybil-proofness that make the market credible?

This is the question the whole thesis is organised around. It has three
sub-questions the results must answer:

1. Can a market learn participants' reliability from data alone, online,
   without a patron or subsidy?
2. Does using that learned reliability to weight the aggregate forecast
   actually improve accuracy on real data?
3. Can this happen while preserving the economic guarantees (budget
   balance, truthfulness, sybil-proofness) from Lambert et al. 2008?

The answer we argue for is **conditional yes** on all three, with honest
scope limitations documented in `writing/90_discussion_and_limits.md`.

## Abstract — draft v0

> Forecasting markets pool predictions from participants who hold
> distributed, partially private information. Existing self-financed
> wagering mechanisms (Lambert et al. 2008; Raja et al. 2024) give strong
> axiomatic guarantees but treat each round independently. Online learning
> approaches for forecast combination (Vitali and Pinson 2025) adapt to
> participant quality over time but operate on relative weights and are
> not self-financed. This thesis bridges the two by introducing an online
> skill layer on top of a weighted-score wagering mechanism. Each
> participant's deposit is modulated by a bounded, absolute skill estimate
> derived from an exponentially weighted moving average of their past
> probabilistic losses; the resulting effective wager controls both
> aggregation weight and financial exposure. The mechanism preserves
> budget balance to machine precision, preserves Lambert's sybil-proofness
> invariance for identical reports, and recovers the true CRPS ordering
> perfectly on a controlled synthetic panel. On a 17 344-hour slice of
> Elia offshore-wind data with seven real forecasters under strictly
> causal expanding normalisation, the mechanism reduces CRPS by 7.1% over
> uniform averaging (Diebold–Mariano t = 40.77, p ≈ 0), reaching CRPS-
> equivalent 76 MW against Elia's own published real-time forecast at 74
> MW. On Elia electricity-imbalance prices (T = 10 000) the mechanism is
> statistically indistinguishable from uniform (t = 0.008, p = 0.994), an
> honest null that reflects the near-identical skill of the forecaster
> panel on volatile imbalance prices. A post-hoc rolling isotonic
> recalibration (Kuleshov et al. 2018) closes roughly 59% of the
> Ranjan–Gneiting tail-calibration gap at a ~1.3% CRPS cost and ~9%
> sharpness cost, without modifying any of the economic layers. The
> dominant empirical lever is the deposit policy, not the weighting rule.
> The main limitations are a systematic tail under-dispersion inherent
> to linear opinion pools, a participation-based vulnerability (bursty
> absence inflates aggregate error by ~10×), and the standard risk-
> neutrality assumption from Lambert's framework.

Targets to tighten in the final version:

- Recalibration numbers (59% tail, 79% centre, +1.3% CRPS, −9%
  sharpness) are exact; remove the tildes in the final abstract.
- DM t = 40.77 (wind) and t = 0.008 (electricity) are the post-fix
  values from `onlinev2/outputs/post_fix_deltas/SUMMARY.md` dated
  2026-05-07. The old audit-slice DM (+15.92) is preserved in
  `THESIS_CLAIMS.md` Claim 4 and Chapter 5.2 §6.2.1 but is no longer
  the headline.
- The behaviour number for bursty (+934%) uses the earlier preset; if
  the final regression pass changes it, update Chapter 6 and the
  abstract together.
- The electricity null result is important framing. Say it in the
  abstract and do not paper over it.

## Why the question matters

Three audiences care about this question for three different reasons:

- **Energy operations** want better short-term forecasts from multiple
  bidders without needing to ingest each bidder's raw data. Forecast
  aggregation that can learn who is reliable online is directly useful.
- **Mechanism designers** care about the combinatorial question — how
  much economic structure (budget balance, truthfulness, sybil-proofness)
  survives once you bolt an online learning layer onto a one-shot
  mechanism.
- **Probabilistic forecasting researchers** care about what happens to
  calibration under a wager-weighted linear pool, and whether the fix
  (post-hoc isotonic recalibration) degrades the economic structure.

The answer ties the three together: the same object — the effective wager
— controls both the market settlement and the aggregation weight, which
is what keeps the economic structure intact while the skill layer adapts.

## Phrasings to reuse

- "The effective wager determines both influence and exposure; you cannot
  have one without the other."
- "The skill signal is absolute, not relative. Pinson-style OGD weights
  sit on a simplex — one participant's weight can only rise if another's
  falls. Our σ_i can rise without anyone else's σ changing."
- "Budget balance is a construction property, not an empirical claim."
- "Calibration is measured, not assumed from the pooling rule."

## What this work explicitly does not try to do

(Kept here so the abstract-level framing is honest.)

- It does not propose a new scoring rule.
- It does not replace the Lambert settlement algebra; it adds a pre-round
  modulator that sits in front of it.
- It does not break the impossibility from Ranjan and Gneiting 2010. It
  measures the resulting miscalibration and closes part of the gap with
  a post-hoc layer that is orthogonal to the economic structure.
- It does not prove sybil-proofness under arbitrary report diversity.
  Only the Lambert case (identical reports, conserved total wager) is
  argued invariant; the dashboard preset with diversified reports shows
  the expected ~6.5% leakage.
