/**
 * Cross-experiment result consistency matrix.
 *
 * Table with experiments as rows, methods as columns, cells showing
 * rank number with colour coding. Kendall's W badge in header.
 * Contradiction tooltips on hover.
 *
 * Requirements: 3.1, 3.2, 3.4, 3.5, 13.3, 13.4, 13.5
 */

import type { ConsistencyResult } from '../../lib/analysis/types';
import PanelShell from './PanelShell';

interface ResultConsistencyMatrixProps {
  result: ConsistencyResult;
}

function rankColor(rank: number, totalMethods: number): string {
  if (rank === 1) return 'bg-teal-50 text-teal-800 border-teal-200';
  if (rank === totalMethods) return 'bg-red-50 text-red-800 border-red-200';
  return 'bg-amber-50 text-amber-800 border-amber-200';
}

export default function ResultConsistencyMatrix({ result }: ResultConsistencyMatrixProps) {
  const { matrix, kendallW, isConsistent, contradictions } = result;

  // Extract unique experiments and methods
  const experiments = [...new Set(matrix.map((r) => r.experiment))];
  const methods = [...new Set(matrix.map((r) => r.method))].sort();

  // Build lookup: experiment → method → rank
  const rankLookup = new Map<string, Map<string, number>>();
  for (const entry of matrix) {
    if (!rankLookup.has(entry.experiment)) rankLookup.set(entry.experiment, new Map());
    rankLookup.get(entry.experiment)!.set(entry.method, entry.rank);
  }

  // Build contradiction lookup for tooltips
  const contradictionsByCell = new Map<string, string[]>();
  for (const c of contradictions) {
    for (const exp of [c.experimentA, c.experimentB]) {
      for (const method of [c.methodA, c.methodB]) {
        const key = `${exp}:${method}`;
        if (!contradictionsByCell.has(key)) contradictionsByCell.set(key, []);
        contradictionsByCell.get(key)!.push(c.description);
      }
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
            Method Ranking Consistency
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-xl">
            Kendall&apos;s W measures how consistently different experiments rank the methods.
            1 = perfect agreement, 0 = no agreement.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
            <span className="text-slate-400">W</span>
            <span className="font-bold">{kendallW.toFixed(3)}</span>
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              isConsistent
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConsistent ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isConsistent ? 'Consistent' : 'Unstable rankings'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/40">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="text-left py-2 pl-3 pr-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Experiment
              </th>
              {methods.map((m) => (
                <th
                  key={m}
                  className="text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {experiments.map((exp) => (
              <tr key={exp} className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                <td className="py-2 pl-3 pr-3 text-slate-700 font-medium whitespace-nowrap">
                  {exp}
                </td>
                {methods.map((method) => {
                  const rank = rankLookup.get(exp)?.get(method);
                  const cellKey = `${exp}:${method}`;
                  const cellContradictions = contradictionsByCell.get(cellKey);
                  const hasContradiction = cellContradictions && cellContradictions.length > 0;

                  return (
                    <td key={method} className="text-center py-2 px-2">
                      {rank != null ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold border font-mono tabular-nums ${rankColor(rank, methods.length)} ${
                            hasContradiction ? 'ring-2 ring-amber-400 ring-offset-1' : ''
                          }`}
                          title={
                            hasContradiction
                              ? cellContradictions!.join('\n')
                              : `Rank ${rank}`
                          }
                        >
                          {rank}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contradictions summary */}
      {contradictions.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200/60 bg-amber-50/40 p-3">
          <p className="text-[11px] text-amber-700 font-semibold mb-1 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2L1.5 13.5H14.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.75" fill="currentColor" />
            </svg>
            {contradictions.length} contradiction{contradictions.length > 1 ? 's' : ''} detected
          </p>
          <ul className="text-[11px] text-amber-800/90 space-y-0.5 pl-5 list-disc">
            {contradictions.slice(0, 3).map((c, i) => (
              <li key={i}>{c.description}</li>
            ))}
            {contradictions.length > 3 && (
              <li className="list-none text-[10px] text-amber-600 italic">… and {contradictions.length - 3} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
