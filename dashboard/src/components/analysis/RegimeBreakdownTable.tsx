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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block w-1 h-3.5 rounded bg-teal-500" />
        Regime Breakdown
      </h4>
      <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/40">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="text-left py-2 pl-3 pr-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Regime
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                n
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Mean ΔCRPS
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                SE
              </th>
              <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                95% CI
              </th>
            </tr>
          </thead>
          <tbody>
            {regimes.map((regime) => (
              <tr
                key={regime.regimeName}
                className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors"
              >
                <td className="py-2 pl-3 pr-3 text-slate-700 font-medium">
                  {regime.regimeName}
                </td>
                <td className="text-right py-2 px-2 text-slate-600 font-mono tabular-nums">
                  {regime.nRounds}
                </td>
                <td className="text-right py-2 px-2 font-mono tabular-nums">
                  <span
                    className={
                      regime.meanDeltaCrps < 0
                        ? 'text-emerald-700 font-semibold'
                        : regime.meanDeltaCrps > 0
                          ? 'text-red-700 font-semibold'
                          : 'text-slate-600'
                    }
                  >
                    {regime.meanDeltaCrps.toFixed(4)}
                  </span>
                </td>
                <td className="text-right py-2 px-2 text-slate-600 font-mono tabular-nums">
                  {regime.se.toFixed(4)}
                </td>
                <td className="text-right py-2 px-3 text-slate-600 font-mono tabular-nums whitespace-nowrap">
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
