import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const ROUTES = [
  { to: '/walkthrough', label: 'Walkthrough', end: true },
  { to: '/experiments', label: 'Experiments', end: true },
  { to: '/validation', label: 'Validation', end: true },
] as const;

export default function Sidebar() {
  return (
    <aside className="w-52 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="px-4 py-4 border-b border-slate-200">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
          Mechanism walkthrough
        </h1>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {ROUTES.map(({ to, label, end }) => (
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
    </aside>
  );
}
