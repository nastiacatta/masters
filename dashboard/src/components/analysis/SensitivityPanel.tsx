/**
 * Sensitivity analysis panel.
 *
 * Line chart per parameter showing ΔCRPS variation using Recharts.
 * Highlights crossover points with vertical reference lines.
 * One-sentence summary below the chart.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { SensitivitySummary } from '../../lib/analysis/types';

interface SensitivityPanelProps {
  summary: SensitivitySummary;
}

const PARAM_COLORS: Record<string, string> = {
  lam: '#6366f1',
  sigmaMin: '#f59e0b',
  eta: '#10b981',
  gamma: '#8b5cf6',
  n: '#ef4444',
  T: '#06b6d4',
};

export default function SensitivityPanel({ summary }: SensitivityPanelProps) {
  const { points, crossoverPoints, summaryText } = summary;

  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
          Sensitivity Analysis
        </h3>
        <p className="text-xs text-slate-400">No sweep data available.</p>
      </div>
    );
  }

  // Group points by parameter
  const paramNames = [...new Set(points.map((p) => p.paramName))];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
        Sensitivity Analysis
      </h3>

      <div className="space-y-4">
        {paramNames.map((paramName) => {
          const paramPoints = points
            .filter((p) => p.paramName === paramName)
            .sort((a, b) => a.paramValue - b.paramValue);

          const paramCrossovers = crossoverPoints.filter(
            (c) => c.paramName === paramName,
          );

          const color = PARAM_COLORS[paramName] ?? '#64748b';

          return (
            <div key={paramName}>
              <p className="text-[11px] font-semibold text-slate-600 mb-1 font-mono">
                {paramName}
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart
                  data={paramPoints}
                  margin={{ top: 8, right: 12, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="paramValue"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v: number) => v.toFixed(3)}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.18), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
                      background: 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(10px)',
                    }}
                    formatter={(value: unknown) => [
                      typeof value === 'number' ? value.toFixed(4) : String(value),
                      'ΔCRPS',
                    ]}
                    labelFormatter={(label: unknown) =>
                      `${paramName} = ${label}`
                    }
                  />
                  {/* Zero reference line */}
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  {/* Crossover points */}
                  {paramCrossovers.map((c, i) => (
                    <ReferenceLine
                      key={i}
                      x={c.value}
                      stroke="#ef4444"
                      strokeDasharray="4 2"
                      label={{
                        value: `crossover ≈ ${c.value.toFixed(3)}`,
                        position: 'top',
                        fontSize: 9,
                        fill: '#ef4444',
                      }}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="deltaCrps"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color, strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Summary text */}
      <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
        {summaryText}
      </p>
    </div>
  );
}
