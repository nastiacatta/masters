# Quotes and snippets

Reusable phrasings and paragraph blocks. These are the sentences we
already know work, extracted from the presentation scripts and dashboard
docs. Use as-is or adapt. Each snippet has a home-chapter tag in square
brackets.

## One-line framings

- **[intro]** "When predictive information is distributed across many
  actors, how should we combine their forecasts, and how should we
  decide whose forecast deserves more influence — while preserving the
  budget balance, truthfulness and sybil-proofness that make the market
  credible?"

- **[intro, mechanism]** "The effective wager determines both influence
  and exposure. You cannot have one without the other."

- **[mechanism]** "Budget balance is a construction property, not an
  empirical claim."

- **[results]** "Calibration is measured, not assumed from the pooling
  rule."

- **[discussion]** "Conditional improvement with preserved economic
  structure, not universal dominance."

- **[discussion]** "A mechanism's contribution is not just aggregation
  accuracy. Simpler methods can match or beat it on CRPS. The
  mechanism's value is the complete economic structure: incentive-
  compatible settlement, budget balance, sybil-proofness, and online
  adaptivity. No simpler method provides all four."

- **[conclusion]** "The skill layer is a small addition — one function
  per round — on top of a well-understood mechanism. The value is not
  in the size of the addition but in what it does not break."

## Paragraphs

### Absolute vs relative weights [mechanism, lit review]

> The critical difference from Vitali and Pinson 2025's simplex OGD is
> that our skill signal is absolute. Their weights live on a simplex
> and are updated by gradient descent with projection; if one
> participant's weight rises, everyone else's mechanically falls, even
> if everyone improved. Our σ_i represents a participant's reliability
> independently of who else is in the market. One forecaster's skill
> can rise without any other's changing. This is what makes the
> settlement algebra go through: m_i is a per-participant scalar, not a
> normalised share.

### Why the skill layer preserves truthfulness [mechanism, appendix A]

> The skill estimate σ_{i,t} at round t is computed from
> L_{i,t−1}, which depends only on losses from rounds before t. The
> effective wager m_{i,t} = b_{i,t} · g(σ_{i,t}) is therefore fixed
> before participant i's round-t report is observed. Lambert's
> truthfulness proof from §4.2 of their 2008 paper assumes the
> participant's wager is fixed when they choose their report; ours
> satisfies this assumption by construction. The proof carries over
> verbatim with m_{i,t} in place of the original wager, under the same
> risk-neutrality assumption.

### The Ranjan–Gneiting gap in plain English [results, recalibration]

> Any weighted average of two or more different calibrated probability
> forecasts is necessarily uncalibrated. This is not a defect of our
> mechanism; it is a theorem (Ranjan and Gneiting 2010). The linear
> pool averages the forecasts but the CDF of the average is not the
> average of the CDFs in general. Our observed tail deviation of 0.017
> on the Elia wind slice is this theorem manifesting at a small
> magnitude. The recalibration layer closes the gap post-hoc without
> touching the economic structure.

### Calibration-sharpness tradeoff [recalibration]

> Gneiting, Balabdaoui and Raftery 2007 formalise the idea that a
> probabilistic forecast should be as sharp as possible subject to
> calibration. The recalibration layer restores calibration by
> transforming the CDF; the transformation widens the interior
> quantiles slightly (sharpness −11%) and pays a modest CRPS cost
> (+1.3%). These are precisely the currencies the tradeoff is
> denominated in. Setting the spec thresholds right at the theoretical
> floor is why two of the three specification checks narrowly fail.

### Deposit design as the dominant lever [results, discussion]

> The single clearest empirical finding of this thesis is that how
> stake enters the system matters more than the weighting rule.
> Bankroll-confidence deposits — computed from observable quantities
> only (wealth, forecast width) — achieve an 11.3% CRPS improvement
> over fixed deposits. The oracle-precision deposit rule — which no
> real system could access — achieves 46.3%. A practical deposit
> policy captures about a quarter of the available gain. The
> weighting rule choice, holding the deposit policy fixed, moves the
> CRPS by a few percent; the deposit policy choice moves it by tens of
> percent.

### Honest assessment of CRPS performance [discussion]

> The mechanism does not consistently beat simpler methods on pure
> CRPS. On the Elia wind full-length run, inverse-variance weighting
> is effectively tied with the mechanism (−7.0% vs −7.1% CRPS vs
> uniform) and the median beats both at −9.3%. Vitali's per-τ OGD
> baseline beats the mechanism by ~11 pp, and best_single by ~16 pp.
> On electricity the mechanism is indistinguishable from uniform. The
> forecast combination puzzle (Bates and Granger 1969; Timmermann
> 2006) is in full effect: simple rules that do not estimate anything
> are hard to beat. The mechanism's contribution in this regime is
> the economic structure, not the aggregation accuracy. When CRPS-
> efficient aggregation is the only goal and budget balance is not
> required, inverse-variance or a per-τ OGD is the right answer.

### Bursty participation retired [robustness, superseded]

> The earlier draft's "+934% bursty" preset is not part of the
> current adversary catalogue. It lived in the legacy 18-preset
> table that has been replaced by the theory-grounded adversary
> rebuild in `onlinev2/outputs/behaviour/experiments/ANALYSIS.md`.
> Any participation-based attack numbers in the final thesis need
> to be regenerated from a new experiment (proposed in §6.11 of the
> robustness chapter) before citing.

## Reading guides for the reviewers

### Reviewer who cares about mechanism design

> Start at Chapter 3 (§3.2 and §3.3 especially). The section on why
> the skill layer preserves Lambert's properties is §3.3; the formal
> proof substitution is in Appendix A. Chapter 6 (§8.6) discusses the
> scope of sybil-proofness and the limitation to identical reports.

### Reviewer who cares about forecasting accuracy

> Start at Chapter 5.2 (§6.1 real data). The headline number is
> mechanism = −7.1% vs uniform on the 17 344-hour wind run, DM
> t = 40.77, p ≈ 0. The electricity null (t = 0.008, p = 0.994) is
> reported plainly. Honest discussion of "inverse-variance ties us,
> median and Vitali's per-τ OGD beat us" is in Chapter 7 (§9.2). The
> forecast combination puzzle framing is also in §9.2. External
> validation against Elia's own operational forecast is in §6.1.4.

### Reviewer who cares about calibration

> Start at Chapter 5.3 (§7 in this folder). The Ranjan–Gneiting
> impossibility drives the observed 2pp tail miscalibration; the
> rolling isotonic recalibration closes 59% of it on the calibration-
> sharpness tradeoff floor. Orthogonality to the economic structure is
> §7.5 / Claim 8.

## Words and phrases to avoid

- "clearly", "obviously", "of course" — reviewers read these as
  defensive. If a claim is clear, the evidence will show it.
- "state-of-the-art" — we are not; we match a published baseline within
  0.3% and make it self-financed.
- "novel" — say what is new rather than claim novelty.
- "significant" — use only in the statistical sense and give the
  p-value.
- "proves that" — use "shows that", "demonstrates empirically that", or
  a formal proof in the appendix.
