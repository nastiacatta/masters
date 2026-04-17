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

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-amber-100 text-amber-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_started: { label: 'Not started', color: 'text-slate-400' },
  in_progress: { label: 'In progress', color: 'text-blue-600' },
  complete: { label: 'Complete', color: 'text-green-600' },
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
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Analysis Gaps
        </h3>
        <p className="text-xs text-slate-400">No analysis gaps identified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Header with sort controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800">Analysis Gaps</h3>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 mr-1">Sort:</span>
          {(['priority', 'status', 'title'] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => setSortBy(field)}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                sortBy === field
                  ? 'bg-slate-200 text-slate-700 font-medium'
                  : 'text-slate-400 hover:text-slate-600'
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
          return (
            <div
              key={gap.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      PRIORITY_COLORS[gap.priority] ?? PRIORITY_COLORS.low
                    }`}
                  >
                    {gap.priority}
                  </span>
                  <h4 className="text-xs font-medium text-slate-800">
                    {gap.title}
                  </h4>
                </div>
                <span className={`text-[10px] font-medium shrink-0 ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-600">{gap.rationale}</p>

              <div className="mt-1.5 flex items-center gap-3">
                <span className="text-[10px] text-slate-400">
                  Effort: {gap.estimated_effort}
                </span>
                {gap.status === 'complete' && gap.link && (
                  <a
                    href={gap.link}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    View analysis →
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
