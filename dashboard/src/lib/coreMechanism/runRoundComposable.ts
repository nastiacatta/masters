import type { AgentState } from './runRound';
import { capWeightShares } from './runRoundExtended';

const EPS = 1e-12;

export type DepositPolicy = 'fixed_unit' | 'wealth_fraction' | 'sigma_scaled';
export type InfluenceRule = 'uniform' | 'deposit_only' | 'skill_only' | 'skill_stake';
export type AggregationRule = 'linear' | 'sqrt' | 'softmax';
export type SettlementRule = 'skill_only' | 'skill_plus_utility';

export interface BuilderSelections {
  depositPolicy: DepositPolicy;
  influenceRule: InfluenceRule;
  aggregationRule: AggregationRule;
  settlementRule: SettlementRule;
}

export const DEFAULT_BUILDER_SELECTIONS: BuilderSelections = {
  depositPolicy: 'wealth_fraction',
  influenceRule: 'skill_stake',
  aggregationRule: 'linear',
  settlementRule: 'skill_only',
};

export interface ComposableParams {
  lam: number;
  eta: number;
  sigma_min: number;
  gamma: number;
  rho: number;
  omegaMax: number;
  utilityPool: number;
  scoreThreshold: number;
  fixedDeposit: number;
  baseDepositFraction: number;
  sigmaDepositScale: number;
  kappa?: number;
  L0?: number;
  builder: BuilderSelections;
}

export interface AgentDecision {
  accountId: number;
  participate: boolean;
  report: number | null;
  riskFraction?: number;
  depositMultiplier?: number;
}

export interface RoundTrace {
  round: number;
  y: number;

  L_prev: number[];
  sigma_t: number[];
  wealth_before: number[];

  participated: boolean[];
  reports: number[];
  deposits: number[];
  influence: number[];

  aggregationMass: number[];
  cappedAggregationMass: number[];
  weights: number[];
  r_hat: number;

  losses: number[];
  scores: number[];

  skillPayoff: number[];
  utilityPayoff: number[];
  totalPayoff: number[];
  profit: number[];
  refunds: number[];

  wealth_after: number[];
  L_new: number[];
  sigma_new: number[];

  activeCount: number;
  hhi: number;
  nEff: number;
  topShare: number;
}

function clamp(value: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, value));
}

function maeLoss(y: number, r: number): number {
  return Math.abs(r - y);
}

function scoreMae(y: number, r: number): number {
  return 1 - Math.abs(y - r);
}

function lossToSkill(L: number, sigmaMin: number, gamma: number): number {
  const sigma = sigmaMin + (1 - sigmaMin) * Math.exp(-gamma * L);
  return clamp(sigma, sigmaMin, 1);
}

function updateEwmaLoss(
  LPrev: number,
  loss: number,
  absent: boolean,
  rho: number,
  kappa = 0,
  L0 = 0,
): number {
  if (!absent) {
    return (1 - rho) * LPrev + rho * loss;
  }
  if (kappa !== 0) {
    return (1 - kappa) * LPrev + kappa * L0;
  }
  return LPrev;
}

function normalise(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= EPS) {
    return values.map(() => 0);
  }
  return values.map((value) => value / total);
}

function computeDeposit(
  state: AgentState,
  sigma: number,
  decision: AgentDecision,
  params: ComposableParams,
): number {
  if (!decision.participate) return 0;

  const riskFraction = clamp(
    decision.riskFraction ?? params.baseDepositFraction,
    0,
    1,
  );
  const multiplier = Math.max(0, decision.depositMultiplier ?? 1);

  let target = 0;
  switch (params.builder.depositPolicy) {
    case 'fixed_unit':
      target = params.fixedDeposit * multiplier;
      break;
    case 'sigma_scaled':
      target =
        state.wealth *
        riskFraction *
        (0.25 + params.sigmaDepositScale * sigma) *
        multiplier;
      break;
    case 'wealth_fraction':
    default:
      target = state.wealth * riskFraction * multiplier;
      break;
  }

  return Math.max(0, Math.min(state.wealth, target));
}

function computeInfluence(
  deposit: number,
  sigma: number,
  participated: boolean,
  params: ComposableParams,
): number {
  if (!participated) return 0;

  const g =
    params.lam +
    (1 - params.lam) * Math.pow(clamp(sigma, 0, 1), params.eta);

  switch (params.builder.influenceRule) {
    case 'uniform':
      return 1;
    case 'deposit_only':
      return deposit;
    case 'skill_only':
      return g;
    case 'skill_stake':
    default:
      return deposit * g;
  }
}

