import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useEffect, type FC } from 'react';
import { useCollapsibleSidebar } from '@/hooks/useCollapsibleSidebar';

/* ------------------------------------------------------------------ */
/*  NavItem type & route configuration                                 */
/* ------------------------------------------------------------------ */

interface NavItem {
  to: string;
  label: string;
  icon: FC<{ className?: string }>;
  /** Step number shown in collapsed mode (null = reference section) */
  step: number | null;
  /** Keyboard shortcut hint (e.g. "1", "2") */
  shortcut?: string;
}

/* 16×16 inline SVG icons — simple paths, no icon library */

const HomeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8.5L8 3L14 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 9.5V13.5H6.5V10.5H9.5V13.5H12.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CogIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.05 3.05L4.1 4.1M11.9 11.9L12.95 12.95M12.95 3.05L11.9 4.1M4.1 11.9L3.05 12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChartBarIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="6.5" y="5" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="2" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const BookIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 2.5H6C7.1 2.5 8 3.4 8 4.5V13.5C8 12.7 7.3 12 6.5 12H2.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13.5 2.5H10C8.9 2.5 8 3.4 8 4.5V13.5C8 12.7 8.7 12 9.5 12H13.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1.5L2.5 4V7.5C2.5 11 5 13.5 8 14.5C11 13.5 13.5 11 13.5 7.5V4L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 8L7.5 9.5L10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SlidesIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ClipboardIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 1.5H10.5C10.5 1.5 11 1.5 11 2V3.5H5V2C5 1.5 5.5 1.5 5.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M5.5 7H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.5 9.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Main nav — numbered steps + unnumbered reference pages */
const NAV_ITEMS: NavItem[] = [
  { to: '/',              label: 'Overview',       icon: HomeIcon,     step: 1, shortcut: '1' },
  { to: '/evidence',      label: 'Evidence',       icon: ChartBarIcon, step: 2, shortcut: '2' },
  { to: '/robustness',    label: 'Robustness',     icon: ShieldIcon,   step: 3, shortcut: '3' },
  { to: '/presentation',  label: 'Slides',         icon: SlidesIcon,   step: null, shortcut: 'p' },
  { to: '/notes',         label: 'Notes',          icon: BookIcon,     step: null, shortcut: 'n' },
  { to: '/explorer',      label: 'Explorer',       icon: CogIcon,      step: null, shortcut: 'e' },
  { to: '/audit',         label: 'Audit',          icon: ClipboardIcon, step: null, shortcut: 'a' },
];

/* ------------------------------------------------------------------ */
/*  Sidebar component                                                  */
/* ------------------------------------------------------------------ */

