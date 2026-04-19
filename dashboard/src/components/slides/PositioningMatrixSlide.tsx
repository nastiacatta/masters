import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 4: Where This Work Fits — 2x2 positioning matrix.
 * Bigger viewBox (1200x700), larger cards (240x80), more theory context.
 */

interface MatrixNode {
  id: string;
  label: string;
  citation: string;
  detail: string;
  x: number;
  y: number;
  isThesis?: boolean;
}

const NODES: MatrixNode[] = [
  { id: 'lambert', label: 'Lambert (2008) / Raja (2024)', citation: 'Self-financed, static', detail: '7 properties, uniqueness theorem', x: 22, y: 22 },
  { id: 'online', label: 'Online Aggregation (OGD, Hedge)', citation: 'Adaptive, no payments', detail: 'Regret bounds, non-strategic', x: 78, y: 78 },
  { id: 'vitali', label: 'Vitali & Pinson (2025)', citation: 'Adaptive, relative weights', detail: 'Online regression, Shapley payoff', x: 72, y: 55 },
  { id: 'thesis', label: 'THIS THESIS', citation: 'Adaptive + self-financed', detail: 'EWMA skill + self-financed settlement', x: 78, y: 20, isThesis: true },
];

export default function PositioningMatrixSlide() {
  const chartX = 60;
  const chartY = 30;
  const chartW = 1080;
  const chartH = 620;
  const midX = chartX + chartW / 2;
  const midY = chartY + chartH / 2;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <svg
        viewBox="0 0 1200 750"
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="pm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Quadrant background tints */}
        <rect x={chartX} y={chartY} width={chartW / 2} height={chartH / 2} fill="rgba(0, 62, 116, 0.04)" rx={4} />
        <rect x={midX} y={chartY} width={chartW / 2} height={chartH / 2} fill="rgba(46, 139, 139, 0.06)" rx={4} />
        <rect x={chartX} y={midY} width={chartW / 2} height={chartH / 2} fill="rgba(100, 116, 139, 0.02)" rx={4} />
        <rect x={midX} y={midY} width={chartW / 2} height={chartH / 2} fill="rgba(0, 62, 116, 0.03)" rx={4} />

        {/* Chart border */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill="none" stroke={PALETTE.border} strokeWidth={1.5} rx={4} />

        {/* Dashed dividers */}
        <line x1={midX} y1={chartY} x2={midX} y2={chartY + chartH} stroke={PALETTE.border} strokeWidth={2} strokeDasharray="8 6" />
        <line x1={chartX} y1={midY} x2={chartX + chartW} y2={midY} stroke={PALETTE.border} strokeWidth={2} strokeDasharray="8 6" />

        {/* X-axis label */}
        <text x={chartX + 20} y={chartY + chartH + 40} fontFamily={TYPOGRAPHY.fontFamily} fontSize="16" fill={PALETTE.slate}>
          Static (no learning)
        </text>
        <text x={chartX + chartW - 20} y={chartY + chartH + 40} textAnchor="end" fontFamily={TYPOGRAPHY.fontFamily} fontSize="16" fill={PALETTE.slate}>
          Adaptive (learns over time)
        </text>
        <text x={chartX + chartW / 2} y={chartY + chartH + 40} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="16" fill={PALETTE.slate} fontWeight={600}>
          {'-->'}
        </text>

        {/* Y-axis label */}
        <text
          x={chartX - 40} y={chartY + chartH - 20}
          fontFamily={TYPOGRAPHY.fontFamily} fontSize="16" fill={PALETTE.slate}
          transform={`rotate(-90, ${chartX - 40}, ${chartY + chartH / 2})`}
          textAnchor="middle"
        >
          No financial guarantees
        </text>
        <text
          x={chartX - 60} y={chartY + chartH / 2}
          fontFamily={TYPOGRAPHY.fontFamily} fontSize="16" fill={PALETTE.slate} fontWeight={600}
          transform={`rotate(-90, ${chartX - 60}, ${chartY + chartH / 2})`}
          textAnchor="middle"
        >
          Self-financed (budget-balanced)
        </text>

        {/* Nodes as cards — 260px wide, 90px tall */}
        {NODES.map((node) => {
          const cx = chartX + (node.x / 100) * chartW;
          const cy = chartY + (node.y / 100) * chartH;
          const cardW = 260;
          const cardH = 90;

          return (
            <g key={node.id}>
              {node.isThesis && (
                <rect
                  x={cx - cardW / 2 - 5} y={cy - cardH / 2 - 5}
                  width={cardW + 10} height={cardH + 10}
                  rx={18}
                  fill="none"
                  stroke={PALETTE.teal}
                  strokeWidth={3}
                  opacity={0.7}
                  filter="url(#pm-glow)"
                />
              )}
              <rect
                x={cx - cardW / 2} y={cy - cardH / 2}
                width={cardW} height={cardH}
                rx={12}
                fill={PALETTE.white}
                stroke={node.isThesis ? PALETTE.teal : PALETTE.imperial}
                strokeWidth={node.isThesis ? 3 : 2}
              />
              <text
                x={cx}
                y={cy - 16}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize={node.isThesis ? '20' : '18'}
                fontWeight={700}
                fill={node.isThesis ? PALETTE.teal : PALETTE.navy}
              >
                {node.label}
              </text>
              <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="15"
                fill={PALETTE.slate}
              >
                {node.citation}
              </text>
              <text
                x={cx}
                y={cy + 30}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="13"
                fontStyle="italic"
                fill={node.isThesis ? PALETTE.teal : PALETTE.purple}
              >
                {node.detail}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
