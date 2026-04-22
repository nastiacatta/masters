import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 3 right panel: Market flow — vertical pipeline SVG.
 * Taller layout so it fills the right panel properly.
 */
export default function MarketFlowSlide() {
  const boxW = 260;
  const boxH = 80;
  const centerX = 200;
  const GAP = 20;

  const actors = [
    { label: 'Client', subtitle: 'Posts forecasting task', y: 30 },
    { label: 'Forecasters', subtitle: 'Submit reports + wagers', y: 160 },
    { label: 'Operator', subtitle: 'Aggregates forecasts', y: 290 },
    { label: 'Settlement', subtitle: 'Redistributes payoffs', y: 420 },
  ] as const;

  const arrowLabels = ['task', 'reports + wagers', 'aggregate'];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 400 540"
        style={{ width: '100%', height: '100%', maxHeight: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="mf-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Actor boxes */}
        {actors.map((actor, i) => (
          <g key={actor.label}>
            <rect
              x={centerX - boxW / 2}
              y={actor.y}
              width={boxW}
              height={boxH}
              rx={12}
              fill={i === 3 ? PALETTE.teal : PALETTE.white}
              stroke={i === 3 ? PALETTE.teal : PALETTE.navy}
              strokeWidth={2.5}
            />
            <text
              x={centerX}
              y={actor.y + boxH / 2 - 8}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="24"
              fontWeight={700}
              fill={i === 3 ? PALETTE.white : PALETTE.navy}
            >
              {actor.label}
            </text>
            <text
              x={centerX}
              y={actor.y + boxH / 2 + 16}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="17"
              fill={i === 3 ? PALETTE.darkText : PALETTE.slate}
            >
              {actor.subtitle}
            </text>
          </g>
        ))}

        {/* Arrows between actors */}
        {arrowLabels.map((label, i) => {
          const y1 = actors[i].y + boxH + GAP / 2;
          const y2 = actors[i + 1].y - GAP / 2;
          const midY = (y1 + y2) / 2;
          return (
            <g key={label}>
              <line
                x1={centerX}
                y1={y1}
                x2={centerX}
                y2={y2}
                stroke={PALETTE.teal}
                strokeWidth={3}
                markerEnd="url(#mf-arrow)"
              />
              <text
                x={centerX + 20}
                y={midY + 5}
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="15"
                fontWeight={600}
                fill={PALETTE.slate}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
