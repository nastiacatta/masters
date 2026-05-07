import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea } from 'recharts';
import type { BehaviourScenario } from '@/lib/types';
import { scenarioLabel } from '@/lib/formatters';
import ChartCard from '../dashboard/ChartCard';
import ZoomBadge from './ZoomBadge';
import { useState, useCallback } from 'react';
import TabGroup from '../dashboard/TabGroup';
import { useChartZoom } from '@/hooks/useChartZoom';

interface Props {
  data: BehaviourScenario[];
}

const COLORS = ['#64748b', '#6366f1', '#0d9488', '#10b981', '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function BehaviourComparisonChart({ data }: Props) {
  const [metric, setMetric] = useState<'finalGini' | 'finalNEff'>('finalGini');
  const zoom = useChartZoom();

  const chartData = data.map((d, i) => ({
    name: scenarioLabel(d.scenario),
    value: d[metric],
    idx: i,
  }));

  const [hiddenSeries, setHiddenSeries] = useState<Set<number>>(new Set());
  const toggleScenario = useCallback((idx: number) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const visibleData = chartData.filter((_, i) => !hiddenSeries.has(i));

  return (
    <ChartCard
      title="Behaviour Scenario Comparison"
      subtitle={<>How different agent behaviours affect market concentration. Drag to zoom. <ZoomBadge isZoomed={zoom.state.isZoomed} onReset={zoom.reset} /></>}
      help={{
        term: 'Behaviour Scenario Comparison',
        definition: 'Compares market outcomes (Gini or N_eff) across different agent behaviour presets (e.g., baseline, bursty, sybil).',
        interpretation: 'Lower Gini means more equal influence distribution. Higher N_eff means more effective participants.',
        axes: { x: metric === 'finalGini' ? 'Gini coefficient' : 'Effective participants (N_eff)', y: 'Scenario' },
      }}
    >
      <TabGroup
        tabs={[
          { id: 'finalGini', label: 'Gini' },
          { id: 'finalNEff', label: 'N_eff' },
        ]}
        active={metric}
        onChange={(v) => setMetric(v as 'finalGini' | 'finalNEff')}
      />
      {/* Clickable legend for scenario toggling */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {chartData.map((d, i) => (
          <button
            key={i}
            onClick={() => toggleScenario(i)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-opacity ${
              hiddenSeries.has(i) ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name}
          </button>
        ))}
      </div>
      <div className="cursor-crosshair">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={visibleData}
          layout="vertical"
          margin={{ top: 10, right: 28, bottom: 10, left: 120 }}
          onMouseDown={zoom.onMouseDown}
          onMouseMove={zoom.onMouseMove}
          onMouseUp={zoom.onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd3" strokeOpacity={0.8} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#5a6175' }}
            stroke="#8c92a3"
            domain={zoom.state.isZoomed ? [zoom.state.left, zoom.state.right] : undefined}
          />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5a6175' }} stroke="#8c92a3" width={115} />
          <Tooltip contentStyle={{
            fontSize: 12, borderRadius: 6,
            border: '1px solid #d1d5db',
            background: 'rgba(255, 253, 248, 0.98)',
            boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.18)',
          }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive={true} animationDuration={300}>
            {visibleData.map((d) => (
              <Cell key={d.idx} fill={COLORS[d.idx % COLORS.length]} />
            ))}
          </Bar>
          {zoom.state.refLeft && zoom.state.refRight && (
            <ReferenceArea x1={zoom.state.refLeft} x2={zoom.state.refRight} strokeOpacity={0.3} fill="#1d3461" fillOpacity={0.1} />
          )}
        </BarChart>
      </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
