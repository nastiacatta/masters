/**
 * "When Does Skill Help?" conditioning panel.
 *
 * Grid/table of ΔCRPS broken down by conditioning variables
 * (panel size N, horizon T, skill heterogeneity τ spread).
 * "Not significant" label when CI includes zero.
 * Summary statement at bottom.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

interface ConditionBreakdown {
  condition: string;
  n: number;
  t: number;
  tauSpread: number;
  deltaCrps: number;
  se: number;
  ciLow: number;
  ciHigh: number;
  significant: boolean;
}

interface WhenDoesSkillHelpPanelProps {
  data: ConditionBreakdown[];
}

export default function WhenDoesSkillHelpPanel({ data }: WhenDoesSkillHelpPanelProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          When Does Skill Help?
        </h3>
        <p className="text-xs text-slate-400">No conditioning data available.</p>
      </div>
    );
  }

  // Derive summary: find minimum conditions where mechanism reliably beats equal
  const significantRows = data.filter((d) => d.significant && d.deltaCrps < 0);
  let summaryStatement = 'The mechanism does not reliably beat equal weighting under any tested condition.';

  if (significantRows.length > 0) {
    const minN = Math.min(...significantRows.map((d) => d.n));
    const minT = Math.min(...significantRows.map((d) => d.t));
    const minTau = Math.min(...significantRows.map((d) => d.tauSpread));
    summaryStatement = `The mechanism reliably beats equal weighting when N ≥ ${minN}, T ≥ ${minT}, and τ spread ≥ ${minTau.toFixed(1)}.`;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        When Does Skill Help?
      </h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 pr-3 text-slate-500 font-medium">
                Condition
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                N
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                T
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                τ spread
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                ΔCRPS
              </th>
              <th className="text-right py-1.5 px-2 text-slate-500 font-medium">
                95% CI
              </th>
              <th className="text-center py-1.5 px-2 text-slate-500 font-medium">
                Sig.
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-1.5 pr-3 text-slate-700 font-medium">
                  {row.condition}
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono">
                  {row.n}
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono">
                  {row.t}
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono">
                  {row.tauSpread.toFixed(2)}
                </td>
                <td className="text-right py-1.5 px-2 font-mono">
                  <span
                    className={
                      row.deltaCrps < 0
                        ? 'text-green-700'
                        : row.deltaCrps > 0
                          ? 'text-red-700'
                          : 'text-slate-600'
                    }
                  >
                    {row.deltaCrps.toFixed(4)}
                  </span>
                </td>
                <td className="text-right py-1.5 px-2 text-slate-600 font-mono whitespace-nowrap">
                  [{row.ciLow.toFixed(4)}, {row.ciHigh.toFixed(4)}]
                </td>
                <td className="text-center py-1.5 px-2">
                  {row.significant ? (
                    <span className="text-green-600 font-bold text-[10px]">✓</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Not significant
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-2">
        {summaryStatement}
      </p>
    </div>
  );
}
