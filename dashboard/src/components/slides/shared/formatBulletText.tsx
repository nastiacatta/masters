import React from 'react';
import { EMPHASIS } from './presentationConstants';

/**
 * Detect and wrap key terms in bullet text with appropriate emphasis styling.
 * - Numeric patterns (−11%, 1.0000, 10⁻¹⁴, etc.) → EMPHASIS.numeric
 * - Method names (WSWM, EWMA, CRPS, sybilproofness, budget balance) → EMPHASIS.method
 * - → lines → EMPHASIS.result
 * - ⚠ lines → EMPHASIS.warning
 */

const METHOD_NAMES = /\b(WSWM|EWMA|CRPS|sybilproofness|budget balance|sybilproof)\b/g;
const NUMERIC_PATTERNS = /([−\-]?\d+\.?\d*%|[−\-]?\d+\.\d{4,}|\d+\s*[×x]\s*10[⁻\-]?\d+)/g;

export function formatBulletText(text: string): React.ReactNode {
  // Full-line emphasis for → and ⚠ lines
  if (text.startsWith('→')) {
    return <span style={EMPHASIS.result}>{text}</span>;
  }
  if (text.startsWith('⚠')) {
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
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const matched = match[0];
    // Determine which group matched
    if (match[1]) {
      // Method name
      parts.push(
        <span key={`m-${match.index}`} style={EMPHASIS.method}>
          {matched}
        </span>,
      );
    } else {
      // Numeric pattern
      parts.push(
        <span key={`n-${match.index}`} style={EMPHASIS.numeric}>
          {matched}
        </span>,
      );
    }
    lastIndex = combined.lastIndex;
  }

  // If no matches found, return original text
  if (parts.length === 0) return text;

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
