import { NavLink } from 'react-router-dom';
import { useStore } from '@/lib/store';
import clsx from 'clsx';

const CORE_ROUTES = [
  { to: '/core', label: 'Overview', end: true },
  { to: '/core/timeline', label: 'Round timeline', end: false },
  { to: '/core/effective-wager', label: 'Effective wager', end: false },
  { to: '/core/aggregation', label: 'Aggregation', end: false },
  { to: '/core/settlement', label: 'Settlement', end: false },
  { to: '/core/skill', label: 'Skill update', end: false },
  { to: '/core/invariants', label: 'Invariants', end: false },
];

const BEHAVIOUR_ROUTES = [
  { to: '/behaviour', label: 'Generator overview', end: true },
  { to: '/behaviour/families', label: 'Behaviour families', end: false },
];

export default function Sidebar() {
  const { experiments, selectedExperiment, setSelectedExperiment, blockFilter, setBlockFilter } = useStore();

  const filtered = blockFilter === 'all' ? experiments : experiments.filter((e) => e.block === blockFilter);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="px-5 py-5 border-b border-slate-200">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">onlinev2</h1>
        <p className="text-xs text-slate-400 mt-0.5">Research Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* Block 1: Core mechanism */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Core mechanism
          </p>
          <div className="space-y-0.5">
            {CORE_ROUTES.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Block 2: User behaviour */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            User behaviour
          </p>
          <div className="space-y-0.5">
            {BEHAVIOUR_ROUTES.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-amber-50 text-amber-800 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Validation layer */}
        <div className="pt-2 border-t border-slate-200">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Validation
          </p>
          <NavLink
            to="/validation"
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
              )
            }
          >
            Results & experiments
          </NavLink>
        </div>

        {/* Experiment selector (for Validation and context) */}
        <div className="pt-2 border-t border-slate-200">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Block
          </p>
          <div className="flex flex-wrap gap-1 px-2 mb-2">
            {(['all', 'core', 'behaviour', 'experiments'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBlockFilter(b)}
                className={clsx(
                  'px-2 py-1 rounded text-xs transition-colors',
                  blockFilter === b ? 'bg-slate-200 text-slate-800 font-medium' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {b === 'all' ? 'All' : b.charAt(0).toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Experiment
          </p>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {filtered.map((exp) => (
              <button
                key={exp.name}
                onClick={() => setSelectedExperiment(exp)}
                className={clsx(
                  'w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors truncate',
                  selectedExperiment?.name === exp.name ? 'bg-slate-100 text-slate-800 font-medium' : 'text-slate-600 hover:bg-slate-50'
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