export default function Sidebar() {
  const {
    isCollapsed,
    isHoverExpanded,
    effectiveWidth,
    toggle,
    onMouseEnter,
    onMouseLeave,
  } = useCollapsibleSidebar();

  const thesis    = NAV_ITEMS.filter((n) => n.step != null);
  const reference = NAV_ITEMS.filter((n) => n.step == null);

  const showLabels = !isCollapsed || isHoverExpanded;

  // Keyboard shortcuts: press 1/2/3/n/e to navigate (only when no input focused)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const item = NAV_ITEMS.find((n) => n.shortcut === e.key);
      if (item) {
        // Use history.pushState via the hash router
        window.location.hash = `#${item.to}`;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside
      className="flex flex-col h-full shrink-0 overflow-hidden"
      style={{
        width: effectiveWidth,
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'var(--cream)',
        borderRight: '1px solid var(--border)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header — brand mark + toggle */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--border)', minHeight: 56 }}
      >
        {showLabels ? (
          <>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="font-semibold tracking-tight truncate"
                style={{
                  fontSize: 16,
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-serif)',
                  lineHeight: 1.15,
                }}
              >
                Skill &amp; Stake
              </div>
              <div
                className="truncate uppercase"
                style={{
                  fontSize: 10,
                  color: 'var(--ink-faint)',
                  letterSpacing: '0.14em',
                  marginTop: 3,
                }}
              >
                Master&rsquo;s project
              </div>
            </div>
            <button
              onClick={toggle}
              className="flex items-center justify-center rounded-md transition-colors duration-150 shrink-0"
              style={{
                minWidth: 28,
                minHeight: 28,
                width: 28,
                height: 28,
                color: 'var(--ink-faint)',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(15, 23, 42, 0.04)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--ink-faint)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <span className="text-[14px] leading-none font-mono">«</span>
            </button>
          </>
        ) : (
          <button
            onClick={toggle}
            className="flex items-center justify-center rounded-md transition-colors duration-150 mx-auto"
            style={{
              minWidth: 32,
              minHeight: 32,
              width: 32,
              height: 32,
              color: 'var(--ink-faint)',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(15, 23, 42, 0.04)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--ink-faint)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <span className="text-[14px] leading-none font-mono">»</span>
          </button>
        )}
      </div>

      {/* Navigation — grouped with subtle eyebrow labels */}
      <nav className="flex-1 px-2 pt-4 pb-3 overflow-y-auto">
        {showLabels && (
          <p
            className="px-3 mb-2 text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.16em', color: 'var(--ink-faint)' }}
          >
            Main
          </p>
        )}
        <ul className="space-y-0.5">
          {thesis.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} showLabel={showLabels} />
            </li>
          ))}
        </ul>

        {/* Subtle separator */}
        <div
          className="my-3 mx-3"
          style={{ borderTop: '1px solid var(--border)' }}
        />

        {showLabels && (
          <p
            className="px-3 mb-2 text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.16em', color: 'var(--ink-faint)' }}
          >
            Reference
          </p>
        )}
        <ul className="space-y-0.5">
          {reference.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} showLabel={showLabels} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer — shortcut hint when expanded */}
      {showLabels && (
        <div
          className="px-3 py-2 text-[10px] flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--ink-faint)' }}
        >
          <span className="flex items-center gap-1">
            <kbd
              className="font-mono rounded px-1 py-px"
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                color: 'var(--ink-soft)',
              }}
            >
              g
            </kbd>{' '}
            glossary
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className="font-mono rounded px-1 py-px"
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                color: 'var(--ink-soft)',
              }}
            >
              ?
            </kbd>{' '}
            keys
          </span>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual nav link                                                */
/* ------------------------------------------------------------------ */

function SidebarLink({ item, showLabel }: { item: NavItem; showLabel: boolean }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={showLabel ? undefined : `${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center rounded-md font-medium transition-colors duration-150',
          showLabel ? 'gap-2.5 px-3 py-2' : 'justify-center px-1 py-2',
          isActive && 'shadow-sm',
        )
      }
      style={({ isActive }: { isActive: boolean }) => ({
        background: isActive ? 'var(--navy)' : 'transparent',
        color: isActive ? '#fbf9f4' : 'var(--ink-soft)',
        fontSize: 14,
      })}
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (el.getAttribute('aria-current') !== 'page') {
          el.style.background = 'rgba(15, 23, 42, 0.04)';
          el.style.color = 'var(--ink)';
        }
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLElement;
        if (el.getAttribute('aria-current') !== 'page') {
          el.style.background = 'transparent';
          el.style.color = 'var(--ink-soft)';
        }
      }}
    >
      {({ isActive }) => (
        <>
          {/* Step number (numbered pages) or icon (reference pages) */}
          {item.step != null ? (
            <span
              className="rounded-full flex items-center justify-center font-semibold shrink-0 transition-colors"
              style={{
                width: 22,
                height: 22,
                fontSize: 11,
                background: isActive ? 'rgba(251, 249, 244, 0.18)' : 'rgba(15, 23, 42, 0.06)',
                color: isActive ? '#fbf9f4' : 'var(--ink-soft)',
                fontFamily: 'var(--font-serif)',
              }}
            >
              {item.step}
            </span>
          ) : (
            <span
              className="inline-flex shrink-0 transition-colors"
              style={{
                color: isActive ? '#fbf9f4' : 'var(--ink-faint)',
              }}
            >
              <Icon className="shrink-0" />
            </span>
          )}
          {showLabel && (
            <span className="whitespace-nowrap overflow-hidden flex-1">{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  );
}
