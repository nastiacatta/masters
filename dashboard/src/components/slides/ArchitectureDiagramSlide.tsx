import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 8: Architecture — Five-step mechanism pipeline (left-to-right).
 *
 * Shows one round of the mechanism:
 * Submit → Eff. Wager → Aggregate → Settle → Skill Update
 *
 * Layout: viewBox 0 0 900 600, max-width 860px
 * Pipeline boxes centred around y=180, x positions [40, 200, 360, 520, 680]
 *
 * Annotations:
 * - Feedback loop (dashed coral) curves below pipeline from Skill Update → Submit
 * - "yₜ observed" marker between Aggregate and Settle
 * - Budget balance "Σ Πᵢ = Σ mᵢ" near Settle
 * - "Round t" header above pipeline
 * - Refund annotation on Eff. Wager
 * - Dual connection from Eff. Wager to Aggregate and Settle
 */

interface PipelineStep {
  id: string;
  label: string;
  formula: string;
  color: string;
  x: number;
}

const BOX_WIDTH = 140;
const BOX_HEIGHT = 100;
const BOX_RX = 12;
const BOX_CENTER_Y = 180;
const BOX_TOP = BOX_CENTER_Y - BOX_HEIGHT / 2;

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'submit', label: 'Submit', formula: 'rᵢ, bᵢ', color: PALETTE.imperial, x: 40 },
  { id: 'wager', label: 'Eff. Wager', formula: 'mᵢ = bᵢ·g(σᵢ)', color: PALETTE.teal, x: 200 },
  { id: 'aggregate', label: 'Aggregate', formula: 'r̂ = Σ wᵢrᵢ', color: PALETTE.teal, x: 360 },
  { id: 'settle', label: 'Settle', formula: 'Πᵢ = mᵢ(1+sᵢ−s̄)', color: PALETTE.teal, x: 520 },
  { id: 'update', label: 'Skill Update', formula: 'EWMA(loss)', color: PALETTE.purple, x: 680 },
];

