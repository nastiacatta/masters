import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 7 right panel: Skill Signal — clean SVG exponential decay curve.
 * Three forecaster dots spaced apart with labels to the right, no overlap.
 */

const SIGMA_MIN = 0.1;
const GAMMA = 4;

// Chart area within viewBox
const CX = 90;   // chart left
const CY = 30;   // chart top
const CW = 480;  // chart width
const CH = 300;  // chart height
const CB = CY + CH; // chart bottom

function sigma(L: number): number {
  return SIGMA_MIN + (1 - SIGMA_MIN) * Math.exp(-GAMMA * L);
}

function toSvg(loss: number, s: number): { x: number; y: number } {
  return {
    x: CX + (loss / 2.5) * CW,
    y: CB - ((s - SIGMA_MIN) / (1 - SIGMA_MIN)) * CH,
  };
}

// Smooth curve points
const CURVE = Array.from({ length: 60 }, (_, i) => {
  const L = (i / 59) * 2.5;
  const s = sigma(L);
  const { x, y } = toSvg(L, s);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

interface Dot {
  label: string;
  loss: number;
  color: string;
}

const DOTS: Dot[] = [
  { label: 'Skilled (σ = 0.96)', loss: 0.15, color: PALETTE.teal },
  { label: 'Medium (σ = 0.55)', loss: 0.80, color: PALETTE.purple },
  { label: 'Weak (σ = 0.18)',   loss: 2.10, color: PALETTE.coral },
];

export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
      <svg viewBox="0 0 620 420" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        {/* Axes */}
        <line x1={CX} y1={CB} x2={CX + CW} y2={CB} stroke={PALETTE.charcoal} strokeWidth={2} />
        <line x1={CX} y1={CY} x2={CX} y2={CB} stroke={PALETTE.charcoal} strokeWidth={2} />

        {/* Y-axis ticks and labels */}
        <text x={CX - 10} y={CY + 5} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fill={PALETTE.slate}>1.0</text>
        <line x1={CX - 4} y1={CY} x2={CX} y2={CY} stroke={PALETTE.charcoal} strokeWidth={1.5} />

        <text x={CX - 10} y={CB + 5} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="13" fill={PALETTE.coral}>σ_min</text>
        <line x1={CX} y1={CB} x2={CX + CW} y2={CB} stroke={PALETTE.coral} strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />

        {/* Mid tick */}
        {(() => {
          const midY = CB - (0.5 / (1 - SIGMA_MIN)) * CH;
          return (
            <>
              <text x={CX - 10} y={midY + 5} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="12" fill={PALETTE.slate}>0.55</text>
              <line x1={CX - 4} y1={midY} x2={CX} y2={midY} stroke={PALETTE.border} strokeWidth={1} />
            </>
          );
        })()}

        {/* X-axis label */}
        <text x={CX + CW / 2} y={CB + 45} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.charcoal}>
          Accumulated Loss (L)
        </text>

        {/* Y-axis label */}
        <text x={20} y={CY + CH / 2} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="15" fontWeight={600} fill={PALETTE.charcoal} transform={`rotate(-90, 20, ${CY + CH / 2})`}>
          Skill (σ)
        </text>

        {/* Decay curve */}
        <polyline points={CURVE} fill="none" stroke={PALETTE.teal} strokeWidth={3.5} strokeLinecap="round" />

        {/* Forecaster dots with labels to the right */}
        {DOTS.map((dot) => {
          const s = sigma(dot.loss);
          const { x, y } = toSvg(dot.loss, s);
          return (
            <g key={dot.label}>
              <circle cx={x} cy={y} r={9} fill={dot.color} stroke={PALETTE.white} strokeWidth={3} />
              <text
                x={x + 16}
                y={y + 5}
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="13"
                fontWeight={600}
                fill={dot.color}
              >
                {dot.label}
              </text>
            </g>
          );
        })}

        {/* Formula annotation */}
        <text x={CX + CW / 2} y={CY - 6} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fontWeight={600} fill={PALETTE.navy}>
          σ = σ_min + (1 − σ_min) · exp(−γ · L)
        </text>
      </svg>
    </div>
  );
}
