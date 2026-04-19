import katex from 'katex';
import 'katex/dist/katex.min.css';

/* ─── Palette (matches PresentationPage.tsx) ─────────────────── */

const C = {
  navy: '#002147',
  accent: '#0091D5',
  white: '#FFFFFF',
  lightGrey: '#F8F9FA',
  dark: '#1a1a2e',
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
    border: isEmphasised ? `2px solid ${C.accent}` : `1px solid ${C.navy}`,
    borderRadius: 12,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    minWidth: 0,
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: C.navy,
    marginBottom: 8,
    fontFamily: FONT_FAMILY,
    lineHeight: 1.2,
  };

  const formulaStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    marginBottom: 6,
    lineHeight: 1.4,
  };

  const secondaryFormulaStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    marginBottom: 6,
    opacity: 0.8,
    lineHeight: 1.3,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '0.85rem',
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


/* ─── ArrowOverlay sub-component ─────────────────────────────── */

function ArrowOverlay() {
  return (
    <svg
      viewBox="0 0 1000 600"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Arrowhead markers */}
      <defs>
        <marker
          id="arrow-grey"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
        <marker
          id="arrow-cyan"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={C.accent} />
        </marker>
        <marker
          id="arrow-green"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#16a34a" />
        </marker>
        <marker
          id="arrow-red"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
        </marker>
      </defs>

      {/* 1. Submit → Effective Wager (grey) */}
      <line
        x1="230" y1="100" x2="430" y2="100"
        stroke="#94a3b8" strokeWidth="2"
        markerEnd="url(#arrow-grey)"
      />

      {/* 2. Effective Wager → Aggregate (CYAN, thick) */}
      <line
        x1="570" y1="100" x2="770" y2="100"
        stroke={C.accent} strokeWidth="3"
        markerEnd="url(#arrow-cyan)"
      />

      {/* 3. Aggregate → Settle (grey) */}
      <line
        x1="833" y1="180" x2="700" y2="350"
        stroke="#94a3b8" strokeWidth="2"
        markerEnd="url(#arrow-grey)"
      />

      {/* 4. Effective Wager → Settle (CYAN, thick — m goes to settle) */}
      <line
        x1="500" y1="180" x2="640" y2="350"
        stroke={C.accent} strokeWidth="3"
        markerEnd="url(#arrow-cyan)"
      />

      {/* 5. Settle → Skill Update (grey) */}
      <line
        x1="600" y1="420" x2="430" y2="420"
        stroke="#94a3b8" strokeWidth="2"
        markerEnd="url(#arrow-grey)"
      />

      {/* 6. Feedback: Skill Update → Effective Wager (dashed green, curved) */}
      <path
        d="M 333 350 C 333 250, 500 250, 500 180"
        fill="none"
        stroke="#16a34a"
        strokeWidth="2"
        strokeDasharray="6 4"
        markerEnd="url(#arrow-green)"
      />
      {/* Feedback label */}
      <text
        x="370" y="270"
        fill="#16a34a"
        fontSize="14"
        fontFamily={FONT_FAMILY}
        fontStyle="italic"
      >
        σ (next round)
      </text>

      {/* 7. Outcome: external → Settle (red) */}
      <line
        x1="750" y1="280" x2="700" y2="350"
        stroke="#dc2626" strokeWidth="2"
        markerEnd="url(#arrow-red)"
      />
      {/* Outcome label */}
      <text
        x="755" y="295"
        fill="#dc2626"
        fontSize="14"
        fontFamily={FONT_FAMILY}
        fontStyle="italic"
      >
        outcome y
      </text>
    </svg>
  );
}


/* ─── InsightBanner sub-component ────────────────────────────── */

function InsightBanner() {
  const bannerStyle: React.CSSProperties = {
    background: 'rgba(0, 145, 213, 0.08)',
    border: '1px solid rgba(0, 145, 213, 0.25)',
    borderLeft: `4px solid ${C.accent}`,
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: '1.2rem',
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
  const topRow = STEPS.filter((s) => ['submit', 'wager', 'aggregate'].includes(s.id));
  const bottomRow = STEPS.filter((s) => ['skill', 'settle'].includes(s.id));

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

      {/* Step grid with SVG overlay */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
          minHeight: 0,
        }}
      >
        {/* Top row: Submit → Effective Wager → Aggregate */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {topRow.map((step) => (
            <StepBox key={step.id} step={step} />
          ))}
        </div>

        {/* Bottom row: Skill Update ← Settle */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
            alignItems: 'stretch',
            paddingLeft: '16%',
            paddingRight: '16%',
          }}
        >
          {bottomRow.map((step) => (
            <StepBox key={step.id} step={step} />
          ))}
        </div>

        {/* SVG arrow overlay */}
        <ArrowOverlay />
      </div>

      {/* Insight banner */}
      <div style={{ flexShrink: 0, marginTop: 20 }}>
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
