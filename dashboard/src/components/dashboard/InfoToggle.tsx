import { useState, useRef, useEffect } from 'react';
import MathBlock from '@/components/dashboard/MathBlock';

export interface InfoToggleContent {
  term: string;
  definition: string;
  interpretation: string;
  latex?: string;
  axes?: { x: string; y: string };
}

interface InfoToggleProps extends InfoToggleContent {}

export default function InfoToggle({
  term,
  definition,
  interpretation,
  latex,
  axes,
}: InfoToggleProps) {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        popRef.current?.contains(e.target as Node) ||
        btnRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
        title={`What is ${term}?`}
        aria-label={`Help: ${term}`}
      >
        <span className="text-[11px] font-bold">i</span>
      </button>
      {open && (
        <div
          ref={popRef}
          className="absolute left-0 top-full mt-1 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg p-4 animate-in fade-in slide-in-from-top-1"
          role="dialog"
          aria-label={`Definition: ${term}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h5 className="text-xs font-semibold text-slate-800">{term}</h5>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {latex && (
            <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 overflow-x-auto text-base [&_.katex]:text-[1.0625rem]">
              <MathBlock latex={latex} inline />
            </div>
          )}
          <p className="text-[11px] text-slate-600 leading-relaxed mb-1.5">
            <strong className="text-slate-700">Meaning:</strong> {definition}
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-1.5">
            <strong className="text-slate-700">Interpretation:</strong> {interpretation}
          </p>
          {axes && (
            <p className="text-[11px] text-slate-500">
              <strong className="text-slate-600">Axes:</strong> x = {axes.x}, y = {axes.y}
            </p>
          )}
        </div>
      )}
    </span>
  );
}
