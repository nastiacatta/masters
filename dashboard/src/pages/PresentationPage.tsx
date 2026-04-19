import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/slides/PasswordGate';
import { PALETTE, TYPOGRAPHY, DARK_GRADIENT } from '@/components/slides/shared/presentationConstants';
import { formatBulletText } from '@/components/slides/shared/formatBulletText';
import TheoryFlowSlide from '@/components/slides/TheoryFlowSlide';
import MarketFlowSlide from '@/components/slides/MarketFlowSlide';
import PositioningMatrixSlide from '@/components/slides/PositioningMatrixSlide';
import ContributionSlide from '@/components/slides/ContributionSlide';
import MechanismPipelineSlide from '@/components/slides/MechanismPipelineSlide';
import SkillSignalSlide from '@/components/slides/SkillSignalSlide';
import ArchitectureDiagramSlide from '@/components/slides/ArchitectureDiagramSlide';
import CorrectnessSlide from '@/components/slides/CorrectnessSlide';
import DepositAblationSlide from '@/components/slides/DepositAblationSlide';
import WeightRulesSlide from '@/components/slides/WeightRulesSlide';
import SkillRecoverySlide from '@/components/slides/SkillRecoverySlide';
import StrategicRobustnessSlide from '@/components/slides/StrategicRobustnessSlide';
import ContributionsChartSlide from '@/components/slides/ContributionsChartSlide';

/**
 * Full-screen presentation mode for thesis defence.
 * Imperial College styling with warm teal accent.
 */

/* ─── Palette (local shorthand) ──────────────────────────────── */

const C = PALETTE;
const FONT_FAMILY = TYPOGRAPHY.fontFamily;

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
  component?: React.ComponentType<SlideComponentProps>;
  rightComponent?: React.ComponentType<SlideComponentProps>;
}

