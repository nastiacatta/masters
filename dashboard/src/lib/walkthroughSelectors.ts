/**
 * Derived selectors for walkthrough: build round-level inputs, DGP meta, results, next state
 * from experiment meta and loaded data. No hardcoded page logic.
 */
import type { ExperimentMeta, SkillWagerPoint, WalkthroughInputs, WalkthroughDGPMeta, WalkthroughRoundResult, WalkthroughNextState } from './types';
import { DGP_OPTIONS } from './coreMechanism/dgpSimulator';

export function getDGPMetaFromExperiment(exp: ExperimentMeta | null): WalkthroughDGPMeta {
  if (!exp?.dgp) return {};
  const dgpOption = DGP_OPTIONS.find((d) => d.id === exp.dgp);
  if (!dgpOption) return { dgpId: exp.dgp, label: exp.dgp, description: exp.dgp };
  return {
    dgpId: dgpOption.id,
    label: dgpOption.label,
    truthSource: dgpOption.truthSource,
    description: dgpOption.description,
    formula: dgpOption.formula,
  };
}

export function getInputsFromExperiment(
  exp: ExperimentMeta | null,
  roundIndex: number,
  roundRecords?: SkillWagerPoint[] | null
): WalkthroughInputs {
  const roundRecordsAtT = roundRecords?.filter((r) => r.t === roundIndex) ?? [];
  const forecasts: Record<number, number> = {};
  const wagers: Record<number, number> = {};
  const previousSkill: Record<number, number> = {};
  const previousWealth: Record<number, number> = {};
  roundRecordsAtT.forEach((r) => {
    forecasts[r.agent] = r.wager; // placeholder; real data may have report column
    wagers[r.agent] = r.wager;
    previousSkill[r.agent] = r.sigma;
    previousWealth[r.agent] = r.cumProfit; // approximate
  });
  const activeAgentIds = [...new Set(roundRecordsAtT.map((r) => r.agent))];
  return {
    taskType: 'point',
    scoringRule: exp?.scoringMode ?? 'CRPS',
    activeAgentIds,
    forecasts: Object.keys(forecasts).length ? forecasts : undefined,
    wagers: Object.keys(wagers).length ? wagers : undefined,
    previousSkill: Object.keys(previousSkill).length ? previousSkill : undefined,
    previousWealth: Object.keys(previousWealth).length ? previousWealth : undefined,
    roundIndex,
    nRounds: exp?.rounds,
  };
}

export function getResultFromRoundRecords(
  roundIndex: number,
  roundRecords?: SkillWagerPoint[] | null,
  outcome?: number
): WalkthroughRoundResult {
  const atT = roundRecords?.filter((r) => r.t === roundIndex) ?? [];
  const payoffs: Record<number, number> = {};
  const wealthChanges: Record<number, number> = {};
  const skillWeightChanges: Record<number, number> = {};
  let aggregateForecast: number | undefined;
  atT.forEach((r) => {
    payoffs[r.agent] = r.profit;
    wealthChanges[r.agent] = r.profit;
    skillWeightChanges[r.agent] = r.sigma;
  });
  if (atT.length) {
    aggregateForecast = atT.reduce((s, r) => s + (r.wager ?? 0), 0) / atT.length; // placeholder
  }
  return {
    aggregateForecast,
    realisedOutcome: outcome,
    payoffs: Object.keys(payoffs).length ? payoffs : undefined,
    wealthChanges: Object.keys(wealthChanges).length ? wealthChanges : undefined,
    skillWeightChanges: Object.keys(skillWeightChanges).length ? skillWeightChanges : undefined,
  };
}

export function getNextStateFromRoundRecords(
  roundIndex: number,
  roundRecords?: SkillWagerPoint[] | null
): WalkthroughNextState {
  const atT = roundRecords?.filter((r) => r.t === roundIndex) ?? [];
  const wealth: Record<number, number> = {};
  const skill: Record<number, number> = {};
  const eligibility: Record<number, boolean> = {};
  atT.forEach((r) => {
    wealth[r.agent] = r.cumProfit;
    skill[r.agent] = r.sigma;
    eligibility[r.agent] = !r.missing;
  });
  return {
    wealth: Object.keys(wealth).length ? wealth : undefined,
    skill: Object.keys(skill).length ? skill : undefined,
    eligibility: Object.keys(eligibility).length ? eligibility : undefined,
  };
}
