import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 11: Real Data Validation — clean horizontal bar chart built in SVG.
 * Shows % CRPS improvement vs equal weights for each method on Elia wind data.
 * Data from comparison.json (γ=16, ρ=0.5, 17,544 rounds, 7 forecasters).
 */

interface MethodResult {
  label: string;
  pctImprovement: number;
  highlight?: boolean;
  color: string;
}

// Computed from comparison.json: (uniform - method) / uniform * 100
const METHODS: MethodResult[] = [
  { label: 'Trimmed Mean',     pctImprovement: -20.6, color: PALETTE.slate },
  { label: 'Skill-only',       pctImprovement: -29.6, color: PALETTE.slate },
  { label: 'Inverse Variance', pctImprovement: -31.4, color: PALETTE.slate },
  { label: 'Median',           pctImprovement: -33.4, color: PALETTE.slate },
  { label: 'Mechanism',        pctImprovement: -33.7, color: PALETTE.teal, highlight: true },
  { label: 'Best Single',      pctImprovement: -46.6, color: PALETTE.imperial },
  { label: 'Oracle',           pctImprovement: -50.0, color: PALETTE.border },
];

const BAR_HEIGHT = 36;
const BAR_GAP = 10;
const LABEL_WIDTH = 150;
const CHART_LEFT = 170;
const CHART_WIDTH = 440;
const CHART_TOP = 50;
const MAX_PCT = 55; // max absolute % for scale

export default function ContributionsChartSlide() {
  const totalHeight = CHART_TOP + METHODS.length * (BAR_HEIGHT + BAR_GAP) + 60;

  return (
    <SlideShell title="Real Data Validation" slideNumber={11}>
      {/* Headline */}
      <div style={{
        background: 'rgba(46, 139, 139, 0.08)',
        border: `2px solid ${PALETTE.teal}`,
        borderRadius: 12,
        padding: '12px 24px',
        marginBottom: 8,
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}>
          −34% CRPS improvement on Elia wind (γ=16, ρ=0.5)
        </span>
      </div>

      <p style={{ fontSize: '1rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'center', margin: '0 0 6px 0' }}>
        17,544 rounds · 7 forecasters · Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble
      </p>

      {/* Bar chart */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox={`0 0 660 ${totalHeight}`} style={{ width: '100%', maxHeight: '100%' }} xmlns="http://www.w3.org/2000/svg">
          {/* Baseline (0%) line */}
          <line x1={CHART_LEFT} y1={CHART_TOP - 10} x2={CHART_LEFT} y2={CHART_TOP + METHODS.length * (BAR_HEIGHT + BAR_GAP)} stroke={PALETTE.border} strokeWidth={1.5} />
          <text x={CHART_LEFT} y={CHART_TOP - 16} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="11" fill={PALETTE.slate}>0%</text>

          {/* Grid lines */}
          {[10, 20, 30, 40, 50].map(pct => {
            const x = CHART_LEFT + (pct / MAX_PCT) * CHART_WIDTH;
            return (
              <g key={pct}>
                <line x1={x} y1={CHART_TOP - 10} x2={x} y2={CHART_TOP + METHODS.length * (BAR_HEIGHT + BAR_GAP)} stroke={PALETTE.border} strokeWidth={0.5} strokeDasharray="4 4" />
                <text x={x} y={CHART_TOP - 16} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="11" fill={PALETTE.slate}>−{pct}%</text>
              </g>
            );
          })}

          {/* Bars */}
          {METHODS.map((m, i) => {
            const y = CHART_TOP + i * (BAR_HEIGHT + BAR_GAP);
            const barW = (Math.abs(m.pctImprovement) / MAX_PCT) * CHART_WIDTH;
            const isHighlight = m.highlight;

            return (
              <g key={m.label}>
                {/* Label */}
                <text
                  x={CHART_LEFT - 12}
                  y={y + BAR_HEIGHT / 2 + 5}
                  textAnchor="end"
                  fontFamily={TYPOGRAPHY.fontFamily}
                  fontSize="14"
                  fontWeight={isHighlight ? 700 : 500}
                  fill={isHighlight ? PALETTE.teal : PALETTE.charcoal}
                >
                  {m.label}
                </text>

                {/* Bar */}
                <rect
                  x={CHART_LEFT}
                  y={y}
                  width={barW}
                  height={BAR_HEIGHT}
                  rx={6}
                  fill={isHighlight ? PALETTE.teal : m.color + '30'}
                  stroke={isHighlight ? PALETTE.teal : m.color}
                  strokeWidth={isHighlight ? 2 : 1}
                />

                {/* Value label */}
                <text
                  x={CHART_LEFT + barW + 8}
                  y={y + BAR_HEIGHT / 2 + 5}
                  fontFamily={TYPOGRAPHY.fontFamily}
                  fontSize="14"
                  fontWeight={700}
                  fill={isHighlight ? PALETTE.teal : PALETTE.charcoal}
                >
                  {m.pctImprovement.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* X-axis label */}
          <text
            x={CHART_LEFT + CHART_WIDTH / 2}
            y={CHART_TOP + METHODS.length * (BAR_HEIGHT + BAR_GAP) + 30}
            textAnchor="middle"
            fontFamily={TYPOGRAPHY.fontFamily}
            fontSize="13"
            fontWeight={600}
            fill={PALETTE.slate}
          >
            ΔCRPS vs equal weights (lower is better)
          </text>
        </svg>
      </div>

      {/* Bottom boxes */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
        <div style={{ flex: 1, background: 'rgba(46, 139, 139, 0.06)', border: `1.5px solid ${PALETTE.teal}`, borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}>
            Wind: −34% CRPS vs equal
          </span>
        </div>
        <div style={{ flex: 1, background: 'rgba(232, 93, 74, 0.06)', border: `1.5px solid ${PALETTE.coral}`, borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: PALETTE.coral, fontFamily: TYPOGRAPHY.fontFamily }}>
            Electricity: −4% (less heterogeneity)
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
