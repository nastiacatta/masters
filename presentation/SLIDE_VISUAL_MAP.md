# Slide → Visual Map

Each slide maps to a specific plot or diagram. Plots marked ✅ already exist as PNGs. Plots marked 🔨 need to be created.

| Slide | Title | Visual | Source | Status |
|-------|-------|--------|--------|--------|
| 1 | Title | Imperial crest + title text | Template layout | ✅ |
| 2 | Why Forecast Aggregation | Diagram: distributed owners → aggregation → decisions | Custom diagram | 🔨 |
| 3 | Prediction Markets | Market structure diagram (Raja Fig 1 style) | Custom diagram | 🔨 |
| 4 | Existing Work | Three-column text layout | Template "Three Content" layout | ✅ |
| 5 | Gap + Contribution | Large text statement + contribution box | Template "Large Text" layout | ✅ |
| 6 | Round-by-Round Mechanism | Pipeline flowchart: submit → skill gate → aggregate → settle → update | Custom diagram | 🔨 |
| 7 | Skill Signal | σ vs L curve + skill recovery table | `skill_recovery/quantiles_crps_recovery.png` | ✅ |
| 8 | Architecture | Three-layer modular diagram | Custom diagram | 🔨 |
| 9 | Correctness | Invariant table (numbers only) | `settlement_sanity/settlement_sanity.png` + `sybil/sybil.png` | ✅ |
| 10 | Deposit Design | Bar chart: 4 deposit policies | `deposit_policy_comparison/deposit_policy_comparison.png` | ✅ |
| 11 | Weight Rules | Table + bar chart | `weight_rule_comparison/weight_rule_comparison.png` | ✅ |
| 12 | Skill Recovery + Robustness | Skill trajectories + behaviour matrix table | `skill_recovery/quantiles_crps_recovery.png` | ✅ |
| 13 | Strategic Robustness | Sybil ratio plot + arbitrage scan | `sybil/sybil.png` | ✅ |
| 14 | Calibration | Reliability diagram | `calibration/calibration_reliability.png` | ✅ |
| 15 | Contributions + Closing | Bullet list + thank you | Template "Closing Slide" layout | ✅ |

## Key plots to embed in pptx (from outputs_final):
1. `deposit_policy_comparison.png` — Slide 10 (strongest result)
2. `weight_rule_comparison.png` — Slide 11
3. `calibration_reliability.png` — Slide 14
4. `quantiles_crps_recovery.png` — Slide 7 and 12
5. `sybil.png` — Slide 9 and 13
6. `settlement_sanity.png` — Slide 9

## Dashboard slides page approach:
- Restore the archived SlidesPage.tsx with updated slide components
- Reuse existing chart components from the dashboard
- Add new slide components for the 15 thesis defence slides
- Keep keyboard navigation (arrow keys) and sidebar index
