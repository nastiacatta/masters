import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 3: Prediction Markets — horizontal pipeline SVG:
 * Client -> Forecasters -> Operator -> Settlement
 * Arrows have 20px gap from box edges. refX=9 so arrowhead tip doesn't overlap.
 * Gaps between boxes: at least 60px.
 */
export default function MarketFlowSlide() {
  const actors = [
    { label: 'Client', subtitle: 'Posts task', x: 10 },
    { label: 'Forecasters', subtitle: 'Reports + wagers', x: 250 },
    { label: 'Operator', subtitle: 'Aggregates', x: 490 },
    { label: 'Settlement', subtitle: 'Payoffs', x: 730 },
  ] as const;

  const arrowLabels = ['task', 'reports + wagers', 'aggregate'];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 960 320"
        style={{ width: '100%', maxWidth: 940, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="mf-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Actor boxes — 200px wide, 60px gap between */}
        {actors.map((actor, i) => (
          <g key={actor.label}>
            <rect
              x={actor.x}
              y={80}
              width={200}
              height={100}
              rx={12}
              fill={i === 3 ? PALETTE.teal : PALETTE.white}
              stroke={i === 3 ? PALETTE.teal : PALETTE.navy}
              strokeWidth={2.5}
            />
            <text
              x={actor.x + 100}
              y={122}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="22"
              fontWeight={700}
              fill={i === 3 ? PALETTE.white : PALETTE.navy}
            >
              {actor.label}
            </text>
            <text
              x={actor.x + 100}
              y={152}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="16"
              fill={i === 3 ? PALETTE.darkText : PALETTE.slate}
            >
              {actor.subtitle}
            </text>
          </g>
        ))}

        {/* Arrows between actors — 15px gap from edges */}
        {arrowLabels.map((label, i) => {
          const x1 = actors[i].x + 200 + 15; // 15px after source right edge
          const x2 = actors[i + 1].x - 15;   // 15px before target left edge
          const midX = (x1 + x2) / 2;
          return (
            <g key={label}>
              <line
                x1={x1}
                y1={130}
                x2={x2}
                y2={130}
                stroke={PALETTE.teal}
                strokeWidth={3}
                markerEnd="url(#mf-arrow)"
              />
              <text
                x={midX}
                y={112}
                textAnchor="middle"
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="14"
                fill={PALETTE.slate}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Bottom warning — coral colour for visibility */}
        <text
          x={480}
          y={260}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fontWeight={600}
          fill={PALETTE.coral}
        >
          Warning: Wash trading ~60% of volume | Prices driven by small elite
        </text>
      </svg>
    </div>
  );
}
