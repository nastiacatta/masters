import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 2: Why Forecast Aggregation — SVG flow diagram showing
 * distributed data sources converging into aggregation then single forecast.
 *
 * Layout (no overlaps):
 * - 4 source boxes: x=40, width=180, right edge=220
 * - Arrows start at x=235 (220 + 15 gap)
 * - Aggregation box: x=420, width=180, left edge=420
 * - Arrows end at x=405 (420 - 15 gap)
 * - Output arrow: from 600+15=615 to 680-15=665
 * - Output box: x=680, width=180
 * - refX=12 so arrowhead tip doesn't overlap target box
 */
export default function TheoryFlowSlide() {
  const sources = [
    { label: 'Energy', y: 60 },
    { label: 'Logistics', y: 170 },
    { label: 'Finance', y: 280 },
    { label: 'Weather', y: 390 },
  ];

  const boxH = 70;
  const srcX = 40;
  const srcW = 180;
  const aggX = 420;
  const aggW = 180;
  const aggH = 90;
  const aggCenterY = 250;
  const outX = 680;
  const outW = 180;
  const outH = 90;
  const GAP = 15;

  const arrowStartX = srcX + srcW + GAP; // 235
  const arrowEndX = aggX - GAP; // 405
  const outArrowStartX = aggX + aggW + GAP; // 615
  const outArrowEndX = outX - GAP; // 665

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 900 520"
        style={{ width: '100%', maxWidth: 900, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="tf-arrow" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" fill={PALETTE.slate} />
          </marker>
          <marker id="tf-arrow-teal" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
            <polygon points="0 0, 12 4, 0 8" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* Data source boxes */}
        {sources.map((src) => (
          <g key={src.label}>
            <rect
              x={srcX}
              y={src.y}
              width={srcW}
              height={boxH}
              rx={12}
              fill={PALETTE.lightBg}
              stroke={PALETTE.navy}
              strokeWidth={2.5}
            />
            <text
              x={srcX + srcW / 2}
              y={src.y + boxH / 2 + 6}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="20"
              fontWeight={600}
              fill={PALETTE.navy}
            >
              {src.label}
            </text>
            {/* Arrow from source center-right to aggregation — spread endpoints vertically */}
            <line
              x1={arrowStartX}
              y1={src.y + boxH / 2}
              x2={arrowEndX}
              y2={aggCenterY - 30 + (sources.indexOf(src) * 20)}
              stroke={PALETTE.slate}
              strokeWidth={2.5}
              markerEnd="url(#tf-arrow)"
            />
          </g>
        ))}

        {/* Aggregation box */}
        <rect
          x={aggX}
          y={aggCenterY - aggH / 2}
          width={aggW}
          height={aggH}
          rx={12}
          fill={PALETTE.white}
          stroke={PALETTE.teal}
          strokeWidth={3.5}
        />
        <text
          x={aggX + aggW / 2}
          y={aggCenterY - 8}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="20"
          fontWeight={700}
          fill={PALETTE.teal}
        >
          Aggregation
        </text>
        <text
          x={aggX + aggW / 2}
          y={aggCenterY + 18}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="14"
          fill={PALETTE.slate}
        >
          Weighted combination
        </text>

        {/* Arrow from aggregation to output */}
        <line
          x1={outArrowStartX}
          y1={aggCenterY}
          x2={outArrowEndX}
          y2={aggCenterY}
          stroke={PALETTE.teal}
          strokeWidth={3}
          markerEnd="url(#tf-arrow-teal)"
        />

        {/* "Reduces error" annotation */}
        <text
          x={(outArrowStartX + outArrowEndX) / 2}
          y={aggCenterY - 14}
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
          x={outX}
          y={aggCenterY - outH / 2}
          width={outW}
          height={outH}
          rx={12}
          fill={PALETTE.teal}
          stroke={PALETTE.teal}
          strokeWidth={2}
        />
        <text
          x={outX + outW / 2}
          y={aggCenterY - 8}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="18"
          fontWeight={700}
          fill={PALETTE.white}
        >
          Single Forecast
        </text>
        <text
          x={outX + outW / 2}
          y={aggCenterY + 18}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="14"
          fill={PALETTE.darkText}
        >
          Lower error
        </text>

        {/* Bottom labels */}
        <text
          x={srcX + srcW / 2}
          y={495}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.slate}
        >
          Distributed data sources
        </text>
        <text
          x={outX + outW / 2}
          y={495}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.slate}
        >
          Improved output
        </text>
      </svg>
    </div>
  );
}
