# Personal reflection {#ch:reflection}

<!--
Main-body section required by the DESE70002 assessment criterion
"Reflection". Handbook Q&A: part of main body, short self-contained
section is acceptable. Kept deliberately short (≈1 page).
-->

The project pushed me hardest at the interface between theoretical
mechanism design and empirical forecasting. Lambert's original
proof is self-contained and elegant; most of the year's difficulty
lived in the empirical half — showing that the extension does
what the proof says it does under the messy conditions of a real
data stream.

Three capabilities were stretched. First, the discipline of
source-linked claims: every number in this report maps back to an
experimental output, which forced an experiment-management habit I
did not have at the start of the year. Second, reading proofs
adversarially: the temptation to use Ranjan and Gneiting 2010 as a
black-box negative result was strong, but the linear-pool
impossibility needed to be worked through in detail to justify the
choice of a post-hoc isotonic fix rather than a parametric one.
Third, calibrating honesty in the face of a null result: the
electricity-imbalance result is reported plainly even though it
contradicts the hope that ran through the early drafts.

Against the Design Engineering Master's Project assessment criteria,
the project's strongest suit is Validation — the results are
statistically anchored with explicit confidence intervals, and the
recalibration layer is benchmarked against the Gneiting–Balabdaoui–
Raftery calibration-sharpness floor. The weakest suit is Contextual
Investigation: the lit review sprawls and a later reader would
benefit from a tighter tutorial arc from Lambert through Raja and
Vitali to the skill layer. The main lesson I will carry forward is
the primacy of a reproducible pipeline over a clever aggregation
rule. The most informative observation from the synthetic work is
that the \emph{deposit channel}, and not the weighting rule, carries
the largest information capacity; the caveat being that deposits are
not under the operator's control in a deployed market, so the
deposit-side gain is a ceiling statement rather than an actionable
lever. Finding that out required the pipeline to be trustworthy
first.

Skills I would strengthen next: formal treatment of multi-round
incentive compatibility (the per-round argument in this report is
solid, but the cross-round bound is informal); faster iteration on
the dashboard so that stakeholders can probe results without
reading the full report.
