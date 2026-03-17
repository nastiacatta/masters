# Skill & Wager Under Intermittency

**Plot**: 3x3 grid — one row per agent (F0–F2), columns: learned skill sigma(t), effective wager m(t), cumulative profit. 200 rounds, 30% missingness. Grey ticks mark absent rounds.

**Results**:
- Skill correctly separates agents: best forecaster maintains highest sigma.
- Wagers amplify skill: m_i = b_i * (lam + (1-lam)*sigma_i).
- Profit is monotonic in skill — best agent gains, worst loses.
- Missing rounds don't destabilise learning (sigma frozen during absence).
