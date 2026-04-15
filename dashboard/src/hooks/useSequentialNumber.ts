import { useContext, useRef, useState, type Context } from 'react';
import type { NumberingContextValue } from '@/contexts/FigureContext';
import { FigureContext } from '@/contexts/FigureContext';
import { EquationContext } from '@/contexts/EquationContext';

/**
 * Calls `ctx.next()` exactly once on mount and returns a stable number.
 *
 * A `useRef` guard prevents the double-invocation that React StrictMode
 * triggers during development, so each consumer gets one unique number.
 */
export function useSequentialNumber(ctx: Context<NumberingContextValue>): number {
  const numbering = useContext(ctx);
  const called = useRef(false);
  const [num] = useState(() => {
    if (called.current) return 0;
    called.current = true;
    return numbering.next();
  });
  return num;
}

/** Convenience wrapper — returns the next figure number. */
export function useFigureNumber(): number {
  return useSequentialNumber(FigureContext);
}

/** Convenience wrapper — returns the next equation number. */
export function useEquationNumber(): number {
  return useSequentialNumber(EquationContext);
}
