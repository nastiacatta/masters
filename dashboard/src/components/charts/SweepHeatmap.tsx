import type { SweepPoint } from '@/lib/types';
import ChartCard from '../dashboard/ChartCard';
import MathBlock from '../dashboard/MathBlock';
import { useState } from 'react';
import TabGroup from '../dashboard/TabGroup';
import { fmtNum, sweepMetricLabel } from '@/lib/formatters';

// Note: Drag-to-zoom is not applicable for this table-based heatmap.
// The heatmap uses HTML table cells, not Recharts, so useChartZoom cannot be applied.

interface Props {
  data: SweepPoint[];
}

export default function SweepHeatmap({ data }: Props) {
  const [metric, setMetric] = useState<'meanCrps' | 'gini'>('meanCrps');

  const lams = [...new Set(data.map(d => d.lam))].sort((a, b) => a - b);
  const sigmaMins = [...new Set(data.map(d => d.sigmaMin))].sort((a, b) => a - b);

  const values = data.map(d => d[metric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const getColor = (v: number) => {
    const t = (v - minVal) / range;
    if (metric === 'meanCrps') {
      const r = Math.round(37 + t * 200);
      const g = Math.round(99 - t * 60);
      const b = Math.round(235 - t * 180);
      return `rgb(${r},${g},${b})`;
    }
    const r = Math.round(37 + t * 200);
    const g = Math.round(99 - t * 60);
    const b = Math.round(235 - t * 180);
    return `rgb(${r},${g},${b})`;
  };

  const cellW = 60;
  const cellH = 36;

  return (
    <ChartCard
      title="Parameter Sweep"
      subtitle={<><MathBlock inline latex="\\lambda" /> vs <MathBlock inline latex="\\sigma_{\\min}" /> — explore the quality–concentration trade-off</>}
      help={{
        term: 'Parameter Sweep',
        definition: 'A grid search over λ (stake weight) and σ_min (minimum skill floor), measuring accuracy (CRPS) and concentration (Gini) at each combination.',
        interpretation: 'Darker cells indicate worse values. The mechanism is not brittle if the colour gradient is smooth rather than having sharp jumps.',
        axes: { x: 'σ_min (minimum skill floor)', y: 'λ (stake weight)' },
      }}
    >
      <TabGroup
        tabs={[
          { id: 'meanCrps', label: 'Mean CRPS' },
          { id: 'gini', label: 'Gini' },
        ]}
        active={metric}
        onChange={(v) => setMetric(v as 'meanCrps' | 'gini')}
      />
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="text-[9px] text-slate-400 p-1"><MathBlock inline latex="\\lambda \\setminus \\sigma_{\\min}" /></th>
              {sigmaMins.map(s => (
                <th key={s} className="text-[9px] text-slate-500 p-1 text-center" style={{ width: cellW }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lams.map(l => (
              <tr key={l}>
                <td className="text-[9px] text-slate-500 p-1 text-right pr-2">{l}</td>
                {sigmaMins.map(s => {
                  const pt = data.find(d => d.lam === l && d.sigmaMin === s);
                  const val = pt ? pt[metric] : 0;
                  return (
                    <td key={s} className="p-0.5">
                      <div
                        className="rounded flex items-center justify-center"
                        style={{ width: cellW, height: cellH, background: getColor(val) }}
                        title={`λ=${l}, σ_min=${s}: ${sweepMetricLabel(metric)}=${fmtNum(val)}`}
                      >
                        <span className="text-[9px] text-white font-mono">{fmtNum(val, 4)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
