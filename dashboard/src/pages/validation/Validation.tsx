import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import Overview from '@/pages/Overview';
import RoundReplay from '@/pages/RoundReplay';
import Behaviour from '@/pages/Behaviour';
import Diagnostics from '@/pages/Diagnostics';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'replay', label: 'Round Replay' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'diagnostics', label: 'Diagnostics' },
] as const;

export default function Validation() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview');
  const { selectedExperiment } = useStore();

  useEffect(() => {
    if (selectedExperiment?.block === 'behaviour') {
      setTab('behaviour');
    }
  }, [selectedExperiment?.name, selectedExperiment?.block]);

  return (
    <div className="space-y-4 p-6">
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
      {tab === 'behaviour' && <Behaviour />}
      {tab === 'diagnostics' && <Diagnostics />}
    </div>
  );
}
