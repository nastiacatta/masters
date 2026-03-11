import type { SkillWagerPoint } from '@/lib/types';
import { agentDisplayName } from '@/lib/formatters';
import ChartCard from '../dashboard/ChartCard';
import { Tooltip as RTooltip } from 'recharts';

interface Props {
  data: SkillWagerPoint[];
}

export default function ParticipationHeatmap({ data }: Props) {
  const agents = [...new Set(data.map(d => d.agent))].sort((a, b) => a - b);
  const maxT = Math.max(...data.map(d => d.t));
  const blockSize = Math.max(1, Math.floor(maxT / 60));

  void RTooltip;

  const blocks: { agent: number; block: number; rate: number }[] = [];
  for (const a of agents) {
    const agentData = data.filter(d => d.agent === a);
    for (let b = 0; b * blockSize <= maxT; b++) {
      const start = b * blockSize;
      const end = Math.min(start + blockSize, maxT + 1);
      const slice = agentData.filter(d => d.t >= start && d.t < end);
      const active = slice.filter(d => !d.missing).length;
      blocks.push({ agent: a, block: b, rate: slice.length > 0 ? active / slice.length : 0 });
    }
  }

  const nBlocks = Math.ceil((maxT + 1) / blockSize);
  const cellW = Math.max(3, Math.min(12, 600 / nBlocks));
  const cellH = 18;

  return (
    <ChartCard title="Participation Heatmap" subtitle="Agents × rounds — darker = more active participation">
      <div className="overflow-x-auto">
        <div className="flex">
          <div className="shrink-0 pr-2">
            {agents.map(a => (
              <div key={a} className="flex items-center justify-end" style={{ height: cellH }}>
                <span className="text-[9px] text-slate-400">{agentDisplayName(a)}</span>
              </div>
            ))}
          </div>
          <div>
            {agents.map(a => (
              <div key={a} className="flex" style={{ height: cellH }}>
                {blocks
                  .filter(b => b.agent === a)
                  .map((b, i) => {
                    const opacity = b.rate;
                    return (
                      <div
                        key={i}
                        style={{
                          width: cellW,
                          height: cellH - 2,
                          background: `rgba(37, 99, 235, ${opacity})`,
                          borderRadius: 1,
                          margin: '1px 0.5px',
                        }}
                        title={`${agentDisplayName(b.agent)}, rounds ${b.block * blockSize}–${(b.block + 1) * blockSize - 1}: ${(b.rate * 100).toFixed(0)}% active`}
                      />
                    );
                  })}
              </div>
            ))}
            <div className="flex justify-between mt-1" style={{ width: nBlocks * (cellW + 1) }}>
              <span className="text-[9px] text-slate-400">0</span>
              <span className="text-[9px] text-slate-400">{maxT}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[9px] text-slate-400">Inactive</span>
          <div className="flex gap-0.5">
            {[0, 0.25, 0.5, 0.75, 1].map(v => (
              <div key={v} style={{ width: 16, height: 10, background: `rgba(37, 99, 235, ${v})`, borderRadius: 2, border: '1px solid #e2e8f0' }} />
            ))}
          </div>
          <span className="text-[9px] text-slate-400">Active</span>
        </div>
      </div>
    </ChartCard>
  );
}
