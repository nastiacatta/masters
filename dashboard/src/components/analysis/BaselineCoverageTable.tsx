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

function CheckIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function CrossIcon() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600">
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function BaselineCoverageTable({ entries }: BaselineCoverageTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
          Baseline Coverage
        </h3>
        <p className="text-xs text-slate-400">No experiments to audit.</p>
      </div>
    );
  }

  const allComplete = entries.every((e) => e.isComplete);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
          Baseline Coverage
        </h3>
        {allComplete ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Full baseline coverage
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
            Partial
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/40">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="text-left py-2 pl-3 pr-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Experiment
              </th>
              {MANDATORY_BASELINES.map((b) => (
                <th
                  key={b}
                  className="text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500"
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
                className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors"
              >
                <td className="py-2 pl-3 pr-3 text-slate-700 font-medium whitespace-nowrap">
                  {entry.experimentName}
                  {!entry.isComplete && (
                    <span className="ml-2 text-[10px] text-amber-700 font-normal">
                      Missing baselines
                    </span>
                  )}
                </td>
                {MANDATORY_BASELINES.map((baseline) => {
                  const present = entry.presentBaselines.includes(baseline);
                  return (
                    <td key={baseline} className="text-center py-2 px-2">
                      {present ? <CheckIcon /> : <CrossIcon />}
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
