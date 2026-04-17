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
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Limitations & Failure Modes
        </h3>
        <p className="text-xs text-slate-400">No failure modes documented.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Limitations & Failure Modes
      </h3>
      <div className="space-y-3">
        {failureModes.map((fm) => (
          <div
            key={fm.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            {/* Condition */}
            <p className="text-sm font-medium text-slate-800">{fm.condition}</p>

            {/* ΔCRPS with CI bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono text-slate-700">
                ΔCRPS = {fm.deltaCrps.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500">
                [{fm.ciLow.toFixed(4)}, {fm.ciHigh.toFixed(4)}]
              </span>
              {/* Visual CI bar */}
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative max-w-[120px]">
                <div
                  className="absolute h-full bg-slate-400 rounded-full"
                  style={{
                    left: `${Math.max(0, ((fm.ciLow + 0.1) / 0.2) * 100)}%`,
                    right: `${Math.max(0, 100 - ((fm.ciHigh + 0.1) / 0.2) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Explanation */}
            <p className="mt-2 text-xs text-slate-600">{fm.explanation}</p>

            {/* Experiment link */}
            <a
              href={`#experiment-${fm.experimentName}`}
              className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              See {fm.experimentName} →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
