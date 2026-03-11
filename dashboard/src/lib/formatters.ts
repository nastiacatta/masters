export function fmtNum(v: number | null | undefined, decimals = 4): string {
  if (v == null || isNaN(v)) return '—';
  if (Math.abs(v) < 1e-10) return '0';
  return v.toFixed(decimals);
}

export function fmtPct(v: number | null | undefined, decimals = 1): string {
  if (v == null || isNaN(v)) return '—';
  return `${(v * 100).toFixed(decimals)}%`;
}

export function fmtSci(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return '—';
  if (Math.abs(v) < 1e-10) return '0';
  return v.toExponential(2);
}

export function scenarioLabel(s: string): string {
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Human-readable label for task type (no internal codes in UI). */
export function taskTypeLabel(code: string): string {
  const labels: Record<string, string> = {
    point: 'Point forecast',
    distribution: 'Distribution (CRPS)',
  };
  return labels[code] ?? scenarioLabel(code);
}

/** Human-readable label for scoring rule (no internal codes in UI). */
export function scoringRuleLabel(code: string): string {
  const labels: Record<string, string> = {
    CRPS: 'CRPS (Continuous Ranked Probability Score)',
    MAE: 'MAE (Mean Absolute Error)',
  };
  return labels[code] ?? code;
}

/** Display name for an agent (1-based "Agent 1", "Agent 2", … instead of raw id/code). */
export function agentDisplayName(agentId: string | number): string {
  const num = typeof agentId === 'string' ? parseInt(agentId.replace(/^A/, ''), 10) : agentId;
  if (!isNaN(num) && num >= 0) return `Agent ${num + 1}`;
  return `Agent ${agentId}`;
}

export function metricLabel(key: string): string {
  const labels: Record<string, string> = {
    crpsUniform: 'CRPS (Equal)',
    crpsDeposit: 'CRPS (Stake)',
    crpsSkill: 'CRPS (Skill)',
    crpsMechanism: 'CRPS (Skill × stake)',
    crpsBestSingle: 'CRPS (Best Single)',
    crpsUniformCum: 'Cumulative CRPS (Equal)',
    crpsDepositCum: 'Cumulative CRPS (Stake)',
    crpsSkillCum: 'Cumulative CRPS (Skill)',
    crpsMechanismCum: 'Cumulative CRPS (Skill × stake)',
    crpsBestSingleCum: 'Cumulative CRPS (Best Single)',
  };
  return labels[key] || key;
}

/** Labels for sweep/heatmap metric keys (avoid showing raw codes in tooltips). */
export function sweepMetricLabel(key: string): string {
  const labels: Record<string, string> = {
    meanCrps: 'Mean CRPS',
    gini: 'Gini coefficient',
  };
  return labels[key] ?? key;
}

export const AGENT_COLORS = [
  '#64748b', '#6366f1', '#ec4899', '#0d9488',
  '#10b981', '#8b5cf6', '#0d9488', '#06b6d4',
  '#ef4444', '#84cc16', '#a855f7', '#14b8a6',
];

export const ACCENT = '#2563eb';
export const MUTED = '#94a3b8';

export const WEIGHTING_COLORS: Record<string, string> = {
  crpsUniform: '#94a3b8',
  crpsDeposit: '#0d9488',
  crpsSkill: '#8b5cf6',
  crpsMechanism: '#2563eb',
  crpsBestSingle: '#10b981',
  crpsUniformCum: '#94a3b8',
  crpsDepositCum: '#0d9488',
  crpsSkillCum: '#8b5cf6',
  crpsMechanismCum: '#2563eb',
  crpsBestSingleCum: '#10b981',
};
