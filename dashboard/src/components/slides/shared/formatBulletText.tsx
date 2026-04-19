import React from 'react';
import { EMPHASIS } from './presentationConstants';

/**
 * Detect and wrap key terms in bullet text with appropriate emphasis styling.
 */

const METHOD_NAMES = /\b(WSWM|EWMA|CRPS|sybilproofness|budget balance|sybilproof)\b/g;
const NUMERIC_PATTERNS = /([−\-]?\d+\.?\d*%|[−\-]?\d+\.\d{4,}|\d+\s*[×x]\s*10[⁻\-]?\d+)/g;

export function formatBulletText(text: string): React.ReactNode {
  // Full-line emphasis for arrow and warning lines
  if (text.startsWith('[!]') || text.startsWith('Warning:')) {
    return <span style={EMPHASIS.warning}>{text}</span>;
  }

  // Build a combined regex for inline matches
  const combined = new RegExp(
    `(${METHOD_NAMES.source})|(${NUMERIC_PATTERNS.source})`,
    'g',
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    if (match[1]) {
      parts.push(
        <span key={`m-${match.index}`} style={EMPHASIS.method}>
          {matched}
        </span>,
      );
    } else {
      parts.push(
        <span key={`n-${match.index}`} style={EMPHASIS.numeric}>
          {matched}
        </span>,
      );
    }
    lastIndex = combined.lastIndex;
  }

  if (parts.length === 0) return text;

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
