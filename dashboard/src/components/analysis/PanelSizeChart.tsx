/**
 * Panel size sensitivity chart — displays per-N ΔCRPS with CI error bars
 * and highlights the minimum reliable N.
 *
 * Requirements: 10.1, 10.2, 10.3
 */

import type { PanelSweepResult } from '../../lib/analysis/types';

interface PanelSizeChartProps {
  sweep: PanelSweepResult;
}

export default function PanelSizeChart({ sweep }: PanelSizeChartProps) {
  const { results, minimumReliableN } = sweep;

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Panel Size Sensitivity
        </h3>
        <p className="text-xs text-slate-400">No panel sweep data available.</p>
      </div>
    );
  }

  // Find max absolute value for bar scaling
  const maxAbs = Math.max(
    ...results.map((r) => Math.max(Math.abs(r.ciLow), Math.abs(r.ciHigh))),
    0.001,
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Panel Size Sensitivity
      </h3>

      {minimumReliableN != null ? (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-2.5">
          <p className="text-xs text-green-800 font-medium">
            Minimum reliable N = {minimumReliableN}
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            The mechanism reliably beats equal weighting (95% CI entirely below zero) at N ≥ {minimumReliableN}.
          </p>
        </div>
      ) : (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <p className="text-xs text-amber-800 font-medium">
            No reliable N found
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            At no tested panel size does the 95% CI for ΔCRPS lie entirely below zero.
          </p>
        </div>
      )}

      {/* Per-N results table with visual CI bars */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 pr-3 text-slate-500 font-medium">N</th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">Mean ΔCRPS</th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">SE</th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">95% CI</th>
              <th className="py-1.5 px-2 text-slate-500 font-medium text-center" style={{ minWidth: 120 }}>
                CI Range
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const isReliable = r.ciHigh < 0;
              const barLeft = ((r.ciLow / maxAbs + 1) / 2) * 100;
              const barRight = ((r.ciHigh / maxAbs + 1) / 2) * 100;
              const barWidth = Math.max(barRight - barLeft, 1);

              return (
                <tr
                  key={r.n}
                  className={`border-b border-slate-100 last:border-0 ${
                    r.n === minimumReliableN ? 'bg-green-50' : ''
                  }`}
                >
                  <td className="py-1.5 pr-3 text-slate-700 font-medium font-mono">
                    {r.n}
                    {r.n === minimumReliableN && (
                      <span className="ml-1 text-[10px] text-green-600">✓</span>
                    )}
                  </td>
                  <td className="text-right py-1.5 px-2 font-mono">
                    <span className={isReliable ? 'text-green-700' : 'text-slate-600'}>
                      {r.meanDeltaCrps.toFixed(4)}
                    </span>
                  </td>
                  <td className="text-right py-1.5 px-2 text-slate-600 font-mono">
                    {r.se.toFixed(4)}
                  </td>
                  <td className="text-right py-1.5 px-2 text-slate-600 font-mono whitespace-nowrap">
                    [{r.ciLow.toFixed(4)}, {r.ciHigh.toFixed(4)}]
                  </td>
                  <td className="py-1.5 px-2">
                    <div className="relative h-4 bg-slate-100 rounded">
                      {/* Zero line */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300" />
                      {/* CI bar */}
                      <div
                        className={`absolute top-0.5 bottom-0.5 rounded ${
                          isReliable ? 'bg-green-400' : 'bg-slate-400'
                        }`}
                        style={{
                          left: `${Math.max(barLeft, 0)}%`,
                          width: `${Math.min(barWidth, 100)}%`,
                        }}
                      />
                      {/* Mean dot */}
                      <div
                        className={`absolute top-1 w-2 h-2 rounded-full ${
                          isReliable ? 'bg-green-700' : 'bg-slate-600'
                        }`}
                        style={{
                          left: `${((r.meanDeltaCrps / maxAbs + 1) / 2) * 100}%`,
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
