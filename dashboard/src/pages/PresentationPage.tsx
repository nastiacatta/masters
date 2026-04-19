import { useState, useEffect, useCallback } from 'react';
import PasswordGate from '@/components/slides/PasswordGate';

/**
 * Full-screen presentation mode for thesis defence.
 * Imperial College styling: Avenir font, navy (#002147) / cyan (#0091D5) palette.
 * Arrow keys navigate between slides. Spacebar advances. Escape toggles nav bar.
 *
 * FORMATTING: All text sized for projection — title 4rem, headings 2.6rem,
 * body 1.5rem, sub-items 1.3rem. Split slides: 45/55 text/image.
 */

/* ─── Palette ────────────────────────────────────────────────── */

const C = {
  navy: '#002147',
  accent: '#0091D5',
  white: '#FFFFFF',
  lightGrey: '#F8F9FA',
  dark: '#1a1a2e',
} as const;

const FONT_FAMILY =
  "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, sans-serif";

const BASE = import.meta.env.BASE_URL;

/* ─── Slide data ─────────────────────────────────────────────── */

interface SlideData {
  id: string;
  type: 'title' | 'section' | 'content' | 'split' | 'columns' | 'closing';
  title?: string;
  subtitle?: string;
  bullets?: string[];
  columns?: { heading: string; items: string[] }[];
  leftBullets?: string[];
  image?: string;
  highlight?: string;
  dark?: boolean;
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
    leftBullets: [
      '• Combining forecasts reduces error',
      '• Modern standard: full probabilistic forecasts',
      '• Quality measured by proper scoring rules (CRPS)',
      '• Information is distributed and costly to share',
      '→ How to incentivise and weight correctly?',
    ],
    image: 'presentation-plots/forecast_aggregation_four_panel.png',
  },

  /* ── 3  PREDICTION MARKETS ── */
  {
    id: 'markets',
    type: 'split',
    title: 'Prediction Markets',
    leftBullets: [
      '• Share predictions, not raw data',
      '• Reward based on forecast quality',
      '• Platforms: Numerai, Polymarket, Kalshi',
      '⚠ Wash trading ~60% volume (Sirolly 2025)',
      '⚠ Prices driven by small elite (Wu 2025)',
      '→ Need mechanisms with formal guarantees',
    ],
    image: 'presentation-plots/behaviour_concentration.png',
  },

  /* ── 4  EXISTING WORK ── */
  {
    id: 'existing-work',
    type: 'columns',
    title: 'Existing Work',
    columns: [
      {
        heading: 'Self-Financed Wagering',
        items: [
          '• Lambert (2008): WSWM',
          '• 7 properties; uniqueness',
          '• Raja (2024): + client utility',
          '⚠ History-free',
        ],
      },
      {
        heading: 'Online Aggregation',
        items: [
          '• OGD / Hedge algorithms',
          '• Regret guarantees',
          '⚠ Non-strategic agents',
          '⚠ No payments',
        ],
      },
      {
        heading: 'Intermittent Markets',
        items: [
          '• Vitali-Pinson (2025)',
          '• Correction matrix for missing',
          '• Shapley + scoring payoff',
          '⚠ Relative weights (simplex)',
        ],
      },
    ],
  },

  /* ── 5  GAP ── */
  {
    id: 'gap',
    type: 'section',
    title: 'No existing design couples\nself-financed wagering\nwith online skill learning',
    subtitle: 'effective wager = deposit × learned skill\nAbsolute · Pre-round · Handles intermittency',
    dark: true,
  },

  /* ── 6  MECHANISM ── */
  {
    id: 'mechanism',
    type: 'split',
    title: 'Mechanism: Round-by-Round',
    leftBullets: [
      '1. Submit forecast + deposit',
      '2. Skill gate: m = b × g(σ)',
      '3. Aggregate by effective wager',
      '4. Settle: Π = m(1 + s − s̄)',
      '5. Update skill from loss',
      '→ Same m controls influence AND exposure',
    ],
    image: 'presentation-plots/fixed_deposit.png',
    highlight: 'Incentives aligned: influence requires risk',
  },

  /* ── 7  SKILL SIGNAL ── */
  {
    id: 'skill-signal',
    type: 'split',
    title: 'The Skill Signal',
    leftBullets: [
      '• Present: EWMA blends loss with history',
      '• Absent: staleness decay toward baseline',
      '• Mapping: loss → σ ∈ [σ_min, 1]',
      '• Absolute (not relative to others)',
      '• Pre-round (past losses only)',
      '• Handles intermittent participation',
    ],
    image: 'presentation-plots/skill_wager.png',
  },

  /* ── 8  ARCHITECTURE ── */
  {
    id: 'architecture',
    type: 'split',
    title: 'Architecture',
    leftBullets: [
      '• Environment: DGPs (exogenous / endogenous)',
      '• Agents: honest, noisy, adversarial',
      '• Platform: deterministic core mechanism',
      '• Agents output (participate, report, deposit)',
      '• Core consumes without knowing motives',
      '• 20+ invariant tests',
    ],
    image: 'presentation-plots/parameter_sweep.png',
  },

  /* ── 9  CORRECTNESS ── */
  {
    id: 'correctness',
    type: 'split',
    title: 'Correctness',
    leftBullets: [
      '• Budget gap: 2.84 × 10⁻¹⁴',
      '• Mean profit: 3.01 × 10⁻¹⁷ (zero-sum)',
      '• Sybil ratio (identical): 1.000000',
      '• Noise-skill correlation: −0.98',
      '✓ All 20+ tests PASS (both modes)',
    ],
    image: 'presentation-plots/settlement_sanity.png',
  },

  /* ── 10  DEPOSIT DESIGN ── */
  {
    id: 'deposit-design',
    type: 'split',
    title: 'Deposit Design',
    leftBullets: [
      '• Random (IID Exp): 0.0456',
      '• Fixed (b=1):      0.0423',
      '• Bankroll+Conf:    0.0375  (−11%)',
      '• Oracle:           0.0227  (−46%)',
      '→ How stake enters > weighting rule',
    ],
    image: 'presentation-plots/deposit_policy_comparison.png',
    highlight: 'Deposit design is the strongest lever',
  },

  /* ── 11  WEIGHT RULES ── */
  {
    id: 'weight-rules',
    type: 'split',
    title: 'Weight Rules',
    leftBullets: [
      'Fixed deposits:',
      '• Uniform:     0.0434',
      '• Skill-only:  0.0419  (−3.5%)',
      'Bankroll deposits:',
      '• Deposit-only: 0.0230',
      '→ Equal weights remain a strong baseline',
    ],
    image: 'presentation-plots/weight_rule_comparison.png',
  },

  /* ── 12  SKILL RECOVERY ── */
  {
    id: 'skill-recovery',
    type: 'split',
    title: 'Skill Recovery',
    leftBullets: [
      '• 6 forecasters, T=20000, 20 seeds',
      '• Least noisy (τ=0.15): σ = 0.959',
      '• Most noisy (τ=1.00): σ = 0.820',
      '• Spearman rank correlation = 1.0000',
      '→ Staleness decay prevents gaming',
    ],
    image: 'presentation-plots/quantiles_crps_recovery.png',
  },

  /* ── 13  STRATEGIC ROBUSTNESS ── */
  {
    id: 'strategic',
    type: 'split',
    title: 'Strategic Robustness',
    leftBullets: [
      '• Sybil (identical): ratio = 1.000000',
      '• Sybil (diversified): ratio = 1.065',
      '• Arbitrage: zero profit (all λ)',
      '→ Resists standard attacks',
      '⚠ Adaptive adversaries remain open',
    ],
    image: 'presentation-plots/sybil.png',
  },

  /* ── 14  CONTRIBUTIONS ── */
  {
    id: 'contributions',
    type: 'content',
    title: 'Contributions & Limitations',
    bullets: [
      '1. Mechanism coupling wagering + online skill learning',
      '2. Budget balance < 10⁻¹⁴; sybilproof (identical reports)',
      '3. Deposit design: strongest lever (−11% CRPS)',
      '4. Skill recovery: Spearman = 1.0000',
      '5. Sybil-resistant; no arbitrage profit in practice',
      '6. Modular platform (onlinev2) + test suite + dashboard',
      '',
      'Limitations:',
      '• Tail calibration ~5pp (quantile averaging)',
      '• Equal weights competitive in some settings',
      '• Truthfulness under risk neutrality only',
      '• All synthetic data',
    ],
  },

  /* ── 15  CLOSING ── */
  {
    id: 'closing',
    type: 'closing',
    title: 'Thank you',
    subtitle: 'Anastasia Cattaneo\nImperial College London\n2025',
    dark: true,
  },
];

