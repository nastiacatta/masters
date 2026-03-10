import { NavLink } from 'react-router-dom';
import { useStore } from '@/lib/store';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Overview', icon: '◉' },
  { to: '/replay', label: 'Round Replay', icon: '▶' },
  { to: '/behaviour', label: 'Behaviour', icon: '⟐' },
  { to: '/diagnostics', label: 'Diagnostics', icon: '⊞' },
];

export default function Sidebar() {
  const { experiments, selectedExperiment, setSelectedExperiment, blockFilter, setBlockFilter } = useStore();

  const filtered = blockFilter === 'all' ? experiments : experiments.filter(e => e.block === blockFilter);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="px-5 py-5 border-b border-slate-200">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">onlinev2</h1>
        <p className="text-xs text-slate-400 mt-0.5">Research Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Pages</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <span className="text-xs opacity-60">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Block</p>
          <div className="flex gap-1 px-2 mb-3">
            {(['all', 'core', 'behaviour', 'experiments'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBlockFilter(b)}
                className={clsx(
                  'px-2 py-1 rounded text-xs transition-colors',
                  blockFilter === b
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {b === 'all' ? 'All' : b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>

          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Experiment</p>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {filtered.map(exp => (
              <button
                key={exp.name}
                onClick={() => setSelectedExperiment(exp)}
                className={clsx(
                  'w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors truncate',
                  selectedExperiment?.name === exp.name
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
                title={exp.description}
              >
                {exp.displayName}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-5 py-3 border-t border-slate-200 text-[10px] text-slate-400">
        Thesis demonstrator · read-only
      </div>
    </aside>
  );
}
