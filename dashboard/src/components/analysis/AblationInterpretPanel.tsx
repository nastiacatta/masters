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

const COMPLEXITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function AblationInterpretPanel({
  interpretation,
}: AblationInterpretPanelProps) {
  const { steps, conclusion, skillGateThreat } = interpretation;

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Ablation Interpretation
      </h3>

      {/* Skill gate threat warning */}
      {skillGateThreat && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <p className="text-xs text-amber-800 font-medium">
            ⚠ Skill gate threat: removing the skill gate (step C) has negligible
            effect on accuracy. This challenges the claim that skill improves
            accuracy.
          </p>
        </div>
      )}

      {/* Ranked step list */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const barWidth =
            (Math.abs(step.deltaCrpsContribution) / maxContribution) * 100;
          const isPositive = step.deltaCrpsContribution > 0;

          return (
            <div
              key={step.variant}
              className="flex items-center gap-3 py-1.5"
            >
              {/* Rank */}
              <span className="text-[10px] text-slate-400 w-4 shrink-0">
                {i + 1}.
              </span>

              {/* Label + variant */}
              <div className="w-28 shrink-0">
                <p className="text-xs font-medium text-slate-700">
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400">{step.variant}</p>
              </div>

              {/* Contribution bar */}
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-4 bg-slate-100 rounded relative">
                  <div
                    className={`absolute top-0 left-0 h-full rounded ${
                      step.isNegligible
                        ? 'bg-slate-300'
                        : isPositive
                          ? 'bg-blue-400'
                          : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.max(barWidth, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-600 w-16 text-right shrink-0">
                  {step.deltaCrpsContribution >= 0 ? '+' : ''}
                  {step.deltaCrpsContribution.toFixed(4)}
                </span>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1 shrink-0">
                {step.isNegligible && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                    No measurable contribution
                  </span>
                )}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    COMPLEXITY_COLORS[step.complexityLevel] ?? COMPLEXITY_COLORS.medium
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
      <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-2">
        {conclusion}
      </p>
    </div>
  );
}