const SLIDES: SlideData[] = [
  /* ── 1  TITLE ── */
  {
    id: 'title',
    type: 'title',
    title: 'Adaptive Skill and Stake\nin Forecast Markets',
    subtitle: 'Coupling Self-Financed Wagering with Online Skill Learning',
    dark: true,
  },

  /* ── 2  WHY FORECAST AGGREGATION ── */
  {
    id: 'motivation',
    type: 'split',
    title: 'Why Forecast Aggregation?',
    bullets: [
      '• Combining forecasts reduces error',
      '• Full probabilistic forecasts (not point estimates)',
      '• Quality: strictly proper scoring rules (CRPS)',
      '• Information distributed, costly to share',
      '',
      '→ How to incentivise and weight correctly?',
    ],
    rightComponent: TheoryFlowSlide,
  },

  /* ── 3  PREDICTION MARKETS ── */
  {
    id: 'markets',
    type: 'split',
    title: 'Prediction Markets',
    bullets: [
      '• Share predictions, not raw data',
      '• Reward based on forecast quality',
      '• Client posts task; forecasters submit reports + wagers',
      '• Market operator aggregates and settles',
      '',
      '• Platforms: Numerai, Polymarket, Kalshi',
      '⚠ Wash trading ~60% of volume [1]',
      '⚠ Prices driven by small elite [2]',
      '',
      '→ Need mechanisms with formal guarantees',
    ],
    ref: '[1] Sirolly et al., 2025  [2] Wu, U. Chicago, 2025',
    rightComponent: MarketFlowSlide,
  },

  /* ── 4  WHERE THIS WORK FITS ── */
  {
    id: 'existing-work',
    type: 'split',
    title: 'Where This Work Fits',
    bullets: [
      '• Lambert/Raja: self-financed, truthful',
      '  but static (no skill learning)',
      '',
      '• Online aggregation: adaptive weights',
      '  but no payments or guarantees',
      '',
      '• Vitali-Pinson: adaptive + intermittent',
      '  but relative weights, different settlement',
      '',
      '→ This thesis: adaptive AND self-financed',
    ],
    ref: '[3] Lambert et al., 2008  [4] Raja et al., 2024  [5] Vitali & Pinson, 2025',
    rightComponent: PositioningMatrixSlide,
  },

  /* ── 5  CONTRIBUTION ── */
  {
    id: 'contribution',
    type: 'section',
    title: 'My Contribution',
    subtitle:
      'I extend self-financed wagering with an online skill-learning layer\n\neffective wager = deposit × learned skill\n\nAbsolute · Pre-round · Handles intermittency\nPreserves budget balance and sybilproofness',
    dark: true,
    component: ContributionSlide,
  },

  /* ── 6  MECHANISM ── */
  {
    id: 'mechanism',
    type: 'split',
    title: 'Mechanism: Round-by-Round',
    bullets: [
      '1. Submit forecast + deposit',
      '2. Skill gate: m = b × g(σ)',
      '3. Aggregate by effective wager',
      '4. Settle: Π = m(1 + s − s̄)',
      '5. Update skill from loss',
      '',
      '→ Same m controls influence AND exposure',
    ],
    highlight: 'Incentives aligned: influence requires risk',
    component: MechanismPipelineSlide,
  },

  /* ── 7  SKILL SIGNAL ── */
  {
    id: 'skill-signal',
    type: 'split',
    title: 'The Skill Signal',
    bullets: [
      '• Present: EWMA blends loss with history',
      '• Absent: staleness decay toward baseline',
      '• Mapping: loss → σ ∈ [σ_min, 1]',
      '',
      '• Absolute (not relative to others)',
      '• Pre-round (past losses only)',
      '• Handles intermittent participation',
    ],
    rightComponent: SkillSignalSlide,
  },

  /* ── 8  ARCHITECTURE ── */
  {
    id: 'architecture',
    type: 'split',
    title: 'Architecture',
    bullets: [
      '• Environment: DGPs (synthetic + real data)',
      '• Agents: honest, noisy, adversarial',
      '• Platform: deterministic core mechanism',
      '',
      '• Agents output (participate, report, deposit)',
      '• Core consumes without knowing motives',
      '• 20+ invariant tests, property-based testing',
    ],
    rightComponent: ArchitectureDiagramSlide,
  },

  /* ── 9  CORRECTNESS ── */
  {
    id: 'correctness',
    type: 'split',
    title: 'Correctness',
    bullets: [
      '• Budget gap: 2.84 × 10⁻¹⁴',
      '• Mean profit: 3.01 × 10⁻¹⁷ (zero-sum)',
      '• Sybil ratio: 1.000000',
      '• Noise-skill correlation: −0.98',
      '',
      '✓ All 20+ tests PASS (both modes)',
    ],
    component: CorrectnessSlide,
  },

  /* ── 10  DEPOSIT DESIGN ── */
  {
    id: 'deposit-design',
    type: 'split',
    title: 'Deposit Design',
    bullets: [
      '• Random (IID Exp): 0.0456',
      '• Fixed (b=1):      0.0423',
      '• Bankroll+Conf:    0.0375  (−11%)',
      '• Oracle:           0.0227  (−46%)',
      '',
      '→ How stake enters > weighting rule',
    ],
    highlight: 'Deposit design is the strongest lever',
    component: DepositAblationSlide,
  },

  /* ── 11  WEIGHT RULES ── */
  {
    id: 'weight-rules',
    type: 'split',
    title: 'Weight Rules',
    bullets: [
      'Fixed deposits:',
      '• Uniform:     0.0434',
      '• Skill-only:  0.0419  (−3.5%)',
      '',
      'Bankroll deposits:',
      '• Deposit-only: 0.0230',
      '',
      '→ Equal weights remain a strong baseline',
    ],
    component: WeightRulesSlide,
  },

  /* ── 12  SKILL RECOVERY ── */
  {
    id: 'skill-recovery',
    type: 'split',
    title: 'Skill Recovery',
    bullets: [
      '• 6 forecasters, T=20000, 20 seeds',
      '• Least noisy (τ=0.15): σ = 0.959',
      '• Most noisy (τ=1.00): σ = 0.820',
      '• Spearman rank correlation = 1.0000',
      '',
      '→ Staleness decay prevents gaming',
    ],
    component: SkillRecoverySlide,
  },

  /* ── 13  STRATEGIC ROBUSTNESS ── */
  {
    id: 'strategic',
    type: 'content',
    title: 'Strategic Robustness',
    bullets: [
      '• Sybil (identical reports): ratio = 1.000000',
      '  Sybilproof under standard assumption',
      '',
      '• Arbitrage [6]: zero profit extracted',
      '  Skill gate limits sustained exploitation',
      '',
      '→ Mechanism resists standard attacks',
      '⚠ Adaptive adversaries remain open',
    ],
    ref: '[6] Chen et al., EC 2014',
    component: StrategicRobustnessSlide,
  },

  /* ── 14  CONTRIBUTIONS & CLOSING ── */
  {
    id: 'contributions',
    type: 'content',
    title: 'Contributions',
    bullets: [
      '1. Mechanism coupling wagering + online skill learning',
      '2. Verified: budget balance < 10⁻¹⁴, sybilproof',
      '3. Deposit design: strongest lever (−11% CRPS)',
      '4. Skill recovery: Spearman = 1.0000',
      '5. Real data: −21% CRPS on Elia wind (ARIMA, XGBoost, MLP)',
      '6. Modular platform + test suite + dashboard',
      '',
      'Limitations:',
      '⚠ Tail calibration ~5pp (quantile averaging)',
      '⚠ Equal weights competitive on some datasets',
      '⚠ Truthfulness under risk neutrality only',
    ],
    component: ContributionsChartSlide,
  },

  /* ── 15  CLOSING ── */
  {
    id: 'closing',
    type: 'closing',
    title: 'Thank you',
    subtitle: 'Anastasia Cattaneo\nImperial College London\n2026',
    dark: true,
  },
];

