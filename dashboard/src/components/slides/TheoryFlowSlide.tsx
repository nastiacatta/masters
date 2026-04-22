import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 2: "What Is a Prediction Market?" — SVG diagram showing
 * the prediction market concept.
 *
 * Layout:
 * - Left: 3–4 participant boxes, each with a forecast icon and wager indicator
 * - Centre: Market aggregation box showing the combination process
 * - Right: Output showing the improved collective prediction
 *
 * No technical formulas or scoring rules. No references to "Logistics".
 * Uses PALETTE and TYPOGRAPHY constants for all styling.
 */
export default function TheoryFlowSlide() {
  const participants = [
    { label: 'Forecaster A', y: 55 },
    { label: 'Forecaster B', y: 175 },
    { label: 'Forecaster C', y: 295 },
    { label: 'Forecaster D', y: 415 },
  ];

  // Layout constants
  const pBoxX = 30;
  const pBoxW = 200;
  const pBoxH = 80;
  const iconSize = 18;

  const aggX = 420;
  const aggW = 200;
  const aggH = 120;
  const aggCenterY = 260;

  const outX = 780;
  const outW = 180;
  const outH = 100;

  const GAP = 18;
  const arrowStartX = pBoxX + pBoxW + GAP;
  const arrowEndX = aggX - GAP;
  const outArrowStartX = aggX + aggW + GAP;
  const outArrowEndX = outX - GAP;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 1000 540"
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Prediction market diagram: participants submit forecasts and wagers, which are aggregated into an improved collective prediction"
      >
        <defs>
          <marker
            id="pm-arrow"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.slate} />
          </marker>
          <marker
            id="pm-arrow-teal"
            markerWidth="12"
            markerHeight="8"
            refX="12"
            refY="4"
            orient="auto"
          >
            <polygon points="0 0, 12 4, 0 8" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* ── Participant boxes ── */}
        {participants.map((p, i) => {
          const centerY = p.y + pBoxH / 2;
          return (
            <g key={p.label}>
              {/* Box */}
              <rect
                x={pBoxX}
                y={p.y}
                width={pBoxW}
                height={pBoxH}
                rx={12}
                fill={PALETTE.lightBg}
                stroke={PALETTE.navy}
                strokeWidth={2}
              />

              {/* Forecast icon — small chart line */}
              <g transform={`translate(${pBoxX + 16}, ${p.y + 14})`}>
                <polyline
                  points={`0,${iconSize} ${iconSize * 0.3},${iconSize * 0.4} ${iconSize * 0.6},${iconSize * 0.7} ${iconSize},0`}
                  fill="none"
                  stroke={PALETTE.teal}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Participant label */}
              <text
                x={pBoxX + 42}
                y={p.y + 28}
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="19"
                fontWeight={600}
                fill={PALETTE.navy}
              >
                {p.label}
              </text>

              {/* Wager/deposit indicator — coin icon + "Wager" text */}
              <g transform={`translate(${pBoxX + 16}, ${p.y + 46})`}>
                <circle
                  cx="7"
                  cy="7"
                  r="7"
                  fill={PALETTE.coral}
                  opacity="0.2"
                />
                <text
                  x="7"
                  y="11"
                  textAnchor="middle"
                  fontFamily={TYPOGRAPHY.fontFamily}
                  fontSize="11"
                  fontWeight={700}
                  fill={PALETTE.coral}
                >
                  $
                </text>
              </g>
              <text
                x={pBoxX + 34}
                y={p.y + 58}
                fontFamily={TYPOGRAPHY.fontFamily}
                fontSize="15"
                fill={PALETTE.slate}
              >
                + forecast
              </text>

              {/* Arrow from participant to aggregation */}
              <line
                x1={arrowStartX}
                y1={centerY}
                x2={arrowEndX}
                y2={aggCenterY - 30 + i * 20}
                stroke={PALETTE.slate}
                strokeWidth={2}
                markerEnd="url(#pm-arrow)"
              />
            </g>
          );
        })}

        {/* ── Market aggregation box ── */}
        <rect
          x={aggX}
          y={aggCenterY - aggH / 2}
          width={aggW}
          height={aggH}
          rx={14}
          fill={PALETTE.white}
          stroke={PALETTE.teal}
          strokeWidth={3}
        />

        {/* Aggregation icon — overlapping circles */}
        <g transform={`translate(${aggX + aggW / 2}, ${aggCenterY - 22})`}>
          <circle cx="-10" cy="0" r="10" fill={PALETTE.teal} opacity="0.15" />
          <circle cx="0" cy="0" r="10" fill={PALETTE.teal} opacity="0.25" />
          <circle cx="10" cy="0" r="10" fill={PALETTE.teal} opacity="0.35" />
        </g>

        <text
          x={aggX + aggW / 2}
          y={aggCenterY + 8}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="20"
          fontWeight={700}
          fill={PALETTE.teal}
        >
          Market
        </text>
        <text
          x={aggX + aggW / 2}
          y={aggCenterY + 30}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="15"
          fill={PALETTE.slate}
        >
          Wager-weighted aggregation
        </text>

        {/* ── Arrow from aggregation to output ── */}
        <line
          x1={outArrowStartX}
          y1={aggCenterY}
          x2={outArrowEndX}
          y2={aggCenterY}
          stroke={PALETTE.teal}
          strokeWidth={3}
          markerEnd="url(#pm-arrow-teal)"
        />

        {/* Annotation above output arrow */}
        <text
          x={(outArrowStartX + outArrowEndX) / 2}
          y={aggCenterY - 14}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="14"
          fontStyle="italic"
          fill={PALETTE.teal}
        >
          improved accuracy
        </text>

        {/* ── Output box — collective prediction ── */}
        <rect
          x={outX}
          y={aggCenterY - outH / 2}
          width={outW}
          height={outH}
          rx={14}
          fill={PALETTE.teal}
          stroke={PALETTE.teal}
          strokeWidth={2}
        />

        {/* Output icon — upward trend arrow */}
        <g transform={`translate(${outX + outW / 2}, ${aggCenterY - 24})`}>
          <polyline
            points="-14,14 -4,2 6,8 16,-6"
            fill="none"
            stroke={PALETTE.white}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="10,-6 16,-6 16,0"
            fill="none"
            stroke={PALETTE.white}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <text
          x={outX + outW / 2}
          y={aggCenterY + 8}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="18"
          fontWeight={700}
          fill={PALETTE.white}
        >
          Collective
        </text>
        <text
          x={outX + outW / 2}
          y={aggCenterY + 28}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="15"
          fill={PALETTE.darkText}
        >
          Prediction
        </text>

        {/* ── Bottom labels ── */}
        <text
          x={pBoxX + pBoxW / 2}
          y={520}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.slate}
        >
          Participants submit forecasts + wagers
        </text>
        <text
          x={aggX + aggW / 2}
          y={520}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.slate}
        >
          Weighted combination
        </text>
        <text
          x={outX + outW / 2}
          y={520}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="16"
          fill={PALETTE.slate}
        >
          Better forecast
        </text>
      </svg>
    </div>
  );
}