export default function ArchitectureDiagramSlide() {
  // Feedback loop path coordinates
  const feedbackStartX = PIPELINE_STEPS[4].x + BOX_WIDTH; // right side of Skill Update
  const feedbackEndX = PIPELINE_STEPS[0].x;                // left side of Submit
  const feedbackY = BOX_CENTER_Y;
  const feedbackBottomY = 420;

  // Dual connection from Eff. Wager
  const wagerBox = PIPELINE_STEPS[1];
  const settleBox = PIPELINE_STEPS[3];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 900 600"
        style={{ width: '100%', maxWidth: 860, height: 'auto' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="pipe-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.slate} />
          </marker>
          <marker id="feedback-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={PALETTE.coral} />
          </marker>
          <marker id="dual-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={PALETTE.teal} />
          </marker>
        </defs>

        {/* ─── "Round t" header label ─── */}
        <text
          x={450}
          y={70}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="22"
          fontWeight={700}
          fill={PALETTE.navy}
        >
          Round t
        </text>

        {/* ─── Pipeline step boxes ─── */}
        {PIPELINE_STEPS.map((step) => (
          <g key={step.id}>
            {/* Box */}
            <rect
              x={step.x}
              y={BOX_TOP}
              width={BOX_WIDTH}
              height={BOX_HEIGHT}
              rx={BOX_RX}
              fill={step.color + '12'}
              stroke={step.color}
              strokeWidth={2}
            />
            {/* Label */}
            <text
              x={step.x + BOX_WIDTH / 2}
              y={BOX_CENTER_Y - 10}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="16"
              fontWeight={700}
              fill={step.color}
            >
              {step.label}
            </text>
            {/* Formula */}
            <text
              x={step.x + BOX_WIDTH / 2}
              y={BOX_CENTER_Y + 18}
              textAnchor="middle"
              fontFamily={TYPOGRAPHY.fontFamily}
              fontSize="13"
              fontWeight={500}
              fill={PALETTE.charcoal}
            >
              {step.formula}
            </text>
          </g>
        ))}

        {/* ─── Forward arrows between steps ─── */}
        {PIPELINE_STEPS.slice(0, -1).map((step, i) => {
          const x1 = step.x + BOX_WIDTH;
          const x2 = PIPELINE_STEPS[i + 1].x;
          return (
            <line
              key={`arrow-${step.id}`}
              x1={x1 + 4}
              y1={BOX_CENTER_Y}
              x2={x2 - 4}
              y2={BOX_CENTER_Y}
              stroke={PALETTE.slate}
              strokeWidth={2}
              markerEnd="url(#pipe-arrow)"
            />
          );
        })}

        {/* ─── Feedback loop: dashed curved path from Skill Update → Submit ─── */}
        <path
          d={`M ${feedbackStartX} ${feedbackY}
              C ${feedbackStartX + 60} ${feedbackBottomY},
                ${feedbackEndX - 60} ${feedbackBottomY},
                ${feedbackEndX} ${feedbackY}`}
          fill="none"
          stroke={PALETTE.coral}
          strokeWidth={2}
          strokeDasharray="8 4"
          markerEnd="url(#feedback-arrow)"
        />
        {/* Feedback loop label */}
        <text
          x={450}
          y={feedbackBottomY + 30}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="13"
          fontWeight={600}
          fill={PALETTE.coral}
        >
          {"W\u2032\u1D62, \u03C3\u2032\u1D62 \u2192 next round"}
        </text>

        {/* ─── "yₜ observed" marker between Aggregate and Settle ─── */}
        <g>
          {/* Diamond marker */}
          <polygon
            points={`${460 + 20},${BOX_TOP - 30} ${460 + 28},${BOX_TOP - 22} ${460 + 20},${BOX_TOP - 14} ${460 + 12},${BOX_TOP - 22}`}
            fill={PALETTE.coral + '30'}
            stroke={PALETTE.coral}
            strokeWidth={1.5}
          />
          {/* Label */}
          <text
            x={460 + 20}
            y={BOX_TOP - 42}
            textAnchor="middle"
            fontFamily={TYPOGRAPHY.fontFamily}
            fontSize="12"
            fontWeight={600}
            fill={PALETTE.coral}
          >
            yₜ observed
          </text>
          {/* Dashed line down to pipeline */}
          <line
            x1={460 + 20}
            y1={BOX_TOP - 14}
            x2={460 + 20}
            y2={BOX_TOP}
            stroke={PALETTE.coral}
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        </g>

        {/* ─── Budget balance annotation near Settle ─── */}
        <text
          x={settleBox.x + BOX_WIDTH / 2}
          y={BOX_TOP + BOX_HEIGHT + 28}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="12"
          fontWeight={600}
          fill={PALETTE.teal}
        >
          Σ Πᵢ = Σ mᵢ
        </text>

        {/* ─── Refund annotation on Eff. Wager ─── */}
        <text
          x={wagerBox.x + BOX_WIDTH / 2}
          y={BOX_TOP + BOX_HEIGHT + 28}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="11"
          fontWeight={500}
          fill={PALETTE.slate}
        >
          (bᵢ − mᵢ) refunded
        </text>

        {/* ─── Dual connection from Eff. Wager to Settle (exposure) ─── */}
        {/* Curved path from bottom of Eff. Wager to bottom of Settle */}
        <path
          d={`M ${wagerBox.x + BOX_WIDTH / 2} ${BOX_TOP + BOX_HEIGHT}
              C ${wagerBox.x + BOX_WIDTH / 2} ${BOX_TOP + BOX_HEIGHT + 60},
                ${settleBox.x + BOX_WIDTH / 2} ${BOX_TOP + BOX_HEIGHT + 60},
                ${settleBox.x + BOX_WIDTH / 2} ${BOX_TOP + BOX_HEIGHT}`}
          fill="none"
          stroke={PALETTE.teal}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#dual-arrow)"
        />
        {/* Dual connection labels */}
        <text
          x={(wagerBox.x + BOX_WIDTH / 2 + settleBox.x + BOX_WIDTH / 2) / 2}
          y={BOX_TOP + BOX_HEIGHT + 68}
          textAnchor="middle"
          fontFamily={TYPOGRAPHY.fontFamily}
          fontSize="10"
          fontWeight={500}
          fill={PALETTE.teal}
        >
          mᵢ → exposure
        </text>
      </svg>
    </div>
  );
}
