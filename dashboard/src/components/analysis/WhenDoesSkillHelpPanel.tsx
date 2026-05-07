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
      <PanelShell title="When does skill help?" accent="var(--teal)" emptyState="No conditioning data available." />
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
        When Does Skill Help?
      </h3>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100 bg-slate-50/40">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-white">
              <th className="text-left py-2 pl-3 pr-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Condition
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                N
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                T
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                τ spread
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                ΔCRPS
              </th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                95% CI
              </th>
              <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Sig.
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors"
              >
                <td className="py-2 pl-3 pr-3 text-slate-700 font-medium">
                  {row.condition}
                </td>
                <td className="text-right py-2 px-2 text-slate-600 font-mono tabular-nums">
                  {row.n}
                </td>
                <td className="text-right py-2 px-2 text-slate-600 font-mono tabular-nums">
                  {row.t}
                </td>
                <td className="text-right py-2 px-2 text-slate-600 font-mono tabular-nums">
                  {row.tauSpread.toFixed(2)}
                </td>
                <td className="text-right py-2 px-2 font-mono tabular-nums">
                  <span
                    className={
                      row.deltaCrps < 0
                        ? 'text-emerald-700 font-semibold'
                        : row.deltaCrps > 0
                          ? 'text-red-700 font-semibold'
                          : 'text-slate-600'
                    }
                  >
                    {row.deltaCrps.toFixed(4)}
                  </span>
                </td>
                <td className="text-right py-2 px-2 text-slate-600 font-mono tabular-nums whitespace-nowrap">
                  [{row.ciLow.toFixed(4)}, {row.ciHigh.toFixed(4)}]
                </td>
                <td className="text-center py-2 px-3">
                  {row.significant ? (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600"
                      aria-label="Significant"
                    >
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      n.s.
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <p className="mt-3 text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
        {summaryStatement}
      </p>
    </div>
  );
}
