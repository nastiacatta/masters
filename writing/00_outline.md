# Thesis outline

Working structure. Chapter word counts are planning targets, not hard
limits. Final length is whatever the argument needs, but the budget keeps
us honest about which chapters pay the rent.

## Chapter 1 — Introduction (≈1500 words)

- Motivation: distributed predictive information in energy and operations.
- Gap: forecasting markets with adaptivity and self-financing at the same
  time.
- Research question: can a market learn who is reliable, use that to
  improve aggregates, and preserve market discipline?
- Contributions (5 bullets, source-linked to `THESIS_CLAIMS.md`).
- Thesis roadmap.

Source files: `writing/10_abstract_and_question.md`,
`writing/20_literature_review.md`.

## Chapter 2 — Background and related work (≈3000 words)

- Lambert et al. 2008 self-financed wagering mechanisms. Seven axioms,
  uniqueness.
- Raja et al. 2024 forecasting market. Extension to quantile forecasts
  and continuous outcomes.
- Vitali and Pinson 2025 online learning with intermittent contributions.
  OGD on the simplex, robust regression, in-sample vs out-of-sample payoff.
- Scoring rules: Gneiting and Raftery 2007; CRPS and pinball loss.
- Probabilistic forecast calibration: Gneiting, Balabdaoui and Raftery
  2007; Ranjan and Gneiting 2010; Kuleshov, Fenner and Ermon 2018.
- Forecast combination: Bates and Granger 1969; Timmermann 2006 (the
  combination puzzle).
- Online learning: Cesa-Bianchi and Lugosi 2006.
- Evaluation methodology: Dawid 1984; Tashman 2000; Cerqueira et al. 2020.

Source files: `writing/20_literature_review.md`,
`writing/theory_notes/*`, `writing/bibliography.md`.

## Chapter 3 — Mechanism design (≈3500 words)

- Round structure (submit → skill gate → aggregate → settle → update).
- Effective wager as a single object controlling influence and exposure.
- Skill layer: EWMA, staleness decay, exponential loss-to-skill mapping.
- Settlement: weighted-score payout, budget balance by construction.
- Deposit policies and the skill gate.
- Theoretical properties preserved vs extended.

Source files: `writing/30_mechanism_design.md`.

## Chapter 4 — Implementation and methodology (≈2500 words)

- Three-layer architecture (environment / agents / platform).
- Data: synthetic DGPs + Elia offshore wind + Elia electricity imbalance.
- Forecaster panel (Naive, EWMA, ARIMA, XGBoost, MLP, Theta, ensemble).
- Strict causality and training protocol (post-audit fixes from
  `model-training-testing-audit`).
- Experiment protocol and the validity ladder.
- Reproducibility (`AUDIT_SEEDS`, `PIPELINE_VERSION`, cache invalidation).

Source files: `writing/40_methodology.md`, `onlinev2/README.md`,
`.kiro/specs/model-training-testing-audit/design.md`.

## Chapter 5 — Results (≈5000 words, split across three sub-chapters)

### 5.1 Synthetic validation — correctness and skill recovery

- Budget balance, sybil invariance, scoring bounds.
- 13/13 Lambert invariants and 60-snapshot golden-value suite.
- Known-noise-panel skill recovery (Spearman σ vs CRPS = 1.0).
- Deposit policy ablation (fixed < bankroll-confidence < oracle).
- Bankroll pipeline ablation (A–E), 20 seeds, fresh from the CSV.

Source: `writing/50_results_synthetic.md`.

### 5.2 Real-data validation — Elia wind and electricity

- Full-length 17 344-hour Elia wind run under expanding
  normalisation: mechanism −7.1% vs uniform, DM t = 40.77, p ≈ 0.
- 3000-point audit slice: mechanism vs `michael_ogd` ratio 1.003
  (Claim 4 reference), mean tail deviation 0.0171 (Claim 6
  reference).
- Elia electricity: null result (t = 0.008, p = 0.994), seven
  forecasters indistinguishable.
- Elia operational-forecast external validation: our best_single
  (online XGBoost, no weather) beats Elia's `mostrecentforecast` by
  ~6% CRPS-MW-eq (69.5 vs 74.0); our 7-forecaster mechanism averages
  down to 83.7 MW, ~13% worse than Elia's real-time forecast because
  the panel mixes XGBoost with weaker models.
- Horizon blocks (day-ahead, 4h-ahead, seasonal slice) still in
  static-mode; refresh pending.

Source: `writing/60_results_real_data.md`.

### 5.3 Recalibration layer

- Rolling isotonic post-processing (Kuleshov–Fenner–Ermon).
- Tail deviation −59%, centre deviation −79%.
- CRPS +1.3%, sharpness −11% (calibration-sharpness floor).
- Orthogonality: economic structure preserved, byte-identical at
  `recalibrate=False`.

Source: `writing/70_recalibration_layer.md`.

## Chapter 6 — Robustness (≈2500 words)

- Adversary catalogue from ANALYSIS.md §1: arbitrage_seeking,
  coordinated_group, strategic_influence, strategic_reporter,
  privileged_information, detector_aware, wash_trader,
  sybil_arbitrage.
- Arbitrage scan (Chen et al. 2014): profit +12 to +24 over 1000
  rounds as λ rises 0 → 1.
- Collusion (Chun & Shachter 2011): +19.9 weighted-mean, +16.9
  weighted-median; informed collusion +33.8 under AR(1).
- Insider advantage (Lambert 2008; Johnstone 2007): +57.1 with
  legitimate lagged signal under AR(1).
- Sybil-proofness: narrow (identical reports) ratio = 1.000000;
  diversified-report breaks invariance by ~6.5%; sybil-arbitrage
  k-invariance = 1.000 to within Monte-Carlo error.
- Wash trading: anchor +15 profit at +68% inflation;
  split-bet −258 profit at +113% inflation.
- Strategic reporting: non-monotone frontier, only small-pull
  attacks (pull = 0.3) are profitable.
- Detection-adaptation: both fixed and adaptive manipulators
  bankrupted.

Source: `writing/80_robustness.md`.

## Chapter 7 — Discussion (≈2000 words)

- What the mechanism does well and what it does not.
- Conditional improvement, not universal dominance.
- Deposit design > weighting rule (the main empirical finding).
- Connection to the forecast combination puzzle.
- Threats to validity.

Source: `writing/90_discussion_and_limits.md`.

## Chapter 8 — Conclusion and future work (≈1000 words)

- Summary of contributions.
- Open directions: per-quantile OGD aggregation, Beta-transformed linear
  pool, conformal wrappers, collusion-resistant scoring, richer strategic
  agents.

Source: `writing/99_conclusion.md`.

## Appendices

- A. Proofs of invariants (budget balance, sybil invariance, skill
  monotonicity).
- B. Hyperparameter tuning table.
- C. Full table of behaviour presets and resulting Δ CRPS.
- D. Full XGBoost / MLP training details.
- E. Code listing for the five-step bankroll pipeline.

## Target submission date

To fill in. Back out the `[PENDING]` dependencies from that date so each
chapter has a draft, review, and revision pass.
