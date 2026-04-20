import { type ReactNode, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InfoToggle, { type InfoToggleContent } from '@/components/dashboard/InfoToggle';
import ProvenanceBadge from '@/components/dashboard/ProvenanceBadge';
import { useFigureNumber } from '@/hooks/useSequentialNumber';
import { generateCSV, downloadCSV, sanitiseFilename } from '@/lib/csv';
import { VERDICT_COLOURS } from '@/lib/palette';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface KeyInsight {
  /** ≤ 12 words */
  headline: string;
  /** e.g. "−34% CRPS" */
  statistic: string;
  /** One sentence */
  interpretation: string;
  /** How the insight was computed (shown on hover) */
  derivation?: string;
  direction: 'improvement' | 'degradation' | 'neutral';
}

export interface DataProvenance {
  type: 'real' | 'synthetic' | 'demo';
  label: string;
}

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  /** Optional chart-specific help; renders an info icon next to the title */
  help?: InfoToggleContent;
  children: ReactNode;
  className?: string;
  /* ── NEW props ─────────────────────────────────────────────────── */
  /** Figure caption text */
  caption?: string;
  /** Key insight card rendered adjacent to chart */
  insight?: KeyInsight;
  /** Data source badge */
  provenance?: DataProvenance;
  /** Data for CSV export */
  csvData?: Record<string, unknown>[];
  /** Override auto-generated CSV filename */
  csvFilename?: string;
  /** Screen reader summary */
  ariaDescription?: string;
  /** For aria-label: "Line chart", "Bar chart", etc. */
  chartType?: string;
  /** Auto-generated interpretation text */
  interpretation?: string;
}

/* ── Direction → verdict colour mapping ────────────────────────────── */

const DIRECTION_COLOUR: Record<KeyInsight['direction'], keyof typeof VERDICT_COLOURS> = {
  improvement: 'good',
  degradation: 'bad',
  neutral: 'neutral',
};

/* ── Expand SVG icon (shared) ──────────────────────────────────────── */

function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M13 3a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V4.414l-4.293 4.293a1 1 0 01-1.414-1.414L15.586 3H14a1 1 0 01-1-1zM3 13a1 1 0 011 1v1.586l4.293-4.293a1 1 0 111.414 1.414L5.414 17H7a1 1 0 110 2H3a1 1 0 01-1-1v-4a1 1 0 011-1z" />
    </svg>
  );
}

/* ── CSV download SVG icon ─────────────────────────────────────────── */

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  );
}

/* ── Key Insight Card ──────────────────────────────────────────────── */

function KeyInsightCard({ insight }: { insight: KeyInsight }) {
  const verdict = VERDICT_COLOURS[DIRECTION_COLOUR[insight.direction]];

  return (
    <div
      className="rounded-lg p-3"
      style={{
        borderLeft: `3px solid ${verdict.border}`,
        backgroundColor: verdict.bg,
      }}
    >
      <p className="font-semibold text-slate-800" style={{ fontSize: '14px', lineHeight: '20px' }}>
        {insight.headline}
      </p>
      <p
        className="font-bold font-mono mt-1"
        style={{ fontSize: '20px', lineHeight: '28px', color: verdict.fg }}
      >
        {insight.statistic}
      </p>
      <p className="text-slate-600 mt-1" style={{ fontSize: '12px', lineHeight: '16px' }}>
        {insight.interpretation}
      </p>
      {insight.derivation && (
        <p
          className="text-slate-400 mt-1 cursor-help"
          style={{ fontSize: '11px', lineHeight: '16px' }}
          title={insight.derivation}
        >
          ℹ Hover for derivation
        </p>
      )}
    </div>
  );
}

/* ── Figure footer (number + caption + interpretation) ─────────────── */

function FigureFooter({
  figureNumber,
  caption,
  interpretation,
}: {
  figureNumber: number;
  caption?: string;
  interpretation?: string;
}) {
  return (
    <div className="mt-2">
      <p className="font-semibold text-slate-600" style={{ fontSize: '11px', lineHeight: '16px' }}>
        Figure {figureNumber}
      </p>
      {caption && (
        <p className="text-slate-500 font-normal" style={{ fontSize: '11px', lineHeight: '16px' }}>
          {caption}
        </p>
      )}
      {interpretation && (
        <p className="text-slate-600 italic mt-0.5" style={{ fontSize: '12px', lineHeight: '16px' }}>
          {interpretation}
        </p>
      )}
    </div>
  );
}

/* ── Expand Modal ──────────────────────────────────────────────────── */

function ExpandModal({
  title,
  children,
  onClose,
  figureNumber,
  caption,
  interpretation,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  figureNumber: number;
  caption?: string;
  interpretation?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none px-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5" style={{ minHeight: '70vh' }}>
          {children}
          <FigureFooter
            figureNumber={figureNumber}
            caption={caption}
            interpretation={interpretation}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── ChartCard ─────────────────────────────────────────────────────── */

export default function ChartCard({
  title,
  subtitle,
  help,
  children,
  className = '',
  caption,
  insight,
  provenance,
  csvData,
  csvFilename,
  ariaDescription,
  chartType,
  interpretation,
}: ChartCardProps) {
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setExpanded(false), []);
  const figureNumber = useFigureNumber();

  const ariaLabel = chartType ? `${chartType}: ${title}` : title;
  const hasCsvData = csvData && csvData.length > 0;

  const handleDownloadCSV = useCallback(() => {
    if (!csvData || csvData.length === 0) return;
    const csv = generateCSV(csvData);
    const filename = csvFilename ?? sanitiseFilename(title);
    downloadCSV(csv, filename);
  }, [csvData, csvFilename, title]);

  return (
    <>
      <div
        className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}
        aria-label={ariaLabel}
      >
        {/* Header area */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {provenance && <ProvenanceBadge type={provenance.type} label={provenance.label} />}
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {help && <InfoToggle {...help} />}

            {/* CSV download button */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={!hasCsvData}
              className="ml-auto text-slate-400 hover:text-slate-700 transition-colors text-xs px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Download CSV"
              title={hasCsvData ? 'Download CSV' : 'No data available'}
              style={{ minWidth: '32px', minHeight: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <DownloadIcon />
            </button>

            {/* Expand button */}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors text-xs px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-300"
              aria-label="Expand chart to fullscreen"
              title="Expand to fullscreen"
              style={{ minWidth: '32px', minHeight: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ExpandIcon />
            </button>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Chart content area — with optional insight 70/30 split */}
        {insight ? (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0 lg:w-[70%]" role="img" aria-label={ariaLabel}>
              {children}
            </div>
            <div className="lg:w-[30%] flex-shrink-0">
              <KeyInsightCard insight={insight} />
            </div>
          </div>
        ) : (
          <div role="img" aria-label={ariaLabel}>
            {children}
          </div>
        )}

        {/* Screen reader summary */}
        {ariaDescription && (
          <p className="sr-only">{ariaDescription}</p>
        )}

        {/* Figure footer */}
        <FigureFooter
          figureNumber={figureNumber}
          caption={caption}
          interpretation={interpretation}
        />
      </div>

      {expanded && (
        <ExpandModal
          title={title}
          onClose={close}
          figureNumber={figureNumber}
          caption={caption}
          interpretation={interpretation}
        >
          {children}
        </ExpandModal>
      )}
    </>
  );
}
