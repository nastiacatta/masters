/**
 * Failure mode documentation panel.
 *
 * List of cards showing conditions where the mechanism underperforms
 * equal weighting. Neutral slate colour scheme with same visual weight
 * as positive claims.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import type { FailureMode } from '../../lib/analysis/types';

interface FailureModePanelProps {
  failureModes: FailureMode[];
}

export default function FailureModePanel({ failureModes }: FailureModePanelProps) {
  if (failureModes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-slate-400" />
          Limitations &amp; Failure Modes
        </h3>
        <p className="text-xs text-slate-400">No failure modes documented.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-slate-400" />
          Limitations &amp; Failure Modes
        </h3>
        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono font-semibold px-1.5 py-0.5 tabular-nums">
          {failureModes.length}
        </span>
      </div>
      <div className="space-y-3">
        {failureModes.map((fm) => (
          <div
            key={fm.id}
            className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/40 p-3 hover:border-slate-300 transition-colors"
          >
            {/* Condition */}
            <p className="text-sm font-medium text-slate-800">{fm.condition}</p>

            {/* ΔCRPS with CI bar */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono tabular-nums text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                ΔCRPS = {fm.deltaCrps.toFixed(4)}
              </span>
              <span className="text-[10px] font-mono tabular-nums text-slate-500">
                [{fm.ciLow.toFixed(4)}, {fm.ciHigh.toFixed(4)}]
              </span>
              {/* Visual CI bar */}
              <div
                className="flex-1 h-1.5 bg-slate-200 rounded-full relative max-w-[140px]"
                title={`95% CI: [${fm.ciLow.toFixed(4)}, ${fm.ciHigh.toFixed(4)}]`}
              >
                <div
                  className="absolute h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"
                  style={{
                    left: `${Math.max(0, ((fm.ciLow + 0.1) / 0.2) * 100)}%`,
                    right: `${Math.max(0, 100 - ((fm.ciHigh + 0.1) / 0.2) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Explanation */}
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{fm.explanation}</p>

            {/* Experiment link */}
            <a
              href={`#experiment-${fm.experimentName}`}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-teal-700 transition-colors group"
            >
              See {fm.experimentName}
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
