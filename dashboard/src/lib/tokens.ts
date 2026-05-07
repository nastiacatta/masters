/**
 * Semantic colour and symbol tokens used across the whole dashboard.
 * One colour per conceptual object — reuse everywhere.
 */

export const SEM = {
  deposit:   { main: '#0ea5e9', light: '#e0f2fe', ring: '#0ea5e940', sym: 'b', label: 'Deposit' },
  skill:     { main: '#8b5cf6', light: '#ede9fe', ring: '#8b5cf640', sym: 'σ', label: 'Skill' },
  wager:     { main: '#6366f1', light: '#e0e7ff', ring: '#6366f140', sym: 'm', label: 'Eff. wager' },
  aggregate: { main: '#0d9488', light: '#ccfbf1', ring: '#0d948840', sym: 'r̂', label: 'Aggregate' },
  score:     { main: '#f59e0b', light: '#fef3c7', ring: '#f59e0b40', sym: 's', label: 'Score' },
  payoff:    { main: '#10b981', light: '#d1fae5', ring: '#10b98140', sym: 'Π', label: 'Payoff' },
  outcome:   { main: '#ef4444', light: '#fee2e2', ring: '#ef444440', sym: 'y', label: 'Outcome' },
  wealth:    { main: '#ec4899', light: '#fce7f3', ring: '#ec489940', sym: 'W', label: 'Wealth' },
} as const;

export const METHOD = {
  equal:      { color: '#64748b', label: 'Equal weight',  id: 'uniform'      as const, dash: undefined,   strokeWidth: 2 },
  skill_only: { color: '#f97316', label: 'Skill-only',    id: 'skill_only'   as const, dash: '6 3',       strokeWidth: 2 },
  blended:    { color: '#6366f1', label: 'Skill × stake', id: 'skill_stake'  as const, dash: undefined,   strokeWidth: 3 },
  stake_only: { color: '#0d9488', label: 'Stake-only',    id: 'deposit_only' as const, dash: '2 3',       strokeWidth: 2 },
} as const;

export const METHOD_EXTRA = {
  best_single: { color: '#eab308', label: 'Best single', id: 'best_single' as const, dash: '8 3 2 3', strokeWidth: 2 },
} as const;

export const GLOSSARY_ENTRIES = [
  { symbol: 'bᵢ',  meaning: 'Deposit — amount agent i puts at risk' },
  { symbol: 'σᵢ',  meaning: 'Skill — online estimate of forecasting quality, ∈ [σ_min, 1]' },
  { symbol: 'mᵢ',  meaning: 'Effective wager — deposit filtered through skill: bᵢ(λ + (1−λ)σᵢ)' },
  { symbol: 'r̂',   meaning: 'Aggregate forecast — weighted combination of individual reports' },
  { symbol: 'sᵢ',  meaning: 'Score — how close agent i\u2019s report was to the realised outcome' },
  { symbol: 'Πᵢ',  meaning: 'Payoff — total payout to agent i after settlement' },
  { symbol: 'πᵢ',  meaning: 'Profit — payoff minus deposit: Πᵢ − bᵢ' },
  { symbol: 'λ',   meaning: 'Stake weight — interpolates between pure skill (λ=0) and pure stake (λ=1) inside the effective wager' },
  { symbol: 'γ',   meaning: 'Skill sharpness — controls how steeply σ falls as the running loss L rises: σ = σ_min + (1−σ_min)·exp(−γL). Larger γ = sharper separation of good and bad forecasters.' },
  { symbol: 'ρ',   meaning: 'EWMA decay — how fast the running loss L adapts to new observations: L ← (1−ρ)·L + ρ·loss' },
  // User-facing chart terms (shared across pages)
  { symbol: 'Forecast error', meaning: 'Distance between realised outcome y and aggregate forecast r̂; e_t = |y_t − r̂_t|. Smaller is better.' },
  { symbol: 'CRPS', meaning: 'Continuous Ranked Probability Score — a proper score for probabilistic forecasts. Measures how far the predicted distribution is from the realised outcome. Lower is better; rewards both calibration and sharpness.' },
  { symbol: 'Calibration', meaning: 'A forecast is calibrated when realised outcomes look like draws from the forecast distribution. Ideal PIT: uniform; ideal reliability curve: the 45° diagonal.' },
  { symbol: 'Gini', meaning: 'Inequality / concentration of a weight or wealth vector. 0 = perfectly equal; larger values = more concentration in a few agents.' },
  { symbol: 'HHI', meaning: 'Herfindahl\u2013Hirschman Index — sum of squared weights, Σ wᵢ². Higher values mean a few agents carry most of the weight; N_eff = 1 / HHI.' },
  { symbol: 'N_eff', meaning: 'Effective number of active agents: 1 / Σ wᵢ². Equals N when weights are uniform and shrinks when a few agents dominate.' },
  { symbol: 'm/b', meaning: 'Effective wager divided by deposit; equals λ + (1−λ)σ. With fixed deposits this isolates the effect of skill on influence.' },
] as const;
