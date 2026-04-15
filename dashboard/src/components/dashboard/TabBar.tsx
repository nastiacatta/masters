import { useRef, useCallback, type KeyboardEvent } from 'react';
import clsx from 'clsx';

interface TabBarProps {
  /** Ordered list of tab labels */
  tabs: readonly string[];
  /** Currently active tab label */
  activeTab: string;
  /** Callback when a tab is activated */
  onTabChange: (tab: string) => void;
  /** Optional set of experiment-backed tab labels (renders status dots) */
  experimentTabs?: Set<string>;
  /** Optional progress label rendered right-aligned, e.g. "Section 2 of 5: Accuracy" */
  progressLabel?: string;
}

/**
 * Unified tab bar with keyboard navigation, optional experiment status dots,
 * and an optional progress label. Used across ResultsPage, BehaviourPage,
 * and RobustnessPage.
 */
export default function TabBar({
  tabs,
  activeTab,
  onTabChange,
  experimentTabs,
  progressLabel,
}: TabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Activate the currently focused tab
        const focused = document.activeElement;
        if (focused instanceof HTMLButtonElement && focused.dataset.tab) {
          onTabChange(focused.dataset.tab);
        }
        return;
      }

      if (nextIndex !== null) {
        const container = containerRef.current;
        if (!container) return;
        const buttons = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        const target = buttons[nextIndex];
        if (target) {
          target.focus();
        }
      }
    },
    [tabs, activeTab, onTabChange],
  );

  return (
    <div className="border-b border-slate-200 flex items-center">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Section tabs"
        className="flex overflow-x-auto gap-0 min-w-0"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          const hasExperiment = experimentTabs?.has(tab);

          return (
            <button
              key={tab}
              role="tab"
              data-tab={tab}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab)}
              className={clsx(
                'relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2',
                'text-xs font-medium transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1',
                'border-b-2 -mb-px',
                isActive
                  ? 'border-slate-800 text-slate-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              )}
              style={{ minHeight: 36, fontSize: '12px' }}
            >
              {tab}
              {experimentTabs != null && (
                <span
                  className={clsx(
                    'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
                    hasExperiment ? 'bg-emerald-500' : 'bg-amber-400',
                  )}
                  aria-label={hasExperiment ? 'Experiment-backed' : 'Taxonomy only'}
                />
              )}
            </button>
          );
        })}
      </div>

      {progressLabel && (
        <span
          className="ml-auto flex-shrink-0 whitespace-nowrap pl-4 pr-1 text-slate-400"
          style={{ fontSize: '11px' }}
        >
          {progressLabel}
        </span>
      )}
    </div>
  );
}
