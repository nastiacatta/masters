/**
 * Transformation ribbon: shows how each agent's values flow through the pipeline.
 * Adapted from the RoundInspector design to work with existing pipeline traces.
 *
 * Click a row to highlight that agent. Click a column header for the formula.
 */
import { useState, useMemo } from 'react';
import type { RoundTrace } from '@/lib/coreMechanism/runRoundComposable';
import { SEM } from '@/lib/tokens';

interface Column {
  key: string;
  label: string;
  sym: string;
  formula: string;
  desc: string;
  color: string;
  bg: string;
  getValue: (trace: RoundTrace, i: number) => number;
  format: (v: number) => string;
}

const COLUMNS: Column[] = [
  {
    key: 'sigma', label: 'Skill', sym: 'σᵢ',
    formula: 'σ_{i,t} = σ_min + (1−σ_min) e^{−γ L_{i,t−1}}',
    desc: 'Online skill estimate. Past cumulative loss decays skill toward σ_min.',
    color: SEM.skill.main, bg: SEM.skill.light,
    getValue: (t, i) => t.sigma_t[i],
    format: (v) => v.toFixed(3),
  },
  {
    key: 'deposit', label: 'Deposit', sym: 'bᵢ',
    formula: 'b_{i,t} = f · W_{i,t} · c_{i,t}',
    desc: 'Cash put at risk, scaled by wealth and confidence.',
    color: SEM.deposit.main, bg: SEM.deposit.light,
    getValue: (t, i) => t.deposits[i],
    format: (v) => v.toFixed(2),
  },
  {
    key: 'wager', label: 'Eff. wager', sym: 'mᵢ',
    formula: 'm_{i,t} = b_{i,t}(λ + (1−λ)σ_{i,t})',
    desc: 'Deposit filtered through the skill gate. Poor skill reduces effective wager below deposit.',
    color: SEM.wager.main, bg: SEM.wager.light,
    getValue: (t, i) => t.effectiveWager[i],
    format: (v) => v.toFixed(2),
  },
  {
    key: 'weight', label: 'Weight', sym: 'w̃ᵢ',
    formula: 'w̃_{i,t} = m_{i,t} / Σⱼ mⱼ,t',
    desc: 'Normalised share of influence. Determines contribution to aggregate forecast.',
    color: SEM.aggregate.main, bg: SEM.aggregate.light,
    getValue: (t, i) => t.weights[i],
    format: (v) => (v * 100).toFixed(1) + '%',
  },
  {
    key: 'report', label: 'Report', sym: 'rᵢ',
    formula: 'r_{i,t} ∈ [0, 1]',
    desc: 'Point forecast submitted by agent i.',
    color: SEM.outcome.main, bg: SEM.outcome.light,
    getValue: (t, i) => t.reports[i],
    format: (v) => v.toFixed(3),
  },
  {
    key: 'score', label: 'Score', sym: 'sᵢ',
    formula: 's_{i,t} = 1 − |y_t − r_{i,t}|',
    desc: 'Accuracy score. Higher means the report was closer to the outcome.',
    color: SEM.score.main, bg: SEM.score.light,
    getValue: (t, i) => t.scores[i],
    format: (v) => v.toFixed(3),
  },
  {
    key: 'profit', label: 'Profit', sym: 'πᵢ',
    formula: 'π_{i,t} = Π_{i,t} − b_{i,t}',
    desc: 'Net gain/loss after settlement. Drives wealth update.',
    color: SEM.payoff.main, bg: SEM.payoff.light,
    getValue: (t, i) => t.profit[i],
    format: (v) => (v >= 0 ? '+' : '') + v.toFixed(2),
  },
  {
    key: 'wealth', label: "Wealth W'", sym: "W'ᵢ",
    formula: "W_{i,t+1} = W_{i,t} + π_{i,t}",
    desc: 'Wealth after settlement. Funds future deposits.',
    color: SEM.wealth.main, bg: SEM.wealth.light,
    getValue: (t, i) => t.wealth_after[i],
    format: (v) => v.toFixed(2),
  },
];

function heatOpacity(value: number, min: number, max: number): number {
  if (max === min) return 0.3;
  return 0.1 + 0.5 * ((value - min) / (max - min));
}

