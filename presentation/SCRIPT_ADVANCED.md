# SCRIPT — Advanced Study Version

> This is **not** the delivery script. The delivery script is `SCRIPT.md`.
> This document is the **study companion**: every slide is expanded with all the
> theory, formulas, code references, experimental details and numerical results
> that sit behind the spoken narration. Read it to understand exactly *what* is
> being claimed on each slide, *why* it is true, and *where* in the repository
> the claim is implemented or validated.
>
> Conventions used throughout:
> - $i \in \{1, \dots, n\}$ indexes forecasters, $t \in \{1, \dots, T\}$ indexes rounds.
> - $y_t \in [0,1]$ is the normalised outcome at round $t$.
> - $q_i^{(k)}(t)$ is forecaster $i$'s quantile at level $\tau_k$.
> - $b_i(t)$ is the deposit at round $t$ and $m_i(t)$ is the effective wager.
> - $\sigma_i(t) \in [\sigma_{\min}, 1]$ is the learned skill signal, $L_i(t)$ the EWMA normalised loss.
> - $W_i(t)$ is the wealth (bankroll).
> - Code references use `file:line` notation; theory references use paper short names.

## How to read this document (recommended)

If you want the clearest “learning path”, use this order:

1. **Slides 2–3**: definition of the market and why combination is non-trivial with strategic agents.
2. **Slide 7**: the full round pipeline (this is the backbone).
3. **Slide 8**: how $\sigma$ is computed and why it is bounded.
4. **Appendix C**: how the *actual code* produces the plots (runner → JSON → R plots/dashboard).
5. **Appendix D**: truthfulness conditions and what breaks them.
6. **Slides 13–14**: real-data results and the apples-to-apples benchmark comparison.

## Glossary (quick reference)

- **Report**: the probabilistic forecast object submitted by a forecaster. In this repo it is a *quantile vector* $q_i(t) \in \mathbb{R}^K$.
- **Deposit** $b_i(t)$: amount the agent chooses to put on the table for round $t$ (can be policy-driven in experiments).
- **Effective wager** $m_i(t)$: the *at-risk* part of the deposit that both (i) weights aggregation and (ii) funds settlement.
- **Skill signal** $\sigma_i(t)$: bounded pre-round estimate of forecaster value; computed from past realised losses only.
- **Score** $s_i(t)$: bounded number in $[0,1]$ derived from a proper scoring rule (here: CRPS-hat), used inside Lambert settlement.
- **CRPS-hat**: finite-grid surrogate for CRPS computed from quantiles; this is what the code uses and what “CRPS” refers to in the plots.
- **Uniform baseline**: equal weights across forecasters in aggregation (not a mechanism with settlement; just a forecast combination rule).
- **Raja (history-free)**: Lambert/Raja-style weighted-score settlement with per-round confidence weights and no memory.
- **Vitali OGD**: per-quantile online gradient descent on the simplex (pure online aggregation baseline in our benchmark).

## Parameter cheat-sheet (what each knob does)

These are the parameters you will be asked about most often in Q&A.

### Mechanism (skill gate + skill learning)

- **$\lambda \in [0,1]$ (skill gate floor)**: minimum fraction of a deposit that becomes effective wager even when skill is low.
  - $\lambda = 0$ means low-skill accounts can be shut down entirely (not used here).
  - $\lambda > 0$ means *everyone always participates a little*.
- **$\eta > 0$ (skill gate curvature)**: shapes how strongly skill differences translate to wager differences.
  - $\eta = 1$ linear; $\eta > 1$ amplifies high-skill forecasters.
- **$\rho \in (0,1]$ (EWMA learning rate)**: how fast $L_i(t)$ reacts to new loss.
  - large $\rho$ = fast adaptation but noisy; small $\rho$ = stable but slow.
- **$\gamma > 0$ (loss→skill sensitivity)**: controls how steeply $\sigma$ drops with $L$.
  - large $\gamma$ = aggressive separation; small $\gamma$ = gentle separation.
- **$\sigma_{\min} \in (0,1)$ (skill floor)**: lower bound on the skill signal (keeps market access non-zero).
- **$\kappa \in [0,1]$ (staleness/missingness decay)**: how fast absent forecasters revert toward baseline skill.
- **`omega_max` (dominance cap)**: caps maximum share of total wager in aggregation (OFF in headline results with `omega_max=0.0`).

### Evaluation

- **`taus`**: the quantile grid. Default is `(0.1, 0.25, 0.5, 0.75, 0.9)`. Not equidistant → call it CRPS-hat.
- **`warmup`**: number of rounds ignored for scoring to avoid “cold start” bias.

---

## Table of Contents