/* ─── Shared style helpers ───────────────────────────────────── */

/** Accent bar under slide titles: 3px tall, 80px wide, Imperial cyan */
function AccentBar() {
  return (
    <div
      style={{
        width: 80,
        height: 3,
        background: C.accent,
        borderRadius: 2,
        marginTop: 12,
      }}
    />
  );
}

/** Footer on content slides */
function SlideFooter() {
  return (
    <div
      style={{
        flexShrink: 0,
        paddingTop: 16,
        fontSize: '0.85rem',
        color: '#999',
        textAlign: 'center',
      }}
    >
      Anastasia Cattaneo — Imperial College London
    </div>
  );
}

/** Blue-tinted highlight bar below split content */
function HighlightBar({ text }: { text: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: 16,
        background: 'rgba(0, 145, 213, 0.08)',
        border: '1px solid rgba(0, 145, 213, 0.25)',
        color: C.navy,
        fontSize: '1.35rem',
        fontWeight: 700,
        padding: '0.85rem 1.5rem',
        borderRadius: 12,
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
}

/** Per-bullet inline style */
function bulletStyle(item: string): React.CSSProperties {
  if (item === '') return { height: '0.5rem' };
  if (item.startsWith('⚠')) return { color: '#dc2626', fontWeight: 600 };
  if (item.startsWith('→')) return { color: '#16a34a', fontWeight: 700 };
  if (item.startsWith('✓')) return { color: '#16a34a', fontWeight: 700 };
  if (item.startsWith('•')) return { paddingLeft: '0.5rem' };
  if (/^\d\./.test(item)) return { fontWeight: 600 };
  return {};
}

/** Dark gradient used by title, gap, and closing slides */
const darkGradient = `linear-gradient(135deg, ${C.navy} 0%, ${C.dark} 100%)`;

/* ─── Slide renderers ────────────────────────────────────────── */

/** Slide 1 — Title (dark, centered) */
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
          fontSize: '4rem',
          fontWeight: 700,
          color: C.white,
          lineHeight: 1.1,
          maxWidth: '1100px',
          whiteSpace: 'pre-line',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            marginTop: 32,
            fontSize: '2rem',
            color: C.accent,
            lineHeight: 1.4,
            maxWidth: '900px',
          }}
        >
          {slide.subtitle}
        </p>
      )}
      <div
        style={{
          marginTop: 64,
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        Anastasia Cattaneo · Imperial College London · 2025
      </div>
    </div>
  );
}

