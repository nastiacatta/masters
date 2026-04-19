import katex from 'katex';
import 'katex/dist/katex.min.css';

/* ─── Palette (matches PresentationPage.tsx) ─────────────────── */

const C = {
  navy: '#002147',
  accent: '#0091D5',
  white: '#FFFFFF',
  lightGrey: '#F8F9FA',
  dark: '#1a1a2e',
  warmGrey: '#4A5568',
  teal: '#00847F',
} as const;

const FONT_FAMILY =
  "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif";

/* ─── Step configuration ─────────────────────────────────────── */

interface StepConfig {
  id: string;
  label: string;
  subtitle: string;
  latex: string;
  secondaryLatex?: string;
  emphasised?: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: 'submit',
    label: '1. Submit',
    subtitle: 'forecaster inputs',
    latex: 'q_i(\\tau),\\; b_i',
  },
  {
    id: 'wager',
    label: '2. Effective Wager',
    subtitle: 'skill × stake',
    latex: 'm_i = b_i \\cdot g(\\sigma_i)',
    secondaryLatex: 'g(\\sigma) = \\lambda + (1-\\lambda)\\sigma^\\eta',
    emphasised: true,
  },
  {
    id: 'aggregate',
    label: '3. Aggregate',
    subtitle: 'wager-weighted pool',
    latex: '\\hat{q}(\\tau) = \\sum_i w_i \\cdot q_i(\\tau)',
  },
  {
    id: 'settle',
    label: '4. Settle',
    subtitle: 'budget-balanced',
    latex: '\\Pi_i = m_i(1 + s_i - \\bar{s})',
  },
  {
    id: 'skill',
    label: '5. Skill Update',
    subtitle: 'feeds back next round',
    latex: '\\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min})e^{-\\gamma L_i}',
  },
];

/* ─── KaTeX helper ───────────────────────────────────────────── */

function renderLatex(latex: string, displayMode = true): string {
  return katex.renderToString(latex, { throwOnError: false, displayMode });
}

/* ─── StepBox sub-component ──────────────────────────────────── */

function StepBox({ step }: { step: StepConfig }) {
  const isEmphasised = step.emphasised === true;

  const boxStyle: React.CSSProperties = {
    background: isEmphasised ? 'rgba(0, 145, 213, 0.05)' : C.white,
    border: isEmphasised ? `2.5px solid ${C.accent}` : `1.5px solid ${C.navy}`,
    borderRadius: 14,
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    minWidth: 0,
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: C.navy,
    marginBottom: 10,
    fontFamily: FONT_FAMILY,
    lineHeight: 1.2,
  };

  const formulaStyle: React.CSSProperties = {
    fontSize: '1.15rem',
    marginBottom: 8,
    lineHeight: 1.4,
  };

  const secondaryFormulaStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    marginBottom: 8,
    opacity: 0.8,
    lineHeight: 1.3,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#64748b',
    fontStyle: 'italic',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.3,
  };

  return (
    <div style={boxStyle} data-testid={`step-${step.id}`}>
      <div style={labelStyle}>{step.label}</div>
      <div
        style={formulaStyle}
        dangerouslySetInnerHTML={{ __html: renderLatex(step.latex) }}
      />
      {step.secondaryLatex && (
        <div
          style={secondaryFormulaStyle}
          dangerouslySetInnerHTML={{ __html: renderLatex(step.secondaryLatex) }}
        />
      )}
      <div style={subtitleStyle}>{step.subtitle}</div>
    </div>
  );
}

/* ─── Arrow divider between steps — bigger ───────────────────── */

function ArrowDivider({ colour = '#94a3b8', thick = false }: { colour?: string; thick?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
        flexShrink: 0,
      }}
    >
      <svg width="36" height="24" viewBox="0 0 36 24">
        <path
          d="M2 12 L26 12 M21 6 L28 12 L21 18"
          stroke={colour}
          strokeWidth={thick ? 3.5 : 2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ─── Feedback arrow (step 5 back to step 2) — more prominent ── */

function FeedbackArrow() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 56, marginTop: 10 }}>
      <svg
        viewBox="0 0 1000 56"
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="feedback-arrow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#00847F" />
          </marker>
        </defs>
        {/* Curved path from right (step 5 area) back to left (step 2 area) */}
        <path
          d="M 820 4 C 820 46, 300 46, 300 4"
          fill="none"
          stroke="#00847F"
          strokeWidth="3"
          strokeDasharray="8 5"
          markerEnd="url(#feedback-arrow)"
        />
        <text
          x="560" y="50"
          fill="#00847F"
          fontSize="14"
          fontWeight="600"
          fontFamily={FONT_FAMILY}
          fontStyle="italic"
          textAnchor="middle"
        >
          σ feeds back (next round)
        </text>
      </svg>
    </div>
  );
}

/* ─── InsightBanner sub-component ────────────────────────────── */

function InsightBanner() {
  const bannerStyle: React.CSSProperties = {
    background: 'rgba(0, 145, 213, 0.08)',
    border: '1px solid rgba(0, 145, 213, 0.25)',
    borderLeft: `4px solid ${C.accent}`,
    borderRadius: 8,
    padding: '14px 28px',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: C.navy,
    fontFamily: FONT_FAMILY,
    lineHeight: 1.4,
  };

  return (
    <div style={bannerStyle}>
      Same effective wager <em>m</em> determines both aggregation weight and financial exposure
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function MechanismPipelineSlide() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
        background: C.white,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: '2.6rem',
            fontWeight: 700,
            color: C.navy,
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Mechanism: Round-by-Round
        </h2>
        <div
          style={{
            width: 80,
            height: 3,
            background: C.accent,
            borderRadius: 2,
            marginTop: 12,
          }}
        />
      </div>

      {/* Steps as horizontal flow with arrow dividers */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 0,
            position: 'relative',
          }}
        >
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <StepBox step={step} />
              {i < STEPS.length - 1 && (
                <ArrowDivider
                  colour={step.id === 'wager' ? C.accent : '#94a3b8'}
                  thick={step.id === 'wager'}
                />
              )}
            </div>
          ))}

          {/* "outcome y" annotation near step 4 (settle) */}
          <div
            style={{
              position: 'absolute',
              top: -28,
              left: '62%',
              fontSize: '0.85rem',
              color: C.warmGrey,
              fontStyle: 'italic',
              fontFamily: FONT_FAMILY,
              background: 'rgba(0,132,127,0.06)',
              padding: '3px 10px',
              borderRadius: 6,
            }}
          >
            outcome y ↓
          </div>
        </div>

        {/* Feedback arrow below the row */}
        <FeedbackArrow />
      </div>

      {/* Insight banner */}
      <div style={{ flexShrink: 0, marginTop: 16 }}>
        <InsightBanner />
      </div>

      {/* Footer */}
      <div
        style={{
          flexShrink: 0,
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#999' }}>
          Anastasia Cattaneo — Imperial College London
        </span>
      </div>
    </div>
  );
}