function FormulaPanel({ col, onClose }: { col: Column; onClose: () => void }) {
  return (
    <div className="absolute z-30 top-full mt-1 left-0 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-4 text-sm">
      <button onClick={onClose} className="absolute top-2 right-3 text-slate-400 hover:text-slate-600">✕</button>
      <p className="font-semibold text-slate-800 mb-1">{col.label}</p>
      <code className="block text-xs bg-slate-50 rounded px-2 py-1.5 mb-2 font-mono" style={{ color: col.color }}>
        {col.formula}
      </code>
      <p className="text-xs text-slate-500 leading-relaxed">{col.desc}</p>
    </div>
  );
}

interface Props {
  trace: RoundTrace;
  selectedAgent: number | null;
  onSelectAgent: (i: number | null) => void;
}

export default function RoundRibbon({ trace, selectedAgent, onSelectAgent }: Props) {
  const [tooltipCol, setTooltipCol] = useState<string | null>(null);
  const N = trace.participated.length;

  const ranges = useMemo(() => {
    const result: Record<string, { min: number; max: number }> = {};
    for (const col of COLUMNS) {
      const vals = Array.from({ length: N }, (_, i) => col.getValue(trace, i));
      result[col.key] = { min: Math.min(...vals), max: Math.max(...vals) };
    }
    return result;
  }, [trace, N]);

  const toggleAgent = (i: number) => onSelectAgent(selectedAgent === i ? null : i);

  return (
    <div className="text-sm">
      {/* Aggregate summary */}
      <div className="flex flex-wrap gap-4 items-center px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">Aggregate r̂</span>
          <span className="font-bold font-mono text-slate-800">{trace.r_hat.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">Outcome y</span>
          <span className="font-bold font-mono text-slate-800">{trace.y.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">Error</span>
          <span className={`font-bold font-mono ${Math.abs(trace.y - trace.r_hat) < 0.1 ? 'text-emerald-600' : 'text-red-500'}`}>
            {Math.abs(trace.y - trace.r_hat).toFixed(4)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">N_eff</span>
          <span className="font-mono text-slate-700">{trace.nEff.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1.5">Active</span>
          <span className="font-mono text-slate-700">{trace.activeCount}/{N}</span>
        </div>
      </div>

      {/* Transformation ribbon */}
      <div className="overflow-x-auto pb-2 -mx-1">
        <table className="border-collapse" style={{ minWidth: `${COLUMNS.length * 100 + 80}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white text-left py-2 pr-3 pl-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 min-w-[72px]">
                Agent
              </th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="relative text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 min-w-[90px]"
                  style={{ background: col.bg, color: col.color }}
                  onClick={() => setTooltipCol(tooltipCol === col.key ? null : col.key)}
                >
                  <span>{col.label}</span>
                  <span className="ml-1 text-slate-400 text-[9px]">ⓘ</span>
                  {tooltipCol === col.key && (
                    <FormulaPanel col={col} onClose={() => setTooltipCol(null)} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: N }, (_, i) => {
              const highlighted = selectedAgent === null || selectedAgent === i;
              const selected = selectedAgent === i;
              const active = trace.participated[i];
              return (
                <tr
                  key={i}
                  onClick={() => toggleAgent(i)}
                  className={`cursor-pointer transition-all duration-150 ${
                    selected ? 'ring-1 ring-inset ring-indigo-400' : ''
                  } ${
                    highlighted ? 'opacity-100' : 'opacity-20'
                  } ${
                    i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } hover:bg-indigo-50/50`}
                >
                  <td className="sticky left-0 z-10 py-2 pr-3 pl-2 bg-inherit whitespace-nowrap">
                    <span className="font-medium text-slate-700">F{i + 1}</span>
                    {!active && (
                      <span className="ml-1.5 text-[9px] text-slate-400 border border-slate-300 rounded px-1">out</span>
                    )}
                  </td>
                  {COLUMNS.map(col => {
                    const raw = col.getValue(trace, i);
                    const { min, max } = ranges[col.key];
                    const alpha = heatOpacity(raw, min, max);
                    const isProfit = col.key === 'profit';
                    const profitColor = isProfit
                      ? raw >= 0 ? 'text-emerald-700' : 'text-red-600'
                      : 'text-slate-800';
                    return (
                      <td
                        key={col.key}
                        className={`text-center py-2 px-2 tabular-nums font-mono text-xs ${profitColor}`}
                        style={{
                          background: selected
                            ? `${col.color}${Math.round(alpha * 60).toString(16).padStart(2, '0')}`
                            : active ? `${col.color}${Math.round(alpha * 20).toString(16).padStart(2, '0')}` : undefined,
                        }}
                      >
                        {col.format(raw)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        Click any row to highlight its path. Click a column header for the formula.
      </p>
    </div>
  );
}
