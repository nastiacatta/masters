import type { ReactNode } from 'react';

export interface SectionHeaderProps {
  /** Section label, e.g. "A", "B", "C". */
  label: string;
  /** Section title rendered after the label. */
  title: string;
  /** Optional description rendered below the title. */
  description?: string;
  /** Content rendered below the header. */
  children: ReactNode;
}

/**
 * Clean academic section header.
 *
 * Renders as "A. Title" in 14px semi-bold slate-900, with an optional
 * description below. Children are rendered beneath the header block.
 * Replaces the old StepSection component — no numbered circles, no
 * tutorial styling.
 */
export default function SectionHeader({
  label,
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <section>
      <h3
        className="font-semibold text-slate-900"
        style={{ fontSize: '14px', lineHeight: '20px' }}
      >
        {label ? `${label}. ` : ''}{title}
      </h3>

      {description && (
        <p
          className="text-slate-500 mt-1"
          style={{ fontSize: '12px', lineHeight: '18px' }}
        >
          {description}
        </p>
      )}

      <div className="mt-3">
        {children}
      </div>
    </section>
  );
}
