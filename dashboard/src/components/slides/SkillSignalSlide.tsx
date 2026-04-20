import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 7 right panel: Skill Signal visual.
 * Clean SVG showing the exponential decay from loss to skill,
 * with 3 example forecasters and property badges.
 * No external PNG — avoids the overlapping label issue.
 */

// Generate smooth decay curve points
const CURVE_POINTS: string = Array.from({ length: 40 }, (_, i) => {
  const loss = i * 0.25; // 0 to 10
  const sigma = 0.1 + 0.9 * Math.exp(-0.35 * loss);
  // Map to SVG coords: x = 80..580, y = 40..320 (inverted — high sigma = low y)
  const x = 80 + (loss / 10) * 500;
  const y = 320 - ((sigma - 0.1) / 0.9) * 280;
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

interface Forecaster {
  label: string;
  loss: number;
  sigma: number;
  colour: string;
}

const FORECASTERS: Forecaster[] = [
  { label: 'Low noise', loss: 0.8, sigma: 0.87, colour: PALETTE.teal },
  { label: 'Medium', loss: 3.5, sigma: 0.39, colour: PALETTE.purple },
  { label: 'High noise', loss: 7.0, sigma: 0.19, colour: PALETTE.coral },
];

export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 16 }}>
      <p style={{
        fontSize: TYPOGRAPHY.chartTitle.fontSize,
        fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
        color: PALETTE.navy,
        fontFamily: TYPOGRAPHY.fontFamily,
        margin: '0 0 8px 0',
      }}>
        How Skill Maps from Loss
      </p>

      {/* SVG chart */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 640 400" style={{ width: '100%', maxWidth: 620, height: 'auto' }} xmlns="http://www.w3.org/2000/svg">
          {/* Axes */}
          <line x1={80} y1={320} x2={580} y2={320} stroke={PALETTE.charcoal} strokeWidth={2} />
          <line x1={80} y1={40} x2={80} y2={320} stroke={PALETTE.charcoal} strokeWidth={2} />

          {/* X-axis label */}
          <text x={330} y={365} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fontWeight={600} fill={PALETTE.charcoal}>
            Accumulated Loss
          </text>

          {/* Y-axis label */}
          <text x={30} y={180} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fontWeight={600} fill={PALETTE.charcoal} transform="rotate(-90, 30, 180)">
            Skill (σ)
          </text>

          {/* Y-axis ticks */}
          <text x={70} y={324} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="11" fill={PALETTE.slate}>σ_min</text>
          <text x={70} y={48} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="11" fill={PALETTE.slate}>1.0</text>
          <text x={70} y={180} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="11" fill={PALETTE.slate}>0.5</text>

          {/* σ_min reference line */}
          <line x1={80} y1={320} x2={580} y2={320} stroke={PALETTE.coral} strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6} />
          <text x={585} y={316} fontFamily={TYPOGRAPHY.fontFamily} fontSize="10" fill={PALETTE.coral}>σ_min</text>

          {/* Decay curve */}
          <polyline
            points={CURVE_POINTS}
            fill="none"
            stroke={PALETTE.teal}
            strokeWidth={3.5}
            strokeLinecap="round"
          />

          {/* Forecaster dots — positioned ON the curve, labels BELOW the chart */}
          {FORECASTERS.map((f) => {
            const x = 80 + (f.loss / 10) * 500;
            const y = 320 - ((f.sigma - 0.1) / 0.9) * 280;
            return (
              <g key={f.label}>
                <circle cx={x} cy={y} r={8} fill={f.colour} stroke={PALETTE.white} strokeWidth={2.5} />
              </g>
            );
          })}

          {/* Legend below chart — no overlap with curve */}
          {FORECASTERS.map((f, i) => {
            const legendX = 120 + i * 180;
            return (
              <g key={`legend-${f.label}`}>
                <circle cx={legendX} cy={388} r={6} fill={f.colour} />
                <text x={legendX + 12} y={392} fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fontWeight={600} fill={PALETTE.charcoal}>
                  {f.label} (σ = {f.sigma.toFixed(2)})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Property badges */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        {['Absolute', 'Pre-round', 'Handles Intermittency'].map(prop => (
          <div key={prop} style={{
            background: PALETTE.white,
            border: `2px solid ${PALETTE.teal}`,
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: PALETTE.teal,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            {prop}
          </div>
        ))}
      </div>
    </div>
  );
}
