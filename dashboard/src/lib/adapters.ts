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
  MasterComparisonRow,
  BankrollAblationRow,
  WeightRecoveryRow,
} from './types';
import type { FailureMode, AnalysisGap, EnrichedThesisClaim, AblationInterpretation, RegimeStats, InteractionAnalysis, PanelSweepResult } from './analysis/types';

type RawRow = Record<string, unknown>;

async function fetchCSV<T extends RawRow>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = `Failed to fetch ${url}: ${res.status}`;
    if (import.meta.env.DEV) console.error(msg);
    throw new Error(msg);
  }
  const text = await res.text();
  const parsed = Papa.parse<T>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return parsed.data ?? [];
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const msg = `Failed to fetch ${url}: ${res.status}`;
    if (import.meta.env.DEV) console.error(msg);
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

const DATA_BASE = `${import.meta.env.BASE_URL}data`;

function expPath(exp: Pick<ExperimentMeta, 'block' | 'name'>): string {
  // All experiment data lives under experiments 2/ (canonical location)
  return `${DATA_BASE}/experiments%202/${exp.name}`;
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

/** Load Method 1 endogenous weight recovery table (target vs learned). */
export async function loadWeightRecoveryMethod1(): Promise<WeightRecoveryRow[]> {
  const raw = await fetchCSV<{
    forecaster: number;
    w_target: number;
    w_learned: number;
    abs_error: number;
  }>(`${DATA_BASE}/experiments%202/weight_learning_comparison/data/aggregation_weights.csv`);

  return raw.map((r) => ({
    forecaster: Number(r.forecaster),
    wTarget: Number(r.w_target),
    wLearned: Number(r.w_learned),
    absError: Number(r.abs_error),
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

/** Load master comparison (all methods on same panel, paired deltas). */
export async function loadMasterComparison(): Promise<{
  config: { T: number; n_forecasters: number; seeds: number[]; warm_start?: number };
  rows: MasterComparisonRow[];
} | null> {
  const url = `${expPath({ block: 'core', name: 'master_comparison' })}/data/master_comparison.json`;

  try {
    const raw = await fetchJSON<{ config: unknown; rows: MasterComparisonRow[] }>(url);
    if (raw?.rows?.length) {
      return {
        config: raw.config as { T: number; n_forecasters: number; seeds: number[]; warm_start?: number },
        rows: raw.rows,
      };
    }
  } catch {
    // Data not available.
  }

  return null;
}

/** Load bankroll ablation (Full vs A-, B-, C-, D-, E-). */
export async function loadBankrollAblation(): Promise<{ config: unknown; rows: BankrollAblationRow[] } | null> {
  try {
    const raw = await fetchJSON<{ experiment_name: string; config: unknown; rows: BankrollAblationRow[] }>(
      `${expPath({ block: 'core', name: 'bankroll_ablation' })}/data/summary.json`,
    );
    if (!raw?.rows?.length) return null;
    return { config: raw.config, rows: raw.rows };
  } catch {
    return null;
  }
}

/** Real-data comparison result (e.g., Elia wind). */
export interface RealDataResult {
  config: {
    T: number;
    n_forecasters: number;
    warmup: number;
    series_name: string;
    forecasters: string[];
  };
  rows: Array<{
    experiment: string;
    method: string;
    seed: number;
    DGP: string;
    preset: string;
    mean_crps: number;
    delta_crps_vs_equal: number;
  }>;
  per_round: Array<{
    t: number;
    y: number;
    crps_uniform: number;
    crps_skill: number;
    crps_mechanism: number;
    crps_best_single: number;
  }>;
  // Per-agent skill history (downsampled)
  skill_history?: Array<Record<string, number>>;
  // Steady-state skill ranking (sorted by mean_sigma descending)
  steady_state?: Array<{
    forecaster: string;
    index: number;
    mean_sigma: number;
    mean_weight: number;
    mean_score: number | null;
  }>;
  // Forecaster names in order
  forecaster_names?: string[];

  // Diebold-Mariano test results
  dm_test?: {
    statistic: number;
    p_value: number;
    significant_at_001: boolean;
    significant_at_005: boolean;
    comparison: string;
  };
  dm_test_skill?: {
    statistic: number;
    p_value: number;
    significant_at_001: boolean;
    significant_at_005: boolean;
    comparison: string;
  };
  // Per-agent CRPS over time (downsampled ~600 points)
  per_agent_crps?: Array<Record<string, number>>;
  // Rolling window improvement (mechanism vs uniform, ~200 points)
  rolling_improvement?: Array<{
    t_start: number;
    t_end: number;
    pct_improvement: number;
  }>;
  // Sensitivity analysis
  sensitivity?: {
    default_params: Record<string, number>;
    optimal_params: Record<string, number>;
    optimal_improvement_pct: number;
    default_improvement_pct: number;
  };
  // Aggregate calibration (PIT coverage)
  calibration?: Array<{
    tau: number;
    nominal: number;
    empirical: number;
    gap: number;
  }>;
  // Train/test split validation
  train_test_split?: {
    train_rounds: number;
    test_rounds: number;
    methods: Record<string, {
      train_crps: number;
      test_crps: number;
      train_delta_vs_uniform: number;
      test_delta_vs_uniform: number;
    }>;
  };
}

export async function loadRealDataComparison(seriesName: string = 'elia_wind'): Promise<RealDataResult | null> {
  try {
    const raw = await fetchJSON<RealDataResult>(
      `${DATA_BASE}/real_data/${seriesName}/data/comparison.json`,
    );
    if (raw?.rows?.length) return raw;
  } catch {
    // Not available.
  }
  return null;
}


// ── New adapter functions for analysis data files ───────────────────

/** Load failure_modes.json for the Limitations & Failure Modes panel. */
export async function loadFailureModes(): Promise<FailureMode[]> {
  return fetchJSON<FailureMode[]>(`${DATA_BASE}/failure_modes.json`);
}

/** Load analysis_gaps.json for the Missing Analysis Checklist. */
export async function loadAnalysisGaps(): Promise<AnalysisGap[]> {
  return fetchJSON<AnalysisGap[]>(`${DATA_BASE}/analysis_gaps.json`);
}

/** Load enriched thesis_results.json with conditions, evidence, and limitations. */
export async function loadEnrichedThesisResults(): Promise<EnrichedThesisClaim[]> {
  return fetchJSON<EnrichedThesisClaim[]>(`${DATA_BASE}/thesis_results.json`);
}

/** Load ablation interpretation JSON for the AblationInterpretPanel. */
export async function loadAblationInterpretation(): Promise<AblationInterpretation | null> {
  try {
    return await fetchJSON<AblationInterpretation>(
      `${DATA_BASE}/core/experiments/bankroll_ablation/data/ablation_interpretation.json`,
    );
  } catch {
    return null;
  }
}

/** Load regime breakdown JSON for the RegimeBreakdownTable. */
export async function loadRegimeBreakdown(): Promise<RegimeStats[]> {
  try {
    return await fetchJSON<RegimeStats[]>(
      `${DATA_BASE}/core/experiments/master_comparison/data/regime_breakdown.json`,
    );
  } catch {
    return [];
  }
}

/** Load deposit interaction analysis JSON. */
export async function loadDepositInteraction(): Promise<InteractionAnalysis | null> {
  try {
    return await fetchJSON<InteractionAnalysis>(
      `${DATA_BASE}/core/experiments/deposit_policy_comparison/data/interaction_analysis.json`,
    );
  } catch {
    return null;
  }
}

/** Load panel size sensitivity sweep JSON. */
export async function loadPanelSizeSensitivity(): Promise<PanelSweepResult | null> {
  try {
    return await fetchJSON<PanelSweepResult>(
      `${DATA_BASE}/core/experiments/panel_size_sensitivity/data/panel_sweep.json`,
    );
  } catch {
    return null;
  }
}
