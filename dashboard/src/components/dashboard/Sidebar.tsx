import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const ROUTES: { to: string; label: string; end: boolean; badge?: string }[] = [
  { to: '/lab', label: 'Lab', end: true },
  { to: '/walkthrough', label: 'Walkthrough', end: true },
  { to: '/experiments', label: 'Experiments', end: true },
  { to: '/validation', label: 'Validation', end: true },
];

export default function Sidebar() {
  return (
    <aside className="w-48 bg-slate-900 flex flex-col h-screen shrink-0">
      <div className="px-4 py-4 border-b border-slate-700/50">
        <h1 className="text-sm font-bold text-white tracking-tight">
          Wagering
        </h1>
        <p className="text-[10px] text-slate-400 mt-0.5">Mechanism explorer</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {ROUTES.map(({ to, label, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-600/20 text-teal-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )
            }
          >
            <span>{label}</span>
            {badge && (
              <span className="text-[9px] font-bold uppercase bg-teal-600 text-white px-1.5 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700/50">
        <p className="text-[9px] text-slate-500 leading-relaxed">
          Interactive simulation lab for wagering-based forecast aggregation mechanisms.
        </p>
      </div>
    </aside>
  );
}
