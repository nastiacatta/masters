import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/slides/PasswordGate';
import { PALETTE, TYPOGRAPHY, DARK_GRADIENT, getSectionForSlide, SECTION_BAR_HEIGHT, MAIN_DECK_SLIDE_COUNT } from '@/components/slides/shared/presentationConstants';
import { formatBulletText } from '@/components/slides/shared/formatBulletText';
import TheoryFlowSlide from '@/components/slides/TheoryFlowSlide';
import MarketFlowSlide from '@/components/slides/MarketFlowSlide';
import PositioningMatrixSlide from '@/components/slides/PositioningMatrixSlide';
import ContributionSlide from '@/components/slides/ContributionSlide';
import MechanismPipelineSlide from '@/components/slides/MechanismPipelineSlide';
import SkillSignalSlide from '@/components/slides/SkillSignalSlide';
import CorrectnessSlide from '@/components/slides/CorrectnessSlide';
import ContributionsChartSlide from '@/components/slides/ContributionsChartSlide';
import ModelsDataOverviewSlide from '@/components/slides/ModelsDataOverviewSlide';
import SyntheticResultsSlide from '@/components/slides/SyntheticResultsSlide';
import ConclusionSlide from '@/components/slides/ConclusionSlide';
import DepositAblationSlide from '@/components/slides/DepositAblationSlide';
import StrategicRobustnessSlide from '@/components/slides/StrategicRobustnessSlide';
import MechanismComparisonSlide from '@/components/slides/MechanismComparisonSlide';
import BaselineComparisonSlide from '@/components/slides/BaselineComparisonSlide';
import AppendixSlide from '@/components/slides/AppendixSlide';
import TitleSlide from '@/components/slides/TitleSlide';

/**
 * Full-screen presentation mode for project defence.
 * Academic styling with section indicators, slide numbers, and new palette.
 */

const C = PALETTE;
const FONT_FAMILY = TYPOGRAPHY.fontFamily;
const TOTAL_SLIDES = MAIN_DECK_SLIDE_COUNT;
const BASE = import.meta.env.BASE_URL;

/* ─── Slide data ─────────────────────────────────────────────── */

export interface SlideComponentProps {
  slide: SlideData;
  palette: typeof PALETTE;
  fontFamily: string;
}

export interface SlideData {
  id: string;
  type: 'title' | 'section' | 'content' | 'split' | 'closing';
  title?: string;
  subtitle?: string;
  bullets?: string[];
  leftBullets?: string[];
  image?: string;
  highlight?: string;
  dark?: boolean;
  ref?: string;
  slideNumber?: number;
  component?: React.ComponentType<SlideComponentProps>;
  rightComponent?: React.ComponentType<SlideComponentProps>;
}

