import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 2: Why Forecast Aggregation — SVG flow diagram showing
 * distributed data sources converging into aggregation → single forecast.
 * Now with 4 data sources, thicker arrows, bigger boxes, and "reduces error" annotation.
 */
export default function TheoryFlowSlide() {
  return (
    <SlideShell title="Why Forecast Aggregation?">
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 1000 520"
          style={{ width: '100%', maxWidth: 950, height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker id="tf-arrow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill={PALETTE.warmGrey} />
            </marker>
            <marker id="tf-arrow-teal" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill={PALETTE.teal} />
            </marker>
          </defs>

          {/* Data source boxes — 4 sources including Weather */}
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
                rx={14}
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
              {/* Arrow from source to convergence */}
              <line
                x1={250}
                y1={src.y + 40}
                x2={390}
                y2={250}
                stroke={PALETTE.warmGrey}
                strokeWidth={3}
                markerEnd="url(#tf-arrow)"
              />
            </g>
          ))}

          {/* Convergence / Aggregation box — more prominent */}
          <rect
            x={400}
            y={205}
            width={220}
            height={90}
            rx={16}
            fill={PALETTE.white}
            stroke={PALETTE.teal}
            strokeWidth={4}
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
            fill={PALETTE.warmGrey}
          >
            Weighted combination
          </text>

          {/* Arrow from aggregation to output */}
          <line
            x1={620}
            y1={250}
            x2={730}
            y2={250}
            stroke={PALETTE.teal}
            strokeWidth={3}
            markerEnd="url(#tf-arrow-teal)"
          />

          {/* "Reduces error" annotation on the output arrow */}
          <text
            x={675}
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
            rx={16}
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
            fill={PALETTE.warmCream}
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
            fill={PALETTE.warmGrey}
          >
            Distributed data sources
          </text>
          <text
            x={850}
            y={490}
            textAnchor="middle"
            fontFamily={TYPOGRAPHY.fontFamily}
            fontSize="17"
            fill={PALETTE.warmGrey}
          >
            Improved output
          </text>
        </svg>
      </div>
    </SlideShell>
  );
}
