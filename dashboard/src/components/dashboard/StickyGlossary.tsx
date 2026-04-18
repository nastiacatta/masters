import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY_ENTRIES } from '@/lib/tokens';

export default function StickyGlossary() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: press 'g' to toggle glossary (when not in an input)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'g') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus the search input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to let the panel animate in
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (prev) setFilter(''); // Clear filter on close
      return !prev;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!filter.trim()) return GLOSSARY_ENTRIES;
    const q = filter.toLowerCase();
    return GLOSSARY_ENTRIES.filter(
      (e) =>
        e.symbol.toLowerCase().includes(q) ||
        e.meaning.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-80 max-h-[70vh] rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-lg flex flex-col animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Glossary
            </h4>
            <button
              onClick={toggle}
              className="text-slate-400 hover:text-slate-600 text-sm leading-none"
              aria-label="Close glossary"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-2">
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search symbols..."
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
            />
          </div>

          {/* Entries */}
          <div className="overflow-y-auto px-4 pb-3 flex-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No matches</p>
            ) : (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                {filtered.map(({ symbol, meaning }) => (
                  <span key={symbol} className="contents">
                    <dt className="font-mono font-semibold text-slate-700">
                      {symbol}
                    </dt>
                    <dd className="text-slate-500 leading-snug">{meaning}</dd>
                  </span>
                ))}
              </dl>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-1.5 border-t border-slate-100 text-[10px] text-slate-400">
            Press <kbd className="font-mono bg-slate-50 border border-slate-200 rounded px-1">g</kbd> to toggle · <kbd className="font-mono bg-slate-50 border border-slate-200 rounded px-1">esc</kbd> to close
          </div>
        </div>
      )}
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-slate-800 text-white text-sm font-bold shadow-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
        title="Symbol glossary (g)"
      >
        Σ
      </button>
    </div>
  );
}