function computeAggregationMass(
  influence: number[],
  params: ComposableParams,
): number[] {
  switch (params.builder.aggregationRule) {
    case 'sqrt':
      return influence.map((value) => Math.sqrt(Math.max(0, value)));
    case 'softmax': {
      const maxValue = Math.max(...influence, 1);
      return influence.map((value) => Math.exp(Math.max(0, value) / maxValue));
    }
    case 'linear':
    default:
      return influence.slice();
  }
}

export function runComposableRound(
  round: number,
  state: AgentState[],
  decisions: AgentDecision[],
  y: number,
  params: ComposableParams,
): RoundTrace {
  const L_prev = state.map((agent) => agent.L);
  const wealth_before = state.map((agent) => agent.wealth);
  const sigma_t = L_prev.map((L) => lossToSkill(L, params.sigma_min, params.gamma));

  const participated = decisions.map((decision) => decision.participate);
  const reports = decisions.map((decision) =>
    decision.participate && decision.report != null ? clamp(decision.report) : 0,
  );

  const deposits = decisions.map((decision, index) =>
    computeDeposit(state[index], sigma_t[index], decision, params),
  );

  const influence = decisions.map((decision, index) =>
    computeInfluence(deposits[index], sigma_t[index], decision.participate, params),
  );

  const aggregationMass = computeAggregationMass(influence, params);
  const cappedAggregationMass =
    params.omegaMax < 1
      ? capWeightShares(aggregationMass, params.omegaMax)
      : aggregationMass.slice();

  const weights = normalise(cappedAggregationMass);

  const r_hat =
    weights.reduce((sum, weight, index) => sum + weight * reports[index], 0);

  const losses = decisions.map((decision, index) =>
    decision.participate && decision.report != null ? maeLoss(y, reports[index]) : 0,
  );

  const scores = decisions.map((decision, index) =>
    decision.participate && decision.report != null ? scoreMae(y, reports[index]) : 0,
  );

  const totalInfluence = influence.reduce((sum, value) => sum + value, 0);

  const meanScore =
    totalInfluence > EPS
      ? influence.reduce((sum, value, index) => sum + value * scores[index], 0) /
        totalInfluence
      : 0;

  const skillPayoff =
    totalInfluence > EPS
      ? influence.map((value, index) =>
          value > 0 ? value * (1 + clamp(scores[index], 0, 1) - meanScore) : 0,
        )
      : influence.map(() => 0);

  let utilityPayoff = influence.map(() => 0);
  if (
    params.builder.settlementRule === 'skill_plus_utility' &&
    params.utilityPool > 0
  ) {
    const qualifiedMass = influence.map((value, index) =>
      scores[index] > params.scoreThreshold ? value * scores[index] : 0,
    );
    const qualifiedTotal = qualifiedMass.reduce((sum, value) => sum + value, 0);

    if (qualifiedTotal > EPS) {
      utilityPayoff = qualifiedMass.map(
        (value) => (params.utilityPool * value) / qualifiedTotal,
      );
    }
  }

  const totalPayoff = skillPayoff.map(
    (value, index) => value + utilityPayoff[index],
  );

  const profit = totalPayoff.map((value, index) => value - influence[index]);
  const refunds = deposits.map((value, index) => Math.max(0, value - influence[index]));
  const wealth_after = wealth_before.map((wealth, index) =>
    Math.max(0, wealth + profit[index]),
  );

  const L_new = L_prev.map((value, index) =>
    updateEwmaLoss(
      value,
      losses[index],
      !participated[index],
      params.rho,
      params.kappa ?? 0,
      params.L0 ?? 0,
    ),
  );

  const sigma_new = L_new.map((L) => lossToSkill(L, params.sigma_min, params.gamma));

  const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
  const nEff = hhi > EPS ? 1 / hhi : 0;
  const topShare = weights.length ? Math.max(...weights) : 0;

  return {
    round,
    y,

    L_prev,
    sigma_t,
    wealth_before,

    participated,
    reports,
    deposits,
    influence,

    aggregationMass,
    cappedAggregationMass,
    weights,
    r_hat,

    losses,
    scores,

    skillPayoff,
    utilityPayoff,
    totalPayoff,
    profit,
    refunds,

    wealth_after,
    L_new,
    sigma_new,

    activeCount: participated.filter(Boolean).length,
    hhi,
    nEff,
    topShare,
  };
}
