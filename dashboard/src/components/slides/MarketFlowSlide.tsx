import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 3: Prediction Markets — horizontal pipeline SVG:
 * Client -> Forecasters -> Operator -> Settlement
 *
 * Layout (viewBox 1000x300, no overlaps):
 * - Box width: 190
 * - Box 1: x=20, right=210
 * - Box 2: x=280, right=470
 * - Box 3: x=540, right=730
 * - Box 4: x=800, right=990
 * - Arrow 1: from 225 to 265 (40px arrow)
 * - Arrow 2: from 485 to 525 (40px arrow)
 * - Arrow 3: from 745 to 785 (40px arrow)
 * - refX=12 so arrowhead tip doesn't overlap target box
 */
export default function MarketFlowSlide() {
  const boxW = 190;
  const boxH = 100;
  const boxY = 80;
  const GAP = 15;

  const actors = [
    { label: 'Client', subtitle: 'Posts task', x: 20 },
    { label: 'Forecasters', subtitle: 'Reports + wagers', x: 280 },
    { label: 'Operator', subtitle: 'Aggregates', x: 540 },
    { label: 'Settlement', subtitle: 'Payoffs', x: 800 },
  ] as const;

  const arrowLabels = ['task', 'reports + wagers', 'aggregate'];
  const centerY = boxY + boxH / 2; // 130

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 1000 300"
        style={{ width: '100%', maxWidth: 960, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="mf-arrow" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Actor boxes */}
        {actors.map((actor, i) => (
          <g key={actor.label}>
            <rect
              x={actor.x}
              y={boxY}
              width={boxW}
              height={boxH}
              rx={12}
              fill={i === 3 ? PALETTE.teal : PALETTE.white}
              stroke={i === 3 ? PALETTE.teal : PALETTE.navy}
              strokeWidth={2.5}
            />
            <text
              x={actor.x + boxW / 2}
              y={centerY - 8}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="20"
              fontWeight={700}
              fill={i === 3 ? PALETTE.white : PALETTE.navy}
            >
              {actor.label}
            </text>
            <text
              x={actor.x + boxW / 2}
              y={centerY + 18}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="14"
              fill={i === 3 ? PALETTE.darkText : PALETTE.slate}
            >
              {actor.subtitle}
            </text>
          </g>
        ))}

        {/* Arrows between actors */}
        {arrowLabels.map((label, i) => {
          const x1 = actors[i].x + boxW + GAP;
          const x2 = actors[i + 1].x - GAP;
          const midX = (x1 + x2) / 2;
          return (
            <g key={label}>
              <line
                x1={x1}
                y1={centerY}
                x2={x2}
                y2={centerY}
                stroke={PALETTE.teal}
                strokeWidth={3}
                markerEnd="url(#mf-arrow)"
              />
              <text
                x={midX}
                y={centerY - 24}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="11"
                fill={PALETTE.slate}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Bottom — removed duplicate warning (already in bullets on left) */}
      </svg>
    </div>
  );
}
