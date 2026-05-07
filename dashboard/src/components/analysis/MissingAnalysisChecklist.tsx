/**
 * Missing analysis checklist.
 *
 * Sortable list of analysis gaps from analysis_gaps.json.
 * Priority badges (colour-coded), rationale, status.
 * Default sort: critical first.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

import { useState, useMemo } from 'react';
import type { AnalysisGap } from '../../lib/analysis/types';

interface MissingAnalysisChecklistProps {
  gaps: AnalysisGap[];
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_STYLES: Record<string, { pill: string; dot: string }> = {
  critical: { pill: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  high:     { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  medium:   { pill: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  low:      { pill: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  not_started: { label: 'Not started', color: 'text-slate-500', dot: 'bg-slate-300' },
  in_progress: { label: 'In progress', color: 'text-blue-700', dot: 'bg-blue-500' },
  complete:    { label: 'Complete',    color: 'text-emerald-700', dot: 'bg-emerald-500' },
};

type SortField = 'priority' | 'status' | 'title';

export default function MissingAnalysisChecklist({ gaps }: MissingAnalysisChecklistProps) {
  const [sortBy, setSortBy] = useState<SortField>('priority');

  const sorted = useMemo(() => {
    return [...gaps].sort((a, b) => {
      if (sortBy === 'priority') {
        return (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return a.title.localeCompare(b.title);
    });
  }, [gaps, sortBy]);

  if (gaps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-indigo-500" />
          Analysis Gaps
        </h3>
        <p className="text-xs text-slate-400">No analysis gaps identified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* Header with sort controls */}
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-indigo-500" />
          Analysis Gaps
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono font-semibold px-1.5 py-0.5 tabular-nums">
            {gaps.length}
          </span>
        </h3>
        <div
          className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          role="group"
          aria-label="Sort gaps"
        >
          <span className="text-[10px] text-slate-400 pl-1 pr-1">Sort</span>
          {(['priority', 'status', 'title'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => setSortBy(field)}
              aria-pressed={sortBy === field}
              className={`text-[10px] px-2 py-0.5 rounded capitalize transition-colors ${
                sortBy === field
                  ? 'bg-white text-slate-800 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {field}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.map((gap) => {
          const statusInfo = STATUS_LABELS[gap.status] ?? STATUS_LABELS.not_started;
          const priorityStyle = PRIORITY_STYLES[gap.priority] ?? PRIORITY_STYLES.low;
          return (
            <div
              key={gap.id}
              className="rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${priorityStyle.pill}`}
                  >
                    <span className={`inline-block w-1 h-1 rounded-full ${priorityStyle.dot}`} />
                    {gap.priority}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-800">
                    {gap.title}
                  </h4>
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium shrink-0 ${statusInfo.color}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{gap.rationale}</p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Effort
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {gap.estimated_effort}
                </span>
                {gap.status === 'complete' && gap.link && (
                  <a
                    href={gap.link}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-800 transition-colors group"
                  >
                    View analysis
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
