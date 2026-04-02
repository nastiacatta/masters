import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import type { CalibrationPoint } from '@/lib/types';
import ChartCard from '../dashboard/ChartCard';
import ZoomBadge from './ZoomBadge';
import { useChartZoom } from '@/hooks/useChartZoom';

interface Props {
  data: CalibrationPoint[];
}

export default function CalibrationChart({ data }: Props) {
  const zoom = useChartZoom('tau');

  return (
    <ChartCard
      title="Reliability Diagram"
      subtitle={<>Coverage vs nominal quantile — perfect calibration follows the diagonal. Drag to zoom. <ZoomBadge isZoomed={zoom.state.isZoomed} onReset={zoom.reset} /></>}
      help={{
        term: 'Reliability Diagram',
        definition: 'Plots observed coverage (p̂) against nominal quantile (τ). If forecasts are perfectly calibrated, points lie on the diagonal.',
        interpretation: 'Points above the diagonal mean the forecast is under-confident; below means over-confident. Closer to the diagonal is better.',
        axes: { x: 'Nominal τ', y: 'Observed p̂' },
      }}
    >
      <div className="cursor-crosshair">
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart
          margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
          onMouseDown={zoom.onMouseDown}
          onMouseMove={zoom.onMouseMove}
          onMouseUp={zoom.onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="tau"
            type="number"
            domain={zoom.state.isZoomed ? [zoom.state.left, zoom.state.right] : [0, 1]}
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            label={{ value: 'Nominal τ', position: 'insideBottom', offset: -5, fontSize: 10 }}
          />
          <YAxis
            dataKey="pHat"
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            label={{ value: 'Observed p̂', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#94a3b8" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(value: unknown) => typeof value === 'number' ? value.toFixed(3) : String(value ?? '')}
          />
          <Scatter data={data} fill="#2563eb" r={7} isAnimationActive={true} animationDuration={300} />
          {zoom.state.refLeft && zoom.state.refRight && (
            <ReferenceArea x1={zoom.state.refLeft} x2={zoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
