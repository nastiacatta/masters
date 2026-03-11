import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaCardProps {
  title: string;
  /** LaTeX string for the formula (preferred — always use for math). */
  latex?: string;
  /** Plain-text fallback when latex is not provided. */
  formula?: string;
  caption: string;
}

export default function FormulaCard({ title, latex, formula, caption }: FormulaCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (latex != null && latex !== '' && containerRef.current) {
      try {
        katex.render(latex, containerRef.current, { displayMode: true, throwOnError: false });
      } catch {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex]);

  const hasLatex = latex != null && latex !== '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
      <div
        className={hasLatex
          ? 'rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 overflow-x-auto text-center min-h-[2.5rem] flex items-center justify-center'
          : ''
        }
      >
        {hasLatex ? (
          <div ref={containerRef} className="katex-block text-sm" />
        ) : (
          <code className="block rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 font-mono text-sm overflow-x-auto">
            {formula ?? ''}
          </code>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-2">{caption}</p>
    </div>
  );
}
