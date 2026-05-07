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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-slate-300 transition-all duration-150">
      <div className="flex items-center gap-2 mb-2">
        <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-teal-500" />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div
        className={
          hasLatex
            ? 'rounded-lg bg-gradient-to-br from-slate-50 to-slate-50/40 border border-slate-200 px-4 py-4 overflow-x-auto text-center min-h-[2.75rem] flex items-center justify-center'
            : ''
        }
      >
        {hasLatex ? (
          <div ref={containerRef} className="katex-block text-sm" />
        ) : (
          <code className="block rounded-lg bg-gradient-to-br from-slate-50 to-slate-50/40 border border-slate-200 px-4 py-3 font-mono text-sm overflow-x-auto">
            {formula ?? ''}
          </code>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{caption}</p>
    </div>
  );
}
