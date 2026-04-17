/**
 * Baseline coverage audit table.
 *
 * Experiments as rows, mandatory baselines as columns.
 * Checkmark (✓) for present, warning (✗) for missing.
 * "Full baseline coverage" badge when all experiments are complete.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.5, 7.6
 */

import type { BaselineCoverageEntry } from '../../lib/analysis/types';
import { MANDATORY_BASELINES } from '../../lib/analysis/baselineCoverage';

interface BaselineCoverageTableProps {
  entries: BaselineCoverageEntry[];
}

export default function BaselineCoverageTable({ entries }: BaselineCoverageTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Baseline Coverage
        </h3>
        <p className="text-xs text-slate-400">No experiments to audit.</p>
      </div>
    );
  }

  const allComplete = entries.every((e) => e.isComplete);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">
          Baseline Coverage
        </h3>
        {allComplete && (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
            Full baseline coverage
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 pr-3 text-slate-500 font-medium">
                Experiment
              </th>
              {MANDATORY_BASELINES.map((b) => (
                <th
                  key={b}
                  className="text-center py-1.5 px-2 text-slate-500 font-medium"
                >
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.experimentName}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-1.5 pr-3 text-slate-700 font-medium whitespace-nowrap">
                  {entry.experimentName}
                  {!entry.isComplete && (
                    <span className="ml-1.5 text-[10px] text-amber-600 font-normal">
                      Missing baselines
                    </span>
                  )}
                </td>
                {MANDATORY_BASELINES.map((baseline) => {
                  const present = entry.presentBaselines.includes(baseline);
                  return (
                    <td key={baseline} className="text-center py-1.5 px-2">
                      {present ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-amber-500 font-bold">✗</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
