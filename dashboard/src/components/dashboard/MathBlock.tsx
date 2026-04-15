import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useEquationNumber } from '@/hooks/useSequentialNumber';

interface VariableLegendEntry {
  symbol: string;
  meaning: string;
}

interface MathBlockProps {
  /** LaTeX equation to render. Use this for proper math typesetting. */
  latex?: string;
  /** Inline math (span) instead of display block; use inside paragraphs */
  inline?: boolean;
  /** Fallback: plain text / Unicode when latex is not provided */
  children?: React.ReactNode;
  /** Optional label above (e.g. "Effective wager") */
  label?: string;
  /** Optional small caption below */
  caption?: string;
  className?: string;
  /** Highlight as key design choice */
  accent?: boolean;
  /** Plain-English explanation of the formula */
  explanation?: string;
  /** Variable legend entries */
  variables?: VariableLegendEntry[];
  /** Auto-applies accent + triggers explanation/legend rendering */
  isCritical?: boolean;
}

export default function MathBlock({
  latex,
  inline,
  children,
  label,
  caption,
  className,
  accent,
  explanation,
  variables,
  isCritical,
}: MathBlockProps) {
  const containerRef = useRef<HTMLDivElement | HTMLSpanElement>(null);
  const eqNum = useEquationNumber();

  // isCritical auto-applies accent styling
  const showAccent = accent || isCritical;

  useEffect(() => {
    if (latex != null && latex !== '' && containerRef.current) {
      try {
        katex.render(latex, containerRef.current, { displayMode: !inline, throwOnError: false });
      } catch {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, inline]);

  // Inline formulas: no equation number, no explanation/legend
  if (inline && latex != null && latex !== '') {
    return <span ref={containerRef as React.RefObject<HTMLSpanElement>} className={clsx('katex-inline', className)} />;
  }

  // Whether to show explanation and variable legend (only when isCritical)
  const showDetails = isCritical && (explanation || (variables && variables.length > 0));

  return (
    <div
      className={clsx(
        'text-center',
        showAccent
          ? 'rounded-xl border border-blue-300 bg-blue-50/50 text-slate-800 px-4 py-3'
          : '',
        className
      )}
    >
      {label && (
        <p className="text-[11px] font-sans font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </p>
      )}

      {/* Formula row with equation number */}
      <div className="flex items-center">
        <div className="flex-1 min-w-0">
          {latex != null && latex !== '' ? (
            <div ref={containerRef as React.RefObject<HTMLDivElement>} className="katex-block text-sm min-h-[1.5em]" />
          ) : (
            <div className="font-mono text-sm break-all">{children}</div>
          )}
        </div>
        <span className="ml-2 shrink-0 text-[11px] font-sans font-medium text-slate-500">
          Eq.&nbsp;{eqNum}
        </span>
      </div>

      {caption && (
        <p className="text-xs font-sans text-slate-500 mt-1.5">{caption}</p>
      )}

      {/* Explanation and variable legend for critical formulas */}
      {showDetails && (
        <div className="mt-2 text-left">
          {explanation && (
            <p className="text-[12px] leading-relaxed text-slate-600">
              {explanation}
            </p>
          )}
          {variables && variables.length > 0 && (
            <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
              {variables.map((v) => (
                <div key={v.symbol} className="contents">
                  <span className="text-[11px] font-mono text-slate-700 text-left">
                    {v.symbol}
                  </span>
                  <span className="text-[11px] font-sans text-slate-600 text-right">
                    {v.meaning}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
