/**
 * Ablation interpretation panel.
 *
 * Ranked list of pipeline steps with horizontal contribution bars.
 * "No measurable contribution" grey badge for negligible steps.
 * Conclusion text and skill gate threat warning.
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
 */

import type { AblationInterpretation } from '../../lib/analysis/types';

interface AblationInterpretPanelProps {
  interpretation: AblationInterpretation;
}

const COMPLEXITY_STYLES: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

export default function AblationInterpretPanel({
  interpretation,
}: AblationInterpretPanelProps) {
  const { steps, conclusion, skillGateThreat } = interpretation;

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-indigo-500" />
          Ablation Interpretation
        </h3>
        <p className="text-xs text-slate-400">No ablation data available.</p>
      </div>
    );
  }

  // Find max |contribution| for bar scaling
  const maxContribution = Math.max(
    ...steps.map((s) => Math.abs(s.deltaCrpsContribution)),
    0.001,
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-indigo-500" />
        Ablation Interpretation
      </h3>

      {/* Skill gate threat warning */}
      {skillGateThreat && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/40 p-3 flex gap-2">
          <span
            aria-hidden="true"
            className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white shadow-sm mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L1.5 13.5H14.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="12" r="0.75" fill="currentColor" />
            </svg>
          </span>
          <p className="text-xs text-amber-900 font-medium leading-relaxed">
            Skill gate threat: removing the skill gate (step C) has negligible
            effect on accuracy. This challenges the claim that skill improves
            accuracy.
          </p>
        </div>
      )}

      {/* Ranked step list */}
      <div className="space-y-1.5">
        {steps.map((step, i) => {
          const barWidth =
            (Math.abs(step.deltaCrpsContribution) / maxContribution) * 100;
          const isPositive = step.deltaCrpsContribution > 0;

          return (
            <div
              key={step.variant}
              className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50/70 transition-colors"
            >
              {/* Rank */}
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-[10px] font-mono font-bold text-slate-500 shrink-0">
                {i + 1}
              </span>

              {/* Label + variant */}
              <div className="w-28 shrink-0">
                <p className="text-xs font-semibold text-slate-700">
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">{step.variant}</p>
              </div>

              {/* Contribution bar */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 h-4 bg-slate-100 rounded-md overflow-hidden relative">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-md transition-all duration-300 ${
                      step.isNegligible
                        ? 'bg-gradient-to-r from-slate-300 to-slate-400'
                        : isPositive
                          ? 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                          : 'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{ width: `${Math.max(barWidth, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-700 font-medium w-16 text-right shrink-0">
                  {step.deltaCrpsContribution >= 0 ? '+' : ''}
                  {step.deltaCrpsContribution.toFixed(4)}
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1 shrink-0">
                {step.isNegligible && (
                  <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                    No impact
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize ${
                    COMPLEXITY_STYLES[step.complexityLevel] ?? COMPLEXITY_STYLES.medium
                  }`}
                >
                  {step.complexityLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
        {conclusion}
      </p>
    </div>
  );
}