/* ─── Shared style helpers ───────────────────────────────────── */

/** Accent bar under slide titles: 4px tall, 60px wide, teal */
function AccentBar() {
  return (
    <div
      style={{
        width: 60,
        height: 4,
        background: C.teal,
        borderRadius: 2,
        marginTop: 14,
      }}
    />
  );
}

/** Footer — left: name, right: optional reference */
function SlideFooter({ refText }: { refText?: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        paddingTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <span style={{ fontSize: '0.8rem', color: C.warmGrey, textAlign: 'left' }}>
        Anastasia Cattaneo — Imperial College London
      </span>
      {refText && (
        <span
          style={{
            fontSize: '0.72rem',
            color: C.warmGrey,
            maxWidth: '55%',
            textAlign: 'right',
            lineHeight: 1.4,
          }}
        >
          {refText}
        </span>
      )}
    </div>
  );
}

/** Warm teal highlight bar with left border accent */
function HighlightBar({ text }: { text: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: 20,
        background: 'rgba(0, 132, 127, 0.07)',
        borderLeft: `4px solid ${C.teal}`,
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
  if (item.startsWith('⚠')) return { color: C.deepRed, fontWeight: 600 };
  if (item.startsWith('→')) return { color: C.teal, fontWeight: 700 };
  if (item.startsWith('✓')) return { color: C.teal, fontWeight: 700 };
  if (item.startsWith('  ')) return { paddingLeft: '1.5rem', fontSize: '1.45rem', color: C.warmGrey };
  if (item.startsWith('•')) return {};
  if (/^\d\./.test(item)) return { fontWeight: 600 };
  if (item.startsWith('Limitations:'))
    return { fontWeight: 700, fontSize: '1.55rem', color: C.navy, marginTop: '0.4rem' };
  if (item.startsWith('Fixed deposits:') || item.startsWith('Bankroll deposits:'))
    return { fontWeight: 700, color: C.darkSlate };
  return {};
}

/** Dark gradient used by title, section, and closing slides */
const darkGradient = DARK_GRADIENT;

/* ─── Slide renderers ────────────────────────────────────────── */

/** Slide 1 — Title (dark, centred) */
function TitleSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        background: darkGradient,
      }}
    >
      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 700,
          color: C.white,
          lineHeight: 1.08,
          maxWidth: '1100px',
          whiteSpace: 'pre-line',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            marginTop: 36,
            fontSize: '2.1rem',
            color: C.teal,
            lineHeight: 1.4,
            maxWidth: '900px',
          }}
        >
          {slide.subtitle}
        </p>
      )}
      <div
        style={{
          marginTop: 72,
          fontSize: '1.3rem',
          color: C.lightGrey,
        }}
      >
        Anastasia Cattaneo · Imperial College London · 2026
      </div>
    </div>
  );
}

/** Section / gap divider (dark, centred) */
function SectionSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        background: darkGradient,
      }}
    >
      <h1
        style={{
          fontSize: '3.4rem',
          fontWeight: 700,
          color: C.white,
          lineHeight: 1.2,
          maxWidth: '1000px',
          whiteSpace: 'pre-line',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            marginTop: 44,
            fontSize: '1.8rem',
            color: C.teal,
            lineHeight: 1.55,
            maxWidth: '900px',
            whiteSpace: 'pre-line',
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/** Content slides — text only, left-aligned, max-width 900px */
function ContentSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 72px',
        background: C.lightBg,
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 36 }}>
        <h2
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: C.navy,
            lineHeight: 1.15,
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>

      {/* Bullets — left-aligned, generous spacing */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 900,
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {slide.bullets?.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '1.7rem',
                lineHeight: 2.0,
                color: C.warmGrey,
                marginBottom: 14,
                ...bulletStyle(item),
              }}
            >
              {formatBulletText(item)}
            </li>
          ))}
        </ul>
      </div>

      <SlideFooter refText={slide.ref} />
    </div>
  );
}

