# Lambert et al. 2008 — Self-financed wagering mechanisms

## Citation

Lambert, N.S., Langford, J., Wortman Vaughan, J., Chen, Y., Reeves, D.,
Shoham, Y., Pennock, D.M. (2008). *Self-financed wagering mechanisms
for forecasting*. EC '08. [doi:10.1145/1386790.1386820](https://doi.org/10.1145/1386790.1386820).

Primary source for us: `theory/lambert_Selffinanced.md`.

## One-line take

The entire economic structure of this thesis — the settlement formula,
the seven axioms, the sybil-proofness invariance — is Lambert's. Our
contribution is an online skill layer that modulates the wager m_i
*before* entering Lambert's algebra, leaving everything else intact.

## Relevant results

### Payout (Definition 3)

For a weighted-score mechanism with a strictly proper score s ∈ [0, 1]:

> Π_i(r, m, ω) = m_i · (1 + s(r_i, ω) − Σ_j s(r_j, ω) m_j / Σ_j m_j).

This is the formula in `onlinev2/src/onlinev2/core/settlement.py`
verbatim.

### Theorem 1 — all seven axioms

Weighted-score mechanisms are budget-balanced, anonymous, truthful,
sybil-proof, normal, individually rational, and monotonic.

The proofs of budget balance (§1), anonymity (§2), truthfulness (§3),
sybil-proofness (§4), normality (§5), individual rationality (§6), and
monotonicity (§7) are in the paper. We reproduce the budget-balance
derivation inline in Chapter 3; the others go in Appendix A as
substitutions with m_i in place of the original wager.

### Sybil-proofness (Definition 4)

Requires r_i = r_j for i, j ∈ S **and** Σ_{i∈S} m_i = Σ_{i∈S} m'_i. Our
use: this is the *narrow* invariance. We verify it empirically with
profit ratio = 1.000000. When clones submit diversified reports (r_i ≠
r_j), the invariance does not hold; we report the ~6.5% empirical
leakage in Chapter 6.

### Uniqueness (Section 5)

The weighted-score mechanisms parameterised by total money wagered are
the *only* wagering mechanisms that are simultaneously budget-balanced,
anonymous, truthful, normal, and sybil-proof. Our mechanism is one of
this family; the skill layer is a pre-round wager modulator, which
does not change the family membership.

## Where we use it

- Chapter 1 (framing), Chapter 2 (literature review §A1), Chapter 3
  (mechanism design, settlement algebra), Chapter 5.1 (invariants),
  Chapter 6 (sybil scope), Chapter 10 (conclusion summary).

## Open questions

- Does the monotonicity proof go through for our m_i = b_i · g(σ_i)?
  Monotonicity is defined on the wager: increasing m_i should
  monotonically change profit. If σ_i depends on b_i indirectly
  through the skill update, the argument may need a second-order
  correction. Resolve in Appendix A. Current belief: the effect is
  second-order and does not break monotonicity at the per-round
  level (σ_{i,t} uses L_{i,t−1}, which predates b_{i,t}).
