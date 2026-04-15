import type { CSSProperties } from 'react';

export const AGENT_PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7',
];

export const CHART_MARGIN = { top: 8, right: 24, bottom: 4, left: 4 };

/** Use when chart has X/Y axis labels so they are not clipped */
export const CHART_MARGIN_LABELED = { top: 16, right: 24, bottom: 28, left: 44 };

export const AXIS_TICK = { fontSize: 11, fill: '#64748b' };
export const AXIS_STROKE = '#94a3b8';

export const GRID_PROPS = { strokeDasharray: '3 3', stroke: '#e2e8f0', strokeOpacity: 0.4 } as const;

export const TOOLTIP_STYLE: CSSProperties = {
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  boxShadow: '0 4px 16px -2px rgb(0 0 0 / 0.12)',
  fontSize: 12,
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.98)',
  backdropFilter: 'blur(8px)',
  lineHeight: 1.5,
};

export function agentName(i: number): string {
  return `F${i + 1}`;
}

export function fmt(v: number | null | undefined, d = 3): string {
  if (v == null || isNaN(v)) return '—';
  if (Math.abs(v) < 1e-10) return '0';
  return v.toFixed(d);
}

export function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = Math.ceil(data.length / maxPoints);
  const result: T[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i % step === 0 || i === data.length - 1) result.push(data[i]);
  }
  return result;
}

/** @deprecated Brush controls are being removed from default chart views in favour of drag-to-zoom. */
export const BRUSH_PROPS = {
  height: 22,
  stroke: '#cbd5e1',
  fill: '#f8fafc',
  travellerWidth: 8,
} as const;

export function movingAvg(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

export function gini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const total = sorted.reduce((s, v) => s + v, 0);
  if (total <= 0) return 0;
  let w = 0;
  sorted.forEach((v, i) => { w += (i + 1) * v; });
  return (2 * w - (sorted.length + 1) * total) / (sorted.length * total);
}
