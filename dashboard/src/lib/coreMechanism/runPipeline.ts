/**
 * Pipeline runner: DGP → Core (weighting) → run and collect results.
 * Used when user selects DGP, weighting rule, and behaviour scenario and runs.
 */
import { generateDGP, type DGPId } from './dgpSimulator';
import { runRoundExtended, type ExtendedParams } from './runRoundExtended';
import type { AgentState, AgentAction, WeightingMode } from './runRound';
import type { BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';

export interface PipelineRoundResult {
  round: number;
  y: number;
  r_hat: number;
  error: number;
  participation: number;
  nEff: number;
  meanSigma: number;
}

export interface PipelineResult {
  dgpId: DGPId;
  weighting: WeightingMode;
  behaviourPreset: BehaviourPresetId;
  rounds: PipelineRoundResult[];
  summary: {
    meanError: number;
    meanParticipation: number;
    meanNEff: number;
    finalRounds: number;
    finalGini: number;
  };
}

const DEFAULT_ROUNDS = 10000;
const DEFAULT_SEED = 42;
const DEFAULT_N = 5;
const INITIAL_WEALTH = 20;
const DEPOSIT_BASELINE = 1;

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function gini(wealths: number[]): number {
  if (wealths.length === 0) return 0;
  const sorted = [...wealths].sort((a, b) => a - b);
  const total = sorted.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let w = 0;
  sorted.forEach((x, i) => {
    w += (i + 1) * x;
  });
  return (2 * w - (sorted.length + 1) * total) / (sorted.length * total);
}

/**
 * Run the full pipeline with selected DGP, weighting rule, and behaviour scenario.
 * For "baseline" behaviour we use full participation and fixed deposit (benign).
 */
export function runPipeline(options: {
  dgpId: DGPId;
  weighting: WeightingMode;
  behaviourPreset: BehaviourPresetId;
  rounds?: number;
  seed?: number;
  n?: number;
}): PipelineResult {
  const T = options.rounds ?? DEFAULT_ROUNDS;
  const seed = options.seed ?? DEFAULT_SEED;
  const n = options.n ?? DEFAULT_N;
  const dgpId = options.dgpId;
  const weighting = options.weighting;
  const behaviourPreset = options.behaviourPreset;

  const dgp = generateDGP(dgpId, seed, T, n);
  const roundData = dgp.rounds;

  const params: ExtendedParams = {
    lam: 0.5,
    eta: 1,
    sigma_min: 0.2,
    gamma: 2,
    rho: 0.15,
    omegaMax: 1,
    utilityPool: 0,
    scoreThreshold: 0.7,
    weightingMode: weighting,
  };

  // Benign baseline: all participate, fixed deposit
  let state: AgentState[] = Array.from({ length: n }, (_, i) => ({
    accountId: i,
    L: 0.5,
    sigma: 0.5,
    wealth: INITIAL_WEALTH,
  }));

  const results: PipelineRoundResult[] = [];

  for (let i = 0; i < roundData.length; i++) {
    const { y, reports } = roundData[i];
    const t = i + 1;

    const actions: AgentAction[] = reports.map((r, idx) => ({
      accountId: idx,
      participate: true,
      report: r,
      deposit: Math.min(state[idx].wealth, DEPOSIT_BASELINE),
    }));

    const step = runRoundExtended(state, actions, y, params);

    const hhi = step.weight.reduce((s, w) => s + w * w, 0);
    const nEff = hhi > 0 ? 1 / hhi : 0;

    results.push({
      round: t,
      y,
      r_hat: step.r_hat,
      error: Math.abs(y - step.r_hat),
      participation: actions.filter((a) => a.participate).length,
      nEff,
      meanSigma: mean(step.sigma_t),
    });

    state = step.wealth_new.map((wealth, i) => ({
      accountId: i,
      L: step.L_new[i],
      sigma: step.sigma_new[i],
      wealth,
    }));
  }

  const finalWealths = state.map((s) => s.wealth);

  return {
    dgpId,
    weighting,
    behaviourPreset,
    rounds: results,
    summary: {
      meanError: mean(results.map((r) => r.error)),
      meanParticipation: mean(results.map((r) => r.participation)),
      meanNEff: mean(results.map((r) => r.nEff)),
      finalRounds: results.length,
      finalGini: gini(finalWealths),
    },
  };
}
