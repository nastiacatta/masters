import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Customized } from 'recharts';
import type { CalibrationPoint } from '@/lib/types';
import ChartCard from '../dashboard/ChartCard';
import ZoomBadge from './ZoomBadge';
import { useChartZoom } from '@/hooks/useChartZoom';

interface Props {
  data: CalibrationPoint[];
}

/** Default blue for well-calibrated points */
const COLOUR_CALIBRATED = '#2563eb';
/** Amber for miscalibrated points (|pHat - tau| > 0.05) */
const COLOUR_MISCALIBRATED = '#f59e0b';

/**
 * Custom shape renderer for scatter points.
 * Renders miscalibrated points (|pHat - tau| > 0.05) in amber,
 * well-calibrated points in blue.
 */
function CalibrationDot(props: Record<string, unknown>) {
  const { cx, cy, payload } = props as {
    cx: number;
    cy: number;
    payload: CalibrationPoint;
  };
  if (cx == null || cy == null || !payload) return null;

  const isMiscalibrated = Math.abs(payload.pHat - payload.tau) > 0.05;
  const fill = isMiscalibrated ? COLOUR_MISCALIBRATED : COLOUR_CALIBRATED;

  return <circle cx={cx} cy={cy} r={4} fill={fill} />;
}

/**
 * SVG layer that draws a shaded ±0.05 band around the y=x diagonal.
 * Uses the Recharts internal xAxisMap/yAxisMap to convert data coords to pixels.
 */
function CalibrationBand(props: Record<string, unknown>) {
  const { xAxisMap, yAxisMap } = props as {
    xAxisMap?: Record<string, { scale: (v: number) => number }>;
    yAxisMap?: Record<string, { scale: (v: number) => number }>;
  };

  if (!xAxisMap || !yAxisMap) return null;

  const xAxis = Object.values(xAxisMap)[0];
  const yAxis = Object.values(yAxisMap)[0];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const toX = (v: number) => xAxis.scale(v);
  const toY = (v: number) => yAxis.scale(v);

  // Build polygon points for the ±0.05 band around y=x.
  // Upper edge: y = x + 0.05 (clamped to [0,1])
  // Lower edge: y = x - 0.05 (clamped to [0,1])
  // We trace the upper edge left-to-right, then the lower edge right-to-left.
  const steps = 50;
  const upperPoints: string[] = [];
  const lowerPoints: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    const yUpper = Math.min(1, Math.max(0, x + 0.05));
    const yLower = Math.min(1, Math.max(0, x - 0.05));
    upperPoints.push(`${toX(x)},${toY(yUpper)}`);
    lowerPoints.push(`${toX(x)},${toY(yLower)}`);
  }

  // Polygon: upper edge left→right, then lower edge right→left
  const polygonPoints = [...upperPoints, ...lowerPoints.reverse()].join(' ');

  return (
    <polygon
      points={polygonPoints}
      fill="#94a3b8"
      fillOpacity={0.1}
      stroke="none"
    />
  );
}

export default function CalibrationChart({ data }: Props) {
  const zoom = useChartZoom();

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
          margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          onMouseDown={zoom.onMouseDown}
          onMouseMove={zoom.onMouseMove}
          onMouseUp={zoom.onMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="tau"
            type="number"
            domain={zoom.state.isZoomed ? [zoom.state.left, zoom.state.right] : [0, 1]}
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            label={{ value: 'Nominal τ', position: 'insideBottom', offset: -5, fontSize: 11 }}
          />
          <YAxis
            dataKey="pHat"
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            label={{ value: 'Observed p̂', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <Customized component={CalibrationBand} />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#94a3b8" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(value: unknown) => typeof value === 'number' ? value.toFixed(3) : String(value ?? '')}
          />
          <Scatter
            data={data}
            fill={COLOUR_CALIBRATED}
            shape={<CalibrationDot />}
            isAnimationActive={true}
            animationDuration={300}
          />
          {zoom.state.refLeft && zoom.state.refRight && (
            <ReferenceArea x1={zoom.state.refLeft} x2={zoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
          )}
        </ScatterChart>
      </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
