# Chen, Devanur, Pennock, Vaughan 2014 — Removing arbitrage from wagering mechanisms

## Citation

Chen, Y., Devanur, N.R., Pennock, D.M., Vaughan, J.W. *Removing
arbitrage from wagering mechanisms.* Proceedings of the 15th ACM
Conference on Economics and Computation (EC '14), 2014, 377–394.
DOI: [10.1145/2600057.2602876](https://doi.org/10.1145/2600057.2602876).

Primary source in-repo: `theory/arbitrage.md`.

Note: a different Chen et al. paper ("Gaming prediction markets:
Equilibrium strategies with a market maker" — Chen, Dimitrov, Sami,
Reeves, Pennock, Hanson, Fortnow, Gonen, EC '07 / Algorithmica 2010)
is sometimes confused with this one. We cite the 2014 arbitrage paper
throughout this thesis.

## One-line take

Every weighted-score wagering mechanism (WSWM), including ours, admits
an arbitrage interval in the single-round setting. Our empirical scan
confirms the theoretical prediction: a theory-grounded arbitrage
seeker extracts +12 to +24 cumulative profit over 1000 rounds across
our λ grid, scaling roughly linearly with crowd size.

## Relevant results

### Theorem 3.3 (arbitrage interval for WSWMs)

For any differentiable, strictly proper scoring rule $s$, participant
$i$ can choose

$$
p_i \in [\|p_{-i}\|_{s_1, \mu}, \|p_{-i}\|_{s_0, \mu}], \quad
\mu_j = w_j / W_{N \setminus \{i\}},
$$

and receive a non-negative payoff under every outcome, strictly
positive whenever other participants disagree.

For the MAE analogue, the arbitrage point is the wager-weighted
median of the other participants' reports.

### §4–5 (NAWM family and sybilproofness)

The paper constructs no-arbitrage wagering mechanisms (NAWMs) that
retain anonymity, individual rationality, incentive compatibility and
weak budget balance. Theorem 5.8 establishes sybilproofness for the
$f$-NAWM subclass.

## What we take

- **Theorem 3.3 directly.** Our `ArbitrageSeekingBehaviour` implements
  the MAE-analogue arbitrage point (the wager-weighted median of
  other reports) using an F_{t−1}-compliant snapshot, and
  participates only when expected profit under uniform $y$ is
  strictly positive. Empirical scan in §8.2 confirms the theory:
  profit increases monotonically with λ (+11.68 at λ = 0, +24.22 at
  λ = 1) and fires on ~77% of rounds.
- **Crowd-size scaling corollary.** Larger crowds have more
  within-crowd disagreement, so the wager-weighted-median arbitrage
  point is further from each member's truth. Our
  `arbitrage_crowd_size` experiment confirms profit scales roughly
  linearly with n_benign at fixed λ.
- **Scope limit for our design.** Our mechanism is a WSWM; the
  arbitrage vulnerability is inherited from this family. Fully
  removing arbitrage requires moving to the NAWM family (Chen et al.
  2014 §4–5), which is outside this thesis's scope. This is stated
  as an honest limitation in §9.2.

## Where we use it

- Chapter 2 (literature review §A3 — motivation).
- Chapter 3.3 (scope: truthfulness-preserving design can't also be
  arbitrage-free inside the WSWM family).
- Chapter 6 / §8.2 (arbitrage_scan experiment), §8.4 (crowd-size
  scaling), §8.5 (sybil-arbitrage audit).
- Chapter 9.2 (honest limitation).

## Open questions

- Is there a skill-layer parameter setting (large γ, small ρ) that
  empirically shrinks the arbitrage profit relative to a baseline
  skill gate? Not currently tested.
- The `sybil_arbitrage` audit shows arbitrage profit is invariant to
  k ∈ {1, 3, 5} with conserved total stake. Is this invariance tight
  (does it break for k ≥ 10)? Not currently tested.
