import Papa from 'papaparse';
import type {
  ExperimentMeta,
  RunSummary,
  SkillWagerPoint,
  ForecastSeriesPoint,
  CalibrationPoint,
  BehaviourScenario,
  SweepPoint,
  RoundSeries,
  FixedDepositPoint,
  PreferenceStressRow,
  IntermittencyStressRow,
  ArbitrageScanRow,
  DetectionAdaptationRow,
  CollusionStressRow,
  InsiderAdvantageRow,
  WashActivityRow,
  StrategicReportingRow,
  IdentityAttackRow,
  DriftAdaptationRow,
  StakePolicyRow,
  DetectionMetricsRow,
} from './types';

type RawRow = Record<string, unknown>;

async function fetchCSV<T extends RawRow>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    const parsed = Papa.parse<T>(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    return parsed.data ?? [];
  } catch {
    return [];
  }
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const DATA_BASE = '/data';

function expPath(exp: Pick<ExperimentMeta, 'block' | 'name'>): string {
  if (exp.block === 'experiments') {
    return `${DATA_BASE}/experiments/${exp.name}`;
  }
  return `${DATA_BASE}/${exp.block}/experiments/${exp.name}`;
}

function dataFile(exp: ExperimentMeta, key: string, fallback: string): string {
  return exp.dataFiles?.[key] ?? fallback;
}

export async function loadExperimentList(): Promise<ExperimentMeta[]> {
  const index = await fetchJSON<ExperimentMeta[]>(`${DATA_BASE}/index.json`);
  return index ?? [];
}

export async function loadSummary(exp: ExperimentMeta): Promise<RunSummary | null> {
  const raw = await fetchJSON<{
    experiment_name: string;
    headline_results: Record<string, unknown>;
  }>(`${expPath(exp)}/summary.json`);

  if (!raw) return null;

  return {
    experimentName: raw.experiment_name,
    finalCRPS: Number(raw.headline_results?.final_crps ?? NaN),
    finalGini: Number(raw.headline_results?.final_gini ?? NaN),
    finalNEff: Number(
      raw.headline_results?.final_n_eff ?? raw.headline_results?.mean_N_eff ?? NaN,
    ),
    meanHHI: Number(raw.headline_results?.mean_HHI ?? NaN),
    meanNt: Number(raw.headline_results?.mean_N_t ?? NaN),
    finalRuinRate: Number(raw.headline_results?.final_ruin_rate ?? NaN),
    headlineResults: raw.headline_results ?? {},
  };
}

export async function loadSkillWagerData(
  exp: ExperimentMeta,
  file = 'timeseries.csv',
): Promise<SkillWagerPoint[]> {
  const raw = await fetchCSV<{
    agent: number;
    t: number;
    wager: number;
    sigma: number;
    m_over_b: number | null;
    profit: number;
    cum_profit: number;
    missing: number;
  }>(`${expPath(exp)}/data/${file}`);

  return raw.map((r) => ({
    agent: Number(r.agent),
    t: Number(r.t),
    wager: Number(r.wager ?? 0),
    sigma: Number(r.sigma),
    mOverB: r.m_over_b == null ? null : Number(r.m_over_b),
    profit: Number(r.profit ?? 0),
    cumProfit: Number(r.cum_profit ?? 0),
    missing: Number(r.missing ?? 0) === 1,
  }));
}

export async function loadForecastSeries(
  exp: ExperimentMeta,
  file = 'crps_timeseries.csv',
): Promise<ForecastSeriesPoint[]> {
  const raw = await fetchCSV<{
    t: number;
    crps_uniform: number;
    crps_uniform_cum: number;
    crps_deposit: number;
    crps_deposit_cum: number;
    crps_skill: number;
    crps_skill_cum: number;
    crps_mechanism: number;
    crps_mechanism_cum: number;
    crps_best_single: number;
    crps_best_single_cum: number;
  }>(`${expPath(exp)}/data/${file}`);

  return raw.map((r) => ({
    t: Number(r.t),
    crpsUniform: Number(r.crps_uniform),
    crpsDeposit: Number(r.crps_deposit),
    crpsSkill: Number(r.crps_skill),
    crpsMechanism: Number(r.crps_mechanism),
    crpsBestSingle: Number(r.crps_best_single),
    crpsUniformCum: Number(r.crps_uniform_cum),
    crpsDepositCum: Number(r.crps_deposit_cum),
    crpsSkillCum: Number(r.crps_skill_cum),
    crpsMechanismCum: Number(r.crps_mechanism_cum),
    crpsBestSingleCum: Number(r.crps_best_single_cum),
  }));
}

