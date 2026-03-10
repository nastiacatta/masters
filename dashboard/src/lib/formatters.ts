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

export function metricLabel(key: string): string {
  const labels: Record<string, string> = {
    crpsUniform: 'CRPS (Equal)',
    crpsDeposit: 'CRPS (Stake)',
    crpsSkill: 'CRPS (Skill)',
    crpsMechanism: 'CRPS (Mechanism)',
    crpsBestSingle: 'CRPS (Best Single)',
    crpsUniformCum: 'Cumulative CRPS (Equal)',
    crpsDepositCum: 'Cumulative CRPS (Stake)',
    crpsSkillCum: 'Cumulative CRPS (Skill)',
    crpsMechanismCum: 'Cumulative CRPS (Mechanism)',
    crpsBestSingleCum: 'Cumulative CRPS (Best Single)',
  };
  return labels[key] || key;
}

export const AGENT_COLORS = [
  '#64748b', '#6366f1', '#ec4899', '#f59e0b',
  '#10b981', '#8b5cf6', '#f97316', '#06b6d4',
  '#ef4444', '#84cc16', '#a855f7', '#14b8a6',
];

export const ACCENT = '#2563eb';
export const MUTED = '#94a3b8';

export const WEIGHTING_COLORS: Record<string, string> = {
  crpsUniform: '#94a3b8',
  crpsDeposit: '#f59e0b',
  crpsSkill: '#8b5cf6',
  crpsMechanism: '#2563eb',
  crpsBestSingle: '#10b981',
  crpsUniformCum: '#94a3b8',
  crpsDepositCum: '#f59e0b',
  crpsSkillCum: '#8b5cf6',
  crpsMechanismCum: '#2563eb',
  crpsBestSingleCum: '#10b981',
};
