import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PALETTE, TYPOGRAPHY, getSectionForSlide, SECTION_BAR_HEIGHT } from './shared/presentationConstants';

/**
 * Slide 6: Mechanism Round-by-Round — horizontal pipeline with
 * plain-English labels ABOVE each formula box. Arrows have 15px gaps.
 * Feedback arrow is BELOW the boxes with proper clearance.
 */

const FONT_FAMILY = TYPOGRAPHY.fontFamily;

interface StepConfig {
  id: string;
  label: string;
  description: string;
  latex: string;
  emphasised?: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: 'submit',
    label: '1. Submit',
    description: 'Forecaster submits quantile forecast q and deposit b',
    latex: 'q_i(\\tau),\\; b_i',
  },
  {
    id: 'wager',
    label: '2. Effective Wager',
    description: 'Effective wager = deposit × skill factor (KEY equation)',
    latex: 'm_i = b_i \\cdot g(\\sigma_i)',
    emphasised: true,
  },
  {
    id: 'aggregate',
    label: '3. Aggregate',
    description: 'Weighted average using effective wagers as weights',
    latex: '\\hat{q}(\\tau) = \\sum_i w_i \\cdot q_i(\\tau)',
  },
  {
    id: 'settle',
    label: '4. Settle',
    description: 'Payoff based on relative score — budget balanced',
    latex: '\\Pi_i = m_i(1 + s_i - \\bar{s})',
  },
  {
    id: 'skill',
    label: '5. Skill Update',
    description: 'Skill updates from loss via exponential smoothing',
    latex: '\\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min})e^{-\\gamma L_i}',
  },
];

function renderLatex(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode: true });
}

function StepBox({ step }: { step: StepConfig }) {
  const isEmphasised = step.emphasised === true;

  return (
    <div
      style={{
        background: isEmphasised ? 'rgba(46, 139, 139, 0.05)' : PALETTE.white,
        border: isEmphasised ? `2.5px solid ${PALETTE.teal}` : `1.5px solid ${PALETTE.border}`,
        borderRadius: 14,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        minWidth: 0,
        flex: 1,
      }}
      data-testid={`step-${step.id}`}
    >
      {/* Plain-English description ABOVE */}
      <div
        style={{
          fontSize: '0.85rem',
          color: PALETTE.slate,
          fontStyle: 'italic',
          fontFamily: FONT_FAMILY,
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        {step.description}
      </div>
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: PALETTE.navy,
          marginBottom: 8,
          fontFamily: FONT_FAMILY,
          lineHeight: 1.2,
        }}
      >
        {step.label}
      </div>
      <div
        style={{ fontSize: '1.1rem', lineHeight: 1.4 }}
        dangerouslySetInnerHTML={{ __html: renderLatex(step.latex) }}
      />
    </div>
  );
}

function ArrowDivider({ highlight = false }: { highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
        flexShrink: 0,
      }}
    >
      <svg width="32" height="24" viewBox="0 0 32 24">
        <path
          d="M2 12 L22 12 M17 6 L24 12 L17 18"
          stroke={highlight ? PALETTE.teal : PALETTE.border}
          strokeWidth={highlight ? 3 : 2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FeedbackArrow() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 56, marginTop: 12 }}>
      <svg
        viewBox="0 0 1000 56"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="feedback-arrow" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
            <polygon points="10 0, 0 3.5, 10 7" fill={PALETTE.teal} />
          </marker>
        </defs>
        {/* Curved path below the boxes — from step 5 (right) curving down to step 2 (left) */}
        <path
          d="M 820 8 C 820 48, 300 48, 300 8"
          fill="none"
          stroke={PALETTE.teal}
          strokeWidth="2.5"
          strokeDasharray="8 5"
          markerEnd="url(#feedback-arrow)"
        />
        <text
          x="560" y="52"
          fill={PALETTE.teal}
          fontSize="13"
          fontWeight="600"
          fontFamily={FONT_FAMILY}
          fontStyle="italic"
          textAnchor="middle"
        >
          skill feeds back (next round)
        </text>
      </svg>
    </div>
  );
}

export default function MechanismPipelineSlide() {
  const section = getSectionForSlide(6);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
        paddingTop: 56,
        background: PALETTE.offWhite,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Section bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SECTION_BAR_HEIGHT, background: section.colour }} />
      {/* Slide number */}
      <div style={{ position: 'absolute', top: 16, right: 24, fontSize: '0.8rem', color: PALETTE.slate }}>6 / 14</div>

      {/* Title */}
      <div style={{ flexShrink: 0, marginBottom: 20 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: PALETTE.slate, marginBottom: 8, opacity: 0.8 }}>
          SOLUTION
        </div>
        <h2 style={{ fontSize: '3.2rem', fontWeight: 700, color: PALETTE.navy, lineHeight: 1.15, margin: 0 }}>
          Mechanism: Round-by-Round
        </h2>
        <div style={{ width: 60, height: 4, background: PALETTE.teal, borderRadius: 2, marginTop: 14 }} />
      </div>

      {/* Steps */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <StepBox step={step} />
              {i < STEPS.length - 1 && <ArrowDivider highlight={step.id === 'wager'} />}
            </div>
          ))}
        </div>
        <FeedbackArrow />
      </div>

      {/* Insight banner */}
      <div
        style={{
          flexShrink: 0,
          marginTop: 12,
          background: 'rgba(46, 139, 139, 0.08)',
          border: '1px solid rgba(46, 139, 139, 0.25)',
          borderLeft: `4px solid ${PALETTE.teal}`,
          borderRadius: 8,
          padding: '14px 28px',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: PALETTE.navy,
          fontFamily: FONT_FAMILY,
          lineHeight: 1.4,
        }}
      >
        Same effective wager m determines both aggregation weight and financial exposure
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '0.8rem', color: PALETTE.slate }}>Anastasia Cattaneo — Imperial College London</span>
      </div>
    </div>
  );
}
