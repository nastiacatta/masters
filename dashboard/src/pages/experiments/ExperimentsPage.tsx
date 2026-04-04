import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { ExperimentMeta } from '@/lib/types';
import ExperimentCard from '@/components/dashboard/ExperimentCard';

const BLOCK_FILTERS = ['all', 'core', 'behaviour', 'experiments'] as const;
type BlockFilter = (typeof BLOCK_FILTERS)[number];

function filterExperiments(
  experiments: ExperimentMeta[],
  block: BlockFilter,
  query: string,
): ExperimentMeta[] {
  let filtered = experiments;
  if (block !== 'all') {
    filtered = filtered.filter((e) => e.block === block);
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.displayName ?? '').toLowerCase().includes(q) ||
        (e.description ?? '').toLowerCase().includes(q),
    );
  }
  return filtered;
}

export default function ExperimentsPage() {
  const { experiments } = useStore();
  const [blockFilter, setBlockFilter] = useState<BlockFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(
    () => filterExperiments(experiments, blockFilter, searchQuery),
    [experiments, blockFilter, searchQuery],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-900">Experiments</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Browse all experiments. Filter by block or search by name.
        </p>
      </div>

      {/* Filter controls */}
      <div className="px-4 pt-3 pb-2 space-y-2">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {BLOCK_FILTERS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBlockFilter(b)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                blockFilter === b
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800',
              )}
            >
              {b === 'all' ? 'All' : b}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search experiments…"
          className="w-full max-w-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
        />
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-500">
            No experiments match your filters.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((exp) => (
                <ExperimentCard key={exp.name} experiment={exp} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
