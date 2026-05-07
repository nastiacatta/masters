# Raja, Pinson, Kazempour, Grammatico 2024 — A market for trading forecasts

## Citation

Raja, A.A., Pinson, P., Kazempour, J., Grammatico, S. (2024). *A market
for trading forecasts: A wagering mechanism*. International Journal of
Forecasting 40(1), 142–159. [doi:10.1016/j.ijforecast.2023.01.007](https://doi.org/10.1016/j.ijforecast.2023.01.007).

Primary source: `theory/Pierre_wagering.md`.

## One-line take

Takes Lambert 2008 from discrete events to continuous outcomes with
probabilistic forecasts, in an energy-style forecasting market with an
explicit buyer. Our thesis extends further by adding online adaptivity
across rounds.

## Relevant results

### Continuous-outcome extension

Participants submit probabilistic forecasts (CDFs or quantiles) of a
continuous random variable. Scoring is CRPS-like.

### Budget-balanced quantile payout

Preserves Lambert's payout structure. Each market instance is
one-shot; no inter-round state.

### Buyer–seller framing

A buyer posts a task and a budget; sellers submit forecasts and
wagers. The aggregate forecast is returned to the buyer (pre-event)
and sellers are paid out (post-event) based on contribution. Our
mechanism inherits the buyer role as the implicit "client" in each
round; in our setting the client is constant across rounds so we do
not explicitly model them.

### Sybil-proofness, truthfulness, individual rationality for the
### quantile case

Proven in the paper for the continuous-outcome setting under the same
Lambert axioms.

## Where we use it

- Chapter 1 (motivation), Chapter 2 (literature review §A2),
  Chapter 3 (quantile extension), Chapter 4 (forecast format).

## Open questions

- Which exact scoring rule do they use? Our CRPS-hat on a 9-level grid
  is an approximation; theirs is [PENDING] — check §4 of the paper.
- Do they test calibration? If yes, at what magnitude? Useful
  reference point for Chapter 5.3.
