import { useState } from 'react';
import Overview from '@/pages/Overview';
import RoundReplay from '@/pages/RoundReplay';
import Behaviour from '@/pages/Behaviour';
import Diagnostics from '@/pages/Diagnostics';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'replay', label: 'Round Replay' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'diagnostics', label: 'Diagnostics' },
];

export default function Validation() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4 w-fit">
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
