/**
 * Thesis walkthrough: step IDs, labels, and flow.
 * Flow: Inputs → DGP → Core → Behaviour → Results → Next state
 */

export const WALKTHROUGH_STEPS = [
  'inputs',
  'dgp',
  'core',
  'behaviour',
  'results',
  'next_state',
] as const;

export type WalkthroughStepId = (typeof WALKTHROUGH_STEPS)[number];

export const WALKTHROUGH_STEP_LABELS: Record<WalkthroughStepId, string> = {
  inputs: 'Inputs',
  dgp: 'DGP',
  core: 'Core',
  behaviour: 'Behaviour',
  results: 'Results',
  next_state: 'Next state',
};

/** Mechanism explorer: 5 main stages */
export const EXPLORER_STAGES = ['inputs', 'dgp', 'core', 'behaviour', 'results'] as const;
export type ExplorerStageId = (typeof EXPLORER_STAGES)[number];
export const EXPLORER_STAGE_LABELS: Record<ExplorerStageId, string> = {
  inputs: 'Inputs',
  dgp: 'DGP',
  core: 'Core',
  behaviour: 'Behaviour',
  results: 'Results',
};

/** Core sub-components (from thesis / Raja-style mechanism) */
export const CORE_SUBTABS = [
  'task_setup',
  'submission',
  'effective_wager',
  'aggregation',
  'scoring',
  'settlement',
  'online_update',
] as const;

export type CoreSubtabId = (typeof CORE_SUBTABS)[number];

export const CORE_SUBTAB_LABELS: Record<CoreSubtabId, string> = {
  task_setup: 'Task & session',
  submission: 'Submission layer',
  effective_wager: 'Effective wager',
  aggregation: 'Aggregation',
  scoring: 'Scoring',
  settlement: 'Settlement',
  online_update: 'Online update',
};

export const BEHAVIOUR_SUBTABS = [
  'participation',
  'belief',
  'reporting',
  'staking',
  'missingness',
  'identity',
] as const;

export type BehaviourSubtabId = (typeof BEHAVIOUR_SUBTABS)[number];

export const BEHAVIOUR_SUBTAB_LABELS: Record<BehaviourSubtabId, string> = {
  participation: 'Participation & timing',
  belief: 'Belief formation',
  reporting: 'Reporting strategy',
  staking: 'Staking / deposits',
  missingness: 'Missingness',
  identity: 'Identity / sybils',
};

/** Thesis research question (one sentence). */
export const THESIS_RESEARCH_QUESTION =
  'Can combining stake with an online, time-varying skill layer improve aggregate forecasts under non-stationarity, strategic behaviour, and intermittent participation?';

/** Short thesis title. */
export const THESIS_TITLE = 'Adaptive skill and stake in forecast markets';
