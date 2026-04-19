import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Line, LineChart, ReferenceLine } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 12: Skill Recovery — ScatterChart showing 6 forecasters,
 * τ (true noise) vs σ (learned skill), demonstrating perfect rank recovery.
 * Much larger points, labels directly on chart, fitted curve, bigger Spearman badge.
 */

interface ForecasterPoint {
  id: string;
  tau: number;
  sigma: number;
}

const FALLBACK_DATA: ForecasterPoint[] = [
  { id: 'F1', tau: 0.15, sigma: 0.959 },
  { id: 'F2', tau: 0.30, sigma: 0.935 },
  { id: 'F3', tau: 0.50, sigma: 0.900 },
  { id: 'F4', tau: 0.65, sigma: 0.870 },
  { id: 'F5', tau: 0.80, sigma: 0.845 },
  { id: 'F6', tau: 1.00, sigma: 0.820 },
];

// Fitted curve data (smooth exponential fit through the points)
const FITTED_CURVE = Array.from({ length: 30 }, (_, i) => {
  const tau = 0.1 + (i / 29) * 0.95;
  const sigma = 0.82 + (0.96 - 0.82) * Math.exp(-2.5 * (tau - 0.15));
  return { tau: parseFloat(tau.toFixed(3)), sigma: parseFloat(Math.min(sigma, 0.96).toFixed(4)) };
});

const COLOURS = [
  PALETTE.teal,
  PALETTE.navy,
  PALETTE.warmGrey,
  PALETTE.deepRed,
  PALETTE.darkSlate,
  '#6B46C1',
] as const;

/** Custom dot renderer that draws large circles with labels */
function renderCustomDot(props: { cx?: number; cy?: number; index?: number }) {
  const { cx, cy, index } = props;
  if (cx === undefined || cy === undefined || index === undefined) return null;
  const point = FALLBACK_DATA[index];
  return (
    <g key={`dot-${index}`}>
      <circle cx={cx} cy={cy} r={12} fill={COLOURS[index]} stroke={PALETTE.white} strokeWidth={2} />
      <text
        x={cx + 18}
        y={cy + 5}
        fontFamily={TYPOGRAPHY.fontFamily}
        fontSize="13"
        fontWeight={600}
        fill={COLOURS[index]}
      >
        {point.id} (τ={point.tau})
      </text>
    </g>
  );
}

export default function SkillRecoverySlide() {
  return (
    <SlideShell title="Skill Recovery">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Annotation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p
            style={{
              fontSize: TYPOGRAPHY.chartTitle.fontSize,
              fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
              color: PALETTE.navy,
              fontFamily: TYPOGRAPHY.fontFamily,
              margin: 0,
            }}
          >
            True Noise (τ) vs Learned Skill (σ)
          </p>
          {/* Bigger Spearman badge */}
          <div
            style={{
              background: PALETTE.teal,
              color: PALETTE.white,
              fontSize: '1.3rem',
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 24,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Spearman ρ = 1.0000
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {/* Fitted curve as background line chart */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FITTED_CURVE} margin={{ top: 24, right: 80, left: 24, bottom: 48 }}>
                <XAxis dataKey="tau" type="number" domain={[0, 1.1]} hide />
                <YAxis dataKey="sigma" type="number" domain={[0.78, 1.0]} hide />
                <Line
                  type="monotone"
                  dataKey="sigma"
                  stroke={PALETTE.teal}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={false}
                  opacity={0.4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scatter chart on top */}
          <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 24, right: 80, left: 24, bottom: 48 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.lightGrey} />
                <XAxis
                  dataKey="tau"
                  type="number"
                  domain={[0, 1.1]}
                  name="τ (true noise)"
                  label={{ value: 'τ (true noise)', position: 'bottom', offset: 20, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                  tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                  axisLine={{ strokeWidth: 2 }}
                />
                <YAxis
                  dataKey="sigma"
                  type="number"
                  domain={[0.78, 1.0]}
                  name="σ (learned skill)"
                  label={{ value: 'σ (learned skill)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                  tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                  axisLine={{ strokeWidth: 2 }}
                />
                <ReferenceLine
                  stroke={PALETTE.warmGrey}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  segment={[{ x: 0.15, y: 0.959 }, { x: 1.0, y: 0.82 }]}
                />
                <Scatter
                  data={FALLBACK_DATA}
                  name="Forecasters"
                  shape={renderCustomDot}
                >
                  {FALLBACK_DATA.map((_, i) => (
                    <Cell key={i} fill={COLOURS[i]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
