export interface ExperimentMeta {
  name: string;
  displayName: string;
  description: string;
  block: 'core' | 'behaviour' | 'experiments';
  dgp?: string;
  scoringMode?: string;
  nAgents?: number;
  rounds?: number;
  config?: Record<string, unknown>;
}

export interface RunSummary {
  experimentName: string;
  finalCRPS?: number;
  finalGini?: number;
  finalNEff?: number;
  meanHHI?: number;
  meanNt?: number;
  finalRuinRate?: number;
  headlineResults: Record<string, number>;
}

export interface RoundRecord {
  agent: number;
  t: number;
  wager: number;
  sigma: number;
  mOverB?: number;
  profit: number;
  cumProfit: number;
  missing: boolean;
  behaviourType?: string;
  deposit?: number;
  score?: number;
  loss?: number;
  wealth?: number;
}

export interface AgentRoundState {
  agentId: number;
  participated: boolean;
  behaviourType: string;
  sigma: number;
  deposit: number;
  effectiveWager: number;
  score: number;
  loss: number;
  profit: number;
  wealth: number;
  cumProfit: number;
}

export interface RoundSeries {
  round: number;
  budgetGap: number;
  minPayoutActive: number;
}

export interface ForecastSeriesPoint {
  t: number;
  crpsUniform: number;
  crpsDeposit: number;
  crpsSkill: number;
  crpsMechanism: number;
  crpsBestSingle: number;
  crpsUniformCum: number;
  crpsDepositCum: number;
  crpsSkillCum: number;
  crpsMechanismCum: number;
  crpsBestSingleCum: number;
}

export interface MetricSeriesPoint {
  t: number;
  value: number;
  label?: string;
}

export interface BehaviourScenario {
  scenario: string;
  totalProfit: number;
  meanRoundProfit: number;
  finalGini: number;
  finalNEff: number;
}

export interface CalibrationPoint {
  tau: number;
  pHat: number;
  nValid: number;
}

export interface SweepPoint {
  lam: number;
  sigmaMin: number;
  meanCrps: number;
  gini: number;
  fracMeaningful: number;
}

export interface SkillWagerPoint {
  agent: number;
  t: number;
  wager: number;
  sigma: number;
  mOverB: number | null;
  profit: number;
  cumProfit: number;
  missing: boolean;
}

export interface FixedDepositPoint {
  agent: number;
  t: number;
  sigma: number;
  wager: number;
  mOverB: number;
}

export interface ExperimentData {
  meta: ExperimentMeta;
  summary?: RunSummary;
  roundRecords?: SkillWagerPoint[];
  forecastSeries?: ForecastSeriesPoint[];
  calibration?: CalibrationPoint[];
  behaviourScenarios?: BehaviourScenario[];
  sweepData?: SweepPoint[];
  settlementSeries?: RoundSeries[];
  fixedDeposit?: FixedDepositPoint[];
}

export type PageId = 'overview' | 'replay' | 'behaviour' | 'diagnostics' | 'compare';