const SLIDES: SlideData[] = [
  /* 1 — Title */
  {
    id: 'title',
    type: 'section',
    title: 'Adaptive Skill and Stake\nin Prediction Markets',
    subtitle: 'Coupling Self-Financed Wagering with Online Skill Learning',
    dark: true,
    component: TitleSlide,
    slideNumber: 1,
  },
  /* 2 — What Is a Prediction Market? */
  {
    id: 'what-is-pm',
    type: 'split',
    title: 'What Is a Prediction Market?',
    bullets: [
      '▸ Participants submit probabilistic forecasts backed by wagers',
      '▸ The market aggregates forecasts into a single prediction',
      '▸ Payoffs depend on accuracy — wagers create incentive to be informative',
      '',
      '→ Prediction markets turn dispersed knowledge into actionable forecasts',
    ],
    rightComponent: TheoryFlowSlide,
    slideNumber: 2,
  },
  /* 3 — Why Combine Forecasts? */
  {
    id: 'why-combine',
    type: 'split',
    title: 'Why Combine Forecasts?',
    bullets: [
      '▸ Different forecasters make different errors',
      '▸ Combining forecasts improves robustness over any single source',
      '',
      '▲ Participants are strategic — simple averaging is not enough',
      '▸ A market should learn who has value',
      '▸ Skill changes over time — learned trust must adapt',
      '',
      '→ We need a mechanism that learns the importance of each contribution',
    ],
    rightComponent: MarketFlowSlide,
    slideNumber: 3,
  },
  /* 4 — Where This Work Fits */
  {
    id: 'literature',
    type: 'split',
    title: 'Where This Work Fits',
    bullets: [
      '▸ Lambert et al.: self-financed wagering — seven properties, uniqueness',
      '▸ Raja et al.: prediction market with client and payoff allocation',
      '▸ Vitali & Pinson: online learning, intermittent participation, relative weights',
      '',
      '→ Gap: adaptive + self-financed + absolute skill',
    ],
    ref: 'Lambert et al., 2008 · Raja et al., 2024 · Vitali & Pinson, 2025',
    rightComponent: PositioningMatrixSlide,
    slideNumber: 4,
  },
  /* 5 — Mechanism Comparison (NEW) */
  {
    id: 'mechanism-comparison',
    type: 'content',
    title: 'Mechanism Comparison',
    component: MechanismComparisonSlide,
    slideNumber: 5,
  },
  /* 6 — My Contribution */
  {
    id: 'contribution',
    type: 'section',
    title: 'My Contribution',
    subtitle:
      'Self-financed prediction market\nwith online skill-learning layer\n\nInfluence depends on deposit and learned importance\nSkill is absolute and pre-round',
    dark: true,
    component: ContributionSlide,
    slideNumber: 6,
  },
  /* 7 — Mechanism: Round-by-Round */
  {
    id: 'mechanism',
    type: 'content',
    title: 'Mechanism: Round-by-Round',
    component: MechanismPipelineSlide,
    slideNumber: 7,
  },
  /* 8 — The Skill Signal */
  {
    id: 'skill-layer',
    type: 'split',
    title: 'The Skill Signal',
    bullets: [
      '▸ EWMA of realised forecasting loss',
      '▸ Bounded skill in [σ_min, 1] — always positive',
      '▸ Absolute, not relative — one forecaster improving does not reduce another',
      '',
      '● Staleness decay: absent forecasters revert toward baseline',
      '● Recent performance weighted more heavily',
    ],
    rightComponent: SkillSignalSlide,
    slideNumber: 8,
  },
  /* 9 — Models, Data, and Synthetic Setup */
  {
    id: 'models-data',
    type: 'content',
    title: 'Models, Data, and Synthetic Setup',
    component: ModelsDataOverviewSlide,
    slideNumber: 9,
  },
  /* 10 — Synthetic Validation: Convergence */
  {
    id: 'synthetic-results',
    type: 'content',
    title: 'Synthetic Validation: Convergence',
    component: SyntheticResultsSlide,
    slideNumber: 10,
  },
  /* 11 — Mechanism Guarantees */
  {
    id: 'guarantees',
    type: 'content',
    title: 'Mechanism Guarantees',
    component: CorrectnessSlide,
    slideNumber: 11,
  },
  /* 12 — Deposit Design */
  {
    id: 'deposit-design',
    type: 'content',
    title: 'Deposit Design',
    component: DepositAblationSlide,
    slideNumber: 12,
  },
  /* 13 — Real Data: Elia Wind + Electricity */
  {
    id: 'real-data',
    type: 'content',
    title: 'Real Data: Elia Wind + Electricity',
    component: ContributionsChartSlide,
    slideNumber: 13,
  },
  /* 14 — Benchmark comparison vs prior work */
  {
    id: 'baseline-comparison',
    type: 'content',
    title: 'Benchmark Comparison: Prior Work and This Project',
    component: BaselineComparisonSlide,
    slideNumber: 14,
  },
  /* 15 — Strategic Robustness */
  {
    id: 'strategic-robustness',
    type: 'content',
    title: 'Strategic Robustness',
    component: StrategicRobustnessSlide,
    slideNumber: 15,
  },
  /* 16 — Conclusion + Future Work */
  {
    id: 'conclusion',
    type: 'closing',
    title: 'Conclusion + Future Work',
    dark: true,
    component: ConclusionSlide,
    slideNumber: 16,
  },
  /* Appendix — hidden backup slide, no slide number */
  {
    id: 'appendix',
    type: 'content',
    title: 'Appendix',
    component: AppendixSlide,
    slideNumber: undefined,
  },
];

/* ─── Section bar component ──────────────────────────────────── */

function SectionBar({ slideNumber }: { slideNumber?: number }) {
  if (!slideNumber) return null;
  const section = getSectionForSlide(slideNumber);
  if (!section.colour || section.colour === 'transparent') return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: SECTION_BAR_HEIGHT,
        background: section.colour,
        zIndex: 10,
      }}
    />
  );
}

/* ─── Slide number indicator ─────────────────────────────────── */

function SlideNumberBadge({ slideNumber, dark }: { slideNumber?: number; dark?: boolean }) {
  if (!slideNumber) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 24,
        fontSize: '0.8rem',
        fontWeight: 500,
        color: dark ? PALETTE.darkText : PALETTE.slate,
        fontFamily: FONT_FAMILY,
        zIndex: 10,
      }}
    >
      {slideNumber} / {TOTAL_SLIDES}
    </div>
  );
}

/* ─── Section label ──────────────────────────────────────────── */

