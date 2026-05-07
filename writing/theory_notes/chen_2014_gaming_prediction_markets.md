# Chen et al. 2014 — Gaming prediction markets

## Citation

Chen, Y., Dimitrov, S., Sami, R., Reeves, D.M., Pennock, D.M.,
Hanson, R., Fortnow, L., Gonen, R. *Gaming prediction markets:
Equilibrium strategies with a market maker*.

[PENDING] Confirm exact venue and year against
`research/arbitrage copy.pdf`. Likely EC '13 / Algorithmica 2014.

## One-line take

Shows weighted-score wagering mechanisms admit an arbitrage interval
in the single-round setting. Our empirical scan finds no sustained
arbitrage in the repeated setting with wealth dynamics and the skill
gate.

## Relevant results

### Arbitrage interval

For a weighted-score mechanism with a quadratic score, the set of
reports r* such that guaranteed profit > 0 for participant i is a
non-empty interval depending on the other participants' reports.

### Equilibrium strategies with a market maker

The paper analyses the market-maker-extended setting; our setting has
no market maker but retains the arbitrage vulnerability.

## What we take

The theoretical motivation for our empirical arbitrage scan
(Chapter 6.7). We test whether the single-round vulnerability persists
across rounds when (a) skill tracks performance, (b) wealth dynamics
punish losses, (c) staleness decay prevents reputation rebuilding.
Scanning λ ∈ [0, 0.5] × γ ∈ [2, 32], the arbitrageur extracts zero
sustained profit.

## Where we use it

- Chapter 2 (literature review §A3), Chapter 6.7 (arbitrage scan).

## Open questions

- The theoretical arbitrage interval shrinks as λ → 0; is there a
  γ–λ boundary where sustained arbitrage becomes possible? Current
  scan says no across the tested grid, but the grid is coarse.
