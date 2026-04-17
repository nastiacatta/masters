/**
 * Regime breakdown table — compact display of per-regime statistics.
 *
 * Shows regime name, n_rounds, mean ΔCRPS (4 decimal places), SE, and 95% CI.
 * Both favourable and unfavourable regimes get equal visual prominence.
 *
 * Requirements: 5.3, 5.4, 5.5
 */

import type { RegimeStats } from '../../lib/analysis/types';

interface RegimeBreakdownTableProps {
  regimes: RegimeStats[];
}

export default function RegimeBreakdownTable({ regimes }: RegimeBreakdownTableProps) {
  if (regimes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs text-slate-400">No regime data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold text-slate-700 mb-2">
        Regime Breakdown
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 pr-3 text-slate-500 font-medium">
                Regime
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                n
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                Mean ΔCRPS
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                SE
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                95% CI
              </th>
            </tr>
          </thead>
          <tbody>
            {regimes.map((regime) => (
              <tr
                key={regime.regimeName}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-1.5 pr-3 text-slate-700 font-medium">
                  {regime.regimeName}
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono">
                  {regime.nRounds}
                </td>
                <td className="text-right py-1.5 px-2 font-mono">
                  <span
                    className={
                      regime.meanDeltaCrps < 0
                        ? 'text-green-700'
                        : regime.meanDeltaCrps > 0
                          ? 'text-red-700'
                          : 'text-slate-600'
                    }
                  >
                    {regime.meanDeltaCrps.toFixed(4)}
                  </span>
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono">
                  {regime.se.toFixed(4)}
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono whitespace-nowrap">
                  [{regime.ciLow.toFixed(4)}, {regime.ciHigh.toFixed(4)}]
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
