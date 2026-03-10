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
} from './types';

async function fetchCSV<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) return [];
  const text = await res.text();
  const parsed = Papa.parse<T>(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return parsed.data;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const DATA_BASE = '/data';

function expPath(block: string, name: string): string {
  if (block === 'experiments') return `${DATA_BASE}/experiments/${name}`;
  return `${DATA_BASE}/${block}/experiments/${name}`;
}

export async function loadExperimentList(): Promise<ExperimentMeta[]> {
  const index = await fetchJSON<ExperimentMeta[]>(`${DATA_BASE}/index.json`);
  return index || [];
}

export async function loadSummary(block: string, name: string): Promise<RunSummary | null> {
  const raw = await fetchJSON<{
    experiment_name: string;
    description: string;
    config: Record<string, unknown>;
    headline_results: Record<string, number>;
  }>(`${expPath(block, name)}/summary.json`);

  if (!raw) return null;
  return {
    experimentName: raw.experiment_name,
    finalGini: raw.headline_results.final_gini,
    finalNEff: raw.headline_results.final_n_eff ?? raw.headline_results.mean_N_eff,
    meanHHI: raw.headline_results.mean_HHI,
    meanNt: raw.headline_results.mean_N_t,
    finalRuinRate: raw.headline_results.final_ruin_rate,
    headlineResults: raw.headline_results,
  };
}

interface RawSkillWager {
  agent: number;
  t: number;
  wager: number;
  sigma: number;
  m_over_b: number | null;
  profit: number;
  cum_profit: number;
  missing: number;
}

export async function loadSkillWagerData(block: string, name: string, file: string): Promise<SkillWagerPoint[]> {
  const raw = await fetchCSV<RawSkillWager>(`${expPath(block, name)}/data/${file}`);
  return raw.map(r => ({
    agent: r.agent,
    t: r.t,
    wager: r.wager ?? 0,
    sigma: r.sigma,
    mOverB: r.m_over_b,
    profit: r.profit ?? 0,
    cumProfit: r.cum_profit ?? 0,
    missing: r.missing === 1,
  }));
}

interface RawForecast {
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
}

export async function loadForecastSeries(block: string, name: string, file: string): Promise<ForecastSeriesPoint[]> {
  const raw = await fetchCSV<RawForecast>(`${expPath(block, name)}/data/${file}`);
  return raw.map(r => ({
    t: r.t,
    crpsUniform: r.crps_uniform,
    crpsDeposit: r.crps_deposit,
    crpsSkill: r.crps_skill,
    crpsMechanism: r.crps_mechanism,
    crpsBestSingle: r.crps_best_single,
    crpsUniformCum: r.crps_uniform_cum,
    crpsDepositCum: r.crps_deposit_cum,
    crpsSkillCum: r.crps_skill_cum,
    crpsMechanismCum: r.crps_mechanism_cum,
    crpsBestSingleCum: r.crps_best_single_cum,
  }));
}

interface RawCalibration {
  tau: number;
  p_hat: number;
  n_valid: number;
}

export async function loadCalibration(block: string, name: string): Promise<CalibrationPoint[]> {
  const raw = await fetchCSV<RawCalibration>(`${expPath(block, name)}/data/reliability.csv`);
  return raw.map(r => ({ tau: r.tau, pHat: r.p_hat, nValid: r.n_valid }));
}

interface RawBehaviour {
  scenario: string;
  total_profit: number;
  mean_round_profit: number;
  final_gini: number;
  final_n_eff: number;
}

export async function loadBehaviourMatrix(block: string, name: string): Promise<BehaviourScenario[]> {
  const raw = await fetchCSV<RawBehaviour>(`${expPath(block, name)}/data/behaviour_matrix.csv`);
  return raw.map(r => ({
    scenario: r.scenario,
    totalProfit: r.total_profit,
    meanRoundProfit: r.mean_round_profit,
    finalGini: r.final_gini,
    finalNEff: r.final_n_eff,
  }));
}

interface RawSweep {
  lam: number;
  sigma_min: number;
  mean_crps: number;
  gini: number;
  frac_meaningful: number;
}

export async function loadSweepData(block: string, name: string): Promise<SweepPoint[]> {
  const raw = await fetchCSV<RawSweep>(`${expPath(block, name)}/data/sweep.csv`);
  return raw.map(r => ({
    lam: r.lam,
    sigmaMin: r.sigma_min,
    meanCrps: r.mean_crps,
    gini: r.gini,
    fracMeaningful: r.frac_meaningful,
  }));
}

interface RawSettlement {
  round: number;
  budget_gap: number;
  min_payout_active: number;
}

export async function loadSettlementSeries(block: string, name: string): Promise<RoundSeries[]> {
  const raw = await fetchCSV<RawSettlement>(`${expPath(block, name)}/data/series.csv`);
  return raw.map(r => ({
    round: r.round,
    budgetGap: r.budget_gap,
    minPayoutActive: r.min_payout_active,
  }));
}

interface RawFixedDeposit {
  agent: number;
  t: number;
  sigma: number;
  wager: number;
  m_over_b: number;
}

export async function loadFixedDeposit(block: string, name: string): Promise<FixedDepositPoint[]> {
  const raw = await fetchCSV<RawFixedDeposit>(`${expPath(block, name)}/data/timeseries.csv`);
  return raw.map(r => ({
    agent: r.agent,
    t: r.t,
    sigma: r.sigma,
    wager: r.wager,
    mOverB: r.m_over_b,
  }));
}
