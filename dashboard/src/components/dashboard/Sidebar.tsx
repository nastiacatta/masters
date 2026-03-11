import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const TOP_LEVEL_ROUTES = [
  { to: '/overview', label: 'Overview', end: true },
  { to: '/mechanism-explorer', label: 'Mechanism explorer', end: true },
  { to: '/experiments', label: 'Experiments', end: true },
  { to: '/comparison', label: 'Comparison', end: true },
  { to: '/appendix', label: 'Appendix', end: true },
] as const;

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="px-4 py-5 border-b border-slate-200">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          Adaptive skill & stake
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Thesis demonstrator
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {TOP_LEVEL_ROUTES.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-200 text-[10px] text-slate-400">
        Thesis demonstrator · read-only
      </div>
    </aside>
  );
}
