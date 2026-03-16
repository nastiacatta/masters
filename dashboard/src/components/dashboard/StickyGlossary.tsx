import { useState } from 'react';
import { GLOSSARY_ENTRIES } from '@/lib/tokens';

export default function StickyGlossary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-72 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-lg p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Glossary</h4>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
            {GLOSSARY_ENTRIES.map(({ symbol, meaning }) => (
              <span key={symbol} className="contents">
                <dt className="font-mono font-semibold text-slate-700">{symbol}</dt>
                <dd className="text-slate-500 leading-snug">{meaning}</dd>
              </span>
            ))}
          </dl>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-slate-800 text-white text-sm font-bold shadow-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
        title="Symbol glossary"
      >
        Σ
      </button>
    </div>
  );
}
