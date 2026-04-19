import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 3: Prediction Markets — horizontal pipeline SVG:
 * Client → Forecasters → Operator → Settlement
 * Panel-friendly: no SlideShell wrapper, fills container.
 */
export default function MarketFlowSlide() {
  const actors = [
    { label: 'Client', subtitle: 'Posts task', x: 20 },
    { label: 'Forecasters', subtitle: 'Reports + wagers', x: 250 },
    { label: 'Operator', subtitle: 'Aggregates', x: 480 },
    { label: 'Settlement', subtitle: 'Payoffs', x: 710 },
  ] as const;

  const arrowLabels = ['task', 'reports + wagers', 'aggregate'];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 940 340"
        style={{ width: '100%', maxWidth: 920, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="mf-arrow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Actor boxes */}
        {actors.map((actor, i) => (
          <g key={actor.label}>
            <rect
              x={actor.x}
              y={80}
              width={200}
              height={100}
              rx={16}
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
              fill={i === 3 ? PALETTE.warmCream : PALETTE.warmGrey}
            >
              {actor.subtitle}
            </text>
          </g>
        ))}

        {/* Arrows between actors */}
        {arrowLabels.map((label, i) => {
          const x1 = actors[i].x + 200;
          const x2 = actors[i + 1].x;
          const midX = (x1 + x2) / 2;
          return (
            <g key={label}>
              <line
                x1={x1 + 6}
                y1={130}
                x2={x2 - 6}
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
                fill={PALETTE.warmGrey}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Bottom warning */}
        <text
          x={470}
          y={280}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="18"
          fontWeight={600}
          fill={PALETTE.deepRed}
        >
          ⚠ Wash trading ~60% of volume · Prices driven by small elite
        </text>
      </svg>
    </div>
  );
}