1. [Slide 1 — Title + Anecdote](#slide-1)
2. [Slide 2 — What is a Prediction Market?](#slide-2)
3. [Slide 3 — Why Combine Forecasts?](#slide-3)
4. [Slide 4 — Where This Work Fits (Positioning)](#slide-4)
5. [Slide 5 — Mechanism Comparison Table](#slide-5)
6. [Slide 6 — The Contribution of This Project](#slide-6)
7. [Slide 7 — Mechanism: Round-by-Round](#slide-7)
8. [Slide 8 — The Skill Signal](#slide-8)
9. [Slide 9 — Models, Data, Synthetic Setup](#slide-9)
10. [Slide 10 — Synthetic Validation: Convergence](#slide-10)
11. [Slide 11 — Mechanism Guarantees](#slide-11)
12. [Slide 12 — Deposit Design](#slide-12)
13. [Slide 13 — Real Data: Elia Wind + Electricity](#slide-13)
14. [Slide 14 — Benchmark Comparison](#slide-14)
15. [Slide 15 — Strategic Robustness](#slide-15)
16. [Slide 16 — Conclusion + Future Work](#slide-16)
17. [Demo (live dashboard)](#demo)
18. [Appendix A — All formulas in one place](#appendix-a)
19. [Appendix B — Code map](#appendix-b)
20. [Appendix C — How the code runs end-to-end](#appendix-c)
21. [Appendix D — Truthfulness (proof sketch) + what can break it](#appendix-d)
22. [Appendix E — Extended Q&A (from `theory/extra/`)](#appendix-e)

---

<a id="slide-1"></a>
## SLIDE 1 — Title + Anecdote

**Spoken line.** "Recently, on the way to the airport, I checked Google Maps, Apple Maps, and Citymapper. They all predicted the same journey time, but they did not give the same answer. And from experience, I knew I trusted Citymapper a little more."

### What is actually being set up

- **Forecast heterogeneity.** Three forecasters, same query, different answers. This is the empirical starting point of the whole thesis: when forecasts disagree, the cost of using any single one unhedged is real.
- **Informal reputation.** My preference for Citymapper comes from accumulated experience — an implicit, unbounded, qualitative memory. The mechanism in this project formalises that into a bounded, quantitative object $\sigma_i(t) \in [\sigma_{\min}, 1]$ updated by a proper scoring rule.
- **Strategic setting.** Maps apps are benign, but the *general* problem (which this thesis addresses) is what happens when forecasters are paid, may strategise, can enter or leave, and can even split identities. The rest of the deck makes that generalisation formal.

### Acknowledgement

Supervisors **Pierre Pinson** and **Michael Vitali**. Pinson co-authors the two most directly relevant papers: Raja, Pinson, Kazempour, Grammatico (2024) on wagering mechanisms for forecast elicitation, and Vitali & Pinson (2025) on repeated forecasting markets with intermittent contributions. These two works define the "prior art" against which the project is compared on slides 4, 5 and 14.

### Where the picture comes from

The title slide is rendered by `dashboard/src/components/slides/TitleSlide.tsx` and uses `title_background.png` with a dark overlay so the section label, title and slide number remain legible.

---

<a id="slide-2"></a>
## SLIDE 2 — What Is a Prediction Market?

### Definition (used throughout the thesis)

A **prediction market** is a mechanism that at each round $t$:

1. Takes, from each participating forecaster $i$, a pair $(r_i(t), b_i(t))$:
   - a **probabilistic forecast** $r_i(t)$ — typically a vector of quantiles $(q_i^{(1)}(t), \dots, q_i^{(K)}(t))$ at probability levels $(\tau_1, \dots, \tau_K)$;
   - a **wager** $b_i(t)$ — a non-negative monetary stake backing that forecast.

2. Aggregates the forecasts into a single **market forecast** $\hat r(t)$.
3. Observes the outcome $y_t$.
4. Allocates **payoffs** $\pi_i(t)$ based on forecast quality and wagers, in such a way that at least the following hold:
   - **budget balance**: $\sum_i \pi_i(t) = \sum_i b_i(t)$ (self-financing); in this project we split it into a refund and a skill payoff, see §[Slide 7](#slide-7);
   - **incentive compatibility** in reporting (under risk neutrality);
   - **Sybil resistance** under identical-report clones.

### Why this is not just "opinion polling"

- **Skin in the game.** The wager ties the monetary exposure of participant $i$ to the statistical quality of $r_i(t)$ through a proper scoring rule. Without this coupling, there is no reason for forecasters to report their true predictive distribution.
- **Aggregation under strategic participation.** A simple average assumes everyone is equally informed and equally honest. A market-based aggregator can exploit the wager as a *self-reported confidence signal*: informed-and-confident forecasters pay to influence the market forecast more; uninformed forecasters who would rather not risk money can post a small wager (or none at all — intermittent participation, §[Slide 8](#slide-8)).
- **Privacy.** Participants reveal a predictive distribution, not the underlying data or model. This is exactly the positioning argued in Raja et al. (2024, §1–§2) and reused here.

### Applications

- **Energy.** Offshore wind production, imbalance prices — the Elia datasets we use on Slide 13. Energy is where probabilistic forecasting markets are most natural: decisions (dispatch, trading, reserve sizing) depend on predictive distributions, not just point forecasts.
- **Supply chain and inventory.** Demand distributions, lead-time distributions.
- **Finance.** Aggregation of analyst forecasts, volatility markets.

### Textbook references for the claims

- Lambert et al. (2008, 2015), *Self-financed wagering mechanisms* — canonical definition of wagering markets, proof that the weighted-score rule is the unique mechanism satisfying seven desirable properties (anonymity, budget balance, truthfulness, sybilproofness, etc.).
- Gneiting & Raftery (2007), *Strictly proper scoring rules* — the scoring rule theory behind why $\text{CRPS}$ elicits truthful probabilistic reports.
- Raja et al. (2024, IJF), §3 — the **buyer/seller + aggregation operator + scoring rule + payoff** architecture we directly reuse.

---

<a id="slide-3"></a>
## SLIDE 3 — Why Combine Forecasts?

### Statistical reason

For independent unbiased forecasts $F_1, \dots, F_n$ of a quantity with variance $\sigma_j^2$, the *inverse-variance-weighted* combination has variance

$$
\text{Var}\!\left(\sum_j w_j F_j\right) = \frac{1}{\sum_j 1/\sigma_j^2} \le \min_j \sigma_j^2.
$$

So the combined forecast is (weakly) at least as accurate as the best component. The Bates–Granger (1969) result generalises this to correlated forecasts with a closed-form optimal weighting. In practice the optimal weights are unknown, which is exactly why we *learn* them online.

### Why equal weights is the natural naïve baseline

Equal weighting is what you get if:

- you have no information about who is better,
- or the forecasters are *exchangeable* from your point of view.

Equal weights is also provably near-optimal in the "flat maximum" region (Claeskens et al., 2016; cited in `theory/extra/ForecastCombinations.md`). When forecasters are similar in quality, equal weights is **difficult to improve on**. This is why on slide 13 the electricity gain (8 %) is modest: the forecasters are more homogeneous in that dataset.

### Why strategic behaviour breaks naïve averaging

Consider an attacker who submits a deliberately biased forecast $r_i = y^{\text{anti}}$. Simple averaging with $n$ participants dilutes the attack only by a factor $1/n$. Two defences we need:

1. **Skin-in-the-game** via the wager, so that bad forecasts cost money (this is what the *settlement* layer provides).
2. **History.** A truly adversarial forecaster performs badly under the proper scoring rule over time; the *skill gate* converts their persistently high loss into a small effective wager, muting their influence (this is what §[Slide 8](#slide-8) formalises).

### Goal statement on the slide

The project's goal is a mechanism that:
- learns each forecaster's importance from their track record (an **online learning** layer),
- uses that to weight both the aggregate forecast and the settlement (a **mechanism design** layer),
- without giving up budget balance, truthfulness (under risk neutrality), or sybilproofness (the **economic-discipline** layer).

These three layers correspond to the three literatures on Slide 4.

---

<a id="slide-4"></a>
## SLIDE 4 — Where This Work Fits (Positioning Matrix)

### The three reference works

**Lambert et al. (2008)** — *Self-financed weighted-score wagering*.
Formal setup: each of $n$ participants submits a forecast $r_i \in \mathcal R$ and wager $b_i \ge 0$; there is an outcome $\omega$. The mechanism has scoring rule $s$ and allocates payoffs

$$
\pi_i = b_i \left( 1 + s(r_i, \omega) - \bar s \right), \qquad \bar s = \frac{\sum_j b_j s(r_j, \omega)}{\sum_j b_j}.
$$

They prove this is the **unique** mechanism satisfying seven axioms simultaneously:

1. **Budget balance** — $\sum_i \pi_i = \sum_i b_i$.
2. **Anonymity** — payoffs invariant to participant labels.
3. **Truthfulness** — under risk neutrality and a strictly proper $s$, truth-telling is optimal.
4. **Individual rationality** — truth-tellers have non-negative expected profit.
5. **Sybilproofness** — a participant cannot increase their expected profit by splitting into clones with identical reports and identical total wager.
6. **Monotonicity** of payoff in own score.
7. **Neutrality** — independence of non-participating participants.

**History-free.** Lambert's design uses $(r_i, b_i)$ for round $t$ only. There is no mechanism-level memory of past performance.

**Raja, Pinson, Kazempour, Grammatico (2024, IJF)** — *Wagering mechanism for forecast elicitation*.
Adds a **client** (buyer) who posts a task, an explicit **forecast aggregation operator** $A: \mathcal R^n \to \mathcal R$, a scoring rule with a threshold $s_c$, and a **payoff allocation** that splits client payment $U$ between forecasters according to their scores. Budget balance is relaxed to allow the client utility $U > 0$ to flow into the system. Still history-free across rounds.

**Vitali & Pinson (2025)** — *Repeated forecasting markets with intermittent contributions*.
Repeated setting. Tracks per-quantile weights $W_{\tau} \in \Delta^{n-1}$ (the probability simplex) updated by **online gradient descent** on the pinball loss:

$$
W_{\tau}(t+1) = \Pi_{\Delta}\!\left( W_{\tau}(t) - \eta \nabla_{W_\tau} L_\tau(t) \right).
$$

Handles intermittent participation. But: weights are *relative* (they live on $\Delta^{n-1}$), and the settlement is **Shapley-based**, not Lambert self-financed — meaning the mechanism is not budget-balanced in the Lambert sense.

### The 2×2 positioning matrix (rendered by `presentation/R/plot_positioning_matrix.R`)

| | **History-free** | **Adaptive (online)** |
|-|------------------|-----------------------|
| **Self-financed (Lambert)** | Lambert et al. (2008); Raja et al. (2024) | **This project** |
| **Not self-financed** | "Classical" online aggregation (e.g. Cesa-Bianchi & Lugosi) | Vitali & Pinson (2025) |

### What "this project" adds

The top-right corner — **adaptive and self-financed** — has, to our knowledge, no direct prior. The mechanism on Slide 7 fills it by introducing a pre-round **skill signal** $\sigma_i(t)$ computed from past realised losses, and using it to scale the wager that both drives aggregation and settles. This keeps Lambert's seven properties while gaining adaptivity.

---

<a id="slide-5"></a>
## SLIDE 5 — Mechanism Comparison Table

The visual is a 3-row comparison across five dimensions. This is the detailed version:

| Dimension | Lambert et al. (2008) | Raja et al. (2024) | Vitali & Pinson (2025) | **This project** |
|-----------|-----------------------|--------------------|------------------------|------------------|
| Financing | Self-financed | Self-financed + client utility | Shapley payoffs (**not** self-financed) | Self-financed (optional $U>0$ utility add-on) |
| Weight update across rounds | None | None | OGD on simplex, per quantile | EWMA loss → bounded skill → scales wager |
| Weight type | Stakes only | Stakes × confidence | Simplex weights $w \in \Delta^{n-1}$ | Absolute skill $\sigma_i \in [\sigma_{\min}, 1]$, scales own stake |
| Intermittent participation | Supports via exclusion | Supports via exclusion | Explicit handling with decay | Staleness decay via $\kappa$ (see [Slide 8](#slide-8)) |
| Formal properties | 7 Lambert properties | 7 + client feasibility | Regret bound for OGD | 7 Lambert properties preserved, + absolute skill + deposit ablation |

Key observations on the slide:

- **"Self-financed"** means total payouts equal total wagers *without any external funding source*. Vitali & Pinson's Shapley layer requires a client payment to fund positive-expected-profit positions.
- **"Absolute vs relative"** matters. With simplex weights, one participant's weight can rise only if another's falls. In our design, $\sigma_i$ and $\sigma_j$ can both rise or fall independently — the signal is a property of forecaster $i$ alone, not a share of a fixed pie.

### Code reference

The table is a React component: `dashboard/src/components/slides/MechanismComparisonSlide.tsx`. The Vitali row deliberately says "Shapley payoffs (not self-financed)" — we use the exact wording from §III of the 2025 paper.

---

<a id="slide-6"></a>
## SLIDE 6 — The Contribution of This Project

### Problem with stake-only influence

Let $W_i$ be wealth. A **wealthy but weak** forecaster can set $b_i = W_i$ and drive the aggregate toward their own report:

$$
w_i = \frac{b_i}{\sum_j b_j} \xrightarrow{W_i \gg W_{-i}} 1.
$$

There is nothing in the Lambert mechanism that prevents this — Lambert's truthfulness argument concerns *what* to report given a wager, not *how much* to stake. So a separate mechanism layer is needed.

### The effective wager: the single object that links learning to money

Define the **skill gate**

$$
g(\sigma_i) = \lambda + (1 - \lambda)\, \sigma_i^{\eta}, \qquad \sigma_i \in [0,1],\quad \lambda \in [0,1],\quad \eta > 0.
$$

Code: `onlinev2/src/onlinev2/core/staking.py` lines 91–97.

Then the **effective wager** is

$$
m_i(t) = b_i(t)\, g(\sigma_i(t)) = b_i(t)\,\bigl( \lambda + (1-\lambda)\,\sigma_i(t)^{\eta} \bigr).
$$

Code: `onlinev2/src/onlinev2/core/staking.py` lines 100–109 (`effective_wager_bankroll`).

**$m_i$ does three things simultaneously:**

1. **Drives aggregation.** The market forecast at level $\tau_k$ is

$$
\hat q^{(k)}(t) = \frac{\sum_i m_i(t)\, q_i^{(k)}(t)}{\sum_i m_i(t)}.
$$

Code: `onlinev2/src/onlinev2/core/aggregation.py` lines 38–65 (`aggregate_forecast`).

2. **Drives settlement.** The skill payoff is

$$
\pi_i^{\text{skill}}(t) = m_i(t)\,\bigl(1 + s(r_i(t), y_t) - \bar s(t)\bigr),\quad \bar s(t) = \frac{\sum_j m_j(t)\, s(r_j(t), y_t)}{\sum_j m_j(t)}.
$$

Code: `onlinev2/src/onlinev2/core/settlement.py` lines 11–36 (`skill_payoff`) and lines 67–125 (`settle_round`).

3. **Determines financial exposure.** The refund is $b_i - m_i$ (returned to the participant regardless of outcome); the at-risk money is exactly $m_i$.

### Why use $\sigma_i$ and not just $b_i$

Because $\sigma_i$ is learned from **past** performance and therefore cannot be manipulated at round $t$ (it is fixed before round $t$ starts); whereas $b_i$ is a round-$t$ strategic choice. Coupling $b_i$ with $\sigma_i$ means that strategic staking cannot decouple influence from demonstrated historical skill.

### Absolute and pre-round

- **Absolute.** $\sigma_i \in [\sigma_{\min}, 1]$ is defined independently of $\sigma_j$ for $j \ne i$. This is the key difference with Vitali & Pinson, whose simplex weights are necessarily *relative*.
- **Pre-round.** $\sigma_i(t)$ depends only on realised losses up to $t-1$. So the truthfulness argument from Lambert extends directly: at round $t$, a risk-neutral agent who takes $m_i(t)$ as given maximises expected payoff by reporting truthfully. Details in §[Appendix A](#appendix-a).

---

<a id="slide-7"></a>
## SLIDE 7 — Mechanism: Round-by-Round (2 min — careful with timing)

### Full pseudocode (what the slide diagram abstracts)

```
for t = 1, ..., T:
    # 1. SUBMIT
    for each participant i:
        observe private signal, produce quantile forecast q_i(t)
        observe wealth W_i(t) and (optionally) confidence c_i(t)
        choose deposit b_i(t)      # deterministic policy in our experiments

    # 2. SKILL GATE (uses sigma_i(t) from EWMA up to t-1)
    m_i(t) = b_i(t) * ( lambda + (1 - lambda) * sigma_i(t) ** eta )
    refund_i(t) = b_i(t) - m_i(t)

    # 3. AGGREGATION
    q_hat(t) = sum_i m_i(t) * q_i(t) / sum_i m_i(t)   # per quantile level

    # 4. OBSERVE y_t, SCORE, SETTLE
    loss_i(t) = CRPS_hat( y_t, q_i(t) ) in [0, 2]
    s_i(t)    = 1 - loss_i(t) / 2                      # score in [0, 1]
    s_bar(t)  = sum_j m_j(t) * s_j(t) / sum_j m_j(t)
    pi_skill_i(t)  = m_i(t) * (1 + s_i(t) - s_bar(t))
    pi_util_i(t)   = 0                                 # unless optional U > 0
    total_payoff_i(t) = pi_skill_i(t) + pi_util_i(t)
    cashout_i(t) = refund_i(t) + total_payoff_i(t)
    profit_i(t)  = total_payoff_i(t) - m_i(t)

    # 5. UPDATE
    L_i(t) = (1 - rho) * L_i(t-1) + rho * loss_i(t) / 2
    sigma_i(t+1) = sigma_min + (1 - sigma_min) * exp( -gamma * L_i(t) )
    W_i(t+1) = max(0, W_i(t) + profit_i(t))
```

### Step-by-step cross-reference

| Step | Spoken phrase | Code | Theory |
|------|---------------|------|--------|
| Submit | "decide how much to deposit" | `staking.choose_deposits` (staking.py:61) | See `theory/Pierre_wagering.md` Raja §3.1 |
| Skill gate | "multiply deposit by a factor" | `staking.skill_gate` (staking.py:91); `effective_wager_bankroll` (staking.py:100) | Eq. 6 in Lambert; extended with $\sigma$ here |
| Aggregation | "effective wagers as weights" | `aggregation.aggregate_forecast` | Raja §3.2 (forecast aggregation operator) |
| Settlement | "Lambert weighted-score formula" | `settlement.settle_round` (settlement.py:67) | Lambert (2008) Thm. 1 |
| Update | "skill estimate updates" | `skill.update_ewma_loss`, `skill.loss_to_skill` | CRPS-based online learning, Pinson et al. |

### Two invariants that must always hold

1. **Budget balance per round.** Because $\sum_i \pi_i^{\text{skill}} = \sum_i m_i \cdot (1 + s_i - \bar s) = \sum_i m_i + \sum_i m_i s_i - \bar s \sum_i m_i = \sum_i m_i$. So total payouts of the skill pool exactly equal total at-risk wagers. The refund is identity-preserving. Tests: `onlinev2/tests/test_settlement*.py`.
2. **Individual feasibility.** $m_i \le b_i$ always, since $g(\sigma_i) \in [\lambda, 1] \subseteq [0,1]$. Enforced at `settlement.py:95–98`.

### What "the same object for influence and exposure" buys you

If the aggregation used weight $w_i^A$ and the settlement used a different $w_i^S$, an agent could sometimes get zero exposure but non-zero influence, which breaks truthfulness. By construction, in our mechanism $w_i^A = w_i^S = m_i/\sum_j m_j$ (with optional capping, see warning below), and the truthfulness argument carries through.

**Implementation warning (audit finding).** When `omega_max > 0` (i.e. a cap on max share), the **aggregation** uses the capped wagers `m_cap` but the **settlement** in `run_simulation` currently uses the un-capped `m`. In our real-data runs and in the Slide-14 benchmark, `omega_max = 0.0`, so the cap is inactive and this does **not** affect any reported number; but it is worth flagging as a minor code-level disagreement if the cap is ever turned on.

---

<a id="slide-8"></a>
## SLIDE 8 — The Skill Signal

### The EWMA of normalised loss

Let $\ell_i(t)$ be forecaster $i$'s round-$t$ loss, normalised to $[0,1]$. In quantile mode we use $\ell_i(t) = \widehat{\text{CRPS}}_i(t)/2$; in point mode, $\ell_i(t) = |y_t - r_i(t)|$ with $y, r \in [0,1]$.

$$
L_i(t) = (1 - \rho_{\text{eff}})\,L_i(t-1) + \rho_{\text{eff}}\,\ell_i(t),
$$

with default $\rho \in (0, 1]$. Code: `skill.update_ewma_loss` (skill.py:32–81).

**Exposure weighting (optional).** If `use_exposure_weighting=True`, the effective learning rate for participant $i$ is

$$
\rho_{\text{eff},i} = \rho \cdot \min\!\left(1, \frac{m_i(t)}{m_{\text{ref}}}\right),
$$

so that participants with near-zero exposure do not fully update their EWMA on round $t$ (they are "cheap" observers). This is off by default in the runners used in Slide 13 and Slide 14.

**Missingness decay.** If participant $i$ is absent at round $t$ (`alpha_i = 1`),

$$
L_i(t) = (1 - \kappa)\,L_i(t-1) + \kappa\,L_0,
$$

so $L_i$ drifts toward a baseline $L_0$ when there is no new evidence. Code: `skill.py:78–80`.

### The loss-to-skill mapping (why bounded?)

$$
\sigma_i(t) = \sigma_{\min} + (1 - \sigma_{\min})\,e^{-\gamma\, L_i(t)}.
$$

Code: `skill.loss_to_skill` (skill.py:84–89). Three properties:

1. **Bounded.** $\sigma_i \in [\sigma_{\min}, 1]$ by construction, even though $L_i$ can drift arbitrarily high when quantile forecasts are badly miscalibrated.
2. **Monotone decreasing in loss.** Higher $L \Rightarrow$ lower $\sigma$. Lower $L \Rightarrow$ $\sigma \to 1$.
3. **No permanent exclusion.** $\sigma_i \ge \sigma_{\min} > 0$ always. A participant who performs badly is down-weighted but not removed.

### Why not use $L_i$ directly?

- **Exposure control.** The skill gate $g(\sigma_i) \in [\lambda, 1]$ keeps $m_i \in [\lambda b_i, b_i]$, so the *fraction* of deposit at risk is bounded away from zero and from one.
- **Stability of aggregation.** If $w_i \propto e^{-\gamma L_i}$, a single catastrophic round for $i$ sends $w_i$ to machine-zero. The boundedness prevents this "reputation cliff".
- **Self-similarity across datasets.** The same $\sigma_{\min}$ and $\gamma$ can be used across datasets with vastly different loss scales; only the calibration of $\gamma$ needs to be checked via `skill.calibrate_gamma` (skill.py:92–104).

### Contrast with Vitali & Pinson's simplex weights

Their $w_{\tau} \in \Delta^{n-1}$ implies $\sum_i w_{\tau,i} = 1$ per quantile. Our $\sigma_i$ is individual — $\sigma_i = 0.7$ means "this forecaster is currently estimated to perform better than a loss of about $L_i = \log((1 - \sigma_{\min})/(\sigma_i - \sigma_{\min}))/\gamma$" and is not affected by what happens elsewhere. This is the *absolute* skill signal that Slide 4 refers to.

### Calibration of $\gamma$ (how $\gamma$ is set)

Given a reference loss $L_{\text{ref}}$ you want to map to a reference skill $\sigma_{\text{ref}}$:

$$
\gamma = -\frac{1}{L_{\text{ref}}} \log\!\left( \frac{\sigma_{\text{ref}} - \sigma_{\min}}{1 - \sigma_{\min}} \right).
$$

Code: `skill.calibrate_gamma`. For the Elia experiments we used $\gamma = 16$, $\rho = 0.5$, $\lambda = 0.05$ (tuned by grid search; reported at `real_data/runner.py:357`).

### The R figure (`presentation/R/plot_skill_signal.R`)

Shows $\sigma(L)$ as an exponentially decreasing curve from 1 (at $L = 0$, "perfect forecaster") to $\sigma_{\min}$ (as $L \to \infty$). The annotation on the $\sigma = 1$ line reads "perfect forecaster" (this was a bug fix; the earlier label was misleadingly "no skill").

---

<a id="slide-9"></a>
## SLIDE 9 — Models, Data, Synthetic Setup

### The 7-forecaster panel (real-data experiments)

Code: `onlinev2/src/onlinev2/real_data/forecasters.py`. All models are strictly causal — at round $t$ they see only $y_1, \dots, y_{t-1}$ — and implement the same `fit / predict / predict_quantiles` interface:

1. **Naive (last value).** $\hat y_t = y_{t-1}$. Retrains every step. Best on autocorrelated series. Residual window 100.
2. **EWMA(span=5).** Exponential smoothing with $\alpha = 2/(\text{span}+1) = 1/3$. Retrains every step. Adapts faster than a simple moving average.
3. **ARIMA(2,1,1).** `statsmodels` fit on a 300-point rolling window, retrained every 50 steps. Native linear AR/MA structure; often adequate for stationary-looking imbalance prices.
4. **XGBoost** (n_lags = 10, 50 trees, max_depth 3). Two sets of models: one for the point forecast, one per quantile using the `reg:quantileerror` objective with `quantile_alpha=tau`. **Seeded** (`random_state=0`) for reproducibility.
5. **MLP** (n_lags = 10, hidden = 16, ReLU). PyTorch, Adam, 100 epochs, MSE. **Seeded** (`torch.manual_seed(0)`) for reproducibility.
6. **Theta**. Simple exponential smoothing with drift ($\alpha = 0.3$, drift from last 50 diffs).
7. **Ensemble.** Arithmetic mean of Naive and EWMA (both point and per-quantile).

Quantile generation is a three-step pipeline in `BaseForecaster.predict_quantiles`:

- **Step 1 (generate).** Native quantile model if available (XGBoost only). Otherwise a residual bootstrap: $q^{(k)} = \hat y + \text{empirical quantile}(\tau_k)$ over the most recent residuals.
- **Step 2 (clip).** $q^{(k)} \leftarrow \text{clip}(q^{(k)}, 0, 1)$ since $y \in [0,1]$.
- **Step 3 (monotonise).** Pool-adjacent-violators (`scipy.optimize.isotonic_regression`) to enforce $q^{(k_1)} \le q^{(k_2)}$ whenever $\tau_{k_1} \le \tau_{k_2}$. This step can move quantiles slightly away from the raw minimiser but guarantees a valid quantile vector.

### The data (Slide 13)

- **Elia offshore wind.** Raw Elia 15-minute "measured" offshore wind power for 2024–2025. Downsampled to hourly by $y^{\text{hourly}}_h = y^{\text{15min}}_{4h}$ (keep every 4th sample). Length: **17,544** hourly observations. Path: `data/elia_offshore_wind_2024_2025.csv`.
- **Elia imbalance prices.** Native hourly resolution. Path: `data/elia_imbalance_prices_2024_2025.csv`.
- Normalisation: $\tilde y = (y - \min)/(\max - \min)$, so $\tilde y \in [0,1]$. The mechanism works on $\tilde y$; the min and max are stored for denormalisation.

### Synthetic setup (Slide 10)

- $n = 6$ synthetic forecasters, each defined by a fixed **noise level** $s_i$ (lower is better).
- $T = 20{,}000$ rounds, averaged over **20 seeds** for the Spearman and reward plots.
- DGP: outcomes drawn from a known process; forecaster $i$ reports the true quantiles plus noise proportional to $s_i$.

### Warm-up

First **200 rounds** (real data) or **100** (synthetic) are used for training only and not scored. This avoids crediting or penalising forecasters before models have seen enough history to produce well-calibrated residual bootstraps. See `real_data/runner.py:68` and `scripts/run_baseline_comparison.py:486`.

---

<a id="slide-10"></a>
## SLIDE 10 — Synthetic Validation: Convergence

### The synthetic experiment

Six forecasters with **known** true noise levels $s_1 < s_2 < \dots < s_6$ over $T=20{,}000$ rounds and $20$ seeds. Two learning-rule sanity checks on the slide:

- **Spearman rank correlation** between the true noise ordering and the end-of-run skill ordering: $\rho = 1.0$. Code: `onlinev2/src/onlinev2/analysis/` + rank reporting in `simulation.py`.
- **Noise–skill Pearson correlation**: $r = -0.98$. The $0.02$ gap from $-1$ reflects sampling noise across seeds, not a systematic bias.

### Why $\rho = 1$ is the right bar

- In synthetic experiments the DGP defines who "should" be ranked higher.
- If the learning rule could not recover the ranking **in synthetic data**, there would be no basis to trust it on Elia (where ground truth is unobserved).
- $\rho = 1$ says the **ordering** is learned perfectly; $r = -0.98$ says the **magnitudes** also line up.

### Reward distribution

On top of ranking, we check that reward follows skill: the noisiest forecaster also has the lowest cumulative profit over the run, the cleanest has the highest. This is a second validation — the mechanism is not just ranking well, it is **paying** correctly under budget balance.

### What this does *not* prove

It does **not** prove anything about real-data performance. Synthetic DGPs with fixed noise levels are the easy case. The gains on Elia (Slide 13) are a separate claim and much smaller, especially on electricity.

---

<a id="slide-11"></a>
## SLIDE 11 — Mechanism Guarantees

### Budget balance

Claim: $\left|\sum_i \pi_i(t) - \sum_i b_i(t)\right| \le \varepsilon_{\text{machine}}$ for every round $t$.

Proof sketch (matches Lambert 2008 Thm. 1):

$$
\sum_i \pi_i^{\text{skill}} = \sum_i m_i(1 + s_i - \bar s) = M + M \cdot \frac{\sum_i m_i s_i}{M} - \bar s \cdot M = M + M \bar s - \bar s M = M,
$$

where $M = \sum_i m_i$. Refund is returned before payoff, so $\sum_i (\text{refund}_i + \pi_i^{\text{skill}}) = \sum_i b_i$.

**Empirical check.** Across 1{,}000 synthetic rounds we observe max $|\text{gap}| \approx 10^{-13}$, i.e. **machine precision** on double-precision arithmetic. The slide therefore summarises this as "machine precision" rather than the raw number. Test file: `onlinev2/tests/test_settlement_budget.py`.

### Mean profit is zero across all participants

Immediate corollary: since $\sum_i \pi_i = \sum_i b_i$, $\sum_i \text{profit}_i = 0$. Mean profit across participants is zero (the mechanism purely redistributes; it does not subsidise or tax).

### Sybilproofness (identical-report clones)

Consider one forecaster $i$ with $(b_i, r_i)$. Suppose they split into $K$ clones each with $(b_i/K, r_i)$. Then:

- Each clone's score is the same $s_i$.
- $\bar s$ is unchanged (the identical scores enter with weights summing to $b_i$).
- Total payoff of the clones: $K \cdot (b_i/K)(1 + s_i - \bar s) = b_i(1 + s_i - \bar s) = \pi_i$.

So total profit is preserved exactly: **sybil ratio = 1.000000**. Test: `onlinev2/tests/test_sybil.py`.

### The "utility" extension (optional, $U > 0$)

When a client posts utility $U > 0$ with cutoff $s_c$, there is an extra term

$$
\pi_i^{\text{util}} = \mathbb 1[U > 0] \cdot \frac{\tilde s_i m_i}{\sum_j \tilde s_j m_j} \cdot U,\qquad \tilde s_i = s_i \cdot \mathbb 1[s_i > s_c].
$$

This adds $U$ to total payouts, so **with $U > 0$ cashflows are no longer strictly zero-sum** (they are zero-sum plus a fixed external input of $U$). All slide-11 claims use $U = 0$ (pure Lambert). Code: `settlement.utility_payoff` (settlement.py:39–64).

### Audit notes (honest caveats worth knowing)

- **Scores are clipped to $[0,1]$** in `skill_payoff` (settlement.py:29). This matches the Lambert-bounded-score formulation but can cut off very-large-deviation scores; in MAE and CRPS-hat modes, this does not bind since those scores are already in $[0,1]$.
- **CRPS-hat ≠ exact CRPS.** We use a finite-quantile approximation on a non-equidistant grid $(0.1, 0.25, 0.5, 0.75, 0.9)$. The approximation is good but not exact; it is called "CRPS-hat" throughout the code (`scoring.py:83–103`).

---

<a id="slide-12"></a>
## SLIDE 12 — Deposit Design

### The 4 deposit policies we compare

Code: `onlinev2/src/onlinev2/behaviour/…` and `simulation.py` `deposit_mode`.

1. **Fixed.** $b_i(t) = b_0$ constant.
2. **Random.** $b_i(t) \sim \text{Uniform}[0, W_i(t)]$.
3. **Bankroll** (wealth-proportional). $b_i(t) = f \cdot W_i(t)$ with $f = 0.3$ default.
4. **Bankroll × Confidence.**

$$
b_i(t) = \min\!\bigl(W_i(t),\, b_{\max},\, f\, W_i(t)\, c_i(t)\bigr),
$$

with confidence derived from quantile width in probit space:

$$
c_i(t) = \text{clip}\!\bigl(e^{-\beta_c\,\Delta z_i(t)},\, c_{\min},\, c_{\max}\bigr),\quad \Delta z_i = \Phi^{-1}(q_i^{(0.9)}) - \Phi^{-1}(q_i^{(0.1)}).
$$

Code: `staking.confidence_from_quantiles` (staking.py:17–58), `staking.choose_deposits` (staking.py:61–88).

### Oracle benchmark

The oracle has access to true precision and uses inverse-variance-optimal weighting. It bounds the best possible improvement from any deposit policy.

### Experimental result (from `fixed_unit=0.0424`, `bankroll_conf=0.0279`)

Relative CRPS improvement over the fixed-deposit baseline:

| Policy | CRPS | $\Delta$ vs fixed | % |
|--------|------|-------------------|----|
| Fixed | 0.0424 | — | 0 % |
| Random | ≈ 0.042 | near 0 | near 0 % |
| Bankroll | 0.035 | −0.007 | −17 % |
| **Bankroll × Conf** | **0.0279** | **−0.0145** | **−34 %** |
| Oracle (upper bound) | 0.024 | −0.0184 | −43 % |

**Takeaway.** Bankroll × Confidence closes most of the oracle gap; the mechanism "looks good" only when deposits themselves carry useful signal. The slide badge therefore reads "Bankroll+Conf: −34% relative to Fixed".

### Truthfulness caveat (important)

If $c_i$ is computed from the **current-round** report $r_i(t)$, deposits become report-dependent and Lambert's truthfulness argument does not apply directly. The safe version uses lagged quantiles or another exogenous/precommitted signal. Code warning is inlined in `staking.py:30–38` and `staking.py:72–79`.

---

<a id="slide-13"></a>
## SLIDE 13 — Real Data: Elia Wind + Electricity

### The experiment

Driver: `scripts/run_real_data_with_skill.py` → `onlinev2.real_data.runner.run_real_data_comparison`. For each dataset:

- $n = 7$ forecasters from §[Slide 9](#slide-9), strictly causal.
- $T = $ 17{,}544 hourly observations (wind) / full native (electricity).
- Warm-up 200 rounds.
- $\tau = (0.1, 0.25, 0.5, 0.75, 0.9)$, CRPS-hat.
- Mechanism tuned: $\gamma = 16$, $\rho = 0.5$, $\lambda = 0.05$, $\eta = 2$, `deposit_mode="fixed"`, $b_0 = 1$, `omega_max=0.0`. Seed 42.

The runner reports **seven** weighting rules in one go (uniform, skill-only, mechanism, best_single, inverse_variance, trimmed_mean, median) plus an **oracle** and a **Diebold-Mariano test** against uniform.

### Headline result

| Dataset | Uniform CRPS | Mechanism CRPS | $\Delta$ | % vs uniform |
|---------|--------------|----------------|----------|--------------|
| Elia wind (offshore power) | ~0.089 | ~0.050 | −0.039 | **−44 %** |
| Elia electricity (imbalance) | ~0.048 | ~0.044 | −0.004 | **−8 %** |

DM statistic is highly significant on wind ($p < 0.001$) and less but still significant on electricity. JSON output: `dashboard/public/data/real_data/{elia_wind,elia_electricity}/data/comparison.json`.

### Why the gap between the two datasets

- **Wind** is highly autocorrelated ($\text{ACF}(1) \approx 0.97$ hourly). Naive persistence is a very strong individual forecaster. The panel is *heterogeneous*: Naive + Ensemble + EWMA are in one cluster, ARIMA/XGBoost/MLP/Theta in another. Skill learning has room to re-weight.
- **Electricity** (imbalance prices) is much noisier and much less autocorrelated. All forecasters sit in roughly the same skill band, so *equal weights is difficult to improve on*. This is the flat-maximum regime.

### Reading the skill trajectories (right panel)

Generated by `presentation/R/plot_real_data.R` from `comparison.json`'s `skill_history` field. On wind:

- Naive rises first (it is nearly optimal given the ACF), followed by Ensemble and EWMA.
- ARIMA/XGBoost/MLP/Theta converge to roughly the same low skill because their *quantiles* are over-spread. Point forecasts might be fine, but the CRPS-hat penalises excess spread.

Key lesson: skill **is not point accuracy**. It is a calibrated probabilistic score — a forecaster can be point-accurate but be ranked low if they are over/under-dispersed.

### Calibration

`comparison.json` contains the empirical PIT per quantile:

| $\tau$ | empirical $\hat F$ (wind) | gap |
|--------|--------------------------|-----|
| 0.10 | ~0.08 | 0.02 |
| 0.25 | ~0.22 | 0.03 |
| 0.50 | ~0.48 | 0.02 |
| 0.75 | ~0.72 | 0.03 |
| 0.90 | ~0.85 | **0.05** |

So the aggregate is slightly **under-dispersed** (tail events happen more often than the 0.9 quantile admits). This is flagged in future work.

---

<a id="slide-14"></a>
## SLIDE 14 — Benchmark Comparison: Prior Work and This Project

### Purpose

Isolate the effect of the **learning layer** by running **three prediction-market designs on exactly the same cached forecasts**. If the forecasts are the same and only the aggregation+settlement differ, the CRPS difference is pure mechanism effect.

Driver: `scripts/run_baseline_comparison.py`. Writes `dashboard/public/data/real_data/{elia_wind,elia_electricity}/data/baselines.json` and `presentation/plots/data/baseline_comparison_{wind,electricity}.csv`. Plot: `presentation/R/plot_baseline_comparison.R` → `dashboard/public/presentation-plots/baseline_comparison.png`.

### The three methods — implementation-level detail

**1. Raja history-free (`method_raja_history_free`)**

- For each round, compute per-agent confidence $c_i(t)$ from quantile width in probit space (same formula as Slide 12).
- Normalise: $w_i(t) = c_i(t) / \sum_j c_j(t)$.
- Aggregate with those weights; settle with Lambert's formula.
- **No memory** across rounds.

**2. Vitali OGD per-quantile (`method_vitali_ogd`, `mode="per_quantile"`)**

- Per quantile $\tau_k$, maintain $W_k(t) \in \Delta^{n-1}$.
- After observing $y_t$, compute pinball subgradient:

$$
\partial_i L^{(\tau_k)}_t = \begin{cases} -\tau_k\, q_i^{(k)}(t) & \text{if } y_t \ge \hat q^{(k)}(t), \\ (1 - \tau_k)\, q_i^{(k)}(t) & \text{otherwise}. \end{cases}
$$

- Update $W_k(t+1) = \Pi_{\Delta}(W_k(t) - \eta\,\partial L_t)$ (Duchi et al. 2008 projection).
- **No Lambert settlement** — this is pure online aggregation, the Shapley layer of the original paper is omitted for comparability.
- Learning rate: $\eta = 0.05$.

**3. This project (`method_mechanism`)**

- Runs `run_simulation` with the same tuned parameters as Slide 13.
- Uses effective wagers $m_i(t) = b_i(t)\,g(\sigma_i(t))$ as both aggregation weights and Lambert-settlement wagers.
- Fixed deposits ($b_0 = 1$) and `omega_max=0` for comparability.

### Numerical headline (from `baselines.json`)

| Method | wind CRPS | wind Δ vs uniform | wind % | electricity CRPS | electricity % |
|--------|-----------|-------------------|--------|------------------|----------------|
| Uniform | 0.089 | — | 0 % | 0.048 | 0 % |
| Raja (history-free) | ~0.087 | −0.002 | **−2 %** | ~0.047 | **−2 %** |
| **This project** | **~0.050** | **−0.039** | **−44 %** | **~0.044** | **−8 %** |
| Vitali OGD (per-quantile) | ~0.031 | −0.058 | **−65 %** | ~0.038 | **−20 %** |

### Interpretation

- **Raja ≪ This project.** The learning layer is what produces the big improvement over Raja on wind (−44 % vs −2 %). This is direct empirical evidence that *history-free self-financed* is leaving a large gain on the table.
- **Vitali < This project on CRPS.** Per-quantile OGD is the lowest CRPS in this benchmark. But it pays three prices: (i) no Lambert self-financing, (ii) weights are relative (simplex), (iii) no single absolute skill signal that can be shown to a participant. The ~21 pp gap on wind is quantified here, not glossed over.
- **The point of the project.** Adaptation + self-financing + absolute skill can coexist, and the empirical cost is now measurable.

### Stability check

The `rolling_crps` panel in `baselines.json` (window = max(100, T_eval/100)) shows the same ordering holds throughout the two-year series — the mechanism's rank is not driven by a single lucky segment.

---

<a id="slide-15"></a>
## SLIDE 15 — Strategic Robustness

### Attack families implemented

In `onlinev2/src/onlinev2/behaviour/` (nine families, 18 presets). Drivers: `scripts/run_behaviour_lab.py` etc.

1. **Identical-report sybils** (exact Lambert assumption). Ratio: **1.000000**.
2. **Diversified sybils** (clones report different $r$). Ratio: **~1.065**. Sybilproofness is guaranteed only under *identical* reports; a small exploitable gap exists with diversification, as expected from the Lambert theorem.
3. **Arbitrage.** Chen et al. (2014, `theory/extra/Unravelling_the_Probabilistic_Forest__Arbitrage_in_Prediction_Market.md`) show weighted-score wagering admits an arbitrage interval in one round. In the repeated setting *with the skill gate and wealth dynamics*, the arbitrage agent extracts **zero sustained profit** across our runs.
4. **Reputation gaming.** The agent reports truthfully for a warm-up phase to build $\sigma$, then submits a biased report. Detection (via sharp drop in $\sigma$) within ~20 rounds.
5. **Collusion.** Two or more participants coordinate reports. No sustained positive profit observed.
6. **Risk-averse hedging, wash-trading, wealth dominance, dynamic drift tracking** and several others — all in `behaviour/` presets.

Each preset is evaluated on a standard metric panel: profit, HHI (Herfindahl concentration of wagers), detection latency, participation pattern.

### The honest caveat on the slide

*Sophisticated adaptive adversaries remain an open direction.* Our attack presets are static or slow-adaptive; a truly adaptive adversary co-optimising with the mechanism is not covered by these runs.

---

<a id="slide-16"></a>
## SLIDE 16 — Conclusion + Future Work

### What was built

A repeated self-financed wagering market that:

- preserves Lambert's seven formal properties (budget balance, truthfulness under risk neutrality, sybilproofness under identical-report clones, anonymity, monotonicity, individual rationality, neutrality),
- adds an **online absolute skill signal** $\sigma_i(t)$ computed from a bounded exponential of EWMA loss,
- couples $\sigma_i$ to the wager through a single object $m_i = b_i g(\sigma_i)$ used for both aggregation and settlement,
- handles intermittent participation via a staleness decay toward a baseline.

### What was shown

- Synthetic: $\rho = 1$ rank recovery, reward aligned with true ordering.
- Guarantees: machine-precision budget balance, zero mean profit, exact identical-report sybilproofness.
- Deposit design: bankroll × confidence closes ~75 % of the oracle gap over fixed deposits.
- Real data (Elia): **−44 %** CRPS on wind, **−8 %** on electricity vs uniform.
- Benchmark (same forecasts, three mechanisms): Raja −2 %, This project −44 %, Vitali −65 % on wind. The three trade-offs are now quantified.

### Clear priorities for future work

1. **Close the Vitali gap without losing self-financing.** This likely requires richer scoring rules (non-linear opinion pools, quantile-specific scores) or richer aggregation primitives — *not* dropping the Lambert framework.
2. **Tail calibration.** The aggregate is under-dispersed by ~5 percentage points at $\tau = 0.9$.
3. **Adaptive adversaries.** Behaviour presets are useful but limited; sophisticated co-adaptive adversaries remain open.

---

<a id="demo"></a>
## DEMO — Live Dashboard (1–2 min, if time)

Suggested live path (same as `SCRIPT.md`):

1. **Home** — orientation.
2. **Results page** — pick Elia wind → scroll mean CRPS by method → optional skill trajectories.
3. **Diagnostics page** — budget gap plot (machine precision), sybil ratio plot.
4. **Behaviour page** (optional) — preset families, comparison table.

All dashboard pages read **the same JSON** the slides are built from (`dashboard/public/data/…`), so anything on the slides can be reproduced live.

---

<a id="appendix-a"></a>
## Appendix A — All formulas in one place

**1. Score (CRPS-hat mode).** For $\tau \in (0,1)$ and outcome $y$, the pinball loss is
$L^{(\tau)}(y, q) = (y - q)\,\bigl(\tau - \mathbb 1[y < q]\bigr)$. The finite-grid CRPS-hat is
$\widehat{\text{CRPS}}(y, q) = (2/K)\sum_{k=1}^K L^{(\tau_k)}(y, q^{(k)}) \in [0, 2]$.
The bounded score is $s = 1 - \widehat{\text{CRPS}}/2 \in [0, 1]$.

**2. Skill gate.** $g(\sigma) = \lambda + (1-\lambda)\sigma^{\eta},\ \sigma \in [0,1],\ \lambda \in [0,1]$.

**3. Effective wager.** $m_i = b_i \cdot g(\sigma_i),\ m_i \le b_i$.

**4. Aggregation.** $\hat q^{(k)} = \sum_i \frac{m_i}{\sum_j m_j}\, q_i^{(k)}$.

**5. Skill payoff.** $\pi_i^{\text{skill}} = m_i(1 + s_i - \bar s)$, $\bar s = \frac{\sum_j m_j s_j}{\sum_j m_j}$.

**6. Utility payoff (optional, $U>0$).**
$\pi_i^{\text{util}} = \mathbb 1[U>0]\,\frac{\tilde s_i m_i}{\sum_j \tilde s_j m_j}\,U$, $\tilde s_i = s_i\,\mathbb 1[s_i > s_c]$.

**7. Cashflow.** refund $= b_i - m_i$; cashout $= \text{refund} + \pi_i^{\text{skill}} + \pi_i^{\text{util}}$; profit $= \pi_i^{\text{skill}} + \pi_i^{\text{util}} - m_i$.

**8. EWMA loss.** $L_i(t) = (1 - \rho_{\text{eff}})\,L_i(t-1) + \rho_{\text{eff}}\,\ell_i(t)$, with $\rho_{\text{eff},i} = \rho\,\min(1, m_i/m_{\text{ref}})$ if exposure weighting is on.

**9. Loss-to-skill.** $\sigma_i(t) = \sigma_{\min} + (1 - \sigma_{\min})\,e^{-\gamma\, L_i(t)}$.

**10. Missingness decay.** Absent at $t$: $L_i(t) = (1 - \kappa)\,L_i(t-1) + \kappa\, L_0$.

**11. Wealth update.** $W_i(t+1) = \max(0,\, W_i(t) + \text{profit}_i(t))$.

**12. Gamma calibration.** $\gamma = -\log\!\bigl((\sigma_{\text{ref}} - \sigma_{\min})/(1 - \sigma_{\min})\bigr)/L_{\text{ref}}$.

---

<a id="appendix-b"></a>
## Appendix B — Code map (what lives where)

- **Core mechanism (pure, no I/O)** — `onlinev2/src/onlinev2/core/`
  - `scoring.py` — pinball, CRPS-hat, bounded scores.
  - `aggregation.py` — weighted quantile averaging.
  - `settlement.py` — `skill_payoff`, `utility_payoff`, `settle_round`.
  - `skill.py` — EWMA loss, loss-to-skill, $\gamma$/$L_0$ calibration.
  - `staking.py` — confidence, deposits, skill gate, effective wager, cap, wealth update.
  - `runner.py`, `types.py`, `weights.py`, `intermittent.py`, `michael_allocation.py`, `shapley.py`.

- **Real data** — `onlinev2/src/onlinev2/real_data/`
  - `forecasters.py` — 7 causal models with seeded XGBoost/MLP.
  - `loader.py` — CSV loaders.
  - `runner.py` — `run_real_data_comparison` producing `comparison.json`.
  - `experiments.py`, `stats.py` — Diebold-Mariano, rolling.

- **Simulation harness** — `onlinev2/src/onlinev2/simulation.py` — `run_simulation` used by both the real-data runner and the baseline comparison.

- **Scripts** — `scripts/`
  - `run_baseline_comparison.py` — 3-way Raja / Vitali / ours head-to-head.
  - `run_real_data_with_skill.py` — the Slide-13 runner.
  - `plot_*.R` and `plot_all_slides.R` — regenerate PNGs.
  - `reproduce_submission.sh` — reproduce everything end-to-end.

- **Plots (R)** — `presentation/R/`
  - `theme_thesis.R` — shared ggplot theme and palette.
  - `plot_positioning_matrix.R`, `plot_baseline_comparison.R`, `plot_real_data.R`, `plot_skill_signal.R`, `plot_deposit_policy.R`, `plot_forecast_aggregation.R`, `plot_settlement_sanity.R`, `plot_skill_recovery.R`, `plot_sybil.R`.

- **Dashboard** — `dashboard/`
  - `src/pages/PresentationPage.tsx` — slide ordering.
  - `src/components/slides/…` — per-slide components.
  - `public/data/real_data/…/comparison.json`, `.../baselines.json`.
  - `public/presentation-plots/*.png` — all the regenerated R plots.

---

<a id="appendix-c"></a>
## Appendix C — How the code runs end-to-end

This appendix is the “wiring diagram” between the clean theory objects ($q_i$, $b_i$, $m_i$, $\sigma_i$, scores, payoffs) and the concrete code that produces the plots and numbers.

### C1. One round in the *core* mechanism (pure functions)

The canonical core is `onlinev2/src/onlinev2/core/` (no I/O, no plotting).

At a high level, a single round is:

1. **Inputs for round $t$**
   - Outcome $y_t$ (already normalised to $[0,1]$ in real-data runs).
   - Quantile report matrix $Q_t \in \mathbb{R}^{n \times K}$ where row $i$ is $(q_i^{(1)}(t),\dots,q_i^{(K)}(t))$.
   - Participation indicator $\alpha_t \in \{0,1\}^n$ (0=present, 1=missing).
   - Deposits $b_t \in \mathbb{R}_+^n$ (policy-defined).
   - Current skill vector $\sigma_t \in [\sigma_{\min},1]^n$ (carried from past rounds).

2. **Effective wager**
   - `core/staking.py`: `effective_wager_bankroll` implements $m_t = b_t \cdot g(\sigma_t)$.

3. **Aggregation**
   - `core/aggregation.py`: `aggregate_forecast(Q_t, m_t)` computes $\hat q^{(k)}(t) = \sum_i (m_i/\sum_j m_j)\,q_i^{(k)}(t)$.

4. **Scoring**
   - `core/scoring.py`: `crps_hat_from_quantiles(y_t, Q_t, taus)` computes per-agent CRPS-hat losses.
   - `core/scoring.py`: `score_crps_hat(...)` maps losses into $s_i(t) \in [0,1]$ by $s=1-\widehat{CRPS}/2$.

5. **Settlement**
   - `core/settlement.py`: `settle_round(b, sigma, lam, scores, ...)` computes:
     - refund $b_i-m_i$,
     - Lambert skill payoff $\pi_i^{skill}=m_i(1+s_i-\bar s)$,
     - profit = payoff − $m_i$,
     - wealth update happens in `core/staking.py:update_wealth`.

6. **Skill update**
   - `core/skill.py`: `update_ewma_loss` updates $L_i(t)$.
   - `core/skill.py`: `loss_to_skill` maps $L_i(t)$ → $\sigma_i(t+1)$.

This is exactly the pipeline you narrate on Slide 7.

### C1b. Minimal “data model” (shapes you should remember)

Keep these shapes in mind while reading the code; it removes 80% of confusion.

- $n$ forecasters, $K$ quantiles
- `q_t`: shape `(n, K)` (quantile reports for round $t$)
- `y_t`: scalar (normalised outcome for round $t$)
- `taus`: shape `(K,)`
- `sigma_t`, `b_t`, `m_t`, `alpha_t`: shape `(n,)`
- `r_hat_t`: shape `(K,)` (market aggregated quantiles)

### C2. Simulation runner (synthetic + “mechanism on fixed forecasts”)

`onlinev2/src/onlinev2/simulation.py` is the harness that loops the core round logic.

Key inputs you should know how to interpret:

- **`scoring_mode="quantiles_crps"`**: uses CRPS-hat (finite quantile score).
- **`taus`**: quantile grid; default in many scripts is `(0.1, 0.25, 0.5, 0.75, 0.9)` (not equidistant).
- **`deposit_mode`**:
  - `"fixed"` with `fixed_deposit=1.0` means the real-data results isolate the *weight-learning* mechanism; they do not exercise wealth-based deposit dynamics.
- **`omega_max=0.0`**: dominance cap is off in all headline runs/plots.
- **`store_history=True`**: stores `sigma_hist`, `wager_hist`, `r_hat_hist` so plots can be generated.

### C2b. What the simulation returns (fields used by plots)

When `store_history=True`, the simulation exposes the time series later used by `real_data/runner.py` and the R plots:

- `sigma_hist`: `(n, T)` skill trajectories
- `wager_hist`: `(n, T)` effective wager per agent per round (also the aggregation weights)
- `r_hat_hist`: length `T` list of aggregated reports, each `(K,)`
- `score_hist` (when present): `(n, T)` per-round scores used by settlement
- `L_hist` (when present): EWMA loss state per agent

### C3. Real-data pipeline (Elia)

Real-data runs are produced by:

- `onlinev2/src/onlinev2/real_data/forecasters.py`: defines the 7 forecasters (strictly causal).
- `onlinev2/src/onlinev2/real_data/runner.py`: `run_real_data_comparison`:
  1. normalises series to $[0,1]$,
  2. rolls forward and produces $Q_t$ for each $t$,
  3. calls `run_simulation` on the precomputed `q_reports_pre` and `y_pre`,
  4. computes CRPS series for several comparison rules (uniform, mechanism, best-single, etc.),
  5. writes `dashboard/public/data/real_data/<dataset>/data/comparison.json`.

**Reproducibility note.** The stochastic forecasters are seeded:
- XGBoost uses `random_state=0`,
- MLP uses `torch.manual_seed(0)`.

### C3b. Where the exact slide numbers come from (files)

- Slide 13 real-data numbers and skill trajectories:
  - `dashboard/public/data/real_data/elia_wind/data/comparison.json`
  - `dashboard/public/data/real_data/elia_electricity/data/comparison.json`
- Slide 14 benchmark comparison plot:
  - `dashboard/public/data/real_data/elia_wind/data/baselines.json`
  - `dashboard/public/data/real_data/elia_electricity/data/baselines.json`

### C4. Baseline benchmark (Raja vs Vitali vs this project)

The head-to-head baseline is `scripts/run_baseline_comparison.py`:

1. Load raw series and normalise it.
2. Run all forecasters causally once; cache forecasts to `onlinev2/outputs_cache/<dataset>_forecasts.npz`.
3. Run 4 methods on the same cached forecasts:
   - uniform,
   - Raja history-free (confidence weights),
   - Vitali OGD on simplex (per-quantile weights),
   - this project’s mechanism (`run_simulation`).
4. Output:
   - `dashboard/public/data/real_data/<dataset>/data/baselines.json` (for dashboard + slide),
   - `presentation/plots/data/*.csv` (for R figure generation).

This is the cleanest “apples-to-apples” comparison because forecasts are held fixed.

### C5. Reproduction commands (copy/paste)

From repo root:

```bash
# Benchmark comparison (Raja vs Vitali vs this project) on both datasets
onlinev2/.venv/bin/python scripts/run_baseline_comparison.py --dataset both --force-cache

# Real-data mechanism comparison JSONs used by Slide 13
onlinev2/.venv/bin/python scripts/run_real_data_with_skill.py --tuned

# Regenerate all R plots used in slides (writes PNGs to dashboard/public/presentation-plots)
Rscript scripts/plot_all_slides.R
```

---

<a id="appendix-d"></a>
## Appendix D — Truthfulness (proof sketch) + what can break it

This is the most important theory point to be able to explain precisely.

### D1. Statement (risk-neutral truthfulness, one round)

Fix a round $t$. Suppose:

1. The agent’s effective wager $m_i(t)$ is fixed with respect to their current report $r_i(t)$.
2. The score $s(r,\omega)$ is **strictly proper** for the report space being elicited (here: quantiles/CRPS-hat).
3. Agents are **risk-neutral** and maximise expected profit.

Then the Lambert weighted-score settlement makes truthful reporting a best response.

### D1b. What exactly is the agent maximising?

In Lambert settlement (with $U=0$), the round-$t$ profit for agent $i$ is:

$$
\mathrm{profit}_i(t) = \pi_i^{\text{skill}}(t) - m_i(t).
$$

If $m_i(t)$ is fixed when the report is chosen, then the only report-dependent term is $s_i(t)$ (inside $\pi_i^{\text{skill}}$). The $\bar s(t)$ term is an affine adjustment that does not change the properness argument: maximising expected profit is equivalent to maximising expected score.

### D2. Why Lambert truthfulness still holds with the skill gate

The skill gate changes $m_i$ from $b_i$ to $m_i=b_i g(\sigma_i)$.

But as long as $\sigma_i(t)$ is computed **only from past information** (i.e. from realised outcomes up to $t-1$), it is fixed at the start of round $t$, so $m_i(t)$ is fixed when the agent chooses $r_i(t)$.

Therefore the classical Lambert argument applies unchanged *conditional on $m_i(t)$*.

### D3. What can break truthfulness in implementation

Truthfulness hinges on “wager independent of current report.” In this repo, the main thing to watch is:

- `core/staking.py:confidence_from_quantiles(...)`

If deposits are computed from the **current-round** quantile report (quantile width proxy), then the wager becomes report-dependent, and strict truthfulness is no longer guaranteed by Lambert’s theorem.

This is why the code contains explicit warnings that confidence must be lagged or exogenous for theorem-preserving claims.

### D3b. Common confusion: “but the agent chooses the deposit”

Lambert truthfulness is a statement about the **best report**, not the **best deposit**.

- Agents may still strategically choose $b_i(t)$ to trade off expected return vs risk.
- **Given** a deposit (and hence a fixed effective wager), strict properness makes truthful reporting optimal (risk-neutral).

Deposit design is a separate behavioural layer (Slide 12), and this repo studies it explicitly.

### D4. Risk aversion

Lambert truthfulness is under risk neutrality. With risk-averse agents, they may hedge/shade reports to reduce variance of payoff even under proper scoring. This is a known limitation of all Lambert-family mechanisms and should be stated explicitly if asked.

---

<a id="appendix-e"></a>
## Appendix E — Extended Q&A (from `theory/extra/`)

### E1. "Why is the skill signal bounded but the accumulator unbounded?"

Because what the *mechanism* uses is $\sigma$, and exposure has to be controllable. The **accumulator** $L$ is unbounded because it is a sufficient statistic — compressing it prematurely would lose information. The **public signal** $\sigma$ is bounded because it governs how much money is at stake, and we need to guarantee $m_i \in [\lambda b_i, b_i]$.

### E2. "How does this compare to pure online convex optimisation (Cesa-Bianchi–Lugosi)?"

Classical online aggregation gives regret bounds like $O(\sqrt T \log n)$ for bounded losses. It does not have:

- Budget balance (no monetary layer).
- Truthfulness (no scoring-rule elicitation).
- Sybilproofness (no identity semantics).

Our mechanism gives up the explicit regret bound but keeps the economic properties. Vitali & Pinson's OGD is the closest to classical online aggregation and achieves the lowest CRPS on Slide 14 exactly because it is optimising CRPS directly.

### E3. "Why use the finite-grid CRPS-hat and not exact CRPS?"

Exact CRPS requires a closed-form predictive distribution. Our forecasters only emit quantile grids. The finite-grid surrogate $\widehat{\text{CRPS}} = (2/K)\sum_k L^{(\tau_k)}$ is the average pinball loss across reported quantiles; it is a proper scoring rule on the quantile grid and is standard in probabilistic forecasting (see Gneiting & Raftery 2007 and `theory/extra/Online_Learning_with_Continuous_Ranked_Probability_Score.md`). The main caveat is that the standard trapezoidal argument for the CRPS-CRPS-hat gap assumes an equidistant probability grid; our default grid is $(0.1, 0.25, 0.5, 0.75, 0.9)$, which is not equidistant. A 9-level equidistant grid is also available (`TAUS_FINE` in `scoring.py`).

### E4. "Why not use exact Shapley payouts instead of Lambert?"

Shapley values for $n$ forecasters require $2^n$ marginal contributions. With $n = 7$ that is $128$ per round; feasible, but not scalable. More importantly, Shapley-based settlement in Vitali & Pinson is *not* self-financed — it requires an external payer — which breaks the market interpretation. See `theory/extra/Game-theoretic_Payoff_Allocation_in_Multiagent_Machine_Learning_Systems.md`.

### E5. "Could the same mechanism work for classification or for non-monetary reputation?"

Yes in principle. The only structural ingredients are:

- A bounded proper scoring rule $s \in [0,1]$ (CRPS for distributions; Brier for probabilities; log-score with clipping; etc.).
- A non-negative wager $b_i$ (or a "budget" for reputation).
- Weighted aggregation and weighted-score settlement.

The theorems from Lambert 2008 extend as long as $s$ is strictly proper and bounded and the wager is budget-balanced.

### E6. "What breaks if $y \notin [0,1]$?"

The score $s = 1 - |y - r|$ is only in $[0,1]$ when $y, r \in [0,1]$. For CRPS-hat we divide by 2 to normalise; that normalisation only works when the outcome is in $[0,1]$ too (otherwise max pinball can be larger). We enforce this by normalising the outcome series before the run (`real_data/runner.normalize_series`).

### E7. "How do you tune $\gamma, \rho, \lambda, \eta$?"

- $\lambda$: "fraction of wager that enters regardless of skill". Interpretation: minimum participation floor. We use $\lambda = 0.05$.
- $\eta$: shape of the gate. $\eta = 2$ convexifies the gate, so high-skill forecasters get disproportionately more weight. $\eta = 1$ is linear.
- $\rho$: EWMA learning rate. Small $\rho$ = slow, smooth; large $\rho$ = fast, noisy. Tuned $\rho = 0.5$.
- $\gamma$: sensitivity of $\sigma$ to $L$. Tuned $\gamma = 16$.

All via grid search on a validation split. See `scripts/run_sensitivity_experiments.py`.

### E8. "What happens when all participants are absent or all wagers are zero?"

`aggregate_forecast` returns either a user-specified `fallback` or zero, and `settlement.skill_payoff` returns zeros. No division by zero; no payouts; the round is effectively skipped.

### E9. "Why not compare against equal weights only on a smaller panel?"

We do — the "best_single" line in `comparison.json` tracks the single best forecaster (lowest recent CRPS) and wins over equal weights on wind because Naive persistence is so strong there. The mechanism sits between Naive-only and equal weights: it captures the heterogeneity without committing to Naive.

### E10. "What are the biggest code-level caveats I should be honest about in Q&A?"

From the audit:

- `confidence_from_quantiles` is a heuristic; it is not derived from a proper scoring rule. Safe to use as a deposit signal **only if lagged**.
- `omega_max` capping applies in aggregation but not in settlement; in our runs `omega_max = 0` so this never bites, but the inconsistency exists.
- CRPS-hat is a surrogate; the 5-point grid is non-equidistant.
- `use_exposure_weighting=True` is off by default in the Slide-13 runner, so EWMA updates are not weighted by economic stake there.
- In the real-data runner, `deposit_mode="fixed"` with $b_0=1$ — the full wealth/deposit dynamics are not exercised on the Elia runs. That is deliberate (comparability with the baselines) but worth flagging.

---

*End of advanced study script. Pair with `SCRIPT.md` for delivery and the dashboard/R plots for figures.*
