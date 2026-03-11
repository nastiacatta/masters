/**
 * Extended mechanism with weight cap (omegaMax), utility pool.
 * Aligned with onlinev2.core and staking.cap_weight_shares.
 */
import type { AgentState, AgentAction, MechanismParams, StepOutputs } from './runRound';
import { runRound } from './runRound';

const EPS = 1e-12;

export interface ExtendedParams extends MechanismParams {
  omegaMax?: number;
  utilityPool?: number;
  scoreThreshold?: number;
}

/** Cap weight shares per onlinev2 staking.cap_weight_shares. */
export function capWeightShares(m: number[], omegaMax: number): number[] {
  const cleaned = m.map((v) => Math.max(0, v));
  const M = cleaned.reduce((a, b) => a + b, 0);
  if (M <= EPS) return cleaned;
  const n = cleaned.length;
  const om = Math.max(1 / n, Math.min(1, omegaMax));
  let shares = cleaned.map((v) => v / M);

  for (let iter = 0; iter < n + 5; iter++) {
    const over = shares.map((s) => s > om + EPS);
    if (!over.some(Boolean)) break;
    let remainder = 1;
    shares = shares.map((s, i) => {
      if (over[i]) {
        remainder -= om;
        return om;
      }
      return s;
    });
    const free = n - over.filter(Boolean).length;
    if (free <= 0) break;
    const fill = Math.min(remainder / free, om);
    shares = shares.map((s, i) => (over[i] ? s : fill));
  }
  const sum = shares.reduce((a, b) => a + b, 0);
  const norm = sum > 0 ? shares.map((s) => (s / sum) * M) : cleaned;
  return norm;
}

export interface ExtendedStepOutputs extends StepOutputs {
  cappedWager: number[];
  weight: number[];
  utilityPayoff: number[];
}

/** Run one round with weight cap and optional utility pool. */
export function runRoundExtended(
  state: AgentState[],
  actions: AgentAction[],
  y_t: number,
  params: ExtendedParams
): ExtendedStepOutputs {
  const base = runRound(state, actions, y_t, params);
  const omegaMax = params.omegaMax ?? 1;
  const U = params.utilityPool ?? 0;
  const sClient = params.scoreThreshold ?? 0;

  let capped = base.m.slice();
  let weights = base.m.map((mi) => {
    const M = base.m.reduce((a, b) => a + b, 0);
    return M > EPS ? mi / M : 0;
  });

  if (omegaMax < 1) {
    capped = capWeightShares(base.m, omegaMax);
    const totalCapped = capped.reduce((a, b) => a + b, 0);
    weights = totalCapped > EPS ? capped.map((c) => c / totalCapped) : capped.map(() => 0);
  }

  const r_hat =
    base.m.reduce((a, b) => a + b, 0) > EPS
      ? weights.reduce((sum, w, i) => sum + w * (base.alpha[i] === 0 ? base.reports[i] : 0), 0)
      : base.r_hat;

  let utilityPayoff = base.m.map(() => 0);
  if (U > 0 && sClient >= 0) {
    const sTildeM = base.scores.map((s, i) =>
      s > sClient ? s * base.m[i] : 0
    );
    const denom = sTildeM.reduce((a, b) => a + b, 0);
    if (denom > EPS) {
      utilityPayoff = base.m.map((mi, i) =>
        base.scores[i] > sClient
          ? (base.scores[i] * mi * U) / denom
          : 0
      );
    }
  }

  const totalPayoff = base.skill_payoff.map((pi, i) => pi + utilityPayoff[i]);
  const profit = totalPayoff.map((tp, i) => tp - base.m[i]);
  const wealth_new = state.map((s, i) => Math.max(0, s.wealth + profit[i]));

  return {
    ...base,
    r_hat,
    cappedWager: capped,
    weight: weights,
    utilityPayoff,
    skill_payoff: base.skill_payoff,
    profit,
    wealth_new,
  };
}
