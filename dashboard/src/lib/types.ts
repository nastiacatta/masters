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
  dataFiles?: Record<string, string>;
}

export interface RunSummary {
  experimentName: string;
  finalCRPS?: number;
  finalGini?: number;
  finalNEff?: number;
  meanHHI?: number;
  meanNt?: number;
  finalRuinRate?: number;
  headlineResults: Record<string, unknown>;
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

export interface PreferenceStressRow {
  scenario: string;
  totalProfit: number;
  meanProfit: number;
  finalGini: number;
}

export interface IntermittencyStressRow {
  mode: string;
  totalProfit: number;
  participationRate: number;
  finalNEff: number;
}

export interface ArbitrageScanRow {
  lam: number;
  arbTotalProfit: number;
  arbFinalWealth: number;
  arbitrageFoundRounds: number;
}

export interface DetectionAdaptationRow {
  attacker: string;
  totalProfit: number;
  finalWealth: number;
}

export interface CollusionStressRow {
  scenario: string;
  totalProfit: number;
  meanProfit: number;
  finalGini: number;
  participationRate: number;
}

export interface InsiderAdvantageRow {
  scenario: string;
  insiderProfit: number;
  finalGini: number;
}

export interface WashActivityRow {
  scenario: string;
  totalActivity: number;
  nRounds: number;
}

export interface StrategicReportingRow {
  scenario: string;
  meanAggError: number;
  finalGini: number;
}

export interface IdentityAttackRow {
  identity: string;
  totalProfit: number;
  finalNEff: number;
  finalGini: number;
}

export interface DriftAdaptationRow {
  belief: string;
  meanMae: number;
  finalGini: number;
}

export interface StakePolicyRow {
  staking: string;
  totalProfit: number;
  meanDeposit: number;
  finalGini: number;
}

export interface DetectionMetricsRow {
  detector: string;
  score: number;
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
  preferenceStress?: PreferenceStressRow[];
  intermittencyStress?: IntermittencyStressRow[];
  arbitrageScan?: ArbitrageScanRow[];
  detectionAdaptation?: DetectionAdaptationRow[];
  collusionStress?: CollusionStressRow[];
  insiderAdvantage?: InsiderAdvantageRow[];
  washActivity?: WashActivityRow[];
  strategicReporting?: StrategicReportingRow[];
  identityAttack?: IdentityAttackRow[];
  driftAdaptation?: DriftAdaptationRow[];
  stakePolicy?: StakePolicyRow[];
  detectionMetrics?: DetectionMetricsRow[];
}

export type PageId = 'overview' | 'replay' | 'behaviour' | 'diagnostics' | 'compare';
