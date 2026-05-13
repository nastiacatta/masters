# Adversary presets {#app:behaviour-presets}

The robustness chapter tests eight theory-grounded adversaries,
each with a published theoretical basis. This appendix gives the
one-line theoretical framing for each and the headline empirical
result. The full confidence intervals, paired-seed comparisons,
and per-preset figures are in the main body
(Chapter~\ref{ch:robustness}).

## 1. Arbitrage-seeking

- Basis: \citet{chen2014arbitrage} Thm 3.3.
- Objective: exploit the no-arbitrage interval implied by the
  skill-gate floor.
- Headline: attacker profit scales monotonically with the floor
  $\lambda$, from $+11.68$ at $\lambda = 0$ to $+24.22$ at
  $\lambda = 1$ over 1000 rounds.

## 2. Coordinated group (Chun--Shachter coalition)

- Basis: \citet{chun2011cooperating}.
- Objective: coalition members submit a pooled report
  $p_C = \sum_{i \in C} (w_i / W_C) p_i$.
- Headline: $+19.9$ coalition profit under weighted-mean
  aggregation, $+16.9$ under weighted median.

## 3. Informed collusion

- Basis: \citet{chen2014arbitrage} combined with
  \citet{chun2011cooperating}.
- Objective: coalition with access to a shared private signal.
- Headline: $+33.8$ coalition profit under an AR(1) data-generating
  process.

## 4. Strategic influence

- Basis: \citet{dimitrov2008nonmyopic}.
- Objective: non-myopic bluff-and-correct across rounds.
- Headline: non-monotone frontier; only small pulls are
  profitable.

## 5. Strategic reporter

- Basis: \citet{hardt2023performative, oesterheld2023performative}.
- Objective: shift the aggregate to match an off-mechanism
  objective.
- Headline: pulls of magnitude $0.3$ are profitable; larger pulls
  bankrupt the attacker.

## 6. Privileged information (insider advantage)

- Basis: \citet{johnstone2007economic}.
- Objective: exploit a lagged, low-variance signal as an insider
  edge.
- Headline: $+57.1$ attacker profit under the AR(1) DGP.

## 7. Detector-aware (whitewashing)

- Basis: \citet{feldman2004freeriding}.
- Objective: adapt to any detection signal the mechanism exposes.
- Headline: both fixed and adaptive variants bankrupt within
  1000 rounds.

## 8. Wash trader (activity gaming)

- Basis: \citet{chen2014arbitrage} §5.
- Objective: inflate reported activity without contributing
  signal.
- Headline: anchor variant, $+15$ profit at $+68\%$ inflation;
  split-bet variant, $-258$ profit at $+113\%$ inflation.

## 9. Sybil arbitrage

- Basis: \citet{lambert2008selffinanced} combined with
  \citet{chen2014arbitrage}.
- Objective: split one identity into $k$ clones to evade the
  skill-tracking layer.
- Headline: the narrow invariance holds to $10^{-17}$;
  diversified-report leakage is approximately $6.5\%$.

Bursty participation is not part of the theory-grounded catalogue.
The earlier ``$+934\%$ bursty'' preset from the legacy presentation
is superseded and is not cited in the main body.

Each preset is evaluated by a dedicated runner configuration that
seeds the attack, records per-seed profit, and aggregates
confidence intervals across the seed grid.