/** Split slides — 35% text left, 65% graph right, left-aligned */
function SplitSlideView({ slide }: { slide: SlideData }) {
  const items = slide.bullets || slide.leftBullets || [];
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        background: C.lightBg,
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: C.navy,
            lineHeight: 1.15,
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>

      {/* Split body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 36,
          minHeight: 0,
        }}
      >
        {/* Left — text (35%) */}
        <div
          style={{
            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '1.6rem',
                  lineHeight: 2.0,
                  color: C.warmGrey,
                  marginBottom: 14,
                  ...bulletStyle(item),
                }}
              >
                {formatBulletText(item)}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — graph (65%) */}
        <div
          style={{
            width: '65%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {slide.rightComponent ? (
            (() => {
              const RightComp = slide.rightComponent;
              return <RightComp slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />;
            })()
          ) : slide.image ? (
            <img
              src={`${BASE}${slide.image}`}
              alt={slide.title ?? 'Slide image'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              }}
            />
          ) : null}
        </div>
      </div>

      {slide.highlight && <HighlightBar text={slide.highlight} />}
      <SlideFooter refText={slide.ref} />
    </div>
  );
}

/** Closing slide (dark, centred) */
function ClosingSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        background: darkGradient,
      }}
    >
      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 700,
          color: C.white,
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            marginTop: 44,
            fontSize: '1.9rem',
            color: C.teal,
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/** Dispatch to the correct renderer by slide type — component field takes priority */
function SlideRenderer({ slide }: { slide: SlideData }) {
  if (slide.component) {
    const Component = slide.component;
    return <Component slide={slide} palette={PALETTE} fontFamily={FONT_FAMILY} />;
  }
  switch (slide.type) {
    case 'title':
      return <TitleSlideView slide={slide} />;
    case 'section':
      return <SectionSlideView slide={slide} />;
    case 'content':
      return <ContentSlideView slide={slide} />;
    case 'split':
      return <SplitSlideView slide={slide} />;
    case 'closing':
      return <ClosingSlideView slide={slide} />;
    default:
      return null;
  }
}


/* ─── Main presentation component ────────────────────────────── */

export default function PresentationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showNav, setShowNav] = useState(true);
  const [fadeKey, setFadeKey] = useState(0);
  const total = SLIDES.length;

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, total - 1));
      if (clamped !== current) {
        setFadeKey((k) => k + 1);
        setCurrent(clamped);
      }
    },
    [total, current],
  );

  /* Keyboard navigation */
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          goTo(current - 1);
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(total - 1);
          break;
        case 'Escape':
          setShowNav((v) => !v);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, goTo, total, isAuthenticated]);

  /* Auto-hide nav bar after 3s */
  useEffect(() => {
    if (!showNav) return;
    const timer = setTimeout(() => setShowNav(false), 3000);
    return () => clearTimeout(timer);
  }, [showNav, current]);

  /* Show nav on mouse move */
  useEffect(() => {
    const handleMove = () => setShowNav(true);
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  /* ── Password gate ── */
  if (!isAuthenticated) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_FAMILY,
          background: darkGradient,
        }}
      >
        <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  const slide = SLIDES[current];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: FONT_FAMILY,
        background: '#0a0a0a',
      }}
      onMouseMove={() => setShowNav(true)}
    >
      {/* Full-viewport slide with opacity fade transition */}
      <div
        key={`slide-${slide.id}-${fadeKey}`}
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          animation: 'slideFadeIn 0.28s ease',
        }}
      >
        <SlideRenderer slide={slide} />
      </div>

      {/* CSS keyframe for fade */}
      <style>{`
        @keyframes slideFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Bottom navigation bar — darker, more subtle, auto-hides */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 32px',
          background: 'rgba(0, 10, 20, 0.75)',
          backdropFilter: 'blur(10px)',
          opacity: showNav ? 1 : 0,
          pointerEvents: showNav ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          style={{
            background: 'none',
            border: 'none',
            color: current === 0 ? 'rgba(255,255,255,0.25)' : C.lightGrey,
            fontSize: '0.95rem',
            cursor: current === 0 ? 'default' : 'pointer',
            padding: '4px 16px',
            fontFamily: FONT_FAMILY,
          }}
        >
          ← Prev
        </button>
        <span
          style={{
            color: C.lightGrey,
            fontSize: '0.9rem',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: FONT_FAMILY,
          }}
        >
          {current + 1} / {total}
        </span>
        <button
          onClick={() => goTo(current + 1)}
          disabled={current === total - 1}
          style={{
            background: 'none',
            border: 'none',
            color: current === total - 1 ? 'rgba(255,255,255,0.25)' : C.lightGrey,
            fontSize: '0.95rem',
            cursor: current === total - 1 ? 'default' : 'pointer',
            padding: '4px 16px',
            fontFamily: FONT_FAMILY,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
