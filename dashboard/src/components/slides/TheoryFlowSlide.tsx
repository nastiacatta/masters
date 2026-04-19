import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 2: Why Forecast Aggregation — SVG flow diagram showing
 * distributed data sources converging into aggregation then single forecast.
 * Arrows have 20px gap from box edges. refX set so arrowhead doesn't overlap.
 */
export default function TheoryFlowSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 1000 520"
        style={{ width: '100%', maxWidth: 950, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="tf-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.slate} />
          </marker>
          <marker id="tf-arrow-teal" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Data source boxes */}
        {[
          { label: 'Energy', y: 30 },
          { label: 'Logistics', y: 145 },
          { label: 'Finance', y: 260 },
          { label: 'Weather', y: 375 },
        ].map((src) => (
          <g key={src.label}>
            <rect
              x={30}
              y={src.y}
              width={220}
              height={80}
              rx={12}
              fill={PALETTE.lightBg}
              stroke={PALETTE.navy}
              strokeWidth={2.5}
            />
            <text
              x={140}
              y={src.y + 47}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="22"
              fontWeight={600}
              fill={PALETTE.navy}
            >
              {src.label}
            </text>
            {/* Arrow from source to aggregation — starts 15px after box right edge, ends 15px before target left edge */}
            <line
              x1={265}
              y1={src.y + 40}
              x2={385}
              y2={250}
              stroke={PALETTE.slate}
              strokeWidth={2.5}
              markerEnd="url(#tf-arrow)"
            />
          </g>
        ))}

        {/* Aggregation box */}
        <rect
          x={400}
          y={205}
          width={220}
          height={90}
          rx={12}
          fill={PALETTE.white}
          stroke={PALETTE.teal}
          strokeWidth={3.5}
        />
        <text
          x={510}
          y={240}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="22"
          fontWeight={700}
          fill={PALETTE.teal}
        >
          Aggregation
        </text>
        <text
          x={510}
          y={270}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.slate}
        >
          Weighted combination
        </text>

        {/* Arrow from aggregation to output — 15px gaps */}
        <line
          x1={635}
          y1={250}
          x2={725}
          y2={250}
          stroke={PALETTE.teal}
          strokeWidth={3}
          markerEnd="url(#tf-arrow-teal)"
        />

        {/* "Reduces error" annotation */}
        <text
          x={680}
          y={235}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="13"
          fontStyle="italic"
          fill={PALETTE.teal}
        >
          reduces error
        </text>

        {/* Output box */}
        <rect
          x={740}
          y={205}
          width={220}
          height={90}
          rx={12}
          fill={PALETTE.teal}
          stroke={PALETTE.teal}
          strokeWidth={2}
        />
        <text
          x={850}
          y={240}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="20"
          fontWeight={700}
          fill={PALETTE.white}
        >
          Single Forecast
        </text>
        <text
          x={850}
          y={268}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.darkText}
        >
          Lower error
        </text>

        {/* Labels */}
        <text
          x={140}
          y={490}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="17"
          fill={PALETTE.slate}
        >
          Distributed data sources
        </text>
        <text
          x={850}
          y={490}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="17"
          fill={PALETTE.slate}
        >
          Improved output
        </text>
      </svg>
    </div>
  );
}
