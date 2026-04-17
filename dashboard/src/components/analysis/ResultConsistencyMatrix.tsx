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

interface ResultConsistencyMatrixProps {
  result: ConsistencyResult;
}

function rankColor(rank: number, totalMethods: number): string {
  if (rank === 1) return 'bg-green-100 text-green-800';
  if (rank === totalMethods) return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Method Ranking Consistency
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
            W = {kendallW.toFixed(3)}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              isConsistent
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isConsistent ? 'Consistent' : 'Unstable rankings'}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 pr-3 text-slate-500 font-medium">
                Experiment
              </th>
              {methods.map((m) => (
                <th
                  key={m}
                  className="text-center py-1.5 px-2 text-slate-500 font-medium"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {experiments.map((exp) => (
              <tr key={exp} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 pr-3 text-slate-700 font-medium whitespace-nowrap">
                  {exp}
                </td>
                {methods.map((method) => {
                  const rank = rankLookup.get(exp)?.get(method);
                  const cellKey = `${exp}:${method}`;
                  const cellContradictions = contradictionsByCell.get(cellKey);
                  const hasContradiction = cellContradictions && cellContradictions.length > 0;

                  return (
                    <td key={method} className="text-center py-1.5 px-2">
                      {rank != null ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold ${rankColor(rank, methods.length)} ${
                            hasContradiction ? 'ring-2 ring-amber-400' : ''
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
        <div className="mt-3 border-t border-slate-100 pt-2">
          <p className="text-[10px] text-amber-600 font-medium mb-1">
            {contradictions.length} contradiction{contradictions.length > 1 ? 's' : ''} detected
          </p>
          <ul className="text-[10px] text-slate-500 space-y-0.5">
            {contradictions.slice(0, 3).map((c, i) => (
              <li key={i}>• {c.description}</li>
            ))}
            {contradictions.length > 3 && (
              <li>… and {contradictions.length - 3} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
