import { useState } from 'react';
import { useStore } from '@/lib/store';
import Overview from '@/pages/Overview';
import RoundReplay from '@/pages/RoundReplay';
import Diagnostics from '@/pages/Diagnostics';
import Invariants from '@/pages/core/Invariants';
import ExperimentContext from '@/components/dashboard/ExperimentContext';

const TABS = [
  { id: 'overview', label: 'Main result' },
  { id: 'replay', label: 'One round' },
  { id: 'robustness', label: 'Robustness' },
] as const;

export default function Validation() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview');
  const { selectedExperiment } = useStore();

  return (
    <div className="space-y-4 p-6">
      {selectedExperiment && (
        <ExperimentContext experiment={selectedExperiment} className="mb-2" />
      )}
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'replay' && <RoundReplay />}
      {tab === 'robustness' && (
        <div className="space-y-6">
          <Diagnostics />
          <Invariants />
        </div>
      )}
    </div>
  );
}
