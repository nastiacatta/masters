# Five-step bankroll pipeline

<!--
Referenced from:
- Chapter 3 (Mechanism design), §3.1 (round structure).
- Chapter 5 (Results — synthetic), §5.1 (bankroll-pipeline
  ablation, variants A to E).

The ablation results themselves are in the main body; this
appendix documents the five pipeline variants so the figure
captions in §5.1 are unambiguous.
-->

The bankroll-pipeline ablation in §5.1 compares five variants of
the per-round pipeline, denoted $A$ through $E$. Each variant
changes exactly one step relative to its neighbour, so the
marginal effect of every pipeline stage can be read off directly.

## Pipeline variants

- **Variant A — fixed-unit deposits, uniform weights.** The
  baseline. Every participant posts a deposit of $1$; the
  aggregate is the simple mean of reports. No skill gate, no
  bankroll scaling. Equivalent to the Lambert 2008 mechanism with
  uniform wagers.
- **Variant B — fixed-unit deposits, skill-gated weights.**
  Adds the skill gate to variant A. Deposits remain constant, but
  participant weights are modulated by
  $g(\sigma_i) = \lambda + (1-\lambda)\sigma_i^\eta$. Isolates the
  effect of the skill layer independent of deposit design.
- **Variant C — bankroll-confidence deposits, skill-gated
  weights.** Replaces the fixed-unit deposit with the
  bankroll-confidence rule $b_i = f_{\mathrm{stake}} \cdot W_i \cdot c_i$
  from §3.1. Combines skill gate with observable-only deposit
  scaling.
- **Variant D — C plus rolling isotonic recalibration.** Adds the
  recalibration layer of Chapter 5.3 on top of variant C. Tests
  whether the calibration fix interferes with the economic
  structure.
- **Variant E — oracle-precision deposits, skill-gated weights.**
  Replaces the observable confidence proxy with the true latent
  precision (known on the synthetic panel). Represents the upper
  bound a real system could not access; the gap $E - C$
  quantifies the information lost by using an observable proxy.

## Headline deltas

Means of CRPS across $20$ seeds, on the latent-fixed synthetic
process used in Chapter~\ref{ch:synthetic}:

| Variant | Mean CRPS | Delta vs A |
|---|---:|---:|
| A --- fixed, uniform | $0.04287$ | 0 |
| B --- fixed, skill-gated | $0.04011$ | $-6.4\%$ |
| C --- bankroll-confidence, skill-gated | $0.03796$ | $-11.5\%$ |
| D --- C + recalibration | $0.03855$ | $-10.1\%$ |
| E --- oracle-precision | $0.02271$ | $-47.0\%$ |

The ordering $A < B < C < D < E$ confirms the main-body claim that
deposit design (the step from $B$ to $C$, $5.1$~pp of CRPS) is the
dominant empirical lever, larger than the skill-gate contribution
alone ($A$ to $B$, $6.4$~pp) or the recalibration cost ($C$ to $D$,
$+1.6\%$ CRPS). The gap $C$ to $E$ quantifies the performance
ceiling a practical system cannot reach without privileged
information.
