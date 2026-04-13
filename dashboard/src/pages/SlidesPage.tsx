import { useState, useRef, useCallback, useEffect } from 'react';
import PasswordGate from '../components/slides/PasswordGate';
import TitleSlide from '../components/slides/TitleSlide';
import DataOverviewSlide from '../components/slides/DataOverviewSlide';
import ForecasterSlide, { FORECASTERS } from '../components/slides/ForecasterSlide';
import ResultsSlide from '../components/slides/ResultsSlide';
import DgpSummarySlide from '../components/slides/comparison/DgpSummarySlide';
import MechanismImprovementSlide from '../components/slides/comparison/MechanismImprovementSlide';
import BestSingleAnomalySlide from '../components/slides/comparison/BestSingleAnomalySlide';
import TheoryValidationSlide from '../components/slides/comparison/TheoryValidationSlide';
import WindExtendedSlide from '../components/slides/comparison/WindExtendedSlide';
import KeyFindingsSlide from '../components/slides/KeyFindingsSlide';

/* ── Slide index definition ─────────────────────────────────── */

interface SlideEntry {
  id: string;
  label: string;
  group: string;
}

const SLIDE_INDEX: SlideEntry[] = [
  { id: 'title', label: 'Title', group: 'Introduction' },
  { id: 'data-overview', label: 'Data Overview', group: 'Introduction' },
  ...FORECASTERS.map((f, i) => ({
    id: `forecaster-${i}`,
    label: f.name,
    group: 'Forecasters',
  })),
  { id: 'results-electricity', label: 'Electricity Results', group: 'Real-Data Results' },
  { id: 'results-wind', label: 'Wind Results', group: 'Real-Data Results' },
  { id: 'dgp-summary', label: 'DGP vs Real-Data', group: 'DGP Comparison' },
  { id: 'mechanism-improvement', label: 'Mechanism Improvement', group: 'DGP Comparison' },
  { id: 'best-single-anomaly', label: 'Best-Single Anomaly', group: 'DGP Comparison' },
  { id: 'theory-validation', label: 'Theory Validation', group: 'DGP Comparison' },
  { id: 'wind-extended', label: 'Wind Extended', group: 'DGP Comparison' },
  { id: 'key-findings', label: 'Key Findings', group: 'Conclusion' },
];

const GROUPS = [...new Set(SLIDE_INDEX.map((s) => s.group))];

/* ── Component ──────────────────────────────────────────────── */

export default function SlidesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalSlides = SLIDE_INDEX.length;

  const scrollToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, totalSlides - 1));
    slideRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSlide(clamped);
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        scrollToSlide(activeSlide + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToSlide(activeSlide - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeSlide, scrollToSlide]);

  // Intersection observer to track active slide on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx >= 0) setActiveSlide(idx);
          }
        }
      },
      { threshold: 0.5 },
    );
    for (const ref of slideRefs.current) {
      if (ref) observer.observe(ref);
    }
    return () => observer.disconnect();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  // Click on slide area advances to next
  const handleSlideClick = () => {
    scrollToSlide(activeSlide + 1);
  };

  let slideIdx = 0;
  const refFor = () => {
    const i = slideIdx++;
    return (el: HTMLDivElement | null) => { slideRefs.current[i] = el; };
  };

  return (
    <div className="flex h-full">
      {/* ── Sidebar index ── */}
      <nav className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-slate-50 overflow-y-auto py-6 px-3">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
          Slides
        </p>
        {GROUPS.map((group) => (
          <div key={group} className="mb-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {group}
            </p>
            {SLIDE_INDEX.filter((s) => s.group === group).map((slide) => {
              const globalIdx = SLIDE_INDEX.indexOf(slide);
              const isActive = globalIdx === activeSlide;
              return (
                <button
                  key={slide.id}
                  onClick={() => scrollToSlide(globalIdx)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors truncate ${
                    isActive
                      ? 'bg-teal-100 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {slide.label}
                </button>
              );
            })}
          </div>
        ))}
        {/* Slide counter */}
        <div className="mt-auto px-3 pt-4 border-t border-slate-200">
          <p className="text-[10px] text-slate-400">
            {activeSlide + 1} / {totalSlides}
          </p>
        </div>
      </nav>

      {/* ── Slide area ── */}
      <div
        ref={containerRef}
        className="flex-1 h-full overflow-y-auto scroll-smooth"
        onClick={handleSlideClick}
      >
        <div className="space-y-6 px-8 py-8 max-w-6xl mx-auto">
          <div ref={refFor()} id="title"><TitleSlide /></div>
          <div ref={refFor()} id="data-overview"><DataOverviewSlide /></div>
          {FORECASTERS.map((f, i) => (
            <div ref={refFor()} id={`forecaster-${i}`} key={f.name}>
              <ForecasterSlide {...f} />
            </div>
          ))}
          <div ref={refFor()} id="results-electricity">
            <ResultsSlide
              title="Elia Electricity — Performance"
              dataPath="data/real_data/elia_electricity/data/comparison.json"
            />
          </div>
          <div ref={refFor()} id="results-wind">
            <ResultsSlide
              title="Elia Wind — Performance"
              dataPath="data/real_data/elia_wind/data/comparison.json"
            />
          </div>
          <div ref={refFor()} id="dgp-summary"><DgpSummarySlide /></div>
          <div ref={refFor()} id="mechanism-improvement"><MechanismImprovementSlide /></div>
          <div ref={refFor()} id="best-single-anomaly"><BestSingleAnomalySlide /></div>
          <div ref={refFor()} id="theory-validation"><TheoryValidationSlide /></div>
          <div ref={refFor()} id="wind-extended"><WindExtendedSlide /></div>
          <div ref={refFor()} id="key-findings"><KeyFindingsSlide /></div>
        </div>
      </div>
    </div>
  );
}