export async function loadCalibration(exp: ExperimentMeta): Promise<CalibrationPoint[]> {
  const raw = await fetchCSV<{
    tau: number;
    p_hat: number;
    n_valid: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'reliability', 'reliability.csv')}`);

  return raw.map((r) => ({
    tau: Number(r.tau),
    pHat: Number(r.p_hat),
    nValid: Number(r.n_valid),
  }));
}

export async function loadBehaviourMatrix(exp: ExperimentMeta): Promise<BehaviourScenario[]> {
  const raw = await fetchCSV<{
    scenario: string;
    total_profit: number;
    mean_round_profit: number;
    final_gini: number;
    final_n_eff: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'behaviour_matrix', 'behaviour_matrix.csv')}`);

  return raw.map((r) => ({
    scenario: String(r.scenario),
    totalProfit: Number(r.total_profit),
    meanRoundProfit: Number(r.mean_round_profit),
    finalGini: Number(r.final_gini),
    finalNEff: Number(r.final_n_eff),
  }));
}

export async function loadPreferenceStress(
  exp: ExperimentMeta,
): Promise<PreferenceStressRow[]> {
  const raw = await fetchCSV<{
    scenario: string;
    total_profit: number;
    mean_profit: number;
    final_gini: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'preference_stress', 'preference_stress.csv')}`);

  return raw.map((r) => ({
    scenario: String(r.scenario),
    totalProfit: Number(r.total_profit),
    meanProfit: Number(r.mean_profit),
    finalGini: Number(r.final_gini),
  }));
}

export async function loadIntermittencyStress(
  exp: ExperimentMeta,
): Promise<IntermittencyStressRow[]> {
  const raw = await fetchCSV<{
    mode: string;
    total_profit: number;
    participation_rate: number;
    final_n_eff: number;
  }>(
    `${expPath(exp)}/data/${dataFile(exp, 'intermittency_stress', 'intermittency_stress.csv')}`,
  );

  return raw.map((r) => ({
    mode: String(r.mode),
    totalProfit: Number(r.total_profit),
    participationRate: Number(r.participation_rate),
    finalNEff: Number(r.final_n_eff),
  }));
}

export async function loadArbitrageScan(
  exp: ExperimentMeta,
): Promise<ArbitrageScanRow[]> {
  const raw = await fetchCSV<{
    lam: number;
    arb_total_profit: number;
    arb_final_wealth: number;
    arbitrage_found_rounds: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'arbitrage_scan', 'arbitrage_scan.csv')}`);

  return raw.map((r) => ({
    lam: Number(r.lam),
    arbTotalProfit: Number(r.arb_total_profit),
    arbFinalWealth: Number(r.arb_final_wealth),
    arbitrageFoundRounds: Number(r.arbitrage_found_rounds),
  }));
}

export async function loadDetectionAdaptation(
  exp: ExperimentMeta,
): Promise<DetectionAdaptationRow[]> {
  const raw = await fetchCSV<{
    attacker: string;
    total_profit: number;
    final_wealth: number;
  }>(
    `${expPath(exp)}/data/${dataFile(
      exp,
      'detection_adaptation',
      'detection_adaptation.csv',
    )}`,
  );

  return raw.map((r) => ({
    attacker: String(r.attacker),
    totalProfit: Number(r.total_profit),
    finalWealth: Number(r.final_wealth),
  }));
}

export async function loadSweepData(exp: ExperimentMeta): Promise<SweepPoint[]> {
  const raw = await fetchCSV<{
    lam: number;
    sigma_min: number;
    mean_crps: number;
    gini: number;
    frac_meaningful: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'sweep', 'sweep.csv')}`);

  return raw.map((r) => ({
    lam: Number(r.lam),
    sigmaMin: Number(r.sigma_min),
    meanCrps: Number(r.mean_crps),
    gini: Number(r.gini),
    fracMeaningful: Number(r.frac_meaningful),
  }));
}

export async function loadSettlementSeries(exp: ExperimentMeta): Promise<RoundSeries[]> {
  const raw = await fetchCSV<{
    round: number;
    budget_gap: number;
    min_payout_active: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'series', 'series.csv')}`);

  return raw.map((r) => ({
    round: Number(r.round),
    budgetGap: Number(r.budget_gap),
    minPayoutActive: Number(r.min_payout_active),
  }));
}

