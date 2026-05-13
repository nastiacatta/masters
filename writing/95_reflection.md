# Personal reflection {#ch:reflection}

<!--
Main-body section required by the DESE70002 assessment criterion
"Reflection". Handbook Q&A: part of main body, short self-contained
section is acceptable. Kept deliberately short (≈1 page).
-->

The project pushed me hardest at the interface between theoretical
mechanism design and empirical forecasting. Lambert's original
proof is self-contained and elegant; most of the year's difficulty
lived in the empirical half, showing that the extension does what
the proof says it does under the messy conditions of a real data
stream.

Three capabilities were stretched. The first is the discipline of
source-linked claims: every number in this report maps back to an
experimental output, which forced an experiment-management habit I
did not have at the start of the year. The second is reading proofs
adversarially. The temptation to treat Ranjan and Gneiting 2010 as
a black-box negative result was strong, but the linear-pool
impossibility needed to be worked through in full to justify the
choice of a post-hoc isotonic fix over a parametric one. The third
is calibrating honesty against a null result: the
electricity-imbalance outcome is reported plainly, even though it
contradicts the hope that ran through the early drafts.

Against the Design Engineering Master's Project assessment
criteria, the strongest piece of the project is Validation. The
results are statistically anchored with explicit confidence
intervals, and the recalibration layer is benchmarked against the
Gneiting, Balabdaoui, and Raftery calibration-sharpness floor. The
weakest piece is Contextual Investigation: the literature review
sprawls, and a later reader would benefit from a tighter tutorial
arc from Lambert through Raja and Vitali to the skill layer. The
main lesson I carry forward is that a reproducible pipeline
matters more than a clever aggregation rule. The most informative
finding from the synthetic work is that the \emph{deposit channel},
and not the weighting rule, carries the largest information
capacity. The caveat is that deposits are not under the operator's
control in a deployed market, so the deposit-side gain is a ceiling
statement rather than an actionable lever. Reaching that finding
required the pipeline to be trustworthy first.

Two skills I would strengthen next. The first is a formal treatment
of multi-round incentive compatibility: the per-round argument in
this report is solid, but the cross-round bound is informal. The
second is faster iteration on the dashboard, so that stakeholders
can probe results without reading the full report.

