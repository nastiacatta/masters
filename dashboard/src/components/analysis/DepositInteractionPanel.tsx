/**
 * Deposit interaction panel — displays per-policy ΔCRPS summaries
 * and the interaction effect between deposit policy and skill layer.
 *
 * Requirements: 8.1, 8.2, 8.3
 */

import type { InteractionAnalysis } from '../../lib/analysis/types';

interface DepositInteractionPanelProps {
  analysis: InteractionAnalysis;
}

export default function DepositInteractionPanel({
  analysis,
}: DepositInteractionPanelProps) {
  const { perPolicy, interactionEffect, interactionSe, interactionCiLow, interactionCiHigh, interpretation, warning } = analysis;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Deposit Policy × Skill Interaction
      </h3>

      {warning && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
          <p className="text-xs text-amber-800 font-medium">⚠ {warning}</p>
        </div>
      )}

      {/* Per-policy method table */}
      {perPolicy.length > 0 && (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-1.5 pr-3 text-slate-500 font-medium">Policy</th>
                <th className="text-left py-1.5 px-2 text-slate-500 font-medium">Method</th>
                <th className="text-right py-1.5 px-2 text-slate-500 font-medium">Mean ΔCRPS</th>
                <th className="text-right py-1.5 px-2 text-slate-500 font-medium">SE</th>
                <th className="text-right py-1.5 px-2 text-slate-500 font-medium">95% CI</th>
              </tr>
            </thead>
            <tbody>
              {perPolicy.map((row, i) => (
                <tr key={`${row.depositPolicy}-${row.method}`} className={i < perPolicy.length - 1 ? 'border-b border-slate-100' : ''}>
                  <td className="py-1.5 pr-3 text-slate-700 font-medium">{row.depositPolicy}</td>
                  <td className="py-1.5 px-2 text-slate-600">{row.method}</td>
                  <td className="text-right py-1.5 px-2 font-mono">
                    <span className={row.meanDeltaCrps < 0 ? 'text-green-700' : row.meanDeltaCrps > 0 ? 'text-red-700' : 'text-slate-600'}>
                      {row.meanDeltaCrps.toFixed(4)}
                    </span>
                  </td>
                  <td className="text-right py-1.5 px-2 text-slate-600 font-mono">{row.se.toFixed(4)}</td>
                  <td className="text-right py-1.5 px-2 text-slate-600 font-mono whitespace-nowrap">
                    [{row.ciLow.toFixed(4)}, {row.ciHigh.toFixed(4)}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interaction effect summary */}
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-xs font-medium text-slate-600">Interaction effect:</span>
          <span className="text-sm font-bold font-mono text-indigo-700">
            {interactionEffect >= 0 ? '+' : ''}{interactionEffect.toFixed(4)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            SE = {interactionSe.toFixed(4)}, 95% CI [{interactionCiLow.toFixed(4)}, {interactionCiHigh.toFixed(4)}]
          </span>
        </div>
        <p className="text-xs text-slate-600">{interpretation}</p>
      </div>
    </div>
  );
}
