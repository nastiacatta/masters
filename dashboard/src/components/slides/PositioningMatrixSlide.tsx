import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 4: Where This Work Fits — Pure SVG 2×2 quadrant chart.
 * X-axis: Static → Adaptive, Y-axis: No Payments → Self-Financed
 * Panel-friendly: no SlideShell wrapper, fills container.
 */

interface MatrixNode {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  colour: string;
  isThesis?: boolean;
}

const NODES: MatrixNode[] = [
  { id: 'lambert', label: 'Lambert / Raja', description: 'Static, truthful, no learning', x: 25, y: 25, colour: PALETTE.warmGrey },
  { id: 'online', label: 'Online Aggregation', description: 'Adaptive weights, no payments', x: 75, y: 80, colour: PALETTE.warmGrey },
  { id: 'vitali', label: 'Vitali-Pinson', description: 'Adaptive, partial financing', x: 70, y: 65, colour: PALETTE.warmGrey },
  { id: 'thesis', label: 'This Thesis', description: 'Adaptive + self-financed', x: 78, y: 22, colour: PALETTE.teal, isThesis: true },
];

export default function PositioningMatrixSlide() {
  const chartX = 100;
  const chartY = 30;
  const chartW = 780;
  const chartH = 500;
  const midX = chartX + chartW / 2;
  const midY = chartY + chartH / 2;

  const quadrantTints = {
    topLeft: 'rgba(0, 33, 71, 0.03)',
    topRight: 'rgba(0, 132, 127, 0.06)',
    bottomLeft: 'rgba(74, 85, 104, 0.02)',
    bottomRight: 'rgba(0, 145, 213, 0.03)',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 1050 640"
        style={{ width: '100%', maxWidth: 980, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pulsing glow filter for thesis node */}
        <defs>
          <filter id="pm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="pm-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.teal} opacity="0.6" />
          </marker>
        </defs>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
          .thesis-glow { animation: pulse 2s ease-in-out infinite; }
        `}</style>

        {/* Quadrant background tints */}
        <rect x={chartX} y={chartY} width={chartW / 2} height={chartH / 2} fill={quadrantTints.topLeft} rx={4} />
        <rect x={midX} y={chartY} width={chartW / 2} height={chartH / 2} fill={quadrantTints.topRight} rx={4} />
        <rect x={chartX} y={midY} width={chartW / 2} height={chartH / 2} fill={quadrantTints.bottomLeft} rx={4} />
        <rect x={midX} y={midY} width={chartW / 2} height={chartH / 2} fill={quadrantTints.bottomRight} rx={4} />

        {/* Chart area border */}
        <rect x={chartX} y={chartY} width={chartW} height={chartH} fill="none" stroke={PALETTE.lightGrey} strokeWidth={1.5} rx={4} />

        {/* Dashed quadrant dividers */}
        <line
          x1={midX} y1={chartY} x2={midX} y2={chartY + chartH}
          stroke={PALETTE.lightGrey} strokeWidth={2} strokeDasharray="8 6"
        />
        <line
          x1={chartX} y1={midY} x2={chartX + chartW} y2={midY}
          stroke={PALETTE.lightGrey} strokeWidth={2} strokeDasharray="8 6"
        />

        {/* Quadrant labels */}
        <text x={chartX + chartW * 0.25} y={chartY + 28} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fill={PALETTE.warmGrey} opacity={0.7}>
          Self-Financed + Static
        </text>
        <text x={chartX + chartW * 0.75} y={chartY + 28} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fill={PALETTE.warmGrey} opacity={0.7}>
          Self-Financed + Adaptive
        </text>
        <text x={chartX + chartW * 0.25} y={chartY + chartH - 12} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fill={PALETTE.warmGrey} opacity={0.7}>
          No Payments + Static
        </text>
        <text x={chartX + chartW * 0.75} y={chartY + chartH - 12} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="14" fill={PALETTE.warmGrey} opacity={0.7}>
          No Payments + Adaptive
        </text>

        {/* X-axis label */}
        <text x={chartX + chartW / 2} y={chartY + chartH + 40} textAnchor="middle" fontFamily={TYPOGRAPHY.fontFamily} fontSize="18" fill={PALETTE.warmGrey} fontWeight={600}>
          Adaptive →
        </text>

        {/* Y-axis label (rotated) */}
        <text
          x={chartX - 50} y={chartY + chartH / 2}
          fontFamily={TYPOGRAPHY.fontFamily} fontSize="18" fill={PALETTE.warmGrey} fontWeight={600}
          transform={`rotate(-90, ${chartX - 50}, ${chartY + chartH / 2})`}
          textAnchor="middle"
        >
          Self-Financed ↑
        </text>

        {/* Arrows from existing work pointing TOWARD thesis node */}
        {NODES.filter(n => !n.isThesis).map((node) => {
          const thesisNode = NODES.find(n => n.isThesis)!;
          const toX = chartX + (thesisNode.x / 100) * chartW;
          const toY = chartY + (thesisNode.y / 100) * chartH;
          const fromX = chartX + (node.x / 100) * chartW;
          const fromY = chartY + (node.y / 100) * chartH;
          const dx = toX - fromX;
          const dy = toY - fromY;
          const len = Math.sqrt(dx * dx + dy * dy);
          const shortenBy = 110;
          const endX = toX - (dx / len) * shortenBy;
          const endY = toY - (dy / len) * shortenBy;
          const startX = fromX + (dx / len) * 80;
          const startY = fromY + (dy / len) * 50;
          return (
            <line
              key={`conn-${node.id}`}
              x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={PALETTE.teal}
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.5}
              markerEnd="url(#pm-arrow)"
            />
          );
        })}

        {/* Nodes as rounded-rect cards */}
        {NODES.map((node) => {
          const cx = chartX + (node.x / 100) * chartW;
          const cy = chartY + (node.y / 100) * chartH;
          const cardW = node.isThesis ? 210 : 200;
          const cardH = node.isThesis ? 76 : 70;

          return (
            <g key={node.id}>
              {node.isThesis && (
                <rect
                  x={cx - cardW / 2 - 6} y={cy - cardH / 2 - 6}
                  width={cardW + 12} height={cardH + 12}
                  rx={18}
                  fill="none"
                  stroke={PALETTE.teal}
                  strokeWidth={3}
                  className="thesis-glow"
                  filter="url(#pm-glow)"
                />
              )}
              <rect
                x={cx - cardW / 2} y={cy - cardH / 2}
                width={cardW} height={cardH}
                rx={12}
                fill={PALETTE.white}
                stroke={node.isThesis ? PALETTE.teal : PALETTE.navy}
                strokeWidth={node.isThesis ? 3 : 2}
              />
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize={node.isThesis ? '16' : '16'}
                fontWeight={700}
                fill={node.isThesis ? PALETTE.teal : PALETTE.navy}
              >
                {node.label}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="13"
                fill={PALETTE.warmGrey}
              >
                {node.description}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
