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
  lam: '#3b82f6',
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
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Sensitivity Analysis
        </h3>
        <p className="text-xs text-slate-400">No sweep data available.</p>
      </div>
    );
  }

  // Group points by parameter
  const paramNames = [...new Set(points.map((p) => p.paramName))];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
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
              <p className="text-xs font-medium text-slate-600 mb-1">
                {paramName}
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart
                  data={paramPoints}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="paramValue"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    tickFormatter={(v: number) => v.toFixed(3)}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
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
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Summary text */}
      <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-2">
        {summaryText}
      </p>
    </div>
  );
}
