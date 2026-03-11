import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const DGP_ROUTES = [
  { to: '/dgp', label: 'Overview', end: true },
  { to: '/dgp/experiments', label: 'Experiments', end: false },
];

const CORE_ROUTES = [
  { to: '/core', label: 'Overview', end: true },
  { to: '/core/timeline', label: 'Round timeline', end: false },
  { to: '/core/effective-wager', label: 'Effective wager', end: false },
  { to: '/core/aggregation', label: 'Aggregation', end: false },
  { to: '/core/settlement', label: 'Settlement', end: false },
  { to: '/core/skill', label: 'Skill update', end: false },
  { to: '/core/invariants', label: 'Invariants', end: false },
  { to: '/core/experiments', label: 'Experiments', end: false },
];

const BEHAVIOUR_ROUTES = [
  { to: '/behaviours', label: 'Overview', end: true },
  { to: '/behaviours/families', label: 'Families', end: false },
  { to: '/behaviours/experiments', label: 'Experiments', end: false },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="px-4 py-5 border-b border-slate-200">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          Adaptive skill & stake
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Forecast-trading prototype
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            clsx(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
            )
          }
        >
          Pipeline overview
        </NavLink>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            DGP
          </p>
          <div className="space-y-0.5">
            {DGP_ROUTES.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Core
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
                    isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Behaviours
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
                    isActive ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-4 py-3 border-t border-slate-200 text-[10px] text-slate-400">
        Thesis demonstrator · read-only
      </div>
    </aside>
  );
}