export async function loadFixedDeposit(
  exp: ExperimentMeta,
): Promise<FixedDepositPoint[]> {
  const raw = await fetchCSV<{
    agent: number;
    t: number;
    sigma: number;
    wager: number;
    m_over_b: number;
  }>(`${expPath(exp)}/data/${dataFile(exp, 'timeseries', 'timeseries.csv')}`);

  return raw.map((r) => ({
    agent: Number(r.agent),
    t: Number(r.t),
    sigma: Number(r.sigma),
    wager: Number(r.wager),
    mOverB: Number(r.m_over_b),
  }));
}

export async function loadCollusionStress(exp: ExperimentMeta): Promise<CollusionStressRow[]> {
  const raw = await fetchCSV<{ scenario: string; total_profit: number; mean_profit: number; final_gini: number; participation_rate: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'collusion_stress', 'collusion_stress.csv')}`,
  );
  return raw.map((r) => ({
    scenario: String(r.scenario),
    totalProfit: Number(r.total_profit),
    meanProfit: Number(r.mean_profit),
    finalGini: Number(r.final_gini),
    participationRate: Number(r.participation_rate),
  }));
}

export async function loadInsiderAdvantage(exp: ExperimentMeta): Promise<InsiderAdvantageRow[]> {
  const raw = await fetchCSV<{ scenario: string; insider_profit: number; final_gini: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'insider_advantage', 'insider_advantage.csv')}`,
  );
  return raw.map((r) => ({
    scenario: String(r.scenario),
    insiderProfit: Number(r.insider_profit),
    finalGini: Number(r.final_gini),
  }));
}

export async function loadWashActivity(exp: ExperimentMeta): Promise<WashActivityRow[]> {
  const raw = await fetchCSV<{ scenario: string; total_activity: number; n_rounds: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'wash_activity_gaming', 'wash_activity_gaming.csv')}`,
  );
  return raw.map((r) => ({
    scenario: String(r.scenario),
    totalActivity: Number(r.total_activity),
    nRounds: Number(r.n_rounds),
  }));
}

export async function loadStrategicReporting(exp: ExperimentMeta): Promise<StrategicReportingRow[]> {
  const raw = await fetchCSV<{ scenario: string; mean_agg_error: number; final_gini: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'strategic_reporting', 'strategic_reporting.csv')}`,
  );
  return raw.map((r) => ({
    scenario: String(r.scenario),
    meanAggError: Number(r.mean_agg_error),
    finalGini: Number(r.final_gini),
  }));
}

export async function loadIdentityAttack(exp: ExperimentMeta): Promise<IdentityAttackRow[]> {
  const raw = await fetchCSV<{ identity: string; total_profit: number; final_n_eff: number; final_gini: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'identity_attack_matrix', 'identity_attack_matrix.csv')}`,
  );
  return raw.map((r) => ({
    identity: String(r.identity),
    totalProfit: Number(r.total_profit),
    finalNEff: Number(r.final_n_eff),
    finalGini: Number(r.final_gini),
  }));
}

export async function loadDriftAdaptation(exp: ExperimentMeta): Promise<DriftAdaptationRow[]> {
  const raw = await fetchCSV<{ belief: string; mean_mae: number; final_gini: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'drift_adaptation', 'drift_adaptation.csv')}`,
  );
  return raw.map((r) => ({
    belief: String(r.belief),
    meanMae: Number(r.mean_mae),
    finalGini: Number(r.final_gini),
  }));
}

export async function loadStakePolicy(exp: ExperimentMeta): Promise<StakePolicyRow[]> {
  const raw = await fetchCSV<{ staking: string; total_profit: number; mean_deposit: number; final_gini: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'stake_policy_matrix', 'stake_policy_matrix.csv')}`,
  );
  return raw.map((r) => ({
    staking: String(r.staking),
    totalProfit: Number(r.total_profit),
    meanDeposit: Number(r.mean_deposit),
    finalGini: Number(r.final_gini),
  }));
}

export async function loadDetectionMetrics(exp: ExperimentMeta): Promise<DetectionMetricsRow[]> {
  const raw = await fetchCSV<{ detector: string; score: number }>(
    `${expPath(exp)}/data/${dataFile(exp, 'detection_metrics', 'detection_metrics.csv')}`,
  );
  return raw.map((r) => ({
    detector: String(r.detector),
    score: Number(r.score),
  }));
}