/** Slide 5 — Section / gap divider (dark, centered) */
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
          fontSize: '3rem',
          fontWeight: 700,
          color: C.white,
          lineHeight: 1.25,
          maxWidth: '1000px',
          whiteSpace: 'pre-line',
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            marginTop: 40,
            fontSize: '1.8rem',
            color: C.accent,
            lineHeight: 1.5,
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

/** Slide 4 — 3-column layout (no graph, full width) */
function ColumnsSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
        background: C.white,
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <h2
          style={{
            fontSize: '2.6rem',
            fontWeight: 700,
            color: C.navy,
            lineHeight: 1.15,
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>

      {/* Columns */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 28,
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        {slide.columns?.map((col) => (
          <div
            key={col.heading}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              padding: '24px 20px',
              background: C.lightGrey,
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: C.accent,
                lineHeight: 1.3,
                marginBottom: 16,
              }}
            >
              {col.heading}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {col.items.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '1.3rem',
                    lineHeight: 1.55,
                    color: C.dark,
                    marginBottom: 8,
                    ...bulletStyle(item),
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SlideFooter />
    </div>
  );
}

/** Slide 14 — Content (text only, full width, centered) */
function ContentSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 64px',
        background: C.white,
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 32, width: '100%', maxWidth: 960 }}>
        <h2
          style={{
            fontSize: '2.6rem',
            fontWeight: 700,
            color: C.navy,
            lineHeight: 1.2,
          }}
        >
          {slide.title}
        </h2>
        <AccentBar />
      </div>

      {/* Bullets */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 960,
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {slide.bullets?.map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: '1.5rem',
                lineHeight: 1.6,
                color: C.dark,
                marginBottom: 6,
                ...bulletStyle(item),
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <SlideFooter />
    </div>
  );
}

/** Split slides — 45% text left, 55% graph right */
function SplitSlideView({ slide }: { slide: SlideData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
        background: C.white,
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 20 }}>
        <h2
          style={{
            fontSize: '2.6rem',
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
          gap: 32,
          minHeight: 0,
        }}
      >
        {/* Left — text (45%) */}
        <div
          style={{
            width: '45%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {slide.leftBullets?.map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: '1.5rem',
                  lineHeight: 1.55,
                  color: C.dark,
                  marginBottom: 8,
                  ...bulletStyle(item),
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — graph (55%) */}
        <div
          style={{
            width: '55%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {slide.image && (
            <img
              src={`${BASE}${slide.image}`}
              alt={slide.title ?? 'Slide image'}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              }}
            />
          )}
        </div>
      </div>

      {slide.highlight && <HighlightBar text={slide.highlight} />}
      <SlideFooter />
    </div>
  );
}

/** Slide 15 — Closing (dark, centered) */
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
          fontSize: '4rem',
          fontWeight: 700,
          color: C.white,
        }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p
          style={{
            marginTop: 40,
            fontSize: '1.8rem',
            color: C.accent,
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

/** Dispatch to the correct renderer by slide type */
function SlideRenderer({ slide }: { slide: SlideData }) {
  switch (slide.type) {
    case 'title':
      return <TitleSlideView slide={slide} />;
    case 'section':
      return <SectionSlideView slide={slide} />;
    case 'content':
      return <ContentSlideView slide={slide} />;
    case 'columns':
      return <ColumnsSlideView slide={slide} />;
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
        background: '#000',
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
          animation: 'slideFadeIn 0.3s ease',
        }}
      >
        <SlideRenderer slide={slide} />
      </div>

      {/* CSS keyframe for fade (injected once) */}
      <style>{`
        @keyframes slideFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Bottom navigation bar — semi-transparent, auto-hides */}
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
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
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
            color: current === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
            cursor: current === 0 ? 'default' : 'pointer',
            padding: '4px 16px',
            fontFamily: FONT_FAMILY,
          }}
        >
          ← Prev
        </button>
        <span
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.95rem',
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
            color: current === total - 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
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