function SectionLabel({ slideNumber, dark }: { slideNumber?: number; dark?: boolean }) {
  if (!slideNumber) return null;
  const section = getSectionForSlide(slideNumber);
  if (!section.label) return null;
  return (
    <div
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: dark ? PALETTE.darkText : PALETTE.slate,
        marginBottom: 8,
        fontFamily: FONT_FAMILY,
        opacity: 0.8,
      }}
    >
      {section.label}
    </div>
  );
}

/* ─── Shared style helpers ───────────────────────────────────── */

function AccentBar() {
  return (
    <div
      style={{
        width: 64,
        height: 3,
        background: C.teal,
        borderRadius: 2,
        marginTop: 12,
        opacity: 0.9,
      }}
    />
  );
}

function SlideFooter({ refText }: { refText?: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        paddingTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: '0.85rem', color: C.slate }}>
        Anastasia Cattaneo — Imperial College London
      </span>
      {refText && (
        <span
          style={{
            fontSize: '0.75rem',
            color: C.slate,
            marginLeft: 'auto',
            paddingLeft: 16,
            textAlign: 'right',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {refText}
        </span>
      )}
    </div>
  );
}

function HighlightBar({ text }: { text: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: 20,
        background: 'rgba(46, 139, 139, 0.07)',
        borderLeft: `6px solid ${C.teal}`,
        color: C.navy,
        fontSize: '1.35rem',
        fontWeight: 700,
        padding: '0.9rem 1.5rem',
        borderRadius: '0 10px 10px 0',
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
}

/** Per-bullet inline style */
function bulletStyle(item: string): React.CSSProperties {
  if (item === '') return { height: '0.6rem' };
  if (item.startsWith('→')) return { color: C.teal, fontWeight: 700 };
  // Warning triangles — coral
  if (item.startsWith('▲')) return { color: C.coral, fontWeight: 600 };
  // Filled circle — teal property badges
  if (item.startsWith('●')) return { color: C.teal, fontWeight: 700 };
  // Teal arrow bullets
  if (item.startsWith('▸')) return { color: C.charcoal };
  // Slate secondary bullets
  if (item.startsWith('▹')) return { color: C.slate };
  // Legacy warning styles
  if (item.startsWith('• Warning:')) return { color: C.coral, fontWeight: 600 };
  if (item.startsWith('⚠')) return { color: C.coral, fontWeight: 600 };
  if (item.startsWith('  [!]')) return { color: C.coral, fontWeight: 600, paddingLeft: '1.5rem' };
  if (item.startsWith('[!]')) return { color: C.coral, fontWeight: 600 };
  if (item.startsWith('    ')) return { paddingLeft: '2.5rem', fontSize: '1.5rem', color: C.slate };
  if (item.startsWith('  ')) return { paddingLeft: '0.5rem' };
  if (/^\d\./.test(item)) return { fontWeight: 600 };
  if (item.startsWith('Limitations:'))
    return { fontWeight: 700, fontSize: '1.6rem', color: C.navy, marginTop: '0.4rem' };
  if (item.startsWith('Fixed deposits:') || item.startsWith('Bankroll deposits:'))
    return { fontWeight: 700, color: C.charcoal };
  return {};
}

const darkGradient = DARK_GRADIENT;

/* ─── Slide view components ──────────────────────────────────── */

/** Title slide */
function TitleSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        backgroundImage: `linear-gradient(180deg, rgba(7, 15, 35, 0.78) 0%, rgba(7, 15, 35, 0.82) 100%), url(${BASE}presentation-plots/title_background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: darkGradient,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <SectionBar slideNumber={slide.slideNumber} />
      <SlideNumberBadge slideNumber={slide.slideNumber} dark />
      <h1
        style={{
          fontSize: '3.6rem',
          fontWeight: 700,
          color: C.white,
          lineHeight: 1.2,
          whiteSpace: 'pre-line',
          marginBottom: 24,
          letterSpacing: '-0.01em',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p style={{ fontSize: '1.45rem', color: C.darkText, lineHeight: 1.6, maxWidth: 720, fontWeight: 400 }}>
          {slide.subtitle}
        </p>
      )}
      <p style={{ marginTop: 48, fontSize: '1.1rem', color: C.darkText }}>
        Anastasia Cattaneo — Imperial College London
      </p>
    </div>
  );
}

/** Section slide (dark, centred) */
function SectionSlideView({ slide }: { slide: SlideData }) {
  if (slide.component) {
    const Comp = slide.component;
    return <Comp slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />;
  }
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        background: darkGradient,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <SectionBar slideNumber={slide.slideNumber} />
      <SlideNumberBadge slideNumber={slide.slideNumber} dark />
      <SectionLabel slideNumber={slide.slideNumber} dark />
      <h1
        style={{
          fontSize: TYPOGRAPHY.heading.fontSize,
          fontWeight: 700,
          color: C.white,
          lineHeight: 1.2,
          marginBottom: 24,
          letterSpacing: '-0.01em',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            fontSize: '1.4rem',
            color: C.darkText,
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
            maxWidth: 820,
            fontWeight: 400,
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/** Content slide (full-width bullets + optional component) */
function ContentSlideView({ slide }: { slide: SlideData }) {
  if (slide.component) {
    const Comp = slide.component;
    const inner = <Comp slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />;
    /* Appendix is interactive (scroll, tabs); stop click-to-advance from swallowing it */
    if (slide.id === 'appendix') {
      return (
        <div
          style={{ width: '100%', height: '100%', position: 'relative' }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {inner}
        </div>
      );
    }
    return inner;
  }
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        paddingTop: 56,
        background: C.offWhite,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <SectionBar slideNumber={slide.slideNumber} />
      <SlideNumberBadge slideNumber={slide.slideNumber} />
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <SectionLabel slideNumber={slide.slideNumber} />
        <h2
          style={{
            fontSize: TYPOGRAPHY.heading.fontSize,
            fontWeight: TYPOGRAPHY.heading.fontWeight,
            color: C.navy,
            lineHeight: TYPOGRAPHY.heading.lineHeight,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {slide.bullets && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {slide.bullets.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: TYPOGRAPHY.bodyContent.fontSize,
                  lineHeight: TYPOGRAPHY.bodyContent.lineHeight,
                  marginBottom: TYPOGRAPHY.bodyContent.marginBottom,
                  color: C.charcoal,
                  fontFamily: FONT_FAMILY,
                  ...bulletStyle(item),
                }}
              >
                {formatBulletText(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {slide.highlight && <HighlightBar text={slide.highlight} />}
      <SlideFooter refText={slide.ref} />
    </div>
  );
}

/** Split slide (left bullets + right component) */
function SplitSlideView({ slide }: { slide: SlideData }) {
  if (slide.component && !slide.rightComponent) {
    const Comp = slide.component;
    return <Comp slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />;
  }
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        paddingTop: 56,
        background: C.offWhite,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <SectionBar slideNumber={slide.slideNumber} />
      <SlideNumberBadge slideNumber={slide.slideNumber} />
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <SectionLabel slideNumber={slide.slideNumber} />
        <h2
          style={{
            fontSize: TYPOGRAPHY.heading.fontSize,
            fontWeight: TYPOGRAPHY.heading.fontWeight,
            color: C.navy,
            lineHeight: TYPOGRAPHY.heading.lineHeight,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 40, minHeight: 0 }}>
        {/* Left: bullets */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {slide.bullets && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {slide.bullets.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: TYPOGRAPHY.bodySplit.fontSize,
                    lineHeight: TYPOGRAPHY.bodySplit.lineHeight,
                    marginBottom: TYPOGRAPHY.bodySplit.marginBottom,
                    color: C.charcoal,
                    fontFamily: FONT_FAMILY,
                    ...bulletStyle(item),
                  }}
                >
                  {formatBulletText(item)}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Right: component */}
        {slide.rightComponent && (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <slide.rightComponent slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />
          </div>
        )}
      </div>
      {slide.highlight && <HighlightBar text={slide.highlight} />}
      <SlideFooter refText={slide.ref} />
    </div>
  );
}

/** Closing slide */
function ClosingSlideView({ slide }: { slide: SlideData }) {
  if (slide.component) {
    const Comp = slide.component;
    return <Comp slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />;
  }
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        background: darkGradient,
        fontFamily: FONT_FAMILY,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <SectionBar slideNumber={slide.slideNumber} />
      <SlideNumberBadge slideNumber={slide.slideNumber} dark />
      <h1
        style={{
          fontSize: '3.6rem',
          fontWeight: 700,
          color: C.white,
          marginBottom: 32,
          letterSpacing: '-0.01em',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            fontSize: '1.4rem',
            color: C.darkText,
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
            fontWeight: 400,
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  if (!authenticated) {
    return <PasswordGate onAuthenticate={() => setAuthenticated(true)} />;
  }

  const slide = SLIDES[current];

  let content: React.ReactNode;
  switch (slide.type) {
    case 'title':
      content = <TitleSlideView slide={slide} />;
      break;
    case 'section':
      content = <SectionSlideView slide={slide} />;
      break;
    case 'content':
      content = <ContentSlideView slide={slide} />;
      break;
    case 'split':
      content = <SplitSlideView slide={slide} />;
      break;
    case 'closing':
      content = <ClosingSlideView slide={slide} />;
      break;
    default:
      content = <ContentSlideView slide={slide} />;
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', cursor: 'none' }}
      onClick={next}
      onContextMenu={(e) => { e.preventDefault(); prev(); }}
    >
      {content}
    </div>
  );
}
