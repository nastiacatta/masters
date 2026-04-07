/**
 * Pipeline runner: DGP → Core (composable) → run and collect results with per-round traces.
 * Rerun from round 0 to T on every option change; UI reads selected round from recomputed state.
 */
import { generateDGP, type DGPId } from './dgpSimulator';
import type { AgentState, WeightingMode } from './runRound';
import {
  DEFAULT_BUILDER_SELECTIONS,
  runComposableRound,
  type BuilderSelections,
  type ComposableParams,
  type RoundTrace,
  type InfluenceRule,
} from './runRoundComposable';
import type { BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';

const DEFAULT_ROUNDS = 20000;
const DEFAULT_SEED = 42;
const DEFAULT_N = 6;
const INITIAL_WEALTH = 20;

export interface PipelineRoundResult {
  round: number;
  y: number;
  r_hat: number;
  error: number;
  participation: number;
  nEff: number;
  meanSigma: number;
  totalDeposited: number;
  totalInfluence: number;
  totalDistributed: number;
  hhi: number;
  topShare: number;
}

export interface PipelineResult {
  dgpId: DGPId;
  weighting: WeightingMode;
  behaviourPreset: BehaviourPresetId;
  builder: BuilderSelections;
  params: ComposableParams;
  rounds: PipelineRoundResult[];
  traces: RoundTrace[];
  finalState: AgentState[];
  summary: {
    meanError: number;
    meanParticipation: number;
    meanNEff: number;
    finalRounds: number;
    finalGini: number;
    finalAggregate: number;
    finalDistributed: number;
  };
}

export interface PipelineOptions {
  dgpId: DGPId;
  weighting?: WeightingMode;
  behaviourPreset: BehaviourPresetId;
  rounds?: number;
  seed?: number;
  n?: number;
  builder?: Partial<BuilderSelections>;
  mechanism?: Partial<Omit<ComposableParams, 'builder'>>;
}

function clamp(value: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, value));
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function gini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const total = sorted.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return 0;

  let weighted = 0;
  sorted.forEach((value, index) => {
    weighted += (index + 1) * value;
  });

  return (2 * weighted - (sorted.length + 1) * total) / (sorted.length * total);
}

