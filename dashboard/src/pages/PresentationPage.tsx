import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/slides/PasswordGate';
import { PALETTE, TYPOGRAPHY, DARK_GRADIENT, getSectionForSlide, SECTION_BAR_HEIGHT } from '@/components/slides/shared/presentationConstants';
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
import SkillRecoverySlide from '@/components/slides/SkillRecoverySlide';
import StrategicRobustnessSlide from '@/components/slides/StrategicRobustnessSlide';
import ContributionsChartSlide from '@/components/slides/ContributionsChartSlide';

/**
 * Full-screen presentation mode for thesis defence.
 * Academic styling with section indicators, slide numbers, and new palette.
 */

const C = PALETTE;
const FONT_FAMILY = TYPOGRAPHY.fontFamily;
const TOTAL_SLIDES = 14;

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
  {
    id: 'title',
    type: 'title',
    title: 'Adaptive Skill and Stake\nin Forecast Markets',
    subtitle: 'Coupling Self-Financed Wagering with Online Skill Learning',
    dark: true,
    slideNumber: 1,
  },
  {
    id: 'motivation',
    type: 'split',
    title: 'Why Forecast Aggregation?',
    bullets: [
      '• Combining forecasts reduces prediction error',
      '• Full probabilistic forecasts, not point estimates',
      '• Quality measured by strictly proper scoring rules (CRPS)',
      '• Information is distributed and costly to share',
      '',
      '→ How do we incentivise participation and weight forecasters?',
    ],
    rightComponent: TheoryFlowSlide,
    slideNumber: 2,
  },
  {
    id: 'markets',
    type: 'split',
    title: 'Prediction Markets',
    bullets: [
      '• Share predictions instead of raw data',
      '• Reward forecasters based on accuracy',
      '• Structure: client posts task, forecasters submit reports + wagers, operator aggregates, settlement',
      '',
      '• Real platforms: Numerai, Polymarket, Kalshi',
      '',
      '• Warning: wash trading ~60% of volume [1]',
      '• Warning: prices driven by small elite [2]',
      '',
      '→ Need mechanisms with formal guarantees',
    ],
    ref: '[1] Sirolly et al., 2025  [2] Wu, U. Chicago, 2025',
    rightComponent: MarketFlowSlide,
    slideNumber: 3,
  },
  {
    id: 'existing-work',
    type: 'split',
    title: 'Where This Work Fits',
    bullets: [
      '• Lambert/Raja: self-financed and truthful',
      '  but static — no learning across rounds',
      '',
      '• Online aggregation: learns adaptive weights',
      '  but no payments or strategic guarantees',
      '',
      '• Vitali-Pinson: handles intermittent participation',
      '  but relative weights on simplex, different settlement',
      '',
      '→ This thesis: adaptive AND self-financed',
    ],
    ref: '[3] Lambert et al., 2008  [4] Raja et al., 2024  [5] Vitali & Pinson, 2025',
    rightComponent: PositioningMatrixSlide,
    slideNumber: 4,
  },
  {
    id: 'contribution',
    type: 'section',
    title: 'My Contribution',
    subtitle:
      'I extend self-financed wagering with an online skill-learning layer\n\neffective wager = deposit x learned skill\n\nAbsolute - Pre-round - Handles intermittency\nPreserves budget balance and sybilproofness',
    dark: true,
    component: ContributionSlide,
    slideNumber: 5,
  },
  {
    id: 'mechanism',
    type: 'split',
    title: 'Mechanism: Round-by-Round',
    component: MechanismPipelineSlide,
    slideNumber: 6,
  },
  {
    id: 'skill-signal',
    type: 'split',
    title: 'The Skill Signal',
    bullets: [
      '• When present: EWMA blends past loss with current round',
      '• When absent: staleness decay reverts skill toward baseline',
      '• Mapping: accumulated loss → skill score σ ∈ [σ_min, 1]',
      '',
      '• Absolute — independent of other participants',
      '• Pre-round — computed before the round begins',
      '• Handles intermittent participation',
    ],
    rightComponent: SkillSignalSlide,
    slideNumber: 7,
  },
  {
    id: 'architecture',
    type: 'split',
    title: 'Architecture',
    bullets: [
      '• One round as a five-step pipeline',
      '• Submit → Skill Gate → Aggregate → Settle → Update',
      '',
      '• Effective wager mᵢ = bᵢ · g(σᵢ) is the key object',
      '• Same mᵢ controls weight AND financial exposure',
      '• Outcome yₜ observed between aggregation and settlement',
      '• W′ᵢ, σ′ᵢ feed back to next round',
    ],
    rightComponent: ArchitectureDiagramSlide,
    slideNumber: 8,
  },
  {
    id: 'correctness',
    type: 'content',
    title: 'Correctness',
    component: CorrectnessSlide,
    slideNumber: 9,
  },
  {
    id: 'deposit-design',
    type: 'content',
    title: 'Deposit Design',
    highlight: 'Practical deposit rules capture most of the available gain',
    component: DepositAblationSlide,
    slideNumber: 10,
  },
  {
    id: 'real-data',
    type: 'content',
    title: 'Real Data Validation',
    bullets: [
      '• Elia wind: 17,544 rounds, 7 forecasters',
      '• Models: Naive, EWMA, ARIMA, XGBoost, MLP, Theta, Ensemble',
      '• Mechanism: −34% CRPS vs equal weights (tuned params)',
      '• Electricity: −4% improvement (forecasters more similar)',
      '',
      '→ Gains conditional on forecaster heterogeneity',
    ],
    component: ContributionsChartSlide,
    slideNumber: 11,
  },
  {
    id: 'skill-recovery',
    type: 'split',
    title: 'Skill Recovery',
    bullets: [
      '• 6 synthetic forecasters, T = 20,000 rounds, 20 seeds',
      '• Best forecaster (τ = 0.15): learned σ = 0.959',
      '• Worst forecaster (τ = 1.00): learned σ = 0.820',
      '• Spearman rank correlation = 1.0000 (perfect)',
      '',
      '→ Staleness decay prevents gaming by absence',
    ],
    rightComponent: SkillRecoverySlide,
    slideNumber: 12,
  },
  {
    id: 'strategic',
    type: 'content',
    title: 'Strategic Robustness',
    bullets: [
      '• 18 behaviour presets tested across 9 families',
      '• Sybil (identical): ratio = 1.000000 — no advantage',
      '• Arbitrage: zero profit in repeated setting',
      '• Reputation gaming: detected within ~20 rounds',
      '',
      '→ Mechanism resists standard attacks',
      '[!] Adaptive adversaries remain open',
    ],
    ref: '[6] Chen et al., EC 2014',
    component: StrategicRobustnessSlide,
    slideNumber: 13,
  },
  {
    id: 'closing',
    type: 'closing',
    title: 'Thank you',
    subtitle: 'Anastasia Cattaneo\nImperial College London\n2026',
    dark: true,
    slideNumber: 14,
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
        width: 60,
        height: 4,
        background: C.teal,
        borderRadius: 2,
        marginTop: 14,
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
  if (item.startsWith('• Warning:')) return { color: C.coral, fontWeight: 600 };
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
          lineHeight: 1.2,
          whiteSpace: 'pre-line',
          marginBottom: 24,
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p style={{ fontSize: '1.6rem', color: C.darkText, lineHeight: 1.6, maxWidth: 700 }}>
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
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            fontSize: '1.5rem',
            color: C.darkText,
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
            maxWidth: 800,
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
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 36, minHeight: 0 }}>
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
      <SlideNumberBadge slideNumber={slide.slideNumber} dark />
      <h1
        style={{
          fontSize: '3.6rem',
          fontWeight: 700,
          color: C.white,
          marginBottom: 32,
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            fontSize: '1.5rem',
            color: C.darkText,
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
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
