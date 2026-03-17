import { type ReactNode, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InfoToggle, { type InfoToggleContent } from '@/components/dashboard/InfoToggle';

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  /** Optional chart-specific help; renders an info icon next to the title */
  help?: InfoToggleContent;
  children: ReactNode;
  className?: string;
}

function ExpandModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none px-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5" style={{ minHeight: '70vh' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ChartCard({ title, subtitle, help, children, className = '' }: ChartCardProps) {
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setExpanded(false), []);

  return (
    <>
      <div className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}>
        <div className="mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {help && <InfoToggle {...help} />}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="ml-auto text-slate-400 hover:text-slate-700 transition-colors text-xs px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-300"
              aria-label="Expand chart"
              title="Expand to fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M13 3a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V4.414l-4.293 4.293a1 1 0 01-1.414-1.414L15.586 3H14a1 1 0 01-1-1zM3 13a1 1 0 011 1v1.586l4.293-4.293a1 1 0 111.414 1.414L5.414 17H7a1 1 0 110 2H3a1 1 0 01-1-1v-4a1 1 0 011-1z" />
              </svg>
            </button>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {children}
      </div>

      {expanded && (
        <ExpandModal title={title} onClose={close}>
          {children}
        </ExpandModal>
      )}
    </>
  );
}