function makeRng(seed: number): () => number {
  let s = (Math.floor(seed) || 1) % 2147483647;
  if (s <= 0) s += 2147483646;

  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

function normalSample(rng: () => number): number {
  // Box-Muller using both components via closure cache
  if (normalSample._cached !== undefined) {
    const v = normalSample._cached;
    normalSample._cached = undefined;
    return v;
  }
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  const r = Math.sqrt(-2 * Math.log(u1));
  const theta = 2 * Math.PI * u2;
  normalSample._cached = r * Math.sin(theta);
  return r * Math.cos(theta);
}
normalSample._cached = undefined as number | undefined;

function influenceFromWeighting(mode: WeightingMode | undefined): InfluenceRule {
  switch (mode) {
    case 'uniform':
      return 'uniform';
    case 'deposit':
      return 'deposit_only';
    case 'skill':
      return 'skill_only';
    case 'full':
    default:
      return 'skill_stake';
  }
}

function buildSelections(
  weighting: WeightingMode | undefined,
  overrides?: Partial<BuilderSelections>,
): BuilderSelections {
  return {
    ...DEFAULT_BUILDER_SELECTIONS,
    influenceRule: influenceFromWeighting(weighting),
    ...overrides,
  };
}

interface BehaviourDecision {
  participate: boolean;
  report: number | null;
  riskFraction: number;
  depositMultiplier: number;
}

function buildRoundBehaviour(
  preset: BehaviourPresetId,
  round: number,
  baseReports: number[],
  previousAggregate: number,
  state: AgentState[],
  rng: () => number,
): BehaviourDecision[] {
  const centre = mean(baseReports);
  const dispersion = Math.sqrt(
    mean(baseReports.map((value) => (value - centre) ** 2)),
  );

  const attackerIndex = 0;
  const arbitrageurIndex = Math.max(0, state.length - 1);
  const sybilCount = Math.min(2, state.length);

  return baseReports.map((baseReport, index) => {
    let participate = true;
    let report = clamp(baseReport);
    let riskFraction = clamp(0.16 + 0.12 * state[index].sigma, 0.05, 0.45);
    let depositMultiplier = 1;

    if (preset === 'bursty') {
      const wave = 0.5 + 0.5 * Math.sin((round + index * 1.7) / 3.5);
      const p = clamp(0.18 + 0.72 * wave, 0.1, 0.95);
      participate = rng() < p;
    }

    if (preset === 'risk_averse') {
      report = clamp(0.7 * baseReport + 0.3 * 0.5);
      riskFraction *= 0.55;
    }

    if (preset === 'manipulator' && index === attackerIndex) {
      const direction = Math.sign(0.5 - previousAggregate || 1);
      report = clamp(baseReport + 0.22 * direction);
      riskFraction *= 1.35;
    }

    if (preset === 'evader' && index === attackerIndex) {
      const direction = Math.sign(0.5 - previousAggregate || 1);
      const stealth = dispersion > 0.15 ? 0.45 : 1;
      report = clamp(baseReport + 0.18 * direction * stealth);
      riskFraction *= 1.15 * stealth;
    }

    if (preset === 'arbitrageur' && index === arbitrageurIndex) {
      // Chen et al. (2014): report = weighted avg of others' reports → guaranteed nonneg payoff
      // p_hat_i = sum_{j≠i} w_j * p_j / sum_{j≠i} w_j
      // In our setting, we approximate with equal weights over other agents' reports
      const othersSum = baseReports.reduce((s, r, j) => j !== index ? s + r : s, 0);
      const othersCount = baseReports.length - 1;
      const arbReport = othersCount > 0 ? othersSum / othersCount : 0.5;
      // Only enter when there's disagreement (dispersion > threshold)
      participate = dispersion > 0.05;
      report = clamp(arbReport);
      riskFraction = participate ? 0.30 : 0.03;
    }

    if (preset === 'sybil' && index < sybilCount) {
      report = clamp(baseReports[0] + normalSample(rng) * 0.005);
      riskFraction *= 0.55;
      depositMultiplier = 1 / sybilCount;
    }

    // Collusion: F1 and F2 coordinate — appear together, submit correlated reports,
    // concentrate stake in rounds where they have high sigma
    if (preset === 'collusion' && index < 2) {
      // Coordinated participation: both in or both out
      const collusionActive = (round % 5 !== 0); // skip every 5th round together
      participate = collusionActive;
      // Report synchronisation: both submit the average of their beliefs
      const collusionReport = (baseReports[0] + baseReports[1]) / 2;
      report = clamp(collusionReport + normalSample(rng) * 0.002);
      // Concentrate stake when sigma is high (reputation grooming payoff)
      riskFraction = state[index].sigma > 0.5 ? 0.35 : 0.10;
    }

    // Reputation reset: F1 plays honestly for first 100 rounds to build sigma,
    // then switches to manipulation. Tests whether the skill gate can recover.
    if (preset === 'reputation_reset' && index === attackerIndex) {
      if (round <= 100) {
        // Phase 1: honest play to build reputation
        report = clamp(baseReport);
      } else {
        // Phase 2: exploit built-up sigma with manipulation
        const direction = Math.sign(0.5 - previousAggregate || 1);
        report = clamp(baseReport + 0.25 * direction);
        riskFraction *= 1.5;
      }
    }

    if (!participate) {
      return {
        participate: false,
        report: null,
        riskFraction,
        depositMultiplier,
      };
    }

    return {
      participate: true,
      report,
      riskFraction,
      depositMultiplier,
    };
  });
}

export function runPipeline(options: PipelineOptions): PipelineResult {
  const T = options.rounds ?? DEFAULT_ROUNDS;
  const seed = options.seed ?? DEFAULT_SEED;
  const n = options.n ?? DEFAULT_N;

  const builder = buildSelections(options.weighting, options.builder);

  const params: ComposableParams = {
    lam: 0.3,
    eta: 1,
    sigma_min: 0.1,
    gamma: 4,
    rho: 0.1,
    omegaMax: 0.25,
    utilityPool: builder.settlementRule === 'skill_plus_utility' ? 2 : 0,
    scoreThreshold: 0.7,
    fixedDeposit: 1,
    baseDepositFraction: 0.18,
    sigmaDepositScale: 0.85,
    builder,
    ...options.mechanism,
  };

  const dgp = generateDGP(options.dgpId, seed, T, n);
  const rng = makeRng(seed + 997);

  const initialL = 0.5;
  let state: AgentState[] = Array.from({ length: n }, (_, index) => ({
    accountId: index,
    L: initialL,
    sigma: params.sigma_min + (1 - params.sigma_min) * Math.exp(-params.gamma * initialL),
    wealth: INITIAL_WEALTH,
  }));

  let previousAggregate = 0.5;

  const traces: RoundTrace[] = [];
  const rounds: PipelineRoundResult[] = [];

  for (let i = 0; i < dgp.rounds.length; i++) {
    const roundNumber = i + 1;
    const { y, reports: baseReports } = dgp.rounds[i];

    const behaviour = buildRoundBehaviour(
      options.behaviourPreset,
      roundNumber,
      baseReports,
      previousAggregate,
      state,
      rng,
    );

    const { qReports: dgpQReports } = dgp.rounds[i];

    const trace = runComposableRound(
      roundNumber,
      state,
      behaviour.map((decision, index) => ({
        accountId: index,
        participate: decision.participate,
        report: decision.report,
        qReport: decision.participate ? dgpQReports[index] : null,
        riskFraction: decision.riskFraction,
        depositMultiplier: decision.depositMultiplier,
      })),
      y,
      params,
    );

    traces.push(trace);

    // Use CRPS of the aggregate quantile forecast as the round error
    const aggCrps = trace.r_hat_q.length > 0
      ? (() => {
          let sum = 0;
          for (let k = 0; k < trace.r_hat_q.length; k++) {
            const taus = [0.1, 0.25, 0.5, 0.75, 0.9];
            const err = y - trace.r_hat_q[k];
            sum += err >= 0 ? taus[k] * err : (taus[k] - 1) * err;
          }
          return (2 * sum) / trace.r_hat_q.length;
        })()
      : Math.abs(y - trace.r_hat);

    rounds.push({
      round: roundNumber,
      y,
      r_hat: trace.r_hat,
      error: aggCrps,
      participation: trace.activeCount,
      nEff: trace.nEff,
      meanSigma: mean(trace.sigma_t),
      totalDeposited: trace.deposits.reduce((sum, value) => sum + value, 0),
      totalInfluence: trace.effectiveWager.reduce((sum, value) => sum + value, 0),
      totalDistributed: trace.totalPayoff.reduce(
        (sum, value) => sum + Math.max(0, value),
        0,
      ),
      hhi: trace.hhi,
      topShare: trace.topShare,
    });

    state = state.map((agent, index) => ({
      accountId: agent.accountId,
      L: trace.L_new[index],
      sigma: trace.sigma_new[index],
      wealth: trace.wealth_after[index],
    }));

    previousAggregate = trace.r_hat;
  }

  return {
    dgpId: options.dgpId,
    weighting: options.weighting ?? 'full',
    behaviourPreset: options.behaviourPreset,
    builder,
    params,
    rounds,
    traces,
    finalState: state,
    summary: {
      meanError: mean(rounds.map((row) => row.error)),
      meanParticipation: mean(rounds.map((row) => row.participation)),
      meanNEff: mean(rounds.map((row) => row.nEff)),
      finalRounds: rounds.length,
      finalGini: gini(state.map((agent) => agent.wealth)),
      finalAggregate: rounds.length ? rounds[rounds.length - 1].r_hat : 0,
      finalDistributed: rounds.length
        ? rounds[rounds.length - 1].totalDistributed
        : 0,
    },
  };
}
